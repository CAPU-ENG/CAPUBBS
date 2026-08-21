#!/usr/bin/env python3
"""Recursively mirror selected public Apache directory indexes.

The defaults target the three pan.chexie.net directories requested for this
project.  The downloader obeys robots.txt unless the operator explicitly
confirms that they are authorized to mirror the selected directories.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import email.utils
import html.parser
import os
from pathlib import Path
import posixpath
import random
import sys
import threading
import time
from typing import Sequence
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser


DEFAULT_SITE_ROOT = "https://pan.chexie.net/"
DEFAULT_ROOT_PATHS = ("图片素材", "学习资料", "视频音频")
USER_AGENT = "CAPUBBS-authorized-mirror/1.0"
RETRYABLE_HTTP_CODES = {408, 425, 429, 500, 502, 503, 504}
URL_PATH_SEGMENT_SAFE = "!$&'()*+,;=:@-._~"


class DirectoryIndexParser(html.parser.HTMLParser):
    """Extract links from an Apache-style directory index."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.hrefs: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag.casefold() != "a":
            return
        href = dict(attrs).get("href")
        if href:
            self.hrefs.append(href)


class MirrorError(RuntimeError):
    pass


class RetryingClient:
    def __init__(self, timeout: float, retries: int, delay: float) -> None:
        self.timeout = timeout
        self.retries = retries
        self.delay = delay
        self._throttle_lock = threading.Lock()
        self._last_request_at = 0.0

    def open(
        self, url: str, *, headers: dict[str, str] | None = None
    ) -> urllib.response.addinfourl:
        request_headers = {
            "User-Agent": USER_AGENT,
            "Accept-Encoding": "identity",
        }
        if headers:
            request_headers.update(headers)

        for attempt in range(self.retries + 1):
            self._wait_for_rate_limit()
            request = urllib.request.Request(url, headers=request_headers)
            try:
                return urllib.request.urlopen(request, timeout=self.timeout)
            except urllib.error.HTTPError as exc:
                if exc.code not in RETRYABLE_HTTP_CODES or attempt >= self.retries:
                    raise
                retry_after = _retry_after_seconds(exc.headers.get("Retry-After"))
                exc.close()
                self._back_off(attempt, retry_after)
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                if attempt >= self.retries:
                    raise
                self._back_off(attempt, None)

        raise AssertionError("retry loop exited unexpectedly")

    def _wait_for_rate_limit(self) -> None:
        if self.delay <= 0:
            return
        with self._throttle_lock:
            remaining = self.delay - (time.monotonic() - self._last_request_at)
            if remaining > 0:
                time.sleep(remaining)
            self._last_request_at = time.monotonic()

    def _back_off(self, attempt: int, retry_after: float | None) -> None:
        wait = retry_after
        if wait is None:
            wait = min(30.0, (2**attempt) + random.random())
        time.sleep(wait)


def _retry_after_seconds(value: str | None) -> float | None:
    if not value:
        return None
    try:
        return max(0.0, float(value))
    except ValueError:
        try:
            retry_at = email.utils.parsedate_to_datetime(value)
            return max(0.0, retry_at.timestamp() - time.time())
        except (TypeError, ValueError, OverflowError):
            return None


def build_root_urls(site_root: str, root_paths: Sequence[str]) -> list[str]:
    site = site_root.rstrip("/") + "/"
    parsed = urllib.parse.urlsplit(site)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise MirrorError("--site-root 必须是 http 或 https URL")

    result = []
    for root_path in root_paths:
        clean = root_path.strip("/")
        if not clean:
            raise MirrorError("--root-path 不能为空")
        encoded = "/".join(
            urllib.parse.quote(
                urllib.parse.unquote(part), safe=URL_PATH_SEGMENT_SAFE
            )
            for part in clean.split("/")
        )
        result.append(urllib.parse.urljoin(site, encoded + "/"))
    return result


def decoded_path_parts(url: str) -> tuple[str, ...]:
    parts: list[str] = []
    for raw_part in urllib.parse.urlsplit(url).path.split("/"):
        if not raw_part:
            continue
        part = urllib.parse.unquote(raw_part)
        if part in {".", ".."} or "/" in part or "\\" in part or "\x00" in part:
            raise MirrorError(f"拒绝不安全的路径片段：{raw_part!r}")
        parts.append(part)
    return tuple(parts)


def is_within_root(candidate_url: str, root_url: str) -> bool:
    candidate = urllib.parse.urlsplit(candidate_url)
    root = urllib.parse.urlsplit(root_url)
    if (candidate.scheme.casefold(), candidate.netloc.casefold()) != (
        root.scheme.casefold(),
        root.netloc.casefold(),
    ):
        return False
    candidate_parts = decoded_path_parts(candidate_url)
    root_parts = decoded_path_parts(root_url)
    return candidate_parts[: len(root_parts)] == root_parts


