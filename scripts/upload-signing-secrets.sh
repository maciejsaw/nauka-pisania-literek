#!/usr/bin/env bash
# Run yourself AFTER preparing these files. No credential values are printed.
set -euo pipefail
repo='maciejsaw/nauka-pisania-literek'
for entry in 'IOS_P12_BASE64:secrets/distribution.p12' 'IOS_PROFILE_BASE64:secrets/app.mobileprovision' 'ASC_KEY_P8_BASE64:secrets/AuthKey.p8' 'ANDROID_KEYSTORE_BASE64:secrets/upload.jks'; do
  name=${entry%%:*}; file=${entry#*:}
  [[ -f "$file" ]] || { echo "Brak $file"; exit 1; }
  base64 < "$file" | tr -d '\n' | gh secret set "$name" --repo "$repo"
done
gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON --repo "$repo" < secrets/play-account.json
for name in IOS_CERT_PASSWORD ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_PASSWORD REVIEW_CONTACT_JSON; do
  echo "Podaj $name w bezpiecznym polu narzędzia GitHub (wartość nie jest wypisywana):"
  gh secret set "$name" --repo "$repo"
done
printf 'upload' | gh secret set ANDROID_KEY_ALIAS --repo "$repo"
