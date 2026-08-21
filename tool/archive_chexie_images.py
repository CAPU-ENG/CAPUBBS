#!/usr/bin/env python3
"""Collect and archive chexie.net images referenced by posts and signatures.

The script reads the local CAPUBBS MySQL database, extracts image requests from
post bodies and user signatures, writes a source-aware link index, downloads
each unique URL, and stores a verified image no larger than 1 MiB.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import html
import http.client
import io
import json
import math
import os
import re
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import (
    Future,
    ProcessPoolExecutor,
    ThreadPoolExecutor,
    as_completed,
)
from pathlib import Path
from typing import Any, Iterable

try:
    from PIL import Image, ImageSequence, UnidentifiedImageError
except ImportError:
    print(
        "错误：缺少 Pillow，请先运行 .venv/bin/python -m pip install -r tool/requirements.txt",
        file=sys.stderr,
    )
    raise SystemExit(2)


DEFAULT_SITE_URL = "https://www.chexie.net"
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent / "output" / "chexie_images"
MAX_IMAGE_BYTES = 1024 * 1024
DEFAULT_MAX_DOWNLOAD_BYTES = 100 * 1024 * 1024
USER_AGENT = "CAPUBBS-chexie-image-archiver/1.0"
RETRYABLE_STATUS_CODES = {408, 425, 429, 500, 502, 503, 504}

BBCODE_IMAGE_RE = re.compile(
    r"\[img(?:\s+[^\]]*)?\](.*?)\[/img\]", re.IGNORECASE | re.DOTALL
)
MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(\s*([^\s)]+)", re.DOTALL)
HTML_IMAGE_TAG_RE = re.compile(
    r"<(img|source|image|video|input)\b[^>]*>", re.IGNORECASE | re.DOTALL
)
HTML_ATTRIBUTE_RE = re.compile(
    r"\b(srcset|src|poster|background|xlink:href|href|style)\s*=\s*"
    r"(?:([\"'])(.*?)\2|([^\s>]+))",
    re.IGNORECASE | re.DOTALL,
)
STYLE_ATTRIBUTE_RE = re.compile(
    r"\bstyle\s*=\s*(?:([\"'])(.*?)\1|([^\s>]+))",
    re.IGNORECASE | re.DOTALL,
)
CSS_URL_RE = re.compile(
    r"url\(\s*(?:([\"'])(.*?)\1|([^\s)]+))\s*\)",
    re.IGNORECASE | re.DOTALL,
)
IMAGE_EXTENSIONS = {
    ".avif",
    ".bmp",
    ".gif",
    ".heic",
    ".jpeg",
    ".jpg",
    ".png",
    ".svg",
    ".tif",
    ".tiff",
    ".webp",
}
FORMAT_EXTENSIONS = {
    "avif": ".avif",
    "bmp": ".bmp",
    "gif": ".gif",
    "jpeg": ".jpg",
    "jpg": ".jpg",
    "png": ".png",
    "tiff": ".tiff",
    "webp": ".webp",
}


class ArchiveError(RuntimeError):
    """A recoverable error for one URL."""


class SameDomainRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Prevent a chexie.net URL from redirecting the crawler out of scope."""

    def redirect_request(
        self,
        request: urllib.request.Request,
        file_pointer: Any,
        code: int,
        message: str,
        headers: Any,
        new_url: str,
    ) -> urllib.request.Request | None:
        if not is_chexie_host(urllib.parse.urlsplit(new_url).hostname):
            raise ArchiveError(f"拒绝跳转到 chexie.net 之外：{new_url}")
        return super().redirect_request(
            request, file_pointer, code, message, headers, new_url
        )


def now_iso() -> str:
    return dt.datetime.now().astimezone().isoformat()


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


def is_chexie_host(hostname: str | None) -> bool:
    host = str(hostname or "").rstrip(".").lower()
    return host == "chexie.net" or host.endswith(".chexie.net")


