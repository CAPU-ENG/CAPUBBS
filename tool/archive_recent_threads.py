#!/usr/bin/env python3
"""Archive every board's most recent threads through the CAPUBBS JSON API.

The resulting snapshot contains board metadata, thread metadata, the main post,
every floor, nested replies, and attachment metadata.  Authentication is
optional, but is required for boards that are not publicly readable.
"""

from __future__ import annotations

import argparse
import datetime as dt
import http.client
import json
import os
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_API_URL = "https://www.chexie.net/api/api.php"
DEFAULT_LIMIT = 20
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


class ApiRequestError(RuntimeError):
    """An HTTP, JSON, or application-level API failure."""


class ApiDecodeError(ApiRequestError):
    """The API response could not be decoded safely."""


class CapubbsClient:
    def __init__(
        self,
        api_url: str,
        token: str = "",
        timeout: float = 30.0,
        retries: int = 3,
        delay: float = 0.1,
    ) -> None:
        self.api_url = api_url
        self.token = token
        self.timeout = timeout
        self.retries = retries
        self.delay = delay

    def call(self, ask: str, **params: Any) -> Any:
        payload = {"ask": ask, **params}
        encoded = urllib.parse.urlencode(payload).encode("utf-8")
        headers = {
            "Accept": "application/json",
            "Connection": "close",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "User-Agent": "CAPUBBS-archiver/1.0",
        }
        if self.token:
            headers["Cookie"] = f"token={self.token}"

        last_error: Exception | None = None
        for attempt in range(self.retries + 1):
            if self.delay > 0:
                time.sleep(self.delay)
            request = urllib.request.Request(
                self.api_url, data=encoded, headers=headers, method="POST"
            )
            try:
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    try:
                        raw_body = response.read()
                    except http.client.IncompleteRead as exc:
                        # Some reverse proxies omit the final chunk terminator even
                        # though the JSON body itself is complete.  Accept it only
                        # when the partial bytes form a complete, valid response.
                        try:
                            return self._decode_body(exc.partial)
                        except ApiDecodeError:
                            raise exc
                return self._decode_body(raw_body)
            except urllib.error.HTTPError as exc:
                message = self._http_error_message(exc)
                last_error = ApiRequestError(message)
                if exc.code not in RETRYABLE_STATUS_CODES or attempt >= self.retries:
                    raise last_error from exc
            except (
                urllib.error.URLError,
                socket.timeout,
                TimeoutError,
                http.client.HTTPException,
                ConnectionError,
            ) as exc:
                last_error = ApiRequestError(f"网络请求失败: {exc}")
                if attempt >= self.retries:
                    raise last_error from exc

            time.sleep(min(2**attempt, 8))

        raise ApiRequestError(str(last_error or "API 请求失败"))

    @staticmethod
    def _decode_body(raw_body: bytes) -> Any:
        try:
            body = json.loads(raw_body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ApiDecodeError(f"API 返回的不是有效 UTF-8 JSON: {exc}") from exc
        if not isinstance(body, dict) or "code" not in body:
            raise ApiDecodeError("API 返回了无法识别的 JSON 结构")
        try:
            code = int(body["code"])
        except (TypeError, ValueError) as exc:
            raise ApiDecodeError("API 返回了无法识别的状态码") from exc
        if code != 0:
            raise ApiRequestError(
                f"API 错误 {body['code']}: {body.get('message', '未知错误')}"
            )
        return body.get("data")

    @staticmethod
    def _http_error_message(exc: urllib.error.HTTPError) -> str:
        try:
            raw = exc.read().decode("utf-8", errors="replace")
            body = json.loads(raw)
            if isinstance(body, dict) and body.get("message"):
                return f"HTTP {exc.code}: {body['message']}"
        except (json.JSONDecodeError, OSError, http.client.HTTPException):
            pass
        return f"HTTP {exc.code}: {exc.reason}"


def as_list(value: Any, label: str) -> list[dict[str, Any]]:
    if value is None:
        return []
    if isinstance(value, dict):
        return [value]
    if isinstance(value, list) and all(isinstance(item, dict) for item in value):
        return value
    raise ApiRequestError(f"{label} 返回的数据结构不正确")


def attachment_metadata(client: CapubbsClient, attachment_id: int) -> dict[str, Any]:
    """Fetch the complete attachment row instead of relying on display fields."""
    rows = as_list(client.call("attachinfo", id=attachment_id), "attachinfo")
    if len(rows) != 1:
        raise ApiRequestError(f"attachinfo({attachment_id}) 返回了多条记录")
    row = rows[0]
    exists = str(row.get("exist", "YES")).upper() == "YES"
    if not exists:
        return {}
    returned_id = int(row.get("id", 0))
    if returned_id != attachment_id:
        raise ApiRequestError(f"attachinfo({attachment_id}) 返回了其他附件: {returned_id}")
    return {
        key: row[key]
        for key in (
            "id",
            "name",
            "path",
            "size",
            "uploader",
            "ref",
            "count",
            "price",
            "auth",
            "time",
        )
        if key in row
    }


def enrich_attachments(
    client: CapubbsClient,
    floors: list[dict[str, Any]],
    cache: dict[int, dict[str, Any]],
) -> None:
    """Attach exact source rows to every archived attachment reference."""
    for floor in floors:
        attachments = floor.get("attachments")
        if not isinstance(attachments, list):
            continue
        for attachment in attachments:
            if not isinstance(attachment, dict) or not attachment.get("exists", True):
                continue
            attachment_id = int(attachment.get("id", 0))
            if attachment_id <= 0:
                continue
            if attachment_id not in cache:
                cache[attachment_id] = attachment_metadata(client, attachment_id)
            if cache[attachment_id]:
                attachment["raw"] = cache[attachment_id]


def archive_thread(
    client: CapubbsClient,
    bid: int,
    tid: int,
    summary: dict[str, Any],
    attachment_cache: dict[int, dict[str, Any]],
) -> dict[str, Any]:
    first_page = client.call("thread_detail", bid=bid, tid=tid, page=1, render="raw")
    if not isinstance(first_page, dict):
        raise ApiRequestError("thread_detail 返回的数据结构不正确")

    page_info = first_page.get("floorsPage")
    if not isinstance(page_info, dict):
        raise ApiRequestError("thread_detail 缺少 floorsPage")

    replies_by_pid: dict[int, dict[str, Any]] = {}
    pages_fetched = 0
    current_page = first_page

    while True:
        current_info = current_page.get("floorsPage")
        if not isinstance(current_info, dict):
            raise ApiRequestError("thread_detail 分页数据不完整")
        pages_fetched += 1
        for floor in as_list(current_info.get("items"), "floorsPage.items"):
            pid = int(floor.get("pid", 0))
            if pid > 1:
                replies_by_pid[pid] = floor

        if not current_info.get("hasMore"):
            break
        next_page = int(current_info.get("nextCursor") or (pages_fetched + 1))
        current_page = client.call(
            "thread_detail", bid=bid, tid=tid, page=next_page, render="raw"
        )
        if not isinstance(current_page, dict):
            raise ApiRequestError("thread_detail 返回的数据结构不正确")

    main_post = first_page.get("mainPost")
    floors = [replies_by_pid[pid] for pid in sorted(replies_by_pid)]
    attachment_floors = [
        floor for floor in [main_post, *floors] if isinstance(floor, dict)
    ]
    enrich_attachments(client, attachment_floors, attachment_cache)

    return {
        "summary": summary,
        "board": first_page.get("board"),
        "thread": first_page.get("thread"),
        "mainPost": main_post,
        "floors": floors,
        "activity": first_page.get("activity"),
        "viewerState": first_page.get("viewerState"),
        "pagination": {
            "pagesFetched": pages_fetched,
            "reportedPages": int(page_info.get("pages", pages_fetched)),
            "reportedTotal": int(page_info.get("total", len(replies_by_pid) + 1)),
        },
    }


def thread_output_path(output_dir: Path, bid: int, tid: int) -> Path:
    return output_dir / "boards" / str(bid) / "threads" / f"{tid}.json"


def is_thread_saved(path: Path, bid: int, tid: int) -> bool:
    if not path.is_file():
        return False
    try:
        with path.open(encoding="utf-8") as input_file:
            payload = json.load(input_file)
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        return False
    if not isinstance(payload, dict):
        return False
    summary = payload.get("summary")
    main_post = payload.get("mainPost")
    floors = payload.get("floors")
    if not isinstance(summary, dict):
        return False
    try:
        matches_thread = (
            int(summary.get("bid", 0)) == bid and int(summary.get("tid", 0)) == tid
        )
    except (TypeError, ValueError):
        return False
    return matches_thread and isinstance(main_post, dict) and isinstance(floors, list)


def count_saved_threads(output_dir: Path) -> int:
    return sum(1 for _ in (output_dir / "boards").glob("*/threads/*.json"))


def archive_all_boards(
    client: CapubbsClient,
    limit: int,
    output_dir: Path,
    api_url: str,
    authenticated: bool,
) -> tuple[int, int, int, list[dict[str, Any]]]:
    boards = as_list(client.call("bbsinfo"), "bbsinfo")
    errors: list[dict[str, Any]] = []
    downloaded_count = 0
    skipped_count = 0
    started_at = dt.datetime.now().astimezone()
    manifest: dict[str, Any] = {
        "meta": {
            "apiUrl": api_url,
            "startedAt": started_at.isoformat(),
            "updatedAt": started_at.isoformat(),
            "finishedAt": None,
            "status": "running",
            "threadsPerBoard": limit,
            "authenticated": authenticated,
            "boardCount": len(boards),
            "downloadedThisRun": 0,
            "skippedThisRun": 0,
            "savedThreadCount": count_saved_threads(output_dir),
            "errorCount": 0,
        },
        "boards": [],
        "errors": errors,
    }

    def checkpoint(status: str = "running") -> None:
        now = dt.datetime.now().astimezone()
        meta = manifest["meta"]
        meta["updatedAt"] = now.isoformat()
        meta["status"] = status
        meta["downloadedThisRun"] = downloaded_count
        meta["skippedThisRun"] = skipped_count
        meta["savedThreadCount"] = count_saved_threads(output_dir)
        meta["errorCount"] = len(errors)
        if status == "finished":
            meta["finishedAt"] = now.isoformat()
        write_json_atomically(output_dir / "manifest.json", manifest)

    checkpoint()
    attachment_cache: dict[int, dict[str, Any]] = {}

    for board_index, board in enumerate(boards, start=1):
        bid = int(board.get("bid", 0))
        board_name = str(board.get("name") or board.get("bbstitle") or f"版块 {bid}")
        print(
            f"[{board_index}/{len(boards)}] {board_name} (bid={bid})", file=sys.stderr
        )

        board_dir = output_dir / "boards" / str(bid)
        board_entry: dict[str, Any] = {
            "bid": bid,
            "name": board_name,
            "boardFile": str((board_dir / "board.json").relative_to(output_dir)),
            "threads": [],
        }
        manifest["boards"].append(board_entry)
        if bid <= 0:
            errors.append({"stage": "board", "bid": bid, "error": "无效的版块 ID"})
            checkpoint()
            continue
        write_json_atomically(board_dir / "board.json", board)

        try:
            summaries = as_list(
                client.call("recent_threads", bid=bid, limit=limit),
                "recent_threads",
            )
        except ApiRequestError as exc:
            errors.append({"stage": "thread_list", "bid": bid, "error": str(exc)})
            print(f"  跳过：{exc}", file=sys.stderr)
            checkpoint()
            continue
        write_json_atomically(
            board_dir / "recent_threads.json",
            {
                "fetchedAt": dt.datetime.now().astimezone().isoformat(),
                "limit": limit,
                "items": summaries,
            },
        )

        for thread_index, summary in enumerate(summaries, start=1):
            tid = int(summary.get("tid", 0))
            title = str(summary.get("title") or "(无标题)")
            output_path = thread_output_path(output_dir, bid, tid)
            thread_entry = {
                "bid": bid,
                "tid": tid,
                "title": title,
                "file": str(output_path.relative_to(output_dir)),
                "status": "pending",
            }
            board_entry["threads"].append(thread_entry)
            print(
                f"  [{thread_index}/{len(summaries)}] tid={tid} {title}",
                file=sys.stderr,
            )
            if is_thread_saved(output_path, bid, tid):
                skipped_count += 1
                thread_entry["status"] = "skipped"
                print("    已保存，跳过", file=sys.stderr)
                checkpoint()
                continue
            try:
                archived_thread = archive_thread(
                    client, bid, tid, summary, attachment_cache
                )
                write_json_atomically(output_path, archived_thread)
                downloaded_count += 1
                thread_entry["status"] = "saved"
                print(f"    已保存：{output_path}", file=sys.stderr)
            except (ApiRequestError, TypeError, ValueError) as exc:
                thread_entry["status"] = "error"
                errors.append(
                    {
                        "stage": "thread_detail",
                        "bid": bid,
                        "tid": tid,
                        "title": title,
                        "error": str(exc),
                    }
                )
                print(f"    失败：{exc}", file=sys.stderr)
            checkpoint()

    checkpoint("finished")
    return len(boards), downloaded_count, skipped_count, errors


def validate_token(token: str) -> str:
    if any(character in token for character in ";\r\n"):
        raise ValueError("token 包含非法字符")
    return token


def default_output_dir() -> Path:
    return Path(__file__).resolve().parent / "output"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="通过 CAPUBBS API 归档每个版块最新的主题及其全部内容。")
    parser.add_argument(
        "--api-url",
        default=os.environ.get("CAPUBBS_API_URL", DEFAULT_API_URL),
        help="统一 JSON API 地址（默认读取 CAPUBBS_API_URL）",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="输出目录（默认 tool/output/；目录中的已保存主题会自动跳过）",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=DEFAULT_LIMIT,
        help=f"每版归档的主题数（默认 {DEFAULT_LIMIT}，最大 100）",
    )
    parser.add_argument(
        "--token-env",
        default="CAPUBBS_TOKEN",
        help="存放登录 token 的环境变量名（默认 CAPUBBS_TOKEN）",
    )
    parser.add_argument("--timeout", type=float, default=30.0, help="单次请求超时秒数")
    parser.add_argument("--retries", type=int, default=3, help="网络错误重试次数")
    parser.add_argument("--delay", type=float, default=0.1, help="每次 API 请求前等待的秒数")
    return parser.parse_args()


