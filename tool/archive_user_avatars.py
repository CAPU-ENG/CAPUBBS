#!/usr/bin/env python3
"""Download archived users' avatars and keep every output within a size limit."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import http.client
import io
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageOps, UnidentifiedImageError
except ImportError:
    print(
        "错误：缺少 Pillow，请先运行 python3 -m pip install -r tool/requirements.txt",
        file=sys.stderr,
    )
    raise SystemExit(2)


DEFAULT_SITE_URL = "https://www.chexie.net"
DEFAULT_MAX_BYTES = 500 * 1024
DEFAULT_MAX_DIMENSION = 2048
USER_AGENT = "CAPUBBS-avatar-archiver/1.0"


class AvatarError(RuntimeError):
    """A recoverable error for one avatar."""


def now_iso() -> str:
    return dt.datetime.now().astimezone().isoformat()


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as input_file:
        return json.load(input_file)


def write_json_atomically(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_suffix(path.suffix + ".tmp")
    with temporary_path.open("w", encoding="utf-8") as output_file:
        json.dump(data, output_file, ensure_ascii=False, indent=2)
        output_file.write("\n")
    temporary_path.replace(path)


def write_bytes_atomically(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_suffix(path.suffix + ".tmp")
    temporary_path.write_bytes(data)
    temporary_path.replace(path)


def normalize_site_url(site_url: str) -> str:
    parsed = urllib.parse.urlparse(site_url.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("site-url 必须是有效的 HTTP(S) 地址")
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, "", "", "", ""))


def infer_site_url(input_path: Path) -> str:
    configured_url = os.environ.get("CAPUBBS_SITE_URL")
    if configured_url:
        return normalize_site_url(configured_url)

    archive_manifest = input_path.parent.parent / "manifest.json"
    try:
        api_url = str(load_json(archive_manifest).get("meta", {}).get("apiUrl", ""))
        if api_url:
            return normalize_site_url(api_url)
    except (AttributeError, OSError, UnicodeDecodeError, json.JSONDecodeError):
        pass
    return DEFAULT_SITE_URL


def resolve_icon_url(icon: Any, site_url: str) -> str | None:
    icon_value = str(icon or "").strip()
    if not icon_value:
        return None

    parsed = urllib.parse.urlparse(icon_value)
    if parsed.scheme:
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise AvatarError(f"不支持的头像地址：{icon_value}")
        return encode_url(icon_value)

    legacy_value = icon_value[1:] if len(icon_value) > 1 else ""
    if icon_value.isdigit() or legacy_value.isdigit():
        icon_value = f"/bbsimg/i/{icon_value}.gif"
    return encode_url(urllib.parse.urljoin(site_url.rstrip("/") + "/", icon_value))


def encode_url(url: str) -> str:
    """Percent-encode non-ASCII and unsafe characters without double encoding."""
    parsed = urllib.parse.urlsplit(url)
    path = urllib.parse.quote(parsed.path, safe="/%:@!$&'()*+,;=-._~")
    query = urllib.parse.quote(parsed.query, safe="%&=/:?@!$'()*+,;+-._~")
    return urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, path, query, parsed.fragment)
    )


def avatar_output_path(output_dir: Path, username: str) -> Path:
    digest = hashlib.sha256(username.encode("utf-8")).hexdigest()
    return output_dir / "files" / f"{digest}.webp"


def load_profiles(input_path: Path) -> dict[str, dict[str, Any]]:
    try:
        payload = load_json(input_path)
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"无法读取用户归档：{exc}") from exc

    profiles = payload.get("profiles") if isinstance(payload, dict) else None
    if not isinstance(profiles, dict):
        raise ValueError("用户归档必须包含 profiles 对象")

    invalid = [
        username
        for username, profile in profiles.items()
        if not isinstance(profile, dict)
    ]
    if invalid:
        raise ValueError(f"用户资料不是对象：{invalid[0]!r}")
    return dict(sorted(profiles.items()))


def download_avatar(
    url: str,
    timeout: float,
    retries: int,
    max_download_bytes: int,
) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"Accept": "image/*", "User-Agent": USER_AGENT},
    )
    last_error: Exception | None = None
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                content_length = response.headers.get("Content-Length")
                if content_length and int(content_length) > max_download_bytes:
                    raise AvatarError(f"源文件超过下载上限 {max_download_bytes} 字节")
                data = response.read(max_download_bytes + 1)
                if len(data) > max_download_bytes:
                    raise AvatarError(f"源文件超过下载上限 {max_download_bytes} 字节")
                if not data:
                    raise AvatarError("服务器返回了空文件")
                return data
        except AvatarError:
            raise
        except (
            http.client.HTTPException,
            OSError,
            ValueError,
            urllib.error.URLError,
        ) as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(min(2**attempt, 5))
    raise AvatarError(f"下载失败：{last_error}")


def prepare_image(data: bytes, max_dimension: int) -> Image.Image:
    try:
        with Image.open(io.BytesIO(data)) as source:
            source.seek(0)
            image = ImageOps.exif_transpose(source).copy()
    except (Image.DecompressionBombError, OSError, UnidentifiedImageError) as exc:
        raise AvatarError(f"无法解析头像图片：{exc}") from exc

    if image.mode in {"RGBA", "LA"} or (
        image.mode == "P" and "transparency" in image.info
    ):
        image = image.convert("RGBA")
    else:
        image = image.convert("RGB")
    image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
    return image


def encode_webp(image: Image.Image, quality: int) -> bytes:
    output = io.BytesIO()
    try:
        image.save(output, format="WEBP", quality=quality, method=6)
    except (KeyError, OSError) as exc:
        raise AvatarError(f"无法编码 WebP（请确认 Pillow 支持 WebP）：{exc}") from exc
    return output.getvalue()


def compress_avatar(
    source_data: bytes,
    max_bytes: int,
    max_dimension: int,
) -> tuple[bytes, dict[str, int]]:
    image = prepare_image(source_data, max_dimension)
    original_width, original_height = image.size

    while True:
        smallest = encode_webp(image, 1)
        if len(smallest) <= max_bytes:
            best_data = smallest
            best_quality = 1
            low, high = 2, 92
            while low <= high:
                quality = (low + high) // 2
                candidate = encode_webp(image, quality)
                if len(candidate) <= max_bytes:
                    best_data = candidate
                    best_quality = quality
                    low = quality + 1
                else:
                    high = quality - 1
            return best_data, {
                "width": image.width,
                "height": image.height,
                "originalWidth": original_width,
                "originalHeight": original_height,
                "quality": best_quality,
            }

        if image.size == (1, 1):
            raise AvatarError(f"图片无法压缩到 {max_bytes} 字节以内")
        next_size = (
            max(1, int(image.width * 0.8)),
            max(1, int(image.height * 0.8)),
        )
        if next_size == image.size:
            next_size = (max(1, image.width - 1), max(1, image.height - 1))
        image = image.resize(next_size, Image.Resampling.LANCZOS)


def reusable_avatar_info(
    username: str,
    entry: Any,
    icon: str,
    output_dir: Path,
    max_bytes: int,
) -> dict[str, Any] | None:
    if isinstance(entry, dict) and entry.get("sourceIcon") != icon:
        return None

    path = avatar_output_path(output_dir, username)
    try:
        size = path.stat().st_size
        if not path.is_file() or size <= 0 or size > max_bytes:
            return None
        with Image.open(path) as image:
            if image.format != "WEBP":
                return None
            width, height = image.size
            image.verify()
    except (OSError, UnidentifiedImageError):
        return None

    info: dict[str, Any] = {}
    if isinstance(entry, dict):
        for key in ("originalWidth", "originalHeight", "quality"):
            if key in entry:
                info[key] = entry[key]
    info.update(
        {
            "avatarFile": str(path.relative_to(output_dir)),
            "bytes": size,
            "width": width,
            "height": height,
        }
    )
    return info


def load_previous_users(manifest_path: Path) -> dict[str, Any]:
    try:
        payload = load_json(manifest_path)
        users = payload.get("users") if isinstance(payload, dict) else None
        return users if isinstance(users, dict) else {}
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        return {}


def archive_avatars(
    profiles: dict[str, dict[str, Any]],
    input_path: Path,
    output_dir: Path,
    site_url: str,
    max_bytes: int,
    max_dimension: int,
    max_download_bytes: int,
    timeout: float,
    retries: int,
    delay: float,
    force: bool,
) -> tuple[dict[str, int], list[dict[str, str]]]:
    manifest_path = output_dir / "manifest.json"
    previous_users = load_previous_users(manifest_path)
    users: dict[str, dict[str, Any]] = {}
    errors: list[dict[str, str]] = []
    counts = {"saved": 0, "skipped": 0, "missing": 0, "errors": 0}
    started_at = now_iso()
    manifest: dict[str, Any] = {
        "meta": {
            "inputFile": str(input_path),
            "siteUrl": site_url,
            "startedAt": started_at,
            "updatedAt": started_at,
            "finishedAt": None,
            "status": "running",
            "profileCount": len(profiles),
            "maxBytes": max_bytes,
            "maxDimension": max_dimension,
            "outputFormat": "webp",
            "savedThisRun": 0,
            "skippedThisRun": 0,
            "missingThisRun": 0,
            "errorCount": 0,
        },
        "users": users,
        "errors": errors,
    }

    def checkpoint(status: str = "running") -> None:
        updated_at = now_iso()
        meta = manifest["meta"]
        meta["updatedAt"] = updated_at
        meta["status"] = status
        meta["savedThisRun"] = counts["saved"]
        meta["skippedThisRun"] = counts["skipped"]
        meta["missingThisRun"] = counts["missing"]
        meta["errorCount"] = counts["errors"]
        if status == "finished":
            meta["finishedAt"] = updated_at
        write_json_atomically(manifest_path, manifest)

    checkpoint()
    for index, (username, profile) in enumerate(profiles.items(), start=1):
        icon = str(profile.get("icon") or "").strip()
        entry: dict[str, Any] = {"sourceIcon": icon, "status": "pending"}
        users[username] = entry
        print(f"[{index}/{len(profiles)}] {username}", file=sys.stderr)

        try:
            source_url = resolve_icon_url(icon, site_url)
            if source_url is None:
                entry["status"] = "missing"
                counts["missing"] += 1
                print("  未设置头像", file=sys.stderr)
                checkpoint()
                continue
            entry["sourceUrl"] = source_url

            reusable_info = None
            if not force:
                reusable_info = reusable_avatar_info(
                    username,
                    previous_users.get(username),
                    icon,
                    output_dir,
                    max_bytes,
                )
            if reusable_info is not None:
                entry.update(reusable_info)
                entry["status"] = "skipped"
                counts["skipped"] += 1
                print("  已存在且符合限制，跳过", file=sys.stderr)
                checkpoint()
                continue

            if delay:
                time.sleep(delay)
            source_data = download_avatar(
                source_url, timeout, retries, max_download_bytes
            )
            avatar_data, image_info = compress_avatar(
                source_data, max_bytes, max_dimension
            )
            output_path = avatar_output_path(output_dir, username)
            write_bytes_atomically(output_path, avatar_data)
            if output_path.stat().st_size > max_bytes:
                output_path.unlink(missing_ok=True)
                raise AvatarError("写入后的头像超过大小限制")

            entry.update(
                {
                    "avatarFile": str(output_path.relative_to(output_dir)),
                    "bytes": len(avatar_data),
                    **image_info,
                    "status": "saved",
                }
            )
            counts["saved"] += 1
            print(
                f"  已保存：{output_path}（{len(avatar_data)} 字节）",
                file=sys.stderr,
            )
        except Exception as exc:
            # A malformed or unusual avatar must never stop the remaining batch.
            entry["status"] = "error"
            entry["error"] = str(exc)
            errors.append({"username": username, "icon": icon, "error": str(exc)})
            counts["errors"] += 1
            print(f"  失败：{exc}", file=sys.stderr)
        checkpoint()

    checkpoint("finished")
    return counts, errors


def default_input_path() -> Path:
    return (
        Path(__file__).resolve().parent
        / "output"
        / "users"
        / "profiles_by_username.json"
    )


def default_output_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "bbsimg" / "icons" / "user_archive"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="下载用户归档中的头像，统一转换为不超过指定大小的 WebP。"
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=None,
        help="profiles_by_username.json 路径（默认 tool/output/users/ 下）",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="头像输出目录（默认 bbsimg/icons/user_archive/）",
    )
    parser.add_argument(
        "--site-url",
        default=None,
        help="用于补全相对头像路径的站点地址（默认从归档清单推断）",
    )
    parser.add_argument(
        "--max-bytes",
        type=int,
        default=DEFAULT_MAX_BYTES,
        help=f"单个输出文件的字节上限（默认 {DEFAULT_MAX_BYTES}，即 500 KiB）",
    )
    parser.add_argument(
        "--max-dimension",
        type=int,
        default=DEFAULT_MAX_DIMENSION,
        help=f"头像最长边像素上限（默认 {DEFAULT_MAX_DIMENSION}）",
    )
    parser.add_argument(
        "--max-download-bytes",
        type=int,
        default=20 * 1024 * 1024,
        help="单个源文件下载上限（默认 20 MiB）",
    )
    parser.add_argument("--timeout", type=float, default=30.0, help="单次请求超时秒数")
    parser.add_argument("--retries", type=int, default=3, help="网络错误重试次数")
    parser.add_argument("--delay", type=float, default=0.1, help="每次下载前等待秒数")
    parser.add_argument("--force", action="store_true", help="重新下载已有且合规的头像")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if (
        args.max_bytes <= 0
        or args.max_dimension <= 0
        or args.max_download_bytes <= 0
        or args.timeout <= 0
        or args.retries < 0
        or args.delay < 0
    ):
        print(
            "错误：大小、尺寸和 timeout 必须为正数，retries/delay 不能为负数",
            file=sys.stderr,
        )
        return 2

    input_path = (args.input or default_input_path()).expanduser().resolve()
    output_dir = (args.output or default_output_dir()).expanduser().resolve()
    try:
        profiles = load_profiles(input_path)
        site_url = normalize_site_url(args.site_url or infer_site_url(input_path))
    except ValueError as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 2

    counts, errors = archive_avatars(
        profiles=profiles,
        input_path=input_path,
        output_dir=output_dir,
        site_url=site_url,
        max_bytes=args.max_bytes,
        max_dimension=args.max_dimension,
        max_download_bytes=args.max_download_bytes,
        timeout=args.timeout,
        retries=args.retries,
        delay=args.delay,
        force=args.force,
    )
    print(
        "完成："
        f"保存 {counts['saved']} 个，跳过 {counts['skipped']} 个，"
        f"未设置头像 {counts['missing']} 个，失败 {counts['errors']} 个。"
        f"\n输出目录：{output_dir}",
        file=sys.stderr,
    )
    return 0 if not errors else 3


if __name__ == "__main__":
    raise SystemExit(main())
