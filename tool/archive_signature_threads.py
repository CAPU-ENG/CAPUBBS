#!/usr/bin/env python3
"""Archive threads referenced by user signatures and recursively fetch users.

The seed profiles come from ``archive_user_profiles.py``.  Every signature is
scanned for legacy floor links and ``[post bid=... tid=... pid=...]`` tags.
Referenced threads are archived in full, authors found in those threads have
their profiles fetched, and newly fetched signatures are scanned in turn.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import json
import os
import re
import sys
from collections import deque
from pathlib import Path
from typing import Any, Iterable

from archive_recent_threads import (
    DEFAULT_API_URL,
    ApiRequestError,
    CapubbsClient,
    archive_thread,
    validate_token,
    write_json_atomically,
)


IGNORED_AUTHORS = {"", "匿名用户"}
SIGNATURE_FIELDS = ("sig1", "sig2", "sig3")

POST_TAG_RE = re.compile(r"\[post\b([^\]]*)\]", re.IGNORECASE)
BBCODE_URL_RE = re.compile(r"\[url\s*=\s*([^\]]+)\]", re.IGNORECASE)
JQUERY_GET_RE = re.compile(
    r"\$\.get\(\s*([\"'])(.*?)\1", re.IGNORECASE | re.DOTALL
)
HTML_LINK_RE = re.compile(
    r"\b(?:href|src)\s*=\s*([\"'])(.*?)\1", re.IGNORECASE | re.DOTALL
)
POST_ATTRIBUTE_RE = re.compile(
    r"\b(bid|tid|pid|p)\s*=\s*[\"']?(\d+)", re.IGNORECASE
)
QUERY_ATTRIBUTE_RE = re.compile(
    r"(?:[?&]|&amp;)(bid|tid|pid|p)=([0-9]+)", re.IGNORECASE
)
NUMERIC_FRAGMENT_RE = re.compile(r"#(\d+)(?:\D|$)")


def now_iso() -> str:
    return dt.datetime.now().astimezone().isoformat()


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as input_file:
        return json.load(input_file)


def profile_file(output_dir: Path, username: str) -> Path:
    digest = hashlib.sha256(username.encode("utf-8")).hexdigest()
    return output_dir / "users" / "profiles" / f"{digest}.json"


def thread_file(output_dir: Path, bid: int, tid: int) -> Path:
    return output_dir / "threads" / str(bid) / f"{tid}.json"


def parse_reference_target(target: str, post_tag: bool = False) -> dict[str, int]:
    decoded = html.unescape(target)
    expression = POST_ATTRIBUTE_RE if post_tag else QUERY_ATTRIBUTE_RE
    values = {key.lower(): int(value) for key, value in expression.findall(decoded)}
    fragment = NUMERIC_FRAGMENT_RE.search(decoded)
    if fragment:
        values["anchor"] = int(fragment.group(1))
    return values


def signature_references(text: str) -> list[dict[str, Any]]:
    """Return concrete thread/floor links from one raw signature."""
    candidates: list[tuple[str, re.Match[str], str, bool]] = []
    for match in POST_TAG_RE.finditer(text):
        candidates.append(("post_tag", match, match.group(1), True))
    for form, expression, target_group in (
        ("bbcode_url", BBCODE_URL_RE, 1),
        ("jquery_get", JQUERY_GET_RE, 2),
        ("html_link", HTML_LINK_RE, 2),
    ):
        for match in expression.finditer(text):
            candidates.append((form, match, match.group(target_group), False))

    references: list[dict[str, Any]] = []
    seen: set[tuple[int, int, str, int, int]] = set()
    for form, match, target, post_tag in sorted(candidates, key=lambda item: item[1].start()):
        values = parse_reference_target(target, post_tag)
        bid = values.get("bid", 0)
        tid = values.get("tid", 0)
        if bid <= 0 or tid <= 0:
            continue
        identity = (match.start(), match.end(), form, bid, tid)
        if identity in seen:
            continue
        seen.add(identity)
        reference: dict[str, Any] = {
            "form": form,
            "bid": bid,
            "tid": tid,
            "rawMatch": match.group(0),
            "target": html.unescape(target),
            "start": match.start(),
            "end": match.end(),
        }
        for key in ("pid", "p", "anchor"):
            if key in values:
                reference[key] = values[key]
        references.append(reference)
    return references


def select_requested_profile(data: Any, username: str) -> tuple[dict[str, Any], str, int]:
    """Select one account when a legacy collation returns near-duplicate names."""
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
        [
            item
            for item in candidates
            if str(item.get("username") or "").strip().casefold()
            == username.strip().casefold()
        ],
    )
    for matches in match_groups:
        if len(matches) == 1:
            profile = matches[0]
            returned_username = str(profile.get("username") or "")
            return profile, returned_username, len(candidates)
    returned = [str(item.get("username") or "") for item in candidates]
    raise ApiRequestError(f"user_profile 无法唯一匹配 {username!r}：{returned!r}")


def collect_thread_authors(payload: dict[str, Any]) -> Iterable[dict[str, Any]]:
    floors: list[tuple[str, Any]] = [("mainPost", payload.get("mainPost"))]
    raw_floors = payload.get("floors", [])
    if isinstance(raw_floors, list):
        floors.extend(("floor", floor) for floor in raw_floors)

    for kind, floor in floors:
        if not isinstance(floor, dict):
            continue
        username = str(floor.get("author") or "").strip()
        if username not in IGNORED_AUTHORS:
            yield {
                "username": username,
                "kind": kind,
                "bid": int(floor.get("bid", 0)),
                "tid": int(floor.get("tid", 0)),
                "pid": int(floor.get("pid", 0)),
                "fid": int(floor.get("fid", 0)),
            }
        nested = floor.get("nestedReplies", [])
        if not isinstance(nested, list):
            continue
        for reply in nested:
            if not isinstance(reply, dict):
                continue
            username = str(reply.get("author") or "").strip()
            if username in IGNORED_AUTHORS:
                continue
            yield {
                "username": username,
                "kind": "nestedReply",
                "bid": int(floor.get("bid", 0)),
                "tid": int(floor.get("tid", 0)),
                "parentPid": int(floor.get("pid", 0)),
                "parentFid": int(floor.get("fid", 0)),
                "id": int(reply.get("id", 0)),
                "fid": int(reply.get("fid", floor.get("fid", 0))),
            }


class SignatureArchiver:
    def __init__(
        self,
        client: CapubbsClient,
        seed_profiles_path: Path,
        seed_usernames_path: Path | None,
        output_dir: Path,
        api_url: str,
        authenticated: bool,
    ) -> None:
        self.client = client
        self.seed_profiles_path = seed_profiles_path
        self.seed_usernames_path = seed_usernames_path
        self.output_dir = output_dir
        self.api_url = api_url
        self.authenticated = authenticated

        self.profiles: dict[str, dict[str, Any]] = {}
        self.users: dict[str, dict[str, Any]] = {}
        self.signature_records: dict[tuple[str, str], dict[str, Any]] = {}
        self.thread_records: dict[tuple[int, int], dict[str, Any]] = {}
        self.profile_queue: deque[str] = deque()
        self.thread_queue: deque[tuple[int, int]] = deque()
        self.queued_profiles: set[str] = set()
        self.queued_threads: set[tuple[int, int]] = set()
        self.attempted_profiles: set[str] = set()
        self.attempted_threads: set[tuple[int, int]] = set()
        self.errors: list[dict[str, Any]] = []
        self.attachment_cache: dict[int, dict[str, Any]] = {}
        self.started_at = now_iso()

    def add_user_source(self, username: str, source: dict[str, Any]) -> None:
        entry = self.users.setdefault(
            username,
            {
                "username": username,
                "profileStatus": "pending",
                "signatureReferenceCount": 0,
                "sources": [],
            },
        )
        if source not in entry["sources"]:
            entry["sources"].append(source)

    def enqueue_profile(self, username: str) -> None:
        if (
            username in IGNORED_AUTHORS
            or username in self.profiles
            or username in self.attempted_profiles
            or username in self.queued_profiles
        ):
            return
        self.queued_profiles.add(username)
        self.profile_queue.append(username)

    def enqueue_thread(self, bid: int, tid: int) -> None:
        key = (bid, tid)
        if key in self.attempted_threads or key in self.queued_threads:
            return
        self.queued_threads.add(key)
        self.thread_queue.append(key)

    def load_seeds(self) -> None:
        payload = load_json(self.seed_profiles_path)
        profiles = payload.get("profiles") if isinstance(payload, dict) else None
        if not isinstance(profiles, dict):
            raise ValueError("种子用户资料必须包含 profiles 对象")

        for username, profile in sorted(profiles.items()):
            if not isinstance(profile, dict):
                raise ValueError(f"用户资料不是对象：{username!r}")
            self.add_user_source(username, {"kind": "seedProfile"})
            self.users[username]["profileStatus"] = "seed"
            self.profiles[username] = profile

        if self.seed_usernames_path and self.seed_usernames_path.is_file():
            usernames_payload = load_json(self.seed_usernames_path)
            usernames = (
                usernames_payload.get("users")
                if isinstance(usernames_payload, dict)
                else None
            )
            if not isinstance(usernames, dict):
                raise ValueError("种子用户名索引必须包含 users 对象")
            for username in sorted(usernames):
                self.add_user_source(username, {"kind": "seedUsernameIndex"})
                self.enqueue_profile(username)

        for username, profile in sorted(self.profiles.items()):
            self.scan_profile(username, profile)

    def scan_profile(self, username: str, profile: dict[str, Any]) -> None:
        user_entry = self.users[username]
        reference_count = 0
        for field in SIGNATURE_FIELDS:
            text = str(profile.get(field) or "")
            references = signature_references(text)
            if not references:
                continue
            signature_entry = {
                "username": username,
                "field": field,
                "text": text,
                "references": references,
            }
            self.signature_records[(username, field)] = signature_entry
            reference_count += len(references)
            for reference in references:
                key = (reference["bid"], reference["tid"])
                thread_entry = self.thread_records.setdefault(
                    key,
                    {
                        "bid": key[0],
                        "tid": key[1],
                        "status": "pending",
                        "references": [],
                    },
                )
                source_reference = {
                    "username": username,
                    "field": field,
                    **reference,
                }
                if source_reference not in thread_entry["references"]:
                    thread_entry["references"].append(source_reference)
                self.enqueue_thread(*key)
        user_entry["signatureReferenceCount"] = reference_count

    def fetch_profile(self, username: str) -> None:
        self.queued_profiles.discard(username)
        self.attempted_profiles.add(username)
        entry = self.users[username]
        print(f"[用户] {username}", file=sys.stderr)
        try:
            path = profile_file(self.output_dir, username)
            saved_payload = self.load_reusable_profile(path, username)
            if saved_payload is not None:
                profile = saved_payload["profile"]
                returned_username = str(profile.get("username") or username)
                candidate_count = 1
                entry["profileStatus"] = "reused"
                print("  已存在，复用并继续排查签名", file=sys.stderr)
            else:
                profile, returned_username, candidate_count = select_requested_profile(
                    self.client.call("user_profile", username=username), username
                )
                entry["profileStatus"] = "saved"
                write_json_atomically(
                    path,
                    {
                        "username": username,
                        "canonicalUsername": returned_username,
                        "fetchedAt": now_iso(),
                        "profile": profile,
                    },
                )
                print(f"  已保存：{path}", file=sys.stderr)
            self.profiles[username] = profile
            entry["canonicalUsername"] = returned_username
            entry["profileCandidateCount"] = candidate_count
            entry["profileFile"] = str(path.relative_to(self.output_dir))
            self.scan_profile(username, profile)
        except (ApiRequestError, TypeError, ValueError) as exc:
            entry["profileStatus"] = "error"
            entry["profileError"] = str(exc)
            error = {"stage": "user_profile", "username": username, "error": str(exc)}
            self.errors.append(error)
            print(f"  失败：{exc}", file=sys.stderr)

    def load_reusable_profile(
        self, path: Path, username: str
    ) -> dict[str, Any] | None:
        if not path.is_file():
            return None
        try:
            payload = load_json(path)
            if not isinstance(payload, dict) or payload.get("username") != username:
                return None
            profile = payload.get("profile")
            return payload if isinstance(profile, dict) else None
        except (OSError, UnicodeDecodeError, json.JSONDecodeError):
            return None

    def load_reusable_thread(self, path: Path, bid: int, tid: int) -> dict[str, Any] | None:
        if not path.is_file():
            return None
        try:
            payload = load_json(path)
            if not isinstance(payload, dict):
                return None
            summary = payload.get("summary")
            if not isinstance(summary, dict):
                return None
            if int(summary.get("bid", 0)) != bid or int(summary.get("tid", 0)) != tid:
                return None
            if not isinstance(payload.get("mainPost"), dict):
                return None
            if not isinstance(payload.get("floors"), list):
                return None
            return payload
        except (OSError, TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError):
            return None

    def fetch_thread(self, bid: int, tid: int) -> None:
        key = (bid, tid)
        self.queued_threads.discard(key)
        self.attempted_threads.add(key)
        entry = self.thread_records[key]
        path = thread_file(self.output_dir, bid, tid)
        print(f"[主题] bid={bid} tid={tid}", file=sys.stderr)
        try:
            payload = self.load_reusable_thread(path, bid, tid)
            if payload is None:
                payload = archive_thread(
                    self.client,
                    bid,
                    tid,
                    {"bid": bid, "tid": tid},
                    self.attachment_cache,
                )
                thread_summary = payload.get("thread")
                if isinstance(thread_summary, dict):
                    payload["summary"] = {**thread_summary, "bid": bid, "tid": tid}
                write_json_atomically(path, payload)
                entry["status"] = "saved"
                print(f"  已保存：{path}", file=sys.stderr)
            else:
                entry["status"] = "reused"
                print("  已存在，复用并继续收集用户", file=sys.stderr)
            entry["threadFile"] = str(path.relative_to(self.output_dir))
            thread_info = payload.get("thread")
            if isinstance(thread_info, dict):
                entry["title"] = str(thread_info.get("title") or "")

            referenced_pids = {
                int(reference["pid"])
                for reference in entry["references"]
                if "pid" in reference
            }
            found_pids: set[int] = set()
            for floor_key in ("mainPost", "floors"):
                floors = payload.get(floor_key)
                if isinstance(floors, dict):
                    floors = [floors]
                if isinstance(floors, list):
                    for floor in floors:
                        if isinstance(floor, dict):
                            found_pids.add(int(floor.get("pid", 0)))
            if referenced_pids:
                entry["referencedPids"] = sorted(referenced_pids)
                entry["missingReferencedPids"] = sorted(referenced_pids - found_pids)

            for author in collect_thread_authors(payload):
                username = author.pop("username")
                self.add_user_source(username, {"kind": "signatureThread", **author})
                self.enqueue_profile(username)
        except (ApiRequestError, TypeError, ValueError) as exc:
            entry["status"] = "error"
            entry["error"] = str(exc)
            error = {
                "stage": "thread_detail",
                "bid": bid,
                "tid": tid,
                "error": str(exc),
            }
            self.errors.append(error)
            print(f"  失败：{exc}", file=sys.stderr)

    def write_outputs(self, status: str) -> None:
        updated_at = now_iso()
        signatures = [
            self.signature_records[key] for key in sorted(self.signature_records)
        ]
        threads = [self.thread_records[key] for key in sorted(self.thread_records)]
        users = [self.users[key] for key in sorted(self.users)]
        reference_count = sum(len(item["references"]) for item in signatures)
        thread_error_count = sum(item["status"] == "error" for item in threads)
        profile_error_count = sum(
            item["profileStatus"] == "error" for item in users
        )
        meta = {
            "apiUrl": self.api_url,
            "seedProfilesFile": str(self.seed_profiles_path),
            "seedUsernamesFile": (
                str(self.seed_usernames_path) if self.seed_usernames_path else None
            ),
            "startedAt": self.started_at,
            "updatedAt": updated_at,
            "finishedAt": updated_at if status == "finished" else None,
            "status": status,
            "authenticated": self.authenticated,
            "userCount": len(users),
            "profileCount": len(self.profiles),
            "profileErrorCount": profile_error_count,
            "signatureCount": len(signatures),
            "signatureReferenceCount": reference_count,
            "threadCount": len(threads),
            "threadSavedCount": sum(
                item["status"] in {"saved", "reused"} for item in threads
            ),
            "threadErrorCount": thread_error_count,
            "pendingProfileCount": len(self.profile_queue),
            "pendingThreadCount": len(self.thread_queue),
            "errorCount": len(self.errors),
        }
        write_json_atomically(
            self.output_dir / "signature_matches.json",
            {"meta": meta, "signatures": signatures, "threads": threads},
        )
        write_json_atomically(
            self.output_dir / "users" / "index.json",
            {"meta": meta, "users": users},
        )
        write_json_atomically(
            self.output_dir / "users" / "profiles_by_username.json",
            {"meta": meta, "profiles": dict(sorted(self.profiles.items()))},
        )
        write_json_atomically(
            self.output_dir / "manifest.json",
            {"meta": meta, "errors": self.errors},
        )

    def run(self) -> dict[str, Any]:
        self.load_seeds()
        self.write_outputs("running")
        work_count = 0
        while self.profile_queue or self.thread_queue:
            if self.profile_queue:
                self.fetch_profile(self.profile_queue.popleft())
            else:
                bid, tid = self.thread_queue.popleft()
                self.fetch_thread(bid, tid)
            work_count += 1
            if work_count % 10 == 0:
                self.write_outputs("running")
        self.write_outputs("finished")
        return load_json(self.output_dir / "manifest.json")["meta"]


def default_seed_profiles() -> Path:
    return Path(__file__).resolve().parent / "output" / "users" / "profiles_by_username.json"


def default_output() -> Path:
    return Path(__file__).resolve().parent / "output" / "signature_links"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="排查用户签名中的楼层链接，递归归档对应主题和新用户资料。"
    )
    parser.add_argument("--profiles", type=Path, default=None, help="种子用户资料汇总 JSON")
    parser.add_argument(
        "--usernames",
        type=Path,
        default=None,
        help="种子用户名索引（默认使用 profiles 同目录的 usernames.json）",
    )
    parser.add_argument("--output", type=Path, default=None, help="输出目录")
    parser.add_argument(
        "--api-url",
        default=os.environ.get("CAPUBBS_API_URL", DEFAULT_API_URL),
        help="CAPUBBS JSON API 地址",
    )
    parser.add_argument(
        "--token-env", default="CAPUBBS_TOKEN", help="存放登录 token 的环境变量名"
    )
    parser.add_argument("--timeout", type=float, default=30.0)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--delay", type=float, default=0.1)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.timeout <= 0 or args.retries < 0 or args.delay < 0:
        print("错误：timeout 必须为正数，retries/delay 不能为负数", file=sys.stderr)
        return 2
    profiles_path = (args.profiles or default_seed_profiles()).expanduser().resolve()
    usernames_path = (
        args.usernames.expanduser().resolve()
        if args.usernames
        else profiles_path.with_name("usernames.json")
    )
    output_dir = (args.output or default_output()).expanduser().resolve()
    if not profiles_path.is_file():
        print(f"错误：找不到种子用户资料：{profiles_path}", file=sys.stderr)
        return 2
    try:
        token = validate_token(os.environ.get(args.token_env, ""))
        archiver = SignatureArchiver(
            CapubbsClient(
                api_url=args.api_url,
                token=token,
                timeout=args.timeout,
                retries=args.retries,
                delay=args.delay,
            ),
            profiles_path,
            usernames_path if usernames_path.is_file() else None,
            output_dir,
            args.api_url,
            bool(token),
        )
        meta = archiver.run()
    except (OSError, UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 2

    print(
        "完成："
        f"排查 {meta['userCount']} 个用户，保存 {meta['profileCount']} 份资料；"
        f"记录 {meta['signatureReferenceCount']} 处签名引用、{meta['threadCount']} 个主题，"
        f"成功归档 {meta['threadSavedCount']} 个主题，失败 {meta['errorCount']} 项。"
        f"\n输出目录：{output_dir}",
        file=sys.stderr,
    )
    return 0 if meta["errorCount"] == 0 else 3


if __name__ == "__main__":
    raise SystemExit(main())
