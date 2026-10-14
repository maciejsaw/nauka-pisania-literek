#!/usr/bin/env python3
"""Validate Apple signing inputs before installing them; never print file contents."""
import datetime
import hashlib
import json
import os
import plistlib
import subprocess
import sys


def run(args, data=None):
    result = subprocess.run(args, input=data, capture_output=True)
    if result.returncode:
        raise ValueError('Nie można odczytać podpisu. Sprawdź pliki i hasło IOS_CERT_PASSWORD (krok 5 instrukcji).')
    return result.stdout


def validate_profile(profile, team, bundle, cert_der, now):
    problems = []
    entitlements = profile.get('Entitlements', {})
    if team not in profile.get('TeamIdentifier', []) or entitlements.get('com.apple.developer.team-identifier') != team:
        problems.append('Profil należy do innego Apple Team ID.')
    identifier = entitlements.get('application-identifier', '')
    if identifier.partition('.')[2] != bundle:
        problems.append('Profil nie jest przeznaczony dla Bundle ID tej aplikacji.')
    if profile.get('ProvisionedDevices') is not None or profile.get('ProvisionsAllDevices') or entitlements.get('get-task-allow'):
        problems.append('Wymagany profil App Store Connect, nie Development, Ad Hoc ani Enterprise.')
    expires = profile.get('ExpirationDate')
    if not isinstance(expires, datetime.datetime) or expires.replace(tzinfo=datetime.timezone.utc) <= now:
        problems.append('Profil wygasł lub nie ma prawidłowej daty ważności.')
    if not profile.get('Name'):
        problems.append('Profil nie ma nazwy wymaganej do eksportu paczki.')
    fingerprint = hashlib.sha256(cert_der).digest()
    if not any(hashlib.sha256(cert).digest() == fingerprint for cert in profile.get('DeveloperCertificates', [])):
        problems.append('Certyfikat w pliku p12 nie jest wskazany w profilu. Pobierz profil dla tego certyfikatu.')
    return problems


def main():
    profile = plistlib.loads(run(['security', 'cms', '-D', '-i', os.environ['IOS_PROFILE_PATH']]))
    p12 = ['openssl', 'pkcs12', '-in', os.environ['IOS_P12_PATH'], '-passin', 'env:IOS_CERT_PASSWORD']
    cert_pem = run(p12 + ['-clcerts', '-nokeys'])
    cert_der = run(['openssl', 'x509', '-outform', 'DER'], cert_pem)
    # The private key stays in process memory, never a file, argument or log.
    private_pem = run(p12 + ['-nocerts', '-nodes'])
    cert_public = run(['openssl', 'x509', '-pubkey', '-noout'], cert_pem)
    private_public = run(['openssl', 'pkey', '-pubout'], private_pem)
    config = json.load(open('release-config.json'))
    now = datetime.datetime.now(datetime.timezone.utc)
    problems = validate_profile(profile, os.environ['APPLE_TEAM_ID'], config['bundleId'], cert_der, now)
    if cert_public != private_public:
        problems.append('Klucz prywatny p12 nie pasuje do certyfikatu.')
    expiry = subprocess.run(['openssl', 'x509', '-checkend', '0', '-noout'], input=cert_pem, capture_output=True)
    if expiry.returncode:
        problems.append('Certyfikat Apple wygasł. Odnów certyfikat i profil (krok 5).')
    if problems:
        print('\n'.join('• ' + problem for problem in problems))
        return 1
    near_expiry = subprocess.run(['openssl', 'x509', '-checkend', '2592000', '-noout'], input=cert_pem, capture_output=True).returncode
    if near_expiry or profile['ExpirationDate'].replace(tzinfo=datetime.timezone.utc) - now < datetime.timedelta(days=30):
        print('::warning::Podpis Apple wygaśnie w ciągu 30 dni. Zaplanuj odnowienie certyfikatu/profilu (krok 5).')
    print('Podpis Apple: właściwa aplikacja, zespół, profil App Store i pasujący ważny certyfikat z kluczem.')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        print('Nie udało się odczytać podpisu Apple. Sprawdź pliki p12/mobileprovision i hasło (krok 5 instrukcji).')
        sys.exit(1)
