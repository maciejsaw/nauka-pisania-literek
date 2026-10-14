#!/usr/bin/env bash
set -euo pipefail
# Importing the selected private-key entry also verifies its password before Gradle runs.
check_dir=$(mktemp -d)
trap 'rm -rf "$check_dir"' EXIT
if ! keytool -importkeystore -noprompt \
  -srckeystore "$ANDROID_KEYSTORE_PATH" -srcstorepass:env ANDROID_KEYSTORE_PASSWORD \
  -srcalias "$ANDROID_KEY_ALIAS" -srckeypass:env ANDROID_KEY_PASSWORD \
  -destkeystore "$check_dir/check.p12" -deststoretype PKCS12 \
  -deststorepass:env ANDROID_KEYSTORE_PASSWORD -destkeypass:env ANDROID_KEYSTORE_PASSWORD \
  >"$check_dir/result.log" 2>&1; then
  echo 'Nie można odczytać klucza Android. Sprawdź plik, alias i oba hasła (krok 5 instrukcji).'
  exit 1
fi
echo 'Podpis Android: magazyn, alias i hasło klucza są zgodne.'
