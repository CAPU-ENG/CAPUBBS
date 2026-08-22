#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from PIL import Image

import archive_chexie_images as archive


def noisy_jpeg_bytes(width: int = 1800, height: int = 1400) -> bytes:
    raw = bytearray(width * height * 3)
    for index in range(len(raw)):
        raw[index] = (index * 73 + index // 97) % 256
    image = Image.frombytes("RGB", (width, height), bytes(raw))
    output = io.BytesIO()
    image.save(output, format="JPEG", quality=100)
    return output.getvalue()


def png_bytes(width: int = 32, height: int = 24) -> bytes:
    image = Image.new("RGBA", (width, height), (20, 90, 130, 160))
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def animated_webp_bytes(width: int = 32, height: int = 24) -> bytes:
    first_frame = Image.new("RGB", (width, height), (220, 30, 20))
    second_frame = Image.new("RGBA", (width, height), (10, 40, 220, 80))
    output = io.BytesIO()
    first_frame.save(
        output,
        format="WEBP",
        save_all=True,
        append_images=[second_frame],
        duration=[100, 100],
        loop=0,
    )
    return output.getvalue()


class ExtractionTests(unittest.TestCase):
    def test_extracts_supported_image_forms_and_resolves_internal_paths(self) -> None:
        text = """
            [img]https://www.chexie.net/bbs/images/a.jpg[/img]
            <img src="//chexie.net/bbs/images/b.png">
            <img srcset="/bbs/images/c.webp 1x, ../images/d.jpg 2x">
            <div style="background-image:url('images/e.gif')"></div>
            ![x](https://static.chexie.net/f.png)
        """

        references = archive.collect_references(
            [(text, {"kind": "post", "fid": 9}, "post:9")],
            "https://www.chexie.net",
        )

        self.assertEqual(
            set(references),
            {
                "https://www.chexie.net/bbs/images/a.jpg",
                "https://chexie.net/bbs/images/b.png",
                "https://www.chexie.net/bbs/images/c.webp",
                "https://www.chexie.net/bbs/images/d.jpg",
                "https://www.chexie.net/bbs/images/e.gif",
                "https://static.chexie.net/f.png",
            },
        )

    def test_ignores_external_and_non_network_images(self) -> None:
        text = (
            "[img]https://example.com/a.jpg[/img]"
            '<img src="data:image/png;base64,abc">'
            '<img src="javascript:alert(1)">'
        )
        references = archive.collect_references(
            [(text, {"kind": "signature"}, "signature:u:1")],
            "https://www.chexie.net",
        )
        self.assertEqual(references, {})

    def test_decodes_html_entities_and_deduplicates_one_source(self) -> None:
        text = (
            "[img]https://www.chexie.net/a.png?x=1&amp;y=2[/img]"
            '<img src="https://www.chexie.net/a.png?x=1&amp;y=2">'
        )
        references = archive.collect_references(
            [(text, {"kind": "post"}, "post:1")], "https://www.chexie.net"
        )
        entry = references["https://www.chexie.net/a.png?x=1&y=2"]
        self.assertEqual(entry["referenceCount"], 2)


class CompressionTests(unittest.TestCase):
    def test_small_image_is_verified_and_kept(self) -> None:
        source = png_bytes()
        output, info = archive.compress_image(source)
        self.assertEqual(output, source)
        self.assertEqual(info["compression"], "not_needed")
        self.assertLessEqual(len(output), archive.MAX_IMAGE_BYTES)

    def test_large_image_is_reencoded_below_one_mibibyte(self) -> None:
        source = noisy_jpeg_bytes()
        self.assertGreater(len(source), archive.MAX_IMAGE_BYTES)

        output, info = archive.compress_image(source)

        self.assertLessEqual(len(output), archive.MAX_IMAGE_BYTES)
        self.assertEqual(info["compression"], "reencoded")
        self.assertEqual(info["bytes"], len(output))
        self.assertEqual(archive.inspect_image(output)["format"], info["format"])

    def test_small_unsupported_container_is_reencoded(self) -> None:
        source = noisy_jpeg_bytes(32, 24)
        inspect_image = archive.inspect_image

        def inspect_with_mpo_source(data: bytes):
            info = inspect_image(data)
            return {**info, "format": "mpo"} if data is source else info

        with mock.patch.object(
            archive, "inspect_image", side_effect=inspect_with_mpo_source
        ):
            output, info = archive.compress_image(source)

        self.assertLessEqual(len(output), archive.MAX_IMAGE_BYTES)
        self.assertEqual(info["sourceFormat"], "mpo")
        self.assertEqual(info["format"], "jpeg")
        self.assertEqual(info["compression"], "reencoded")

    def test_small_animation_is_reencoded_as_one_frame(self) -> None:
        source = animated_webp_bytes()
        self.assertEqual(archive.inspect_image(source)["frameCount"], 2)

        output, info = archive.compress_image(source)

        output_info = archive.inspect_image(output)
        self.assertNotEqual(output, source)
        self.assertEqual(info["sourceFrameCount"], 2)
        self.assertEqual(info["frameCount"], 1)
        self.assertEqual(info["format"], "jpeg")
        self.assertEqual(output_info["frameCount"], 1)
        self.assertFalse(info["animationPreserved"])
        self.assertEqual(info["compression"], "reencoded")

        with Image.open(io.BytesIO(output)) as image:
            red, green, blue = image.convert("RGB").getpixel((0, 0))
        self.assertGreater(red, 150)
        self.assertLess(green, 100)
        self.assertLess(blue, 100)

    def test_reusable_file_rejects_previous_animation(self) -> None:
        source = animated_webp_bytes()
        with tempfile.TemporaryDirectory() as temporary_dir:
            output_dir = Path(temporary_dir)
            image_path = output_dir / "images" / "animated.webp"
            image_path.parent.mkdir(parents=True)
            image_path.write_bytes(source)
            entry = {
                "file": str(image_path.relative_to(output_dir)),
                "sha256": hashlib.sha256(source).hexdigest(),
            }

            self.assertIsNone(archive.reusable_file(entry, output_dir))


class ArchiveTests(unittest.TestCase):
    def test_archives_file_and_writes_strict_manifest(self) -> None:
        links = {
            "https://www.chexie.net/a.png": {
                "url": "https://www.chexie.net/a.png",
                "referenceCount": 2,
                "references": [],
            }
        }
        with tempfile.TemporaryDirectory() as temporary_dir:
            output_dir = Path(temporary_dir)
            with mock.patch.object(
                archive,
                "download_image",
                return_value=(png_bytes(), "image/png", "https://www.chexie.net/a.png"),
            ):
                counts, errors = archive.archive_links(
                    links,
                    output_dir,
                    timeout=1,
                    retries=0,
                    delay=0,
                    max_download_bytes=2 * archive.MAX_IMAGE_BYTES,
                    force=False,
                    workers=1,
                    compression_workers=0,
                )

            self.assertEqual(counts, {"saved": 1, "skipped": 0, "errors": 0})
            self.assertEqual(errors, [])
            manifest = json.loads(
                (output_dir / "manifest.json").read_text(encoding="utf-8")
            )
            entry = manifest["entries"][0]
            image_path = output_dir / entry["file"]
            self.assertTrue(image_path.is_file())
            self.assertLessEqual(image_path.stat().st_size, archive.MAX_IMAGE_BYTES)
            self.assertEqual(manifest["meta"]["maxImageBytes"], 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
