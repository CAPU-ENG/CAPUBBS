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

    def test_encodes_spaces_and_unicode_in_path(self) -> None:
        self.assertEqual(
            avatars.resolve_icon_url(
                "/bbsimg/icons/姜饼 man.jpeg", "https://www.chexie.net"
            ),
            "https://www.chexie.net/bbsimg/icons/%E5%A7%9C%E9%A5%BC%20man.jpeg",
        )


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
    def archive(
        self,
        profiles: dict[str, dict[str, str]],
        input_path: Path,
        output_dir: Path,
    ) -> tuple[dict[str, int], list[dict[str, str]]]:
        return avatars.archive_avatars(
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
                counts, errors = self.archive(profiles, input_path, output_dir)

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

    def test_one_avatar_error_does_not_stop_batch(self) -> None:
        profiles = {
            "Broken": {"icon": "/avatars/broken.png"},
            "Working": {"icon": "/avatars/working.png"},
        }
        with tempfile.TemporaryDirectory() as temporary_dir:
            root = Path(temporary_dir)
            input_path = root / "profiles_by_username.json"
            output_dir = root / "avatars"
            with mock.patch.object(
                avatars,
                "download_avatar",
                side_effect=[RuntimeError("unexpected failure"), png_bytes()],
            ):
                counts, errors = self.archive(profiles, input_path, output_dir)

            self.assertEqual(counts["saved"], 1)
            self.assertEqual(counts["errors"], 1)
            self.assertEqual(errors[0]["username"], "Broken")
            manifest = json.loads(
                (output_dir / "manifest.json").read_text(encoding="utf-8")
            )
            self.assertEqual(manifest["users"]["Broken"]["status"], "error")
            self.assertEqual(manifest["users"]["Working"]["status"], "saved")

    def test_skips_existing_file_when_previous_manifest_is_incomplete(self) -> None:
        profiles = {"Alice": {"icon": "/avatars/alice.png"}}
        with tempfile.TemporaryDirectory() as temporary_dir:
            root = Path(temporary_dir)
            input_path = root / "profiles_by_username.json"
            output_dir = root / "avatars"
            existing_path = avatars.avatar_output_path(output_dir, "Alice")
            existing_path.parent.mkdir(parents=True)
            image = Image.open(io.BytesIO(png_bytes()))
            image.save(existing_path, format="WEBP")

            with mock.patch.object(avatars, "download_avatar") as download:
                counts, errors = self.archive(profiles, input_path, output_dir)

            download.assert_not_called()
            self.assertEqual(counts["skipped"], 1)
            self.assertEqual(errors, [])
            manifest = json.loads(
                (output_dir / "manifest.json").read_text(encoding="utf-8")
            )
            self.assertEqual(manifest["users"]["Alice"]["status"], "skipped")


class DefaultPathTests(unittest.TestCase):
    def test_default_output_is_public_and_git_ignored(self) -> None:
        self.assertEqual(
            avatars.default_output_dir(),
            Path(__file__).resolve().parent.parent
            / "bbsimg"
            / "icons"
            / "user_archive",
        )


if __name__ == "__main__":
    unittest.main()