def normalize_link(href: str, current_url: str, root_url: str) -> str | None:
    parsed_href = urllib.parse.urlsplit(href)
    if parsed_href.query or parsed_href.fragment:
        return None
    candidate = urllib.parse.urljoin(current_url, href)
    parsed = urllib.parse.urlsplit(candidate)
    normalized_path = posixpath.normpath(parsed.path)
    normalized_path = "/".join(
        urllib.parse.quote(
            urllib.parse.unquote(part), safe=URL_PATH_SEGMENT_SAFE
        )
        for part in normalized_path.split("/")
    )
    if parsed.path.endswith("/") and not normalized_path.endswith("/"):
        normalized_path += "/"
    candidate = urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, normalized_path, "", "")
    )
    return candidate if is_within_root(candidate, root_url) else None


def check_robots(site_root: str, root_urls: Sequence[str]) -> list[str]:
    robots_url = urllib.parse.urljoin(site_root.rstrip("/") + "/", "robots.txt")
    parser = urllib.robotparser.RobotFileParser()
    parser.set_url(robots_url)
    try:
        request = urllib.request.Request(robots_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(request, timeout=15) as response:
            lines = response.read().decode("utf-8", errors="replace").splitlines()
        parser.parse(lines)
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise MirrorError(f"无法检查 robots.txt：{exc}") from exc
    return [url for url in root_urls if not parser.can_fetch(USER_AGENT, url)]


def discover_files(client: RetryingClient, root_url: str) -> list[str]:
    pending = [root_url]
    visited: set[str] = set()
    files: set[str] = set()

    while pending:
        directory_url = pending.pop()
        if directory_url in visited:
            continue
        visited.add(directory_url)
        print(f"[扫描] {urllib.parse.unquote(directory_url)}")
        try:
            with client.open(directory_url) as response:
                content_type = response.headers.get_content_type()
                charset = response.headers.get_content_charset() or "utf-8"
                body = response.read().decode(charset, errors="replace")
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            raise MirrorError(f"读取目录失败 {directory_url}: {exc}") from exc
        if content_type not in {"text/html", "application/xhtml+xml"}:
            raise MirrorError(f"目录没有返回 HTML：{directory_url} ({content_type})")

        parser = DirectoryIndexParser()
        parser.feed(body)
        for href in parser.hrefs:
            candidate = normalize_link(href, directory_url, root_url)
            if candidate is None or candidate == directory_url:
                continue
            if urllib.parse.urlsplit(candidate).path.endswith("/"):
                if candidate not in visited:
                    pending.append(candidate)
            else:
                files.add(candidate)

    return sorted(files)


def target_for_url(url: str, root_url: str, output_root: Path) -> Path:
    url_parts = decoded_path_parts(url)
    root_parts = decoded_path_parts(root_url)
    if url_parts[: len(root_parts)] != root_parts or len(url_parts) == len(root_parts):
        raise MirrorError(f"文件 URL 不在目标目录内：{url}")
    relative_parts = (root_parts[-1], *url_parts[len(root_parts) :])
    target = output_root.joinpath(*relative_parts)
    try:
        target.resolve(strict=False).relative_to(output_root.resolve())
    except ValueError as exc:
        raise MirrorError(f"本地目标路径越界：{target}") from exc
    return target


def download_file(client: RetryingClient, url: str, target: Path) -> str:
    if target.exists():
        return "skipped"

    target.parent.mkdir(parents=True, exist_ok=True)
    partial = target.with_name(target.name + ".part")
    if partial.is_symlink():
        raise MirrorError(f"拒绝写入符号链接：{partial}")
    start = partial.stat().st_size if partial.exists() else 0
    headers = {"Range": f"bytes={start}-"} if start else None

    try:
        response = client.open(url, headers=headers)
    except urllib.error.HTTPError as exc:
        if exc.code == 416 and start:
            total = _range_total(exc.headers.get("Content-Range"))
            exc.close()
            if total == start:
                os.replace(partial, target)
                return "downloaded"
        raise

    with response:
        status = getattr(response, "status", response.getcode())
        append = bool(start and status == 206)
        if append and _range_start(response.headers.get("Content-Range")) != start:
            raise MirrorError(f"服务器返回了错误的断点位置：{url}")
        expected = _content_length(response.headers.get("Content-Length"))
        mode = "ab" if append else "wb"
        written = 0
        with partial.open(mode) as output:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                output.write(chunk)
                written += len(chunk)
        last_modified = response.headers.get("Last-Modified")
        if expected is not None and written != expected:
            raise MirrorError(
                f"下载不完整：{url}（应收 {expected} 字节，实收 {written} 字节）"
            )

    os.replace(partial, target)
    if last_modified:
        try:
            modified = email.utils.parsedate_to_datetime(last_modified).timestamp()
            os.utime(target, (modified, modified))
        except (TypeError, ValueError, OverflowError, OSError):
            pass
    return "downloaded"


def _range_total(value: str | None) -> int | None:
    if not value or "/" not in value:
        return None
    try:
        return int(value.rsplit("/", 1)[1])
    except ValueError:
        return None


def _range_start(value: str | None) -> int | None:
    if not value or not value.startswith("bytes ") or "-" not in value:
        return None
    try:
        return int(value[6:].split("-", 1)[0])
    except ValueError:
        return None


def _content_length(value: str | None) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="递归下载公开 Apache 目录索引中的文件（请仅下载你有权获取的内容）"
    )
    parser.add_argument(
        "--output", type=Path, default=Path("pan/chexie.net"), help="下载目录"
    )
    parser.add_argument("--workers", type=int, default=3, help="并发下载数（默认 3）")
    parser.add_argument("--delay", type=float, default=0.25, help="请求最小间隔秒数")
    parser.add_argument("--timeout", type=float, default=30.0, help="单次请求超时秒数")
    parser.add_argument("--retries", type=int, default=4, help="失败重试次数")
    parser.add_argument("--dry-run", action="store_true", help="只列出文件，不下载")
    parser.add_argument(
        "--confirm-authorized",
        action="store_true",
        help="确认已获得授权；当 robots.txt 禁止抓取时必须显式提供",
    )
    parser.add_argument(
        "--site-root",
        default=DEFAULT_SITE_ROOT,
        help=argparse.SUPPRESS,
    )
    parser.add_argument(
        "--root-path",
        action="append",
        dest="root_paths",
        help=argparse.SUPPRESS,
    )
    args = parser.parse_args(argv)
    if args.workers < 1 or args.workers > 16:
        parser.error("--workers 必须在 1 到 16 之间")
    if args.delay < 0 or args.timeout <= 0 or args.retries < 0:
        parser.error("--delay、--timeout 和 --retries 的取值无效")
    return args


