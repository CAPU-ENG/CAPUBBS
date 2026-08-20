import unittest

from archive_signature_threads import (
    collect_thread_authors,
    select_requested_profile,
    signature_references,
)


class SignatureReferenceTests(unittest.TestCase):
    def test_selects_exact_profile_from_legacy_collation_matches(self):
        profiles = [
            {"username": "AuPt\u3000", "sig1": "other"},
            {"username": "AuPt", "sig1": "exact"},
        ]

        profile, canonical_username, candidate_count = select_requested_profile(
            profiles, "AuPt"
        )

        self.assertEqual(profile["sig1"], "exact")
        self.assertEqual(canonical_username, "AuPt")
        self.assertEqual(candidate_count, 2)

    def test_accepts_unique_case_only_alias(self):
        profile, canonical_username, candidate_count = select_requested_profile(
            {"username": "Kody", "sig1": "signature"}, "kody"
        )

        self.assertEqual(profile["sig1"], "signature")
        self.assertEqual(canonical_username, "Kody")
        self.assertEqual(candidate_count, 1)

    def test_post_tag_accepts_non_breaking_spaces_and_attribute_order(self):
        references = signature_references("x[post\u00a0pid=2\u00a0tid=9065\u00a0bid=2]y")

        self.assertEqual(
            references,
            [
                {
                    "form": "post_tag",
                    "bid": 2,
                    "tid": 9065,
                    "rawMatch": "[post\u00a0pid=2\u00a0tid=9065\u00a0bid=2]",
                    "target": "\u00a0pid=2\u00a0tid=9065\u00a0bid=2",
                    "start": 1,
                    "end": 28,
                    "pid": 2,
                }
            ],
        )

    def test_extracts_legacy_link_forms_and_ignores_search_text(self):
        signature = (
            '<script>$.get("/api/bbs/content/floor/?bid=2&amp;tid=9051&amp;pid=8",'
            'function(){$(".sig").search("bid=4&tid=19989")});</script>'
            "[url=?p=2&bid=1&tid=8192#22]floor[/url]"
        )

        references = signature_references(signature)

        self.assertEqual(
            [(item["bid"], item["tid"]) for item in references],
            [(2, 9051), (1, 8192)],
        )
        self.assertEqual(references[0]["pid"], 8)
        self.assertEqual(references[1]["p"], 2)
        self.assertEqual(references[1]["anchor"], 22)

    def test_collects_floor_and_nested_reply_authors(self):
        payload = {
            "mainPost": {
                "author": "楼主",
                "bid": 2,
                "tid": 9,
                "pid": 1,
                "fid": 10,
                "nestedReplies": [{"author": "层中层", "id": 4, "fid": 10}],
            },
            "floors": [
                {"author": "匿名用户", "bid": 2, "tid": 9, "pid": 2, "fid": 11},
                {"author": "回复者", "bid": 2, "tid": 9, "pid": 3, "fid": 12},
            ],
        }

        authors = list(collect_thread_authors(payload))

        self.assertEqual(
            [item["username"] for item in authors],
            ["楼主", "层中层", "回复者"],
        )


if __name__ == "__main__":
    unittest.main()
