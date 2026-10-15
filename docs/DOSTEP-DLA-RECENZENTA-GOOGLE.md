# Bezpłatny dostęp do oceny Google

Od Android build **1000003** recenzent może otworzyć **Ustawienia → Dostęp kodem**, rozwiązać bramkę rodzicielską i wpisać prywatny kod. Otrzymuje wszystkie 74 znaki i te same ćwiczenia co płacący użytkownik. Nie potrzebuje konta, płatności, internetu ani konkretnego kraju. Kod nie wygasa i można użyć go ponownie. Nie ma wykrywania recenzentów ani zmienionej wersji treści.

Przycisk jest dostępny na Androidzie. Wersje WWW i iOS go nie oferują. „Wyłącz dostęp kodem” przywraca zwykłe ograniczenia, chyba że użytkownik faktycznie kupił pełną wersję. Pozwala to sprawdzić również normalną ofertę zakupu. Dostęp kodem nie jest testem transakcji — przed testami Google Billing należy go wyłączyć.

## Zapis w Play Console

App content → Sign in details → dostęp ograniczony → Add details:

- Name: `Full access code — Android build 1000003 and later`.
- Username: puste, aplikacja nie ma kont.
- Password: zawartość prywatnego `secrets/google-review-code.txt`. Nie kopiuj do repo, issue ani logów.
- Other information: instrukcja po angielsku poniżej.

> No account or payment needed. From home open Settings (gear, "Ustawienia") > "Dostęp kodem". Solve the displayed multiplication (e.g. 12 x 6 = 72), tap "Dalej". Paste the password above into "Kod dostępu", then tap "Odblokuj kodem". All letters/digits unlock with the same exercises as paid users. Code is reusable, works offline, has no expiry or location limit. To inspect the normal paywall, return here and tap "Wyłącz dostęp kodem". Available in build 1000003 and later.

Zaznacz pełny dostęp po użyciu instrukcji i zapisz. Do oceny zgłoś build 1000003 lub nowszy, zawierający ten mechanizm. Właściciel zatwierdza przekazanie kodu Google; nie udostępniamy żadnych poświadczeń jego kont.

## Prywatna kopia i kolejne wydania

Kod utworzono lokalnie z 20 losowych bajtów. Plik `secrets/google-review-code.txt` jest ignorowany przez Git i ma uprawnienia 600. Zachowaj go w prywatnej kopii. Każdy posiadacz kodu może odblokować ćwiczenia, więc nie publikuj go.

Repo zawiera jedynie skrót SHA-256 w `review-access-config.json`. Kolejne tagi używają tego samego weryfikatora; nie wymagają nowego sekretu GitHub. `node scripts/prepare-review-access.mjs` sprawdza istniejącą parę kod–skrót i odmawia cichej podmiany, jeśli kod zaginął lub nie pasuje. Nie odtwarzaj kodu przez przypadkowe wygenerowanie nowego.

Po wycieku można świadomie przygotować nową parę kod–skrót, zaktualizować instrukcję Google i wydać nową wersję. Poprzednia aplikacja nadal zaakceptuje stary kod: rozwiązanie offline nie umożliwia zdalnego cofnięcia go w starych paczkach. Zmiana skrótu w nowym buildzie powoduje ponowną walidację zapisanego kodu.

## Kontrole w repo

- Testy obejmują błędny kod, ponowne uruchomienie, uszkodzony zapis, wyłączenie dostępu, niepowodzenie zapisu oraz niezależność od zakupu, zwrotu i przywracania.
- Testy przeglądarkowe sprawdzają bramkę rodzica, odblokowanie, ćwiczenie płatnej litery i powrót kłódek. Most Androida jest symulowany; to nie zastępuje próby na urządzeniu.
- Publiczny kod testowy działa wyłącznie w osobnym katalogu `build/e2e`. Produkcja powstaje w `dist`, a kontrola po budowaniu odrzuca obecność testowego kodu lub jego skrótu.
- Kod dostępu nigdy nie jest uznawany za udany zakup ani przywróconą transakcję.

[Wymagania Google dotyczące dostępu do oceny](https://support.google.com/googleplay/android-developer/answer/15748846).