def normalize_site_url(site_url: str) -> str:
    parsed = urllib.parse.urlsplit(site_url.strip())
    if parsed.scheme not in {"http", "https"} or not is_chexie_host(parsed.hostname):
        raise ValueError("site-url 必须是 chexie.net 或其子域的 HTTP(S) 地址")
    if parsed.username or parsed.password:
        raise ValueError("site-url 不能包含用户名或密码")
    return urllib.parse.urlunsplit(
        (parsed.scheme.lower(), parsed.netloc.lower(), "", "", "")
    )


def encode_url(url: str) -> str:
    parsed = urllib.parse.urlsplit(url)
    path = urllib.parse.quote(parsed.path, safe="/%:@!$&'()*+,;=-._~")
    query = urllib.parse.quote(parsed.query, safe="%&=/:?@!$'()*+,;+-._~")
    return urllib.parse.urlunsplit(
        (parsed.scheme.lower(), parsed.netloc.lower(), path, query, "")
    )


def normalize_image_url(target: str, site_url: str) -> str | None:
    value = html.unescape(str(target or "")).strip().strip("\"'")
    if not value or any(ord(character) < 32 for character in value):
        return None

    lowered = value.lower()
    if lowered.startswith(("data:", "blob:", "javascript:", "file:", "mailto:")):
        return None

    if value.startswith("//"):
        value = "https:" + value
    parsed = urllib.parse.urlsplit(value)
    if parsed.scheme:
        if parsed.scheme.lower() not in {"http", "https"}:
            return None
        if parsed.username or parsed.password or not is_chexie_host(parsed.hostname):
            return None
        return encode_url(value)

    normalized_relative = value.replace("\\", "/")
    if re.match(r"^(?:\.\./)+images/", normalized_relative, re.IGNORECASE):
        normalized_relative = "/bbs/images/" + re.sub(
            r"^(?:\.\./)+images/", "", normalized_relative, flags=re.IGNORECASE
        )
    elif re.match(r"^\.?/?images/", normalized_relative, re.IGNORECASE):
        normalized_relative = "/bbs/images/" + re.sub(
            r"^\.?/?images/", "", normalized_relative, flags=re.IGNORECASE
        )

    page_url = site_url.rstrip("/") + "/bbs/content/"
    resolved = urllib.parse.urljoin(page_url, normalized_relative)
    return (
        encode_url(resolved)
        if is_chexie_host(urllib.parse.urlsplit(resolved).hostname)
        else None
    )


def srcset_targets(value: str) -> Iterable[str]:
    for candidate in value.split(","):
        target = candidate.strip().split(maxsplit=1)[0] if candidate.strip() else ""
        if target:
            yield target


def css_targets(value: str) -> Iterable[str]:
    for match in CSS_URL_RE.finditer(value):
        yield match.group(2) if match.group(1) else match.group(3)


def looks_like_image_url(target: str) -> bool:
    path = urllib.parse.urlsplit(html.unescape(target)).path.lower()
    return Path(path).suffix in IMAGE_EXTENSIONS


