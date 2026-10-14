import copy
import datetime
import importlib.util
import unittest

spec = importlib.util.spec_from_file_location('signing', 'scripts/check-ios-signing.py')
signing = importlib.util.module_from_spec(spec)
spec.loader.exec_module(signing)


class SigningTest(unittest.TestCase):
    def setUp(self):
        self.now = datetime.datetime(2026, 10, 14, tzinfo=datetime.timezone.utc)
        self.profile = {
            'Name': 'App Store profile', 'TeamIdentifier': ['AB12345678'],
            'Entitlements': {'com.apple.developer.team-identifier': 'AB12345678', 'application-identifier': 'OLDPREFIX1.com.example.app', 'get-task-allow': False},
            'ExpirationDate': datetime.datetime(2027, 10, 14), 'DeveloperCertificates': [b'certificate'],
        }

    def problems(self, profile=None, **kwargs):
        return signing.validate_profile(profile or self.profile, kwargs.get('team', 'AB12345678'), kwargs.get('bundle', 'com.example.app'), kwargs.get('cert', b'certificate'), self.now)

    def test_accepts_valid_profile_including_legacy_app_id_prefix(self):
        self.assertEqual(self.problems(), [])

    def test_rejects_other_team_bundle_and_certificate(self):
        self.assertTrue(self.problems(team='OTHERTEAM1'))
        self.assertTrue(self.problems(bundle='com.other.app'))
        self.assertTrue(self.problems(cert=b'other certificate'))
        self.profile['Entitlements']['application-identifier'] = 'AB12345678.*'
        self.assertTrue(self.problems())

    def test_rejects_development_ad_hoc_and_enterprise_profiles(self):
        for key, value in [('ProvisionedDevices', ['device']), ('ProvisionedDevices', []), ('ProvisionsAllDevices', True)]:
            profile = copy.deepcopy(self.profile)
            profile[key] = value
            self.assertTrue(self.problems(profile))
        self.profile['Entitlements']['get-task-allow'] = True
        self.assertTrue(self.problems())

    def test_rejects_expired_or_incomplete_profile(self):
        self.profile['ExpirationDate'] = datetime.datetime(2026, 10, 13)
        self.assertTrue(self.problems())
        del self.profile['ExpirationDate']
        self.assertTrue(self.problems())
