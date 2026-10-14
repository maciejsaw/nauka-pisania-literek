# Od gotowego kodu do pierwszego wydania

Ta instrukcja jest dla właściciela aplikacji. Kod, ikony, opisy, zrzuty i automatyzacja są w repo. Nie potrzebujesz Maca z procesorem M: iOS kompiluje GitHub na swoim Macu. Twój Intel wystarczy do przygotowania kluczy i wysyłania zmian.

**Nie wklejaj kluczy, plików JSON, haseł ani certyfikatów do rozmowy, issue lub commita.** Repo jest publiczne. Poniżej podano dokładne nazwy bezpiecznych pól GitHub.

**Raport postępów:** [Actions → Release readiness](https://github.com/maciejsaw/nauka-pisania-literek/actions/workflows/readiness.yml) → Run workflow → branch `main`. Wybierz `bootstrap` przed pierwszymi paczkami, `beta` przed testową wysyłką albo `production` przed wydaniem. Raport pokazuje wszystkie braki naraz i numer właściwego kroku poniżej. Czerwony wynik na początku jest oczekiwany: oznacza nieuzupełnione ustawienia. Po każdej części konfiguracji możesz uruchomić go ponownie. Nie łączy się ze sklepami i niczego nie publikuje.

## 1. Sprawdź swoje istniejące konta

- [Apple Developer](https://developer.apple.com/account/) i [App Store Connect](https://appstoreconnect.apple.com/): członkostwo musi być aktywne. W Business/Agreements uzupełnij umowę dla płatnych aplikacji/zakupów, rachunek bankowy i dane podatkowe.
- [Google Play Console](https://play.google.com/console/): zaloguj się na stare konto. **Nie płać ponownie za nowe konto.** Jeśli stare konto wymaga weryfikacji tożsamości, danych kontaktowych lub reaktywacji, wykonaj zadania wskazane przez konsolę. Uzupełnij profil płatności.
- Sprawdź wymagania testów widoczne na koncie. Warunek 12 testerów przez 14 dni dotyczy określonych nowych kont osobistych; nie zakładamy, że obejmuje Twoje stare konto.

Efekt: oba konta pozwalają tworzyć i monetyzować aplikację.

## 2. Potwierdź nazwę i prawa do materiałów

Projekt ma wspólny identyfikator `com.maciejsawicki.pajaczek`, nazwę sklepową **Pajączek: nauka literek** i nazwę pod ikoną **Pajączek**. Nie zmieniaj identyfikatora po pierwszym wysłaniu paczki. Jeśli jest zajęty, zmień go konsekwentnie przed pierwszą wysyłką w projektach Android/iOS, capacitor.config.ts i release-config.json.

Wzory liter w dostarczonej grze wskazują font „Elementarz Dwa”. Potrzebne jest potwierdzenie uprawnień do użycia tych wzorów w sprzedawanej aplikacji lub zastąpienie ich własnymi. Zobacz THIRD-PARTY-NOTICES.md. Po potwierdzeniu ustaw `contentRightsConfirmed: true` w release-config.json. Nie zaznaczaj tej opcji tylko po to, żeby przejść kontrolę.

W `release-config.json` wpisz publiczny adres pomocy w `supportEmail`. Strony pomocy i prywatności aktualizują się automatycznie podczas builda. Dane kontaktowe recenzenta (telefon itp.) zapiszesz oddzielnie w sekrecie.

## 3. Utwórz rekord aplikacji w obu sklepach

**Apple:** w Certificates, Identifiers & Profiles utwórz explicit App ID z Bundle ID `com.maciejsawicki.pajaczek`. In-App Purchase powinno być włączone. W App Store Connect → My Apps → „+” utwórz nową aplikację iOS; nazwa jak wyżej, główny język polski, SKU np. `pajaczek-001`, wybierz ten Bundle ID. Zapisz Apple Team ID z Membership.

**Google:** w Play Console wybierz Create app, nazwę jak wyżej, język polski, bezpłatna aplikacja (pełna wersja jest zakupem wewnątrz). Wybierz właściwą kategorię edukacyjną i faktyczną grupę odbiorców. Package name pochodzi z pierwszej paczki AAB.

## 4. Utwórz projekt RevenueCat i pobierz publiczne klucze SDK

1. Załóż konto w [RevenueCat](https://app.revenuecat.com/) i projekt Pajączek.
2. Dodaj aplikację App Store z powyższym Bundle ID oraz aplikację Google Play z tym samym package name.
3. W API keys znajdź **publiczne klucze SDK** dla iOS i Android. Nie używaj klucza Secret API `sk_` ani klucza Test Store `test_`.
4. W repo → Settings → Secrets and variables → Actions → **Variables** dodaj:

| Zmienna | Wartość |
|---|---|
| `VITE_REVENUECAT_IOS_KEY` | publiczny klucz SDK iOS z RevenueCat |
| `VITE_REVENUECAT_ANDROID_KEY` | publiczny klucz SDK Android z RevenueCat |
| `APPLE_TEAM_ID` | Apple Team ID |
| `ASC_KEY_ID` | identyfikator klucza API z kroku 6 |
| `ASC_ISSUER_ID` | issuer ID z kroku 6 |

Klucze SDK są przeznaczone do umieszczenia w aplikacji. Nie są kluczami administracyjnymi. SDK można skonfigurować przed utworzeniem produktów; brak produktu nie blokuje darmowych ćwiczeń.

## 5. Przygotuj podpisy aplikacji

### Apple — bez Xcode i bez Maca M

1. W lokalnym katalogu repo uruchom `bash scripts/apple-csr.sh`. Wypełnij dane certyfikatu (pole challenge password może pozostać puste). Powstanie CSR i prywatny klucz w ignorowanym katalogu `secrets/`.
2. Apple Developer → Certificates → „+” → **Apple Distribution**. Wgraj CSR. Pobierz plik `.cer`.
3. Uruchom `bash scripts/apple-p12.sh /pełna/ścieżka/do/distribution.cer`. Ustaw silne hasło eksportu; powstanie `secrets/distribution.p12`.
4. Apple Developer → Profiles → „+” → profil dystrybucyjny **App Store Connect**, App ID Pajączka, właśnie utworzony certyfikat. Pobierz profil i zapisz jako `secrets/app.mobileprovision`.
5. Zachowaj bezpieczną kopię klucza, certyfikatu, profilu i hasła. Certyfikat/profil trzeba odnowić przed wygaśnięciem.

### Android

1. Potrzebujesz `keytool`, dostępnego w JDK 21 albo Javie dołączonej do Android Studio (Intel jest obsługiwany).
2. Uruchom `bash scripts/android-key.sh`. Ustaw hasło magazynu i klucza; domyślny alias to `upload`. Jeśli używasz jednego hasła dla obu, wpiszesz je do obu sekretów.
3. Powstanie `secrets/upload.jks`. Zachowaj kopię poza repo. Przy pierwszej wysyłce w Play włącz **Play App Signing**; ten plik jest kluczem wysyłki.

W GitHub → Settings → Secrets and variables → Actions → **Secrets** dodaj:

| Sekret | Zawartość |
|---|---|
| `IOS_P12_BASE64` | cały distribution.p12 zakodowany base64 |
| `IOS_CERT_PASSWORD` | hasło eksportu p12 |
| `IOS_PROFILE_BASE64` | cały app.mobileprovision zakodowany base64 |
| `ANDROID_KEYSTORE_BASE64` | cały upload.jks zakodowany base64 |
| `ANDROID_KEYSTORE_PASSWORD` | hasło magazynu |
| `ANDROID_KEY_PASSWORD` | hasło klucza |
| `ANDROID_KEY_ALIAS` | `upload` |

Możesz użyć później `scripts/upload-signing-secrets.sh`, który przesyła pliki przez GitHub CLI bez wypisywania ich zawartości. Wymaga wszystkich plików z kroku 6.

## 6. Dostęp API do automatycznej wysyłki

**Apple:** App Store Connect → Users and Access → Integrations → App Store Connect API → utwórz zespołowy klucz do zarządzania wydaniami (App Manager, w razie wymagań konta uprawnienia odpowiednie do wysyłki). Pobierz `.p8` — zwykle tylko raz. Zapisz lokalnie jako `secrets/AuthKey.p8`. Dodaj `ASC_KEY_ID`, `ASC_ISSUER_ID` do Variables i `ASC_KEY_P8_BASE64` do Secrets. Nie zapisuj hasła Apple ID ani kodów 2FA w repo.

**Google:** utwórz projekt Google Cloud, włącz **Google Play Android Developer API**, utwórz konto usługi i klucz JSON. Zaproś jego adres do Play Console → Users and permissions i nadaj dostęp do tej aplikacji: wyświetlanie danych aplikacji, zarządzanie wydaniami testowymi i produkcyjnymi oraz materiałami sklepowymi. Zapisz JSON lokalnie jako `secrets/play-account.json` i jego pełną treść w sekrecie `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`.

RevenueCat też wymaga konfiguracji połączeń sklepów: w Apple podłącz klucz In-App Purchase/StoreKit wymagany przez jego formularz (to może być **inny klucz** niż ASC do publikacji), a w Google konto usługi z uprawnieniami do weryfikacji zakupów. Włącz server notifications/RTDN zgodnie z instrukcjami RevenueCat, żeby zwroty i zmiany zakupów szybko odświeżały dostęp. Nie włączaj reklam, atrybucji ani analityki marketingowej.

Sekret `REVIEW_CONTACT_JSON` powinien zawierać:

```json
{"firstName":"Twoje imię","lastName":"Twoje nazwisko","email":"Twój adres kontaktowy","phone":"Numer z prefiksem kraju"}
```

Te dane są dla Apple App Review, nie do publicznego repo.

## 7. Zbuduj paczki do pierwszej konfiguracji

Najpierw uruchom **Release readiness** z etapem `bootstrap`. Po zielonym raporcie: repo → Actions → **Release to stores** → Run workflow → branch main → `release_tag: v1.0.0-beta.1`.

Uruchomienie ręczne **tylko buduje podpisane paczki**, bez wysyłania ich do sklepów. Nie wymaga jeszcze flag gotowości produkcyjnej. Po sukcesie pobierz artefakty `signed-android` (Pajaczek.aab) i `signed-ios` (Pajaczek.ipa).

W Play Console utwórz pierwsze wydanie w Internal testing i wgraj AAB. Uzupełnij Play App Signing i wymagane podstawowe pola, następnie **uruchom pierwsze wydanie testowe**. Nie zostawiaj aplikacji wyłącznie jako szkicu: Play API może wtedy odrzucić automatyczne wydanie ze statusem completed. Jeśli konsola wymaga dodatkowych deklaracji, wykonaj już teraz odpowiednie punkty kroku 10. Ten pierwszy krok uruchamia możliwość późniejszych aktualizacji przez API. Nie wysyłaj tej samej paczki/tego samego numeru drugi raz.

Na Apple pierwszą paczkę może już wysłać beta tag z kolejnego kroku; nie potrzebujesz aplikacji Transporter na swoim Macu.

## 8. Skonfiguruj jednorazowy zakup

**Oba sklepy:** produkt `full_version`, nazwa „Pełna wersja”, polski opis „Odblokuj wszystkie literki i cyferki. Jednorazowy zakup, bez abonamentu.”

- Apple: typ **Non-Consumable**. Dodaj lokalizację, cenę, dostępność i zrzut ekranu zakupu do oceny IAP.
- Google: **One-time product / produkt jednorazowy**, aktywna opcja zakupu (buy), bez konsumpcji. Ustaw kraje i aktywny status.
- Polska: cena docelowa 5 zł. Jeśli sklep nie oferuje dokładnie takiej kwoty, wybierz najbliższą akceptowaną (np. 4,99 zł). Dla euro około 1 €. Aplikacja zawsze wyświetla rzeczywistą cenę sklepu, nie wpisuje 5 zł na sztywno w mobilnej płatności.
- RevenueCat: zaimportuj oba produkty. Utwórz entitlement o identyfikatorze **`full_version`** i podepnij oba produkty do niego. Offering nie jest wymagany — kod pobiera produkt bezpośrednio.
- Przy modelu bez kont wybierz regułę restore pozwalającą przywrócić zakup na tym samym koncie sklepu po reinstalacji (nie „Keep with original App User ID”). Testuj ustawione zachowanie transferów na drugim urządzeniu.

## 9. Pierwsza beta i test zakupów

Po uruchomieniu pierwszego wydania testowego Android sprawdź **Release readiness → beta**, a następnie użyj **nowego** numeru beta:

```bash
git tag v1.0.0-beta.2
git push origin v1.0.0-beta.2
```

Pipeline wysyła do TestFlight i Google Internal testing. W Apple przypisz build do grupy testerów wewnętrznych; w Google dodaj testerów i udostępnij link opt-in. Dodaj też testerów zakupów/sandbox zgodnie z konsolą, żeby testy nie obciążały prawdziwej karty. Build instaluj przez sklep/testową dystrybucję, nie z przypadkowej paczki debug.

Na prawdziwym iPhonie/iPadzie i Androidzie sprawdź:

- 10 darmowych znaków (5 par), pozostałe z kłódką.
- Kliknięcie kłódki, tekst o Leonie i **lokalna cena ze sklepu**.
- Poprawne i błędne rozwiązanie bramki rodzica.
- Anulowanie zakupu → nadal demo.
- Zakup testowy → wszystkie 74 znaki dostępne, także po ponownym uruchomieniu.
- Oczekujący zakup/Ask to Buy → bez przedwczesnego odblokowania.
- Odblokowanie bez internetu po wcześniejszym zakupie i ponownym uruchomieniu.
- Przywracanie po reinstalacji i na drugim urządzeniu, na tym samym koncie sklepu.
- Zwrot/cofnięcie uprawnienia → powrót do demo po odświeżeniu online.
- Rysowanie, rysik, powrót, dźwięk, przerwa i obrót ekranu.

Po wykonaniu testów ustaw `sandboxPurchasesVerified: true`. Automatyczne testy repo nie zastępują testowej transakcji w Twoim koncie.

## 10. Uzupełnij karty sklepowe i deklaracje

Gotowe treści: `store/ios/metadata/pl/` i `store/android/metadata/pl-PL/`. Gotowe ikony i grafiki: `assets/branding/` oraz foldery `images/`. Zrzuty są w `store/ios/screenshots/pl/` i `store/android/metadata/pl-PL/images/phoneScreenshots/`; można je odtworzyć przez `npm run screenshots` po buildzie. Pokazują rzeczywiste widoki gry, bez przykładowej ceny i bez fikcyjnego systemowego okna zakupu. Obejrzyj je i ustaw `screenshotsReviewed: true`.

Adresy:

- prywatność: https://maciejsawicki.com/nauka-pisania-literek/legal/privacy/
- pomoc: https://maciejsawicki.com/nauka-pisania-literek/legal/support/

Sprawdź i uzupełnij politykę w `scripts/legal.mjs`, publiczny supportEmail oraz zgodność z Twoją działalnością. Formularze prywatności muszą uwzględniać RevenueCat, nie zaznaczaj automatycznie „nie zbieramy żadnych danych”. Zobacz `docs/PRYWATNOSC-I-RECENZJA.md`.

Wybierz rzeczywistą grupę wiekową i kategorię dziecięcą, wypełnij Apple age rating oraz Google Target audience/Families, Data Safety, Ads (brak reklam), App access (brak logowania), Content rating i pozostałe zadania konsoli. Uzupełnij wymagane informacje o sprzedawcy/trader status dla dystrybucji w UE. Apple może wymagać dodatkowej korekty położenia bramki rodzicielskiej przed ofertą — nie da się zagwarantować akceptacji layoutu.

Pierwszy produkt IAP w Apple **ręcznie dołącz do pierwszej wersji aplikacji** w sekcji In-App Purchases. Uzupełnij jego review screenshot. Potem automat zgłasza wersję do oceny razem z przypisanym produktem.

W Google wyłącz Managed publishing, jeśli chcesz publikować od razu po zatwierdzeniu; pozostawienie go włączonego oznacza dodatkowe ręczne Publish. Wykonaj ewentualne wymagane testy/wniosek o dostęp do produkcji widoczne dla Twojego konta.

Po faktycznym zakończeniu ustaw `privacyDeclarationsReviewed: true` i `storeListingsCompleted: true`.

## 11. Pierwsze wydanie produkcyjne

Upewnij się, że najnowszy przebieg **Checks and website** jest zielony, opisy i zrzuty są aktualne, a wszystkie flagi w release-config.json są prawdziwe. Zapisz konfigurację na main. Uruchom **Release readiness → production** i uzupełnij wszystkie pozycje raportu przed utworzeniem taga.

```bash
npm run doctor -- --production
git tag v1.0.0
git push origin v1.0.0
```

Tag uruchamia: kontrole → podpisane buildy obu platform → wysyłkę → zgłoszenie do oceny. Apple publikuje automatycznie po zatwierdzeniu. Google publikuje zgodnie z ustawieniami konta/Managed publishing. Odrzucenie, nowe umowy i wygasłe certyfikaty wymagają Twojej reakcji.

## 12. Kolejne wydania

Zmieniasz kod i release notes, pushujesz na main, sprawdzasz zielone testy, opcjonalnie wydajesz `v1.0.1-beta.1`, a następnie `v1.0.1`. Nie przesuwaj istniejących tagów i nie używaj ponownie numerów wysłanych do sklepu. Numery buildów są wyliczane z taga; produkcja ma numer wyższy niż beta tej samej wersji. Obsługiwane są beta.1–beta.98; iOS używa formatu z kropkami zgodnego z ograniczeniami Apple, Android liczby całkowitej.

Jeśli jedna wysyłka nie powiedzie się, użyj **Re-run failed jobs**, aby nie wysyłać ponownie paczki do sklepu, który już ją przyjął. Jeśli trzeba zmienić samą paczkę, nadaj nowy tag. Artefakty podpisanych buildów są przechowywane 14 dni.

## Gdy kontrola zgłosi problem

| Komunikat | Co poprawić |
|---|---|
| Brak lub niepoprawna Variable/Secret w raporcie | Wpisz wartość w GitHub w sekcji wskazanej przez raport. `Variables` i `Secrets` są osobnymi zakładkami. Nie zmieniaj ich nazw. |
| Niewłaściwy klucz RevenueCat | iOS wymaga publicznego klucza `appl_`, Android `goog_`. Klucze `sk_` i `test_` nie służą do wydania tej aplikacji. |
| Profil innej aplikacji, zespołu lub niewłaściwy certyfikat | Pobierz ponownie profil **App Store Connect** dla właściwego Bundle ID i certyfikatu. Uaktualnij `IOS_PROFILE_BASE64`; sprawdź `APPLE_TEAM_ID` (krok 5). |
| Certyfikat/profil wygasł lub wygaśnie w ciągu 30 dni | Odnów podpis Apple i jego profil. Uaktualnij odpowiednie sekrety. Raport ważności pojawia się podczas budowania podpisanej paczki. |
| Nie można odczytać klucza Android | Sprawdź zgodność pliku, aliasu i obu haseł (krok 5). Przy późniejszych wydaniach nie generuj pochopnie nowego klucza wysyłki. |
| Ustawienia poprawne, ale sklep odmawia wysyłki | Sprawdź uprawnienia API, umowy i pierwsze ręczne wydanie Google (kroki 1, 6, 7). Raport formatu kluczy nie potwierdza uprawnień na koncie. |

Automatyczne próby Release w **Checks and website** nie zużywają numeru wersji w sklepach. Android używa jednorazowego klucza testowego; iOS sprawdza archiwum dla prawdziwych urządzeń bez podpisu. Właściwe podpisanie i zakup sprawdzisz dopiero z własnymi kontami.

## Koszty i utrzymanie

Apple Developer musi pozostać aktywne. Stare konto Google wykorzystujesz bez ponownej opłaty rejestracyjnej, o ile jest aktywne. RevenueCat ma własny cennik, sklepy potrącają opłaty i podatki. Standardowe GitHub Actions dla publicznego repo są obecnie bezpłatne. Od czasu do czasu trzeba aktualizować SDK, wymagane wersje Xcode/Android i certyfikaty. Instrukcja i wersje sprawdzone 14 października 2026.
