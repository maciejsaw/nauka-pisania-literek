#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ $# -eq 1 ]] || { echo 'Użycie: bash scripts/apple-p12.sh /ścieżka/do/distribution.cer'; exit 1; }
[[ ! -f secrets/distribution.p12 ]] || { echo 'distribution.p12 już istnieje; nie nadpisuję.'; exit 1; }
openssl x509 -inform DER -in "$1" -out secrets/distribution.pem
openssl pkcs12 -export -inkey secrets/apple-distribution.key -in secrets/distribution.pem -name 'Pajaczek Apple Distribution' -out secrets/distribution.p12
printf '\nHasło podane powyżej zapisz jako IOS_CERT_PASSWORD. Zachowaj kopię klucza i certyfikatu poza repo.\n'