def extract_image_targets(text: str) -> list[dict[str, str]]:
    """Extract browser image requests from raw forum HTML/BBCode."""
    decoded = html.unescape(str(text or ""))
    candidates: list[dict[str, str]] = []

    def add(form: str, target: str) -> None:
        value = html.unescape(str(target or "")).strip()
        if value:
            candidates.append({"form": form, "rawTarget": value})

    for match in BBCODE_IMAGE_RE.finditer(decoded):
        add("bbcode_img", match.group(1))
    for match in MARKDOWN_IMAGE_RE.finditer(decoded):
        add("markdown_img", match.group(1))

    for tag_match in HTML_IMAGE_TAG_RE.finditer(decoded):
        tag_name = tag_match.group(1).lower()
        tag = tag_match.group(0)
        attributes: dict[str, list[str]] = {}
        for match in HTML_ATTRIBUTE_RE.finditer(tag):
            name = match.group(1).lower()
            value = match.group(3) if match.group(2) else match.group(4)
            attributes.setdefault(name, []).append(value)

        if tag_name == "input" and not re.search(
            r"\btype\s*=\s*(?:[\"']image[\"']|image(?:\s|>))", tag, re.IGNORECASE
        ):
            continue
        if tag_name in {"img", "input"}:
            for value in attributes.get("src", []):
                add(f"html_{tag_name}_src", value)
        for value in attributes.get("srcset", []):
            for target in srcset_targets(value):
                add(f"html_{tag_name}_srcset", target)
        if tag_name == "video":
            for value in attributes.get("poster", []):
                add("html_video_poster", value)
        if tag_name == "image":
            for attribute in ("href", "xlink:href"):
                for value in attributes.get(attribute, []):
                    add("html_svg_image", value)
        for value in attributes.get("background", []):
            add(f"html_{tag_name}_background", value)
        for style in attributes.get("style", []):
            for target in css_targets(style):
                add("css_url", target)

    for match in STYLE_ATTRIBUTE_RE.finditer(decoded):
        style = match.group(2) if match.group(1) else match.group(3)
        for target in css_targets(style):
            add("css_url", target)

    # Raw CSS may occur inside a signature <style> block.
    for target in css_targets(decoded):
        add("css_url", target)

    unique: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for candidate in candidates:
        identity = (candidate["form"], candidate["rawTarget"])
        if identity not in seen:
            seen.add(identity)
            unique.append(candidate)
    return unique


def collect_references(
    records: Iterable[tuple[str, dict[str, Any], str]], site_url: str
) -> dict[str, dict[str, Any]]:
    links: dict[str, dict[str, Any]] = {}
    for text, source, source_id in records:
        per_record_seen: set[tuple[str, str]] = set()
        for target in extract_image_targets(text):
            url = normalize_image_url(target["rawTarget"], site_url)
            if url is None:
                continue
            identity = (url, target["form"])
            if identity in per_record_seen:
                continue
            per_record_seen.add(identity)
            entry = links.setdefault(url, {"url": url, "references": []})
            entry["references"].append(
                {
                    **source,
                    "sourceId": source_id,
                    "form": target["form"],
                    "rawTarget": target["rawTarget"],
                }
            )
    for entry in links.values():
        entry["referenceCount"] = len(entry["references"])
    return dict(sorted(links.items()))


def database_records(connection: Any) -> Iterable[tuple[str, dict[str, Any], str]]:
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT bid, tid, pid, fid, author, text FROM posts ORDER BY fid"
        )
        while rows := cursor.fetchmany(500):
            for row in rows:
                yield (
                    str(row.get("text") or ""),
                    {
                        "kind": "post",
                        "bid": int(row["bid"]),
                        "tid": int(row["tid"]),
                        "pid": int(row["pid"]),
                        "fid": int(row["fid"]),
                        "author": str(row.get("author") or ""),
                    },
                    f"post:{row['fid']}",
                )

    normalized_signatures: set[tuple[str, int]] = set()
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT username, sig_num, sig FROM user_sig ORDER BY username, sig_num"
        )
        while rows := cursor.fetchmany(500):
            for row in rows:
                username = str(row["username"])
                sig_num = int(row["sig_num"])
                normalized_signatures.add((username, sig_num))
                yield (
                    str(row.get("sig") or ""),
                    {
                        "kind": "signature",
                        "username": username,
                        "sigNum": sig_num,
                        "signatureSource": "user_sig",
                    },
                    f"signature:{username}:{sig_num}",
                )

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT username, sig1, sig2, sig3 FROM userinfo ORDER BY username"
        )
        while rows := cursor.fetchmany(500):
            for row in rows:
                username = str(row["username"])
                for sig_num in (1, 2, 3):
                    if (username, sig_num) in normalized_signatures:
                        continue
                    yield (
                        str(row.get(f"sig{sig_num}") or ""),
                        {
                            "kind": "signature",
                            "username": username,
                            "sigNum": sig_num,
                            "signatureSource": "userinfo",
                        },
                        f"signature:{username}:{sig_num}",
                    )


