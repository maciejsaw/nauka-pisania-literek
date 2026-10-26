#!/usr/bin/env bash
set -euo pipefail

# The Azure Ubuntu mirror can stall individual downloads for minutes. Use the
# upstream Ubuntu archive; apt still verifies packages with Ubuntu signing keys.
shopt -s nullglob
for source in /etc/apt/apt-mirrors.txt /etc/apt/sources.list /etc/apt/sources.list.d/*.list /etc/apt/sources.list.d/*.sources; do
  if [[ -f "$source" ]]; then
    sudo sed -i 's|http://azure.archive.ubuntu.com/ubuntu|https://archive.ubuntu.com/ubuntu|g; s|https://azure.archive.ubuntu.com/ubuntu|https://archive.ubuntu.com/ubuntu|g' "$source"
  fi
done

# Fail a broken download promptly instead of occupying a release runner for hours.
printf '%s\n' 'Acquire::http::Timeout "30";' 'Acquire::https::Timeout "30";' 'Acquire::Retries "2";' | sudo tee /etc/apt/apt.conf.d/80-pajaczek-downloads >/dev/null
npx playwright install --with-deps chromium webkit
