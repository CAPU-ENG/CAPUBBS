#!/usr/bin/env python3

from __future__ import annotations

import io
import json
import random
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from PIL import Image

import archive_user_avatars as avatars


def png_bytes(width: int = 64, height: int = 64) -> bytes:
    image = Image.new("RGBA", (width, height), (22, 85, 130, 180))
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


class ResolveIconUrlTests(unittest.TestCase):
    def test_resolves_uploaded_and_legacy_icons(self) -> None:
        site_url = "https://www.chexie.net"
        self.assertEqual(
            avatars.resolve_icon_url("/bbsimg/icons/user_upload/a.png", site_url),
            "https://www.chexie.net/bbsimg/icons/user_upload/a.png",
        )
        self.assertEqual(
            avatars.resolve_icon_url("u235", site_url),
            "https://www.chexie.net/bbsimg/i/u235.gif",
        )
        self.assertEqual(
            avatars.resolve_icon_url("188", site_url),
            "https://www.chexie.net/bbsimg/i/188.gif",
        )

    def test_rejects_non_http_url(self) -> None:
        with self.assertRaises(avatars.AvatarError):
            avatars.resolve_icon_url("file:///tmp/avatar.png", "https://example.test")


class CompressionTests(unittest.TestCase):
    def test_compressed_output_obeys_hard_byte_limit(self) -> None:
        random_bytes = random.Random(7).randbytes(600 * 600 * 3)
        image = Image.frombytes("RGB", (600, 600), random_bytes)
        source = io.BytesIO()
        image.save(source, format="PNG")

        result, info = avatars.compress_avatar(
            source.getvalue(), max_bytes=20_000, max_dimension=2048
        )

        self.assertLessEqual(len(result), 20_000)
        self.assertLess(info["width"], 600)
        with Image.open(io.BytesIO(result)) as compressed:
            self.assertEqual(compressed.format, "WEBP")


class ArchiveTests(unittest.TestCase):
    def test_writes_per_user_file_and_manifest(self) -> None:
        profiles = {
            "Alice": {"icon": "/avatars/alice.png"},
            "No Avatar": {"icon": ""},
        }
        with tempfile.TemporaryDirectory() as temporary_dir:
            root = Path(temporary_dir)
            input_path = root / "profiles_by_username.json"
            input_path.write_text(json.dumps({"profiles": profiles}), encoding="utf-8")
            output_dir = root / "avatars"

            with mock.patch.object(
                avatars, "download_avatar", return_value=png_bytes()
            ):
                counts, errors = avatars.archive_avatars(
                    profiles=profiles,
                    input_path=input_path,
                    output_dir=output_dir,
                    site_url="https://example.test",
                    max_bytes=500 * 1024,
                    max_dimension=2048,
                    max_download_bytes=1024 * 1024,
                    timeout=1,
                    retries=0,
                    delay=0,
                    force=False,
                )

            self.assertEqual(
                counts, {"saved": 1, "skipped": 0, "missing": 1, "errors": 0}
            )
            self.assertEqual(errors, [])
            manifest = json.loads(
                (output_dir / "manifest.json").read_text(encoding="utf-8")
            )
            alice = manifest["users"]["Alice"]
            avatar_path = output_dir / alice["avatarFile"]
            self.assertTrue(avatar_path.is_file())
            self.assertLessEqual(avatar_path.stat().st_size, 500 * 1024)
            self.assertEqual(manifest["users"]["No Avatar"]["status"], "missing")


if __name__ == "__main__":
    unittest.main()