def connect_database(args: argparse.Namespace) -> Any:
    try:
        import pymysql
    except ImportError as exc:
        raise ValueError(
            "缺少 PyMySQL，请先运行 .venv/bin/python -m pip install -r tool/requirements.txt"
        ) from exc
    try:
        return pymysql.connect(
            host=args.db_host,
            port=args.db_port,
            user=args.db_user,
            password=os.environ.get(args.db_password_env, ""),
            database=args.db_name,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
            read_timeout=args.db_timeout,
            write_timeout=args.db_timeout,
            connect_timeout=args.db_timeout,
        )
    except pymysql.MySQLError as exc:
        raise ValueError(f"连接本地 MySQL 失败：{exc}") from exc


def write_link_indexes(
    output_dir: Path, links: dict[str, dict[str, Any]], site_url: str
) -> None:
    generated_at = now_iso()
    references = sum(entry["referenceCount"] for entry in links.values())
    post_references = sum(
        reference["kind"] == "post"
        for entry in links.values()
        for reference in entry["references"]
    )
    signature_references = references - post_references
    write_json_atomically(
        output_dir / "links.json",
        {
            "meta": {
                "generatedAt": generated_at,
                "siteUrl": site_url,
                "uniqueUrlCount": len(links),
                "referenceCount": references,
                "postReferenceCount": post_references,
                "signatureReferenceCount": signature_references,
            },
            "links": list(links.values()),
        },
    )

    csv_path = output_dir / "links.csv"
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = csv_path.with_suffix(".csv.tmp")
    with temporary_path.open("w", encoding="utf-8-sig", newline="") as output_file:
        writer = csv.writer(output_file)
        writer.writerow(
            [
                "url",
                "kind",
                "source_id",
                "bid",
                "tid",
                "pid",
                "fid",
                "author",
                "username",
                "sig_num",
                "form",
                "raw_target",
            ]
        )
        for entry in links.values():
            for reference in entry["references"]:
                writer.writerow(
                    [
                        entry["url"],
                        reference["kind"],
                        reference["sourceId"],
                        reference.get("bid", ""),
                        reference.get("tid", ""),
                        reference.get("pid", ""),
                        reference.get("fid", ""),
                        reference.get("author", ""),
                        reference.get("username", ""),
                        reference.get("sigNum", ""),
                        reference["form"],
                        reference["rawTarget"],
                    ]
                )
    temporary_path.replace(csv_path)


def download_image(
    url: str, timeout: float, retries: int, max_download_bytes: int, delay: float
) -> tuple[bytes, str, str]:
    opener = urllib.request.build_opener(SameDomainRedirectHandler())
    last_error: Exception | None = None
    for attempt in range(retries + 1):
        if delay:
            time.sleep(delay)
        request = urllib.request.Request(
            url,
            headers={
                "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
                "Connection": "close",
                "User-Agent": USER_AGENT,
            },
        )
        try:
            with opener.open(request, timeout=timeout) as response:
                content_length = response.headers.get("Content-Length")
                if content_length and int(content_length) > max_download_bytes:
                    raise ArchiveError(f"源文件超过下载上限 {max_download_bytes} 字节")
                data = response.read(max_download_bytes + 1)
                if len(data) > max_download_bytes:
                    raise ArchiveError(f"源文件超过下载上限 {max_download_bytes} 字节")
                if not data:
                    raise ArchiveError("服务器返回了空文件")
                return (
                    data,
                    str(response.headers.get_content_type() or ""),
                    response.geturl(),
                )
        except urllib.error.HTTPError as exc:
            last_error = exc
            if exc.code not in RETRYABLE_STATUS_CODES or attempt >= retries:
                break
        except ArchiveError:
            raise
        except (
            http.client.HTTPException,
            OSError,
            socket.timeout,
            TimeoutError,
            urllib.error.URLError,
            ValueError,
        ) as exc:
            last_error = exc
            if attempt >= retries:
                break
        time.sleep(min(2**attempt, 5))
    raise ArchiveError(f"下载失败：{last_error}")


