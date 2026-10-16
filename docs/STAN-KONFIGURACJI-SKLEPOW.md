# Pajączek — stan konfiguracji sklepów

Status wydania zaktualizowany 16 października 2026; starsze kontrole kont mają daty poniżej. To zapis wykonanych czynności, nie potwierdzenie gotowości do publicznej sprzedaży. Przy wznowieniu sprawdź stan paneli i nie generuj ponownie istniejących kluczy.

## Co już działa

- Repo: `maciejsaw/nauka-pisania-literek`; identyfikator obu aplikacji: `com.maciejsawicki.pajaczek`.
- Pełny przebieg taga **v1.0.0-beta.7** zakończył się powodzeniem: testy, podpisanie i wysłanie obu aplikacji. [Wynik GitHub Actions](https://github.com/maciejsaw/nauka-pisania-literek/actions/runs/38946135479). [Kontrola kodu i publikacja strony](https://github.com/maciejsaw/nauka-pisania-literek/actions/runs/38946129403) również zakończona powodzeniem. Tag wskazuje commit `a9b9cfe`.
- Android: wersja 1.0.0, build **1000007**; API Google Play potwierdziło kanał `internal` i status `completed` 16 października. Trzy konta wskazane przez właściciela są testerami aplikacji i zakupów. [Dołącz do testów na Androidzie](https://play.google.com/apps/internaltest/4701129001410143384). Zaloguj się jednym z tych kont; nazwa w Play może jeszcze zawierać `(unreviewed)`.
- Apple: build **100.0.7** przetworzony i dostępny w TestFlight. API potwierdziło `processingState = VALID`, `internalBuildState = IN_BETA_TESTING` i obecność w grupie `Pajaczek — testy wewnetrzne` 16 października. Automatyczne powiadomienia testerów są włączone; szkic pierwszej wersji ostatnio wskazywał **100.0.3**.
- Beta.7 dodaje **Ustawienia → Oceń aplikację** z gwiazdką i bramką rodzica. Bez automatycznych próśb po starcie lub odznace. Beta pokazuje informację o ocenach po premierze; produkcyjny tag otworzy oficjalną kartę ocen sklepu. Przebieg i uzasadnienie w [notatkach o ocenach](PRYWATNOSC-I-RECENZJA.md#dobrowolna-ocena-aplikacji-beta7).
- Beta.6 poprawia ofertę, cenę dla polskiego sklepu, spinner przed i po oknie płatności, odblokowanie po opóźnionym potwierdzeniu oraz podziękowanie z uśmiechniętym Pajączkiem i przyciskiem **Gotowe**. Oferta jest przed weryfikacją rodzica, zgodnie z wyborem właściciela. Po zakupie ustawienia pokazują odblokowany dostęp bez zachęty do ponownej płatności. Opisy przedstawiają autora Macieja i jego syna Leona, bez niejasnego określenia „pary”.
- Beta.5 dodaje darmowe pary **D/d i E/e** (łącznie siedem), odstępy dialogów uwzględniające bezpieczny obszar iPhone’a oraz bramkę rodzica z rokiem urodzenia zamiast mnożenia. Rok jest sprawdzany wyłącznie lokalnie, bez zapisywania lub wysyłania. Nie usunięto żadnych liter.
- Beta.4 dodała **Aktywuj kodem** dla oficjalnych kodów obu sklepów, blokadę powiększania gestem, pionową orientację iPhone'a i reakcję wszystkich przycisków na naciśnięcie bez przesuwania obszaru dotyku. Zachowuje prywatny kod recenzenta Androida.
- Apple Distribution i profil App Store są poprawne i zostały użyte przez GitHub. Profil jest ważny do 15 października 2027. Mac z Intelem wystarcza; buildy wykonuje GitHub.
- GitHub ma klucze podpisów, dostęp do Apple i Google oraz publiczne klucze RevenueCat. Prywatny kontakt recenzenta `REVIEW_CONTACT_JSON` pozostaje do uzupełnienia.
- Produkt **full_version** jest w obu sklepach i w RevenueCat, przypisany do uprawnienia o tej samej nazwie. Zakup jest jednorazowy. Apple: 4,99 zł / 0,99 EUR; Google: 4,99 zł w Polsce / 1,09 EUR w Niemczech i Francji. Przy metadanych PLN aplikacja wyświetla cenę ze sklepu. Od beta.8 przy metadanych TestFlight w innej walucie pokazuje zatwierdzony tekst „4,99 zł jednorazowo” bez dodatkowego dopisku; szczegóły i źródło rozbieżności TestFlight w [notatkach o zakupach](PRYWATNOSC-I-RECENZJA.md#zakupy-po-poprawkach-ux-beta6).
- Google: produkt aktywny, opcja zakupu `full-version`, zgodność wsteczna włączona. Profil sprzedawcy utworzony.
- RevenueCat: poświadczenia obu sklepów mają status **Valid credentials**. Powiadomienie testowe Google dotarło do RevenueCat 15 października o 12:07 UTC.
- Apple: oba adresy powiadomień (sandbox i produkcja) kierują do RevenueCat. Próba sandbox przez oficjalne API zwróciła **SUCCESS**, a panel RevenueCat potwierdził odbiór 15 października o 12:32 UTC. Próba produkcyjna zwróciła **HTTP 401** — ponowić po aktywacji umowy i sprawdzić przy pierwszym wydaniu. Przyczyna odmowy nie jest jeszcze potwierdzona. Nie jest to test zakupu.
- Materiały sklepowe odświeżone 16 października przez **Prepare store listings**: aktualne opisy siedmiu bezpłatnych liter (małych i wielkich), grafiki Google, 3 zrzuty Android i 6 zrzutów Apple. [Udany przebieg](https://github.com/maciejsaw/nauka-pisania-literek/actions/runs/38945672753). Workflow nie wysyła ani nie promuje builda.
- Nazwa i ikona Google sprawdzone 16 października: **Pajączek: nauka literek**, ikona 1/1, grafika promocyjna 1/1 i 3 zrzuty są zapisane w polskiej karcie. Karta ma status **Ready to send for review**. Dashboard wprost wyjaśnia nazwę `com.maciejsawicki.pajaczek (unreviewed)` do czasu pierwszej oceny aplikacji. Nie jest to brak zasobów w repo ani błąd podpisania paczki. **Send app for review** pozostaje nieaktywne do przygotowania wydania poza samym testem wewnętrznym (np. testu zamkniętego). Nie uruchomiono dodatkowego kanału ani produkcji tylko w celu zmiany tej nazwy. [Zasady Google](https://support.google.com/googleplay/android-developer/answer/9845334#internal_test).
- Apple App Privacy opublikowane za zgodą właściciela: historia zakupów, App Functionality + Analytics, bez powiązania z tożsamością, bez śledzenia reklamowego. Polityka prywatności i strona pomocy są publiczne.
- Google Data safety: finalna deklaracja zapisana w Publishing overview, gotowa do oceny razem z aplikacją. Historia zakupów, szyfrowanie, brak kont użytkownika, brak udostępniania poza usługodawcą; adres zgłoszeń usunięcia danych. App content potwierdza brak brakujących deklaracji. `privacyDeclarationsReviewed` ustawiono na `true`; pozostałe nieukończone kontrole pozostają `false`.
- Google IARC: regulamin zaakceptowany za zgodą właściciela, klasyfikacja ukończona — PEGI 3, ESRB Everyone, oznaczenie zakupów w aplikacji. Deklaracja Advertising ID zapisana jako No.
- Google Sign in details: zapisano ograniczony dostęp i zatwierdzony przez właściciela prywatny kod z instrukcją po angielsku. Kod odblokowuje te same ćwiczenia bez płatności w Android build 1000003 i nowszych. Opcjonalne udostępnienie do dodatkowych testów na urządzeniach partnerów wyłączone. [Szczegóły](DOSTEP-DLA-RECENZENTA-GOOGLE.md).
- Beta.7 przeszła **34 testy logiki i 65 scenariuszy przeglądarkowych**; dodatkowo 8 scenariuszy ocen w konfiguracji beta. Testy obejmują bramkę rodzica przed oceną, anulowanie, błędy otwierania sklepu i brak próśb podczas zdobywania odznaki. Zachowano wcześniejsze scenariusze, w tym WebKit z dotykiem, opóźniony zakup, anulowanie, błędy sklepu, ponowne uruchomienie po zakupie, bezpieczne odstępy, ukończenie liter i oficjalne kody sklepu. Mosty platform i sklepy są symulowane; te testy nie zastępują realizacji kodu i zakupu na telefonie. Kompilacja i archiwizacja obu platform również zakończyła się powodzeniem.
- Google Managed publishing jest wyłączone. Oznacza to automatyczną publikację zatwierdzonych zmian po ocenie; żadne wydanie produkcyjne nie zostało jeszcze zgłoszone.
- Google: dostępność produkcyjna zapisana **wyłącznie w Polsce**, zgodnie z decyzją właściciela. Produkcja pozostaje nieaktywna. Target audience: zatwierdzone przez właściciela **6–8 lat**, wymagania Families potwierdzone. Dodatkowy program Teacher Approved pozostawiono wyłączony.
- Apple IAP: zapisano instrukcję recenzenta po angielsku i potwierdzono jej trwały zapis po ponownym otwarciu produktu. Kopia w `store/ios/iap-review-notes.txt`. Wciąż brakuje zrzutu dialogu zakupu z aplikacji iOS; produkt nie został zgłoszony do oceny.
- Apple: kategoria Education, klasyfikacja 4+, grupa dzieci 6–8 lat; właściciel potwierdził tę grupę również przy kończeniu Google.
- Apple: cena pobrania aplikacji 0 zł, kraj bazowy Polska; dotychczas przygotowana dostępność po wydaniu w 175 krajach i regionach. Najnowszy wybór Polski dotyczył pytania o Google Play; przed publikacją uzgodnić, czy ograniczyć także Apple. Wydanie obejmuje iPhone/iPad; automatyczna dostępność na Macach Apple Silicon i Vision Pro wyłączona do czasu sprawdzenia tych urządzeń.

## Pozostałe zadania właściciela

Kontrola Apple Business z 16 października, po uzupełnieniu danych przez właściciela: **W-8BEN = Active**, **Certificate of Foreign Status = Active**, **Paid Apps Agreement = Processing**, rachunek bankowy = **Processing**. Później tego dnia właściciel potwierdził, że cena i okno płatności działają już w TestFlight, lecz zgłosił nieczytelne oczekiwanie i wynik zakupu. Beta.6 poprawia te elementy; cały zakup wymaga ponownej próby na telefonie. Nie sprawdzano ponownie statusu umowy i rachunku.

Kody dla znajomych i blogerów będą obsługiwane przez oficjalne sklepy; konfiguracja i warunki tworzenia kodów są w [instrukcji kodów promocyjnych](KODY-PROMOCYJNE.md). Nie wygenerowano jeszcze kodów do rozdawania.

Właściciel wznowił i uzupełnił Apple Business 16 października; nie składać ponownie formularzy podatkowych. Numer kontaktowy Apple App Review pozostaje osobnym zadaniem. Dalszą próbę instalacji Androida właściciel wykona później na nowszym telefonie. Przyczyna zgłoszonego „Item not found” pozostaje niepotwierdzona; na koncie właściciela karta bety otwiera się poprawnie.

1. **Apple Business:** sprawdź zakończenie przetwarzania Paid Apps Agreement i rachunku oraz status weryfikacji sprzedawcy w UE. Formularze podatkowe są już aktywne. Nie powtarzaj złożonych wniosków podczas weryfikacji Apple.
2. **Kontakt dla Apple App Review — później:** w prywatnym pliku `secrets/review-contact.json` uzupełnij `phone` z prefiksem kraju. Nie wklejaj go do publicznego repo. Po zgodzie właściciela asystent zapisze komplet w Apple oraz w GitHub Secrets.
3. **Zainstaluj betę:** Android przez powyższy link, iPhone/iPad przez otrzymane zaproszenie TestFlight. W Google upewnij się, że instalujesz i kupujesz tym samym kontem testera.
4. **Sprawdź zakupy:** najpierw anulowanie, potem testowe odblokowanie, ponowne uruchomienie, tryb offline oraz przywrócenie po reinstalacji. Jeśli użyto dostępu kodem na Androidzie, najpierw wyłącz go w ustawieniach. Google powinien pokazać testową formę płatności. Jeśli widzisz zwykłą płatność bez oznaczenia testu, anuluj i zgłoś problem. TestFlight używa środowiska testowego.
5. **Sprawdź ćwiczenie:** ukończ darmową literę, zobacz ekran sukcesu, użyj „Dalej”, sprawdź zapis postępu, małe ą oraz cyfry 5 i 6. Zgłoś wynik osobno dla obu platform.
6. **Zrzut dla oceny zakupu Apple:** zrób zrzut dialogu pełnej wersji w rzeczywistej aplikacji iOS z TestFlight. Potrzebny jest ekran IAP; grafika dialogu z wersji WWW pokazuje inne informacje. Plik pozwoli asystentowi zakończyć materiały produktu.
7. Sprawdź opisy i zrzuty sklepu oraz docelowy wiek dzieci. Zachowaj prywatną kopię katalogu `secrets/` i haseł. Google może jeszcze wymagać metody wypłat na koncie sprzedawcy.

## Potem asystent

1. Zebrać wyniki testów beta.7 na telefonach: oferta → Kup pełną wersję → weryfikacja rodzica → spinner → sklep → potwierdzenie z Pajączkiem → Gotowe; także anulowanie, ponowne uruchomienie i przywrócenie zakupu. Zachować wcześniejsze próby ćwiczeń, gestów i oficjalnych kodów. Do oceny publicznej wybrać najnowszy sprawdzony build; szkic Apple nadal wskazuje 100.0.3.
2. Google Target audience, Data safety, IARC, App access i pozostałe deklaracje są zakończone. Wrócić do nich tylko po zmianie działania aplikacji lub uwagach sklepu.
3. Po kontroli właściciela zaznaczyć przegląd grafik i kompletność kart sklepowych. Google Managed publishing sprawdzono: Off. Przed produkcją potwierdzić zakres krajów Apple — Google ma już tylko Polskę.
4. W Apple dodać zrzut produktu i przypisać pierwszy IAP do pierwszej wersji. Cena samej aplikacji i dostępność są ustawione. Uzupełnić prywatny kontakt recenzenta i sprawdzić aktywację umów.
5. Po faktycznych testach zaznaczyć potwierdzenia w `release-config.json`. Dopiero wtedy uruchomić **Release readiness → production** i przygotować pierwsze zgłoszenie.

## Następne tagi

Tagi od `v1.0.0-beta.1` do **v1.0.0-beta.7** są wykorzystane. Beta.7 dodaje dobrowolne ocenianie aplikacji; [przebieg wysyłki](https://github.com/maciejsaw/nauka-pisania-literek/actions/runs/38946135479). Kolejna zmieniona paczka: **v1.0.0-beta.8**. Pierwszy tag produkcyjny: **v1.0.0**, dopiero po zakończeniu powyższych kroków. Nie przesuwaj istniejących tagów. Tag produkcyjny zgłasza wydanie do oceny; decyzja i termin publikacji należą do sklepów.

## Dane techniczne bez sekretów

- Google app ID: `4974262256182594112`; internal track: `4701129001410143384`.
- Apple app ID: `6823056260`; IAP ID: `6823060950`.
- RevenueCat project: `65c82d6a`; iOS app: `app7720f0ccdc`; Google app: `app965c1c6c64`.
- GCP: `pajaczek-nauka-literek`; topic: `Play-Store-Notifications`.
- Konto Google GitHub Release ma dostęp tylko do Pajączka, w tym zatwierdzone „Edit and delete draft apps”, wymagane do zapisu pierwszej karty sklepowej. Konto RevenueCat jest osobne. Oficjalny nadawca Google ma Pub/Sub Publisher tylko na powyższym kanale.
- `scripts/test-apple-notifications.mjs` pozwala sprawdzić doręczenie testowego powiadomienia z lokalnym kluczem IAP; nie wykonuje zakupów ani zwrotów.