def mirror(args: argparse.Namespace) -> int:
    root_paths = args.root_paths or DEFAULT_ROOT_PATHS
    root_urls = build_root_urls(args.site_root, root_paths)
    disallowed = check_robots(args.site_root, root_urls)
    if disallowed and not args.confirm_authorized:
        shown = "\n  ".join(urllib.parse.unquote(url) for url in disallowed)
        raise MirrorError(
            "robots.txt 禁止自动抓取以下目录：\n"
            f"  {shown}\n"
            "如你是内容所有者或已获明确授权，请加 --confirm-authorized 后重试。"
        )
    if disallowed:
        print("[提示] 已根据 --confirm-authorized 继续处理 robots.txt 禁止抓取的目录。")

    output_root = args.output.expanduser().resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    client = RetryingClient(args.timeout, args.retries, args.delay)
    jobs_by_target: dict[Path, str] = {}
    for root_url in root_urls:
        for url in discover_files(client, root_url):
            target = target_for_url(url, root_url, output_root)
            jobs_by_target.setdefault(target, url)
    jobs = [(url, target) for target, url in jobs_by_target.items()]

    print(f"[汇总] 共发现 {len(jobs)} 个文件")
    if args.dry_run:
        for url, target in jobs:
            print(f"[文件] {target} <- {url}")
        return 0

    downloaded = 0
    skipped = 0
    failures: list[tuple[str, Exception]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        future_jobs = {
            executor.submit(download_file, client, url, target): (url, target)
            for url, target in jobs
        }
        for future in concurrent.futures.as_completed(future_jobs):
            url, target = future_jobs[future]
            try:
                result = future.result()
                if result == "skipped":
                    skipped += 1
                    print(f"[跳过] {target}")
                else:
                    downloaded += 1
                    print(f"[完成] {target}")
            except Exception as exc:
                failures.append((url, exc))
                print(f"[失败] {url}: {exc}", file=sys.stderr)

    print(f"[结果] 下载 {downloaded}，跳过 {skipped}，失败 {len(failures)}")
    return 1 if failures else 0


def main(argv: Sequence[str] | None = None) -> int:
    try:
        return mirror(parse_args(argv))
    except (MirrorError, urllib.error.URLError, OSError) as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("\n已中止；未完成文件保存在 .part 中，下次运行会断点续传。", file=sys.stderr)
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