def image_has_alpha(image: Image.Image) -> bool:
    return image.mode in {"RGBA", "LA"} or (
        image.mode == "P" and "transparency" in image.info
    )


def frame_copy(frame: Image.Image, size: tuple[int, int], alpha: bool) -> Image.Image:
    copied = frame.convert("RGBA" if alpha else "RGB")
    if copied.size != size:
        copied = copied.resize(size, Image.Resampling.LANCZOS)
    return copied


def encode_candidate(
    source: Image.Image,
    size: tuple[int, int],
    quality: int,
    animated: bool,
    alpha: bool,
) -> tuple[bytes, str, bool]:
    output = io.BytesIO()
    if animated:
        frames = [
            frame_copy(frame, size, alpha) for frame in ImageSequence.Iterator(source)
        ]
        durations = [
            int(
                getattr(frame, "info", {}).get(
                    "duration", source.info.get("duration", 100)
                )
            )
            for frame in ImageSequence.Iterator(source)
        ]
        frames[0].save(
            output,
            format="WEBP",
            save_all=True,
            append_images=frames[1:],
            duration=durations,
            loop=int(source.info.get("loop", 0)),
            quality=quality,
            method=6,
        )
        return output.getvalue(), "webp", True

    frame = frame_copy(source, size, alpha)
    if alpha:
        frame.save(output, format="WEBP", quality=quality, method=6)
        return output.getvalue(), "webp", False
    frame.save(
        output,
        format="JPEG",
        quality=quality,
        optimize=True,
        progressive=True,
        subsampling=2,
    )
    return output.getvalue(), "jpeg", False


def inspect_image(data: bytes) -> dict[str, Any]:
    try:
        with Image.open(io.BytesIO(data)) as source:
            result = {
                "width": int(source.width),
                "height": int(source.height),
                "format": str(source.format or "").lower(),
                "frameCount": int(getattr(source, "n_frames", 1)),
            }
            source.verify()
            return result
    except (Image.DecompressionBombError, OSError, UnidentifiedImageError) as exc:
        raise ArchiveError(f"无法解析图片：{exc}") from exc


