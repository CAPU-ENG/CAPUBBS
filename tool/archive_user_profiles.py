#!/usr/bin/env python3
"""Collect authors from archived CAPUBBS threads and archive their profiles."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any

from archive_recent_threads import (
    DEFAULT_API_URL,
    ApiRequestError,
    CapubbsClient,
    validate_token,
    write_json_atomically,
)


IGNORED_AUTHORS = {"", "匿名用户"}


def now_iso() -> str:
    return dt.datetime.now().astimezone().isoformat()


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as input_file:
        return json.load(input_file)


def add_author(
    users: dict[str, dict[str, Any]],
    author: Any,
    location: dict[str, Any],
) -> None:
    username = str(author or "").strip()
    if username in IGNORED_AUTHORS:
        return
    entry = users.setdefault(username, {"occurrenceCount": 0, "locations": []})
    entry["occurrenceCount"] += 1
    entry["locations"].append(location)


def collect_floor_authors(
    users: dict[str, dict[str, Any]],
    floor: Any,
    kind: str,
    source_file: str,
) -> None:
    if not isinstance(floor, dict):
        return
    bid = int(floor.get("bid", 0))
    tid = int(floor.get("tid", 0))
    pid = int(floor.get("pid", 0))
    fid = int(floor.get("fid", 0))
    add_author(
        users,
        floor.get("author"),
        {
            "kind": kind,
            "bid": bid,
            "tid": tid,
            "pid": pid,
            "fid": fid,
            "sourceFile": source_file,
        },
    )

    nested_replies = floor.get("nestedReplies", [])
    if not isinstance(nested_replies, list):
        return
    for nested_reply in nested_replies:
        if not isinstance(nested_reply, dict):
            continue
        add_author(
            users,
            nested_reply.get("author"),
            {
                "kind": "nestedReply",
                "bid": bid,
                "tid": tid,
                "parentPid": pid,
                "parentFid": fid,
                "id": int(nested_reply.get("id", 0)),
                "fid": int(nested_reply.get("fid", fid)),
                "sourceFile": source_file,
            },
        )


def collect_usernames(
    archive_dir: Path,
) -> tuple[dict[str, dict[str, Any]], list[dict[str, str]], int]:
    users: dict[str, dict[str, Any]] = {}
    errors: list[dict[str, str]] = []
    thread_count = 0
    thread_paths = sorted(archive_dir.glob("boards/*/threads/*.json"))

    for thread_path in thread_paths:
        try:
            payload = load_json(thread_path)
        except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
            errors.append({"file": str(thread_path), "error": str(exc)})
            continue
        if not isinstance(payload, dict):
            errors.append({"file": str(thread_path), "error": "主题文件不是 JSON 对象"})
            continue

        thread_count += 1
        source_file = str(thread_path.relative_to(archive_dir))
        collect_floor_authors(users, payload.get("mainPost"), "mainPost", source_file)
        floors = payload.get("floors", [])
        if isinstance(floors, list):
            for floor in floors:
                collect_floor_authors(users, floor, "floor", source_file)

    return dict(sorted(users.items())), errors, thread_count


def profile_output_path(output_dir: Path, username: str) -> Path:
    digest = hashlib.sha256(username.encode("utf-8")).hexdigest()
    return output_dir / "profiles" / f"{digest}.json"


def is_profile_saved(path: Path, username: str) -> bool:
    if not path.is_file():
        return False
    try:
        payload = load_json(path)
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        return False
    return (
        isinstance(payload, dict)
        and payload.get("username") == username
        and isinstance(payload.get("profile"), dict)
    )


def normalize_profile(data: Any, username: str) -> dict[str, Any]:
    if isinstance(data, dict):
        candidates = [data]
    elif isinstance(data, list) and data and all(isinstance(item, dict) for item in data):
        candidates = data
    else:
        raise ApiRequestError("user_profile 返回的数据结构不正确")

    match_groups = (
        [item for item in candidates if str(item.get("username") or "") == username],
        [
            item
            for item in candidates
            if str(item.get("username") or "").strip() == username.strip()
        ],
    )
    for matches in match_groups:
        if len(matches) == 1:
            return matches[0]

    returned = [str(item.get("username") or "") for item in candidates]
    raise ApiRequestError(f"user_profile 无法唯一匹配 {username!r}：{returned!r}")


def write_username_index(
    output_dir: Path,
    users: dict[str, dict[str, Any]],
    scan_errors: list[dict[str, str]],
    thread_count: int,
) -> None:
    write_json_atomically(
        output_dir / "usernames.json",
        {
            "meta": {
                "generatedAt": now_iso(),
                "threadCount": thread_count,
                "usernameCount": len(users),
                "scanErrorCount": len(scan_errors),
            },
            "users": users,
            "scanErrors": scan_errors,
        },
    )


def archive_profiles(
    client: CapubbsClient,
    users: dict[str, dict[str, Any]],
    output_dir: Path,
    api_url: str,
    authenticated: bool,
) -> tuple[int, int, list[dict[str, str]]]:
    saved_count = 0
    skipped_count = 0
    errors: list[dict[str, str]] = []
    started_at = now_iso()
    manifest_users: dict[str, dict[str, Any]] = {}
    manifest: dict[str, Any] = {
        "meta": {
            "apiUrl": api_url,
            "startedAt": started_at,
            "updatedAt": started_at,
            "finishedAt": None,
            "status": "running",
            "authenticated": authenticated,
            "usernameCount": len(users),
            "savedThisRun": 0,
            "skippedThisRun": 0,
            "errorCount": 0,
        },
        "users": manifest_users,
        "errors": errors,
    }

    def checkpoint(status: str = "running") -> None:
        updated_at = now_iso()
        meta = manifest["meta"]
        meta["updatedAt"] = updated_at
        meta["status"] = status
        meta["savedThisRun"] = saved_count
        meta["skippedThisRun"] = skipped_count
        meta["errorCount"] = len(errors)
        if status == "finished":
            meta["finishedAt"] = updated_at
        write_json_atomically(output_dir / "manifest.json", manifest)

    checkpoint()
    usernames = list(users)
    for index, username in enumerate(usernames, start=1):
        profile_path = profile_output_path(output_dir, username)
        relative_path = str(profile_path.relative_to(output_dir))
        entry = {
            "occurrenceCount": users[username]["occurrenceCount"],
            "profileFile": relative_path,
            "status": "pending",
        }
        manifest_users[username] = entry
        print(f"[{index}/{len(usernames)}] {username}", file=sys.stderr)

        if is_profile_saved(profile_path, username):
            skipped_count += 1
            entry["status"] = "skipped"
            print("  已保存，跳过", file=sys.stderr)
            checkpoint()
            continue

        try:
            profile = normalize_profile(
                client.call("user_profile", username=username), username
            )
            write_json_atomically(
                profile_path,
                {
                    "username": username,
                    "fetchedAt": now_iso(),
                    "profile": profile,
                },
            )
            saved_count += 1
            entry["status"] = "saved"
            print(f"  已保存：{profile_path}", file=sys.stderr)
        except (ApiRequestError, TypeError, ValueError) as exc:
            entry["status"] = "error"
            errors.append({"username": username, "error": str(exc)})
            print(f"  失败：{exc}", file=sys.stderr)
        checkpoint()

    checkpoint("finished")
    return saved_count, skipped_count, errors


def write_consolidated_profiles(
    output_dir: Path, users: dict[str, dict[str, Any]]
) -> tuple[int, list[dict[str, str]]]:
    profiles: dict[str, Any] = {}
    errors: list[dict[str, str]] = []
    for username in users:
        path = profile_output_path(output_dir, username)
        if not is_profile_saved(path, username):
            continue
        try:
            payload = load_json(path)
            profiles[username] = payload["profile"]
        except (
            OSError,
            KeyError,
            TypeError,
            UnicodeDecodeError,
            json.JSONDecodeError,
        ) as exc:
            errors.append({"username": username, "error": str(exc)})
    write_json_atomically(
        output_dir / "profiles_by_username.json",
        {
            "meta": {
                "generatedAt": now_iso(),
                "profileCount": len(profiles),
                "errorCount": len(errors),
            },
            "profiles": profiles,
            "errors": errors,
        },
    )
    return len(profiles), errors


def default_archive_dir() -> Path:
    return Path(__file__).resolve().parent / "output"


def read_api_url(archive_dir: Path) -> str:
    configured_url = os.environ.get("CAPUBBS_API_URL")
    if configured_url:
        return configured_url
    try:
        manifest = load_json(archive_dir / "manifest.json")
        api_url = manifest.get("meta", {}).get("apiUrl")
        if api_url:
            return str(api_url)
    except (AttributeError, OSError, UnicodeDecodeError, json.JSONDecodeError):
        pass
    return DEFAULT_API_URL


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="汇总已归档楼层的用户名，并通过 CAPUBBS API 归档用户信息。")
    parser.add_argument(
        "--archive-dir",
        type=Path,
        default=None,
        help="主题归档目录（默认 tool/output/）",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="用户信息输出目录（默认 <archive-dir>/users/）",
    )
    parser.add_argument(
        "--api-url",
        default=None,
        help="统一 JSON API 地址（默认读取环境变量或主题归档清单）",
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


def main() -> int:
    args = parse_args()
    if args.timeout <= 0 or args.retries < 0 or args.delay < 0:
        print("错误：timeout 必须为正数，retries/delay 不能为负数", file=sys.stderr)
        return 2

    archive_dir = (args.archive_dir or default_archive_dir()).expanduser().resolve()
    output_dir = (args.output or archive_dir / "users").expanduser().resolve()
    if not (archive_dir / "boards").is_dir():
        print(f"错误：找不到主题归档目录：{archive_dir / 'boards'}", file=sys.stderr)
        return 2

    try:
        token = validate_token(os.environ.get(args.token_env, ""))
    except ValueError as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 2

    users, scan_errors, thread_count = collect_usernames(archive_dir)
    write_username_index(output_dir, users, scan_errors, thread_count)
    print(
        f"已扫描 {thread_count} 个主题，汇总 {len(users)} 个用户，" f"{len(scan_errors)} 个读取错误。",
        file=sys.stderr,
    )

    api_url = args.api_url or read_api_url(archive_dir)
    client = CapubbsClient(
        api_url=api_url,
        token=token,
        timeout=args.timeout,
        retries=args.retries,
        delay=args.delay,
    )
    saved_count, skipped_count, errors = archive_profiles(
        client, users, output_dir, api_url, bool(token)
    )
    profile_count, consolidation_errors = write_consolidated_profiles(output_dir, users)
    print(
        f"完成：本次保存 {saved_count} 个用户，跳过 {skipped_count} 个，"
        f"当前共汇总 {profile_count} 份用户信息，"
        f"{len(errors) + len(consolidation_errors)} 个错误。"
        f"\n输出目录：{output_dir}",
        file=sys.stderr,
    )
    return 0 if not (scan_errors or errors or consolidation_errors) else 3


if __name__ == "__main__":
    raise SystemExit(main())