def write_json_atomically(path: Path, payload: dict[str, Any]) -> None:
    path = path.expanduser().resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_name(f".{path.name}.tmp")
    try:
        with temporary_path.open("w", encoding="utf-8") as output_file:
            json.dump(payload, output_file, ensure_ascii=False, indent=2)
            output_file.write("\n")
            output_file.flush()
            os.fsync(output_file.fileno())
        os.replace(temporary_path, path)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def main() -> int:
    args = parse_args()
    if not 1 <= args.limit <= 100:
        print("错误：--limit 必须在 1 到 100 之间", file=sys.stderr)
        return 2
    if args.timeout <= 0 or args.retries < 0 or args.delay < 0:
        print("错误：timeout 必须为正数，retries/delay 不能为负数", file=sys.stderr)
        return 2

    try:
        token = validate_token(os.environ.get(args.token_env, ""))
    except ValueError as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 2

    client = CapubbsClient(
        api_url=args.api_url,
        token=token,
        timeout=args.timeout,
        retries=args.retries,
        delay=args.delay,
    )
    output_dir = (args.output or default_output_dir()).expanduser().resolve()
    try:
        board_count, downloaded_count, skipped_count, errors = archive_all_boards(
            client,
            args.limit,
            output_dir,
            args.api_url,
            bool(token),
        )
    except ApiRequestError as exc:
        print(f"无法获取版块列表：{exc}", file=sys.stderr)
        return 1
    print(
        f"完成：处理 {board_count} 个版块，本次保存 {downloaded_count} 个主题，"
        f"跳过 {skipped_count} 个已保存主题，{len(errors)} 个错误。"
        f"\n输出目录：{output_dir}",
        file=sys.stderr,
    )
    return 0 if not errors else 3


if __name__ == "__main__":
    raise SystemExit(main())