def compress_image(
    data: bytes, max_bytes: int = MAX_IMAGE_BYTES
) -> tuple[bytes, dict[str, Any]]:
    source_info = inspect_image(data)
    source_format = source_info["format"]
    if len(data) <= max_bytes:
        extension = FORMAT_EXTENSIONS.get(source_format)
        if extension is None:
            raise ArchiveError(f"不支持保存的图片格式：{source_format or 'unknown'}")
        return data, {
            "sourceBytes": len(data),
            "bytes": len(data),
            "sourceFormat": source_format,
            "format": source_format,
            "extension": extension,
            "width": source_info["width"],
            "height": source_info["height"],
            "frameCount": source_info["frameCount"],
            "animationPreserved": source_info["frameCount"] > 1,
            "compression": "not_needed",
        }

    try:
        source = Image.open(io.BytesIO(data))
        source.load() if int(getattr(source, "n_frames", 1)) == 1 else None
    except (Image.DecompressionBombError, OSError, UnidentifiedImageError) as exc:
        raise ArchiveError(f"无法载入待压缩图片：{exc}") from exc

    animated = int(getattr(source, "n_frames", 1)) > 1
    alpha = image_has_alpha(source)
    width, height = source.size
    scale = 1.0
    smallest_candidate: tuple[bytes, str, bool, tuple[int, int], int] | None = None

    try:
        while True:
            size = (max(1, round(width * scale)), max(1, round(height * scale)))
            for quality in (88, 78, 68, 58, 48, 38):
                try:
                    candidate, output_format, animation_preserved = encode_candidate(
                        source, size, quality, animated, alpha
                    )
                except (KeyError, OSError, ValueError) as exc:
                    if animated:
                        animated = False
                        source.seek(0)
                        candidate, output_format, animation_preserved = (
                            encode_candidate(source, size, quality, False, alpha)
                        )
                    else:
                        raise ArchiveError(f"图片压缩失败：{exc}") from exc
                if smallest_candidate is None or len(candidate) < len(
                    smallest_candidate[0]
                ):
                    smallest_candidate = (
                        candidate,
                        output_format,
                        animation_preserved,
                        size,
                        quality,
                    )
                if len(candidate) <= max_bytes:
                    result_info = inspect_image(candidate)
                    return candidate, {
                        "sourceBytes": len(data),
                        "bytes": len(candidate),
                        "sourceFormat": source_format,
                        "format": output_format,
                        "extension": FORMAT_EXTENSIONS[output_format],
                        "width": result_info["width"],
                        "height": result_info["height"],
                        "frameCount": result_info["frameCount"],
                        "animationPreserved": animation_preserved,
                        "quality": quality,
                        "compression": "reencoded",
                    }

            if size == (1, 1):
                break
            ratio = math.sqrt(max_bytes / max(len(smallest_candidate[0]), 1)) * 0.9
            scale *= min(0.82, max(0.15, ratio))
            if round(width * scale) == size[0] and round(height * scale) == size[1]:
                scale *= 0.8
    finally:
        source.close()

    raise ArchiveError("无法将图片压缩到 1 MiB 以内")


def safe_component(value: str) -> str:
    cleaned = re.sub(r"[\x00-\x1f/:\\]", "_", value).strip(" .")
    return cleaned[:120] or "image"


def image_output_path(output_dir: Path, url: str, extension: str) -> Path:
    parsed = urllib.parse.urlsplit(url)
    decoded_name = urllib.parse.unquote(Path(parsed.path).name)
    stem = safe_component(Path(decoded_name).stem)
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:16]
    host = safe_component(str(parsed.hostname or "chexie.net"))
    return output_dir / "images" / host / digest[:2] / f"{stem}--{digest}{extension}"


def load_previous_entries(path: Path) -> dict[str, dict[str, Any]]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        entries = payload.get("entries") if isinstance(payload, dict) else None
        if isinstance(entries, list):
            return {
                str(entry.get("url")): entry
                for entry in entries
                if isinstance(entry, dict) and entry.get("url")
            }
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        pass
    return {}


def reusable_file(
    entry: dict[str, Any] | None, output_dir: Path
) -> tuple[Path, dict[str, Any]] | None:
    if not entry or not entry.get("file"):
        return None
    path = output_dir / str(entry["file"])
    try:
        data = path.read_bytes()
        if not data or len(data) > MAX_IMAGE_BYTES:
            return None
        info = inspect_image(data)
        if entry.get("sha256") != hashlib.sha256(data).hexdigest():
            return None
        return path, info
    except (ArchiveError, OSError):
        return None


