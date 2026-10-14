# Pajączek: nauka literek

Polska aplikacja do ćwiczenia pisania, przygotowana jako strona WWW oraz projekty Android/iOS (Capacitor 8).

**Zacznij tutaj: [wydanie do sklepów krok po kroku](docs/RELEASE-KROK-PO-KROKU.md).**

- Darmowe: A/a, Ą/ą, B/b, C/c i Ć/ć.
- Pozostałe litery i cyfry: jednorazowy produkt `full_version` (RevenueCat + natywne sklepy).
- WWW: demo bez zakupu; mobilne zakupy działają po skonfigurowaniu kluczy i produktów.
- Ćwiczenia i fonty lokalne, brak reklam i kont dziecka.
- Tagi `v1.0.0-beta.1`: TestFlight/Play Internal; `v1.0.0`: zgłoszenie do oceny i publikacja po zatwierdzeniu.

## Praca lokalna

Node 22.12+ (CI: Node 22). `npm ci`, `npm run dev`. Testy: `npm test`, `npm run typecheck`, `npm run build`, `npx playwright install chromium`, `npm run test:ui`. Mobilne projekty synchronizuje `npm run sync`. Na Intel Macu nie trzeba lokalnie budować iOS — robi to GitHub.

Ikony: `npm run assets`. Zrzuty sklepowe: `npm run build && npm run screenshots`. Materiały sklepowe są wersjonowane w `store/`. Podgląd paywalla jest w artefaktach CI w `build/previews/`, nie jest wysyłany do sklepów jako ekran płatności.

## Automatyzacja

`Checks and website`: testy JS/przeglądarki, kompilacja debug Android i symulatora iOS, a także próba podpisania Android Release tymczasowym kluczem i archiwizacja iOS Release dla urządzeń (bez podpisu Apple). Testowy klucz Android znika po kontroli; tych paczek nie wysyłamy do sklepów. Testy skryptów publikacji sprawdzają wybór kanału beta/produkcja bez kontaktu ze sklepami. GitHub Pages aktualizuje się po testach web.

`Release readiness`: ręczny raport ustawień z numerami kroków instrukcji. Wybierz `bootstrap` przed pierwszymi paczkami, `beta` przed wysyłką testową lub `production` przed produkcją. Wykrywa brakujące i pomylone klucze, sprawdza format plików i dane recenzenta, nie wypisuje ich zawartości. Niczego nie publikuje. Czerwony wynik oznacza pozycje do uzupełnienia; pełny raport jest w podsumowaniu przebiegu i artefakcie.

`Release to stores`: te same kontrole przed kompilacją, następnie walidacja podpisów, budowa, upload i zgłoszenie. Ręczne uruchomienie przygotowuje tylko paczki startowe. Sprawdzamy zgodność magazynu Android, aliasu i haseł oraz profil App Store, Bundle ID, zespół, dopasowanie certyfikatu i klucza Apple, daty ważności (ostrzeżenie 30 dni przed końcem). Uprawnienia API i zakup w sklepach nadal wymagają rzeczywistej próby po konfiguracji kont.

Źródłem aplikacji są `index.html` i `src/`, gotowy build jest w ignorowanym `dist/`. Nie wgrywaj surowego index.html na Pages; publikacja odbywa się przez Actions.

Sekrety i certyfikaty nie są częścią repo. Bez konfiguracji kont i testowej transakcji nie można potwierdzić prawdziwych płatności ani publikacji. Checklistę blokad produkcyjnych zawiera `release-config.json`. Nie należy zmieniać flag bez wykonania opisanych czynności.

[Materiały i licencje](THIRD-PARTY-NOTICES.md) · [Prywatność i ocena sklepowa](docs/PRYWATNOSC-I-RECENZJA.md)
