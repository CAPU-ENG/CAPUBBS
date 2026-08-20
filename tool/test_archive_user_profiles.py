import unittest

from archive_recent_threads import ApiRequestError
from archive_user_profiles import normalize_profile


class NormalizeProfileTests(unittest.TestCase):
    def test_selects_unique_exact_profile_from_legacy_collation_matches(self):
        profiles = [
            {"username": "AuPt\u3000", "intro": "other"},
            {"username": "AuPt", "intro": "exact"},
        ]

        profile = normalize_profile(profiles, "AuPt")

        self.assertEqual(profile["intro"], "exact")

    def test_rejects_case_only_alias_to_avoid_importing_wrong_account(self):
        with self.assertRaises(ApiRequestError):
            normalize_profile({"username": "Kody"}, "kody")

    def test_accepts_unique_trailing_space_variant_used_by_legacy_account(self):
        profile = normalize_profile({"username": "Blade runner "}, "Blade runner")

        self.assertEqual(profile["username"], "Blade runner ")


if __name__ == "__main__":
    unittest.main()