def archive_links(
    links: dict[str, dict[str, Any]],
    output_dir: Path,
    timeout: float,
    retries: int,
    delay: float,
    max_download_bytes: int,
    force: bool,
    workers: int = 4,
    compression_workers: int = 4,
) -> tuple[dict[str, int], list[dict[str, Any]]]:
    manifest_path = output_dir / "manifest.json"
    previous_entries = load_previous_entries(manifest_path)
    entries: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    counts = {"saved": 0, "skipped": 0, "errors": 0}
    started_at = now_iso()
    manifest: dict[str, Any] = {
        "meta": {
            "startedAt": started_at,
            "updatedAt": started_at,
            "finishedAt": None,
            "status": "running",
            "uniqueUrlCount": len(links),
            "maxImageBytes": MAX_IMAGE_BYTES,
            "savedThisRun": 0,
            "skippedThisRun": 0,
            "errorCount": 0,
        },
        "entries": entries,
        "errors": errors,
    }

    def checkpoint(status: str = "running") -> None:
        updated_at = now_iso()
        manifest["meta"].update(
            {
                "updatedAt": updated_at,
                "finishedAt": updated_at if status == "finished" else None,
                "status": status,
                "savedThisRun": counts["saved"],
                "skippedThisRun": counts["skipped"],
                "errorCount": counts["errors"],
            }
        )
        write_json_atomically(manifest_path, manifest)

    work: list[tuple[int, str, dict[str, Any]]] = []
    for index, (url, link) in enumerate(links.items(), start=1):
        entry = {
            "url": url,
            "referenceCount": link["referenceCount"],
            "status": "pending",
        }
        entries.append(entry)
        work.append((index, url, entry))

    def archive_one(url: str) -> dict[str, Any]:
        try:
            reusable = (
                None if force else reusable_file(previous_entries.get(url), output_dir)
            )
            if reusable is not None:
                path, info = reusable
                data = path.read_bytes()
                return {
                    "status": "skipped",
                    "file": str(path.relative_to(output_dir)),
                    "bytes": len(data),
                    "sha256": hashlib.sha256(data).hexdigest(),
                    **info,
                }

            source_data, content_type, final_url = download_image(
                url, timeout, retries, max_download_bytes, delay
            )
            if compressor is None:
                output_data, compression_info = compress_image(source_data)
            else:
                output_data, compression_info = compressor.submit(
                    compress_image, source_data
                ).result()
            if len(output_data) > MAX_IMAGE_BYTES:
                raise ArchiveError("压缩结果超过 1 MiB")
            output_path = image_output_path(
                output_dir, url, compression_info["extension"]
            )
            write_bytes_atomically(output_path, output_data)
            return {
                "status": "saved",
                "finalUrl": final_url,
                "contentType": content_type,
                "file": str(output_path.relative_to(output_dir)),
                "sha256": hashlib.sha256(output_data).hexdigest(),
                **compression_info,
            }
        except Exception as exc:
            return {"status": "error", "error": str(exc)}

    checkpoint()
    futures: dict[Future[dict[str, Any]], tuple[int, str, dict[str, Any]]] = {}
    compressor = (
        ProcessPoolExecutor(max_workers=compression_workers)
        if compression_workers > 0
        else None
    )
    pool = ThreadPoolExecutor(max_workers=workers, thread_name_prefix="chexie-image")
    try:
        for index, url, entry in work:
            futures[pool.submit(archive_one, url)] = (index, url, entry)
        for completed_count, future in enumerate(as_completed(futures), start=1):
            index, url, entry = futures[future]
            result = future.result()
            entry.update(result)
            status = str(result["status"])
            counts[status if status != "error" else "errors"] += 1
            if status == "saved":
                print(
                    f"[{index}/{len(links)}] 已保存 {url}"
                    f"（{result['sourceBytes']} → {result['bytes']} 字节）",
                    file=sys.stderr,
                )
            elif status == "skipped":
                print(f"[{index}/{len(links)}] 已存在，跳过 {url}", file=sys.stderr)
            else:
                errors.append({"url": url, "error": result["error"]})
                print(
                    f"[{index}/{len(links)}] 失败 {url}：{result['error']}",
                    file=sys.stderr,
                )
            if completed_count % 10 == 0 or status == "error":
                checkpoint()
    except KeyboardInterrupt:
        checkpoint("interrupted")
        for future in futures:
            future.cancel()
        pool.shutdown(wait=False, cancel_futures=True)
        if compressor is not None:
            compressor.shutdown(wait=False, cancel_futures=True)
        raise
    else:
        pool.shutdown(wait=True)
        if compressor is not None:
            compressor.shutdown(wait=True)

    checkpoint("finished")
    return counts, errors


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="汇总帖子正文/签名档中的 chexie.net 图片链接并下载到本地（每张不超过 1 MiB）。"
    )
    parser.add_argument(
        "--output", type=Path, default=DEFAULT_OUTPUT_DIR, help="输出目录"
    )
    parser.add_argument(
        "--site-url",
        default=DEFAULT_SITE_URL,
        help="用于补全相对图片地址的站点 URL",
    )
    parser.add_argument(
        "--db-host", default=os.environ.get("CAPUBBS_DB_HOST", "localhost")
    )
    parser.add_argument(
        "--db-port", type=int, default=int(os.environ.get("CAPUBBS_DB_PORT", "3306"))
    )
    parser.add_argument("--db-user", default=os.environ.get("CAPUBBS_DB_USER", "root"))
    parser.add_argument(
        "--db-name", default=os.environ.get("CAPUBBS_DB_NAME", "capubbs")
    )
    parser.add_argument(
        "--db-password-env",
        default="CAPUBBS_DB_PASSWORD",
        help="存放数据库密码的环境变量名（默认 CAPUBBS_DB_PASSWORD）",
    )
    parser.add_argument("--db-timeout", type=int, default=10, help="数据库超时秒数")
    parser.add_argument("--timeout", type=float, default=30.0, help="单次下载超时秒数")
    parser.add_argument("--retries", type=int, default=3, help="网络错误重试次数")
    parser.add_argument("--delay", type=float, default=0.1, help="每次下载前等待秒数")
    parser.add_argument("--workers", type=int, default=4, help="并行下载数（默认 4）")
    parser.add_argument(
        "--compression-workers", type=int, default=4, help="并行压缩进程数（默认 4）"
    )
    parser.add_argument(
        "--max-download-bytes",
        type=int,
        default=DEFAULT_MAX_DOWNLOAD_BYTES,
        help="单个源文件下载上限（默认 100 MiB）",
    )
    parser.add_argument(
        "--scan-only", action="store_true", help="只生成链接汇总，不下载"
    )
    parser.add_argument("--force", action="store_true", help="重新下载已有且有效的文件")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if (
        args.db_port <= 0
        or args.db_timeout <= 0
        or args.timeout <= 0
        or args.retries < 0
        or args.delay < 0
        or args.workers <= 0
        or args.compression_workers <= 0
        or args.max_download_bytes <= MAX_IMAGE_BYTES
    ):
        print(
            "错误：端口/超时必须为正数，retries/delay 不能为负数，下载上限必须大于 1 MiB",
            file=sys.stderr,
        )
        return 2

    try:
        site_url = normalize_site_url(args.site_url)
        output_dir = args.output.expanduser().resolve()
        connection = connect_database(args)
        try:
            links = collect_references(database_records(connection), site_url)
        finally:
            connection.close()
        write_link_indexes(output_dir, links, site_url)
    except (OSError, UnicodeDecodeError, ValueError) as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 2

    reference_count = sum(entry["referenceCount"] for entry in links.values())
    print(
        f"汇总完成：{reference_count} 处引用，{len(links)} 个唯一链接。"
        f"\n链接清单：{output_dir / 'links.json'} 和 {output_dir / 'links.csv'}",
        file=sys.stderr,
    )
    if args.scan_only:
        return 0

    counts, errors = archive_links(
        links=links,
        output_dir=output_dir,
        timeout=args.timeout,
        retries=args.retries,
        delay=args.delay,
        max_download_bytes=args.max_download_bytes,
        force=args.force,
        workers=args.workers,
        compression_workers=args.compression_workers,
    )
    print(
        "下载完成："
        f"保存 {counts['saved']} 个，跳过 {counts['skipped']} 个，失败 {counts['errors']} 个。"
        f"\n输出目录：{output_dir}",
        file=sys.stderr,
    )
    return 0 if not errors else 3


if __name__ == "__main__":
    raise SystemExit(main())
