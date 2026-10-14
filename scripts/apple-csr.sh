#!/usr/bin/env bash
set -euo pipefail
umask 077
mkdir -p secrets
if [[ -f secrets/apple-distribution.key ]]; then
  echo 'Klucz już istnieje. Zachowaj go; nie twórz nowego dla tego certyfikatu.'; exit 1
fi
openssl genrsa -out secrets/apple-distribution.key 2048
openssl req -new -key secrets/apple-distribution.key -out secrets/apple-distribution.csr
printf '\nWgraj secrets/apple-distribution.csr do Apple przy tworzeniu certyfikatu Apple Distribution.\nPrywatny plik .key zachowaj lokalnie.\n'
