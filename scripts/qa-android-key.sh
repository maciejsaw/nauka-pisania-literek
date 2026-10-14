#!/usr/bin/env bash
set -euo pipefail
: "${RUNNER_TEMP:?Ten skrypt służy do tymczasowych prób GitHub Actions}"
: "${GITHUB_ENV:?Wymagane GitHub Actions}"
qa_key_path="$RUNNER_TEMP/qa-only-upload.jks"
qa_key_password=$(openssl rand -hex 24)
echo "::add-mask::$qa_key_password"
export QA_KEY_PASSWORD="$qa_key_password"
keytool -genkeypair -noprompt -keystore "$qa_key_path" -storetype JKS \
  -alias qa-only -storepass:env QA_KEY_PASSWORD -keypass:env QA_KEY_PASSWORD \
  -keyalg RSA -keysize 2048 -validity 2 -dname 'CN=QA only - never upload to stores' >/dev/null 2>&1
chmod 600 "$qa_key_path"
{
  echo "ANDROID_KEYSTORE_PATH=$qa_key_path"
  echo "ANDROID_KEYSTORE_PASSWORD=$qa_key_password"
  echo "ANDROID_KEY_PASSWORD=$qa_key_password"
  echo 'ANDROID_KEY_ALIAS=qa-only'
} >> "$GITHUB_ENV"
echo 'Utworzono tymczasowy podpis wyłącznie do sprawdzenia kompilacji Release.'
