#!/usr/bin/env bash
set -euo pipefail
umask 077
mkdir -p secrets
[[ ! -f secrets/upload.jks ]] || { echo 'Klucz już istnieje. Nie nadpisuję.'; exit 1; }
command -v keytool >/dev/null || { echo 'Zainstaluj JDK 21 lub uruchom keytool z Javy dołączonej do Android Studio.'; exit 1; }
keytool -genkeypair -v -keystore secrets/upload.jks -storetype JKS -alias upload -keyalg RSA -keysize 2048 -validity 10000
printf '\nAlias to upload. Zachowaj kopię upload.jks i haseł poza repo. Nigdy nie twórz nowego klucza dla kolejnej wersji aplikacji.\n'
