# Wydajemy Pajączka razem — kiedy Twoja kolej, kiedy moja
**Aktualizacja 15 października 2026:** konta, podpisy i wydanie testowe są już skonfigurowane. Zacznij od [aktualnego stanu i krótkiej listy następnych kroków](STAN-KONFIGURACJI-SKLEPOW.md), zamiast powtarzać tworzenie kont i kluczy.

To druga, praktyczna instrukcja: przechodzimy ją wspólnie, po jednym etapie. Ty logujesz się, uzupełniasz dane właściciela i testujesz na telefonach. Ja przygotowuję konfigurację, klucze, materiały i wydania oraz obsługuję dostępne formularze. Nie musisz samodzielnie wykonywać wszystkich technicznych punktów [pierwszej instrukcji](https://github.com/maciejsaw/nauka-pisania-literek/blob/main/docs/RELEASE-KROK-PO-KROKU.md).

**Mac z Intelem wystarczy.** Obie aplikacje buduje GitHub; nie potrzebujesz lokalnego Xcode ani Maca z procesorem M. Na późniejszym etapie przyda się iPhone lub iPad oraz telefon z Androidem do rzeczywistych testów zakupów.

## 0. Jak przekazujemy sobie komputer

1. Otwórz ten czat. Napisz: **„Zaczynamy wydanie Pajączka, etap 1. Otwórz potrzebne strony.”**
2. Sprawdzę dostęp do przeglądarki i otworzę właściwy panel. Zalogujesz się w tej samej przeglądarce, którą mogę obsługiwać. Samo zalogowanie w Twoim zwykłym Chrome nie oznacza zalogowania w przeglądarce Codex.
3. Hasło, kod 2FA, CAPTCHA i potwierdzenia tożsamości wpisujesz sam. Gdy skończysz, piszesz **„Gotowe, przejmij”** i na czas mojego klikania nie używasz tej karty.
4. Przy kolejnym kroku wymagającym Ciebie wskażę dokładny ekran i czynność. Jeśli przerwiemy, wracamy do ostatniego ukończonego etapu, bez zakładania kolejnych kont i generowania kluczy od nowa.

W obecnej sesji mogę obsługiwać strony w dostępnej przeglądarce oraz pliki i skrypty projektu. **Sterowanie całym pulpitem i aplikacjami macOS nie jest obecnie dostępne.** Gdy pojawi się systemowe okno wyboru pliku lub przeglądarka nie obsłuży wgrywania, wskażę gotowy plik, a Ty go wybierzesz. Jeśli w przyszłej sesji będzie dostępne pełne Computer Use, najpierw sprawdzimy jego uprawnienia.

Sekrety zapisujemy w lokalnym, ignorowanym katalogu `secrets/` i w GitHub Secrets. **Do czatu podajesz ścieżkę do pliku, nigdy treść klucza, hasła ani JSON z poświadczeniami.** Nie zapisujemy ich w publicznym repo. Dane kontaktowe dla recenzenta również przechowujemy prywatnie; tylko adres pomocy ma być publiczny.

## 1. Zaloguj się na istniejące konta

**Twoja kolej**

1. Zaloguj się do [Apple Developer](https://developer.apple.com/account/) i [App Store Connect](https://appstoreconnect.apple.com/).
2. Zaloguj się do [Google Play Console](https://play.google.com/console/) na konto, za które już kiedyś zapłaciłeś. Nie zakładaj nowego konta tylko dlatego, że stare wymaga uzupełnienia danych.
3. Zaloguj się do [GitHuba](https://github.com/maciejsaw/nauka-pisania-literek) i [RevenueCat](https://app.revenuecat.com/); w RevenueCat załóż konto, jeśli go jeszcze nie masz.

**Przekaż mi sterowanie:** „Jestem zalogowany. Sprawdź konta i wypisz tylko rzeczy, które wymagają mnie.”

**Moja kolej:** sprawdzę status członkostwa Apple, komunikaty starego konta Google, dostęp do repo oraz istniejące aplikacje i projekty. Ustalimy rzeczywiste wymagania konta Google dotyczące testów — nie zakładamy z góry, że obowiązuje Cię wymóg dla nowych kont osobistych.

**Kończymy etap, gdy:** wiemy, które konta są gotowe, a które oczekują na Twoje działanie lub weryfikację operatora.

## 2. Uzupełnij dane właściciela i kontakt

**Twoja kolej**

1. Wykonaj wskazane przez konsole weryfikacje tożsamości i danych kontaktowych.
2. Przeczytaj i zaakceptuj wymagane umowy, w tym umowę umożliwiającą zakupy w Apple. Uzupełnij rachunek bankowy, podatki i profil płatności w odpowiednich panelach.
3. Ustal właściwe informacje o sprzedawcy na rynek UE zgodnie z Twoją sytuacją. Mogę wyjaśnić pola, ale dane muszą pochodzić od Ciebie.
4. Podaj publiczny adres e-mail do pomocy. Prywatne dane kontaktowe dla Apple App Review wprowadzisz lokalnie do przygotowanego przeze mnie pliku/formularza: imię, nazwisko, e-mail i telefon z prefiksem kraju.

**Przekaż mi sterowanie:** „Dane i umowy uzupełnione. Adres pomocy to …; sprawdź, co dalej.”

**Moja kolej:** sprawdzę pozostałe blokady, wpiszę publiczny adres w konfigurację i zaktualizuję strony pomocy oraz prywatności. Potwierdzenie praw do samodzielnie przygotowanych wzorów liter mamy już zapisane — nie trzeba powtarzać tego kroku.

**Kończymy etap, gdy:** konta pozwalają przygotować aplikację do sprzedaży; jeśli trwa weryfikacja, wskażę, co da się robić w międzyczasie.

## 3. Przekaż mi tworzenie aplikacji i dostępów technicznych

**Twoja kolej:** pozostaw otwarte zalogowane panele. Przy tworzeniu dostępu API może być potrzebne jednorazowe potwierdzenie właściciela konta. Jeśli panel pokaże plik do pobrania tylko raz, pobierz go do wskazanego katalogu i podaj mi ścieżkę.

**Przekaż mi sterowanie:** „Przygotuj rekordy aplikacji, RevenueCat i dostęp do automatycznej publikacji.”

**Moja kolej**

1. Sprawdzę, czy rekordy już istnieją. Przygotuję aplikację **Pajączek: nauka literek**, język polski, identyfikator `com.maciejsawicki.pajaczek`. Sama aplikacja jest bezpłatna; pełna wersja to zakup w środku.
2. Utworzę lub uzupełnię projekt RevenueCat z aplikacją Apple i Google.
3. Poprowadzę konfigurację zespołowego klucza App Store Connect, Google Play Android Developer API i konta usługi z dostępem do tej aplikacji. Wykonam dostępne kroki w panelu; potrzebne potwierdzenia logowania zostawię Tobie.
4. Zapiszę wymagane identyfikatory i publiczne klucze SDK w GitHub Variables, a prywatne klucze w Secrets. Osobno podłączę wymagane poświadczenia sklepów w RevenueCat — klucz do wysyłania aplikacji do Apple nie musi być tym samym kluczem co klucz do weryfikacji zakupów.
5. Sprawdzę dostęp na kontach. Raport poprawnego formatu klucza sam w sobie nie potwierdza uprawnień w sklepie.

**Kończymy etap, gdy:** mamy rekordy aplikacji, projekt zakupów oraz dostęp do dalszej konfiguracji. Dokładne nazwy pól znajdują się w krokach 3, 4 i 6 pierwszej instrukcji.

## 4. Przekaż mi przygotowanie podpisów aplikacji

**Twoja kolej:** gdy wskażę, wybierz plik żądania certyfikatu Apple do wysłania albo pobierz wydany certyfikat/profil. Hasła do kluczy wpiszesz w przygotowanym lokalnym formularzu lub terminalu, bez wysyłania ich do rozmowy.

**Przekaż mi sterowanie:** „Przygotuj podpisy Android i iOS oraz ustawienia GitHuba.”

**Moja kolej:** sprawdzę istniejące podpisy, przygotuję CSR Apple, certyfikat dystrybucyjny i profil App Store Connect oraz klucz wysyłki Android. Wykorzystam skrypty z repo; w razie potrzeby przygotuję środowisko z Javą. Sprawdzę zgodność identyfikatorów, kluczy, haseł i dat ważności, po czym wgram sekrety bez wypisywania ich zawartości. Nie zastępuję istniejącego klucza Android bez sprawdzenia, czy został już użyty.

**Jeszcze Twoja kolej:** zachowaj wskazane pliki i hasła w prywatnej kopii zapasowej, poza repo. GitHub Secrets nie służy do odzyskiwania oryginałów.

**Kończymy etap, gdy:** [Release readiness](https://github.com/maciejsaw/nauka-pisania-literek/actions/workflows/readiness.yml) dla etapu `bootstrap` przechodzi, a podpisy mają bezpieczną kopię.

## 5. Pierwsza paczka Google — możliwy krótki powrót do Ciebie

**Moja kolej:** uruchomię ręcznie [Release to stores](https://github.com/maciejsaw/nauka-pisania-literek/actions/workflows/release.yml), na gałęzi `main`, z numerem `v1.0.0-beta.1`, o ile ten numer nie został już użyty. Ten tryb buduje podpisane paczki, bez wysyłania do sklepów. Pobiorę gotowy `Pajaczek.aab` i przygotuję pierwsze wydanie w Google Internal testing.

**Twoja kolej, gdy ją wskażę**

1. Wybierz wskazany plik AAB w oknie wysyłania, jeśli dostępna przeglądarka nie pozwoli mi go wgrać.
2. Przeczytaj wymagane warunki Play App Signing i potwierdź je.
3. Jeśli konsola wymaga już teraz deklaracji dotyczących aplikacji, przejdziemy odpowiednią część etapu 6.

**Przekaż mi sterowanie:** „Plik wgrany, wymagane potwierdzenia gotowe. Dokończ pierwsze wydanie wewnętrzne.”

**Moja kolej:** doprowadzę wydanie testowe do uruchomienia. Sam szkic może nie wystarczyć do późniejszej wysyłki przez API. Zapiszę wykorzystany numer wersji; następna wysyłana paczka dostanie nowy numer.

**Kończymy etap, gdy:** pierwsze wydanie wewnętrzne Google jest uruchomione. iOS może otrzymać pierwszą paczkę automatycznie w etapie 7; nie potrzebujesz Transportera na swoim Macu.

## 6. Zakup, opisy, grafiki i deklaracje

**Przekaż mi sterowanie:** „Skonfiguruj pełną wersję i uzupełnij materiały sklepowe. Przygotuj odpowiedzi do sprawdzenia.”

**Moja kolej**

1. Skonfiguruję produkt `full_version`: Apple **Non-Consumable**, Google **produkt jednorazowy**. Cena docelowa to 5 zł w Polsce i około 1 euro; sprawdzimy dostępne ceny sklepowe, np. 4,99 zł. Aplikacja pokaże rzeczywistą cenę ze sklepu.
2. Połączę oba produkty z uprawnieniem `full_version` w RevenueCat. Skonfiguruję przywracanie zakupu oraz powiadomienia o zmianach i zwrotach.
3. Wgram przygotowane opisy, ikony i zrzuty; ustawię adresy pomocy i prywatności. Jeśli wysyłanie konkretnego pliku wymaga Ciebie, podam gotową ścieżkę.
4. Przygotuję odpowiedzi do formularzy prywatności, grupy wiekowej, kategorii dziecięcej, dostępu do aplikacji i reklam na podstawie rzeczywistego działania aplikacji. Uwzględnię RevenueCat. Pytania o właściciela i działalność pozostawię do Twojego uzupełnienia.
5. Przypiszę pierwszy zakup do pierwszej wersji Apple w konsoli i uzupełnię materiały do oceny IAP. Sprawdzę też ustawienie Google Managed publishing: przy włączonym potrzebny będzie dodatkowy krok publikacji po ocenie.

**Twoja kolej:** obejrzyj opisy, zrzuty i ceny, sprawdź dane właściciela oraz przygotowane deklaracje. Powiedz, co trzeba poprawić. Nie zaznaczamy automatycznie „brak zbierania danych” ani wykonanych kontroli, których jeszcze nie zrobiliśmy.

**Przekaż mi sterowanie:** „Materiały, ceny i odpowiedzi sprawdzone; zapisz ustalenia i przygotuj betę.”

**Kończymy etap, gdy:** oferta zakupowa i materiały są gotowe, a brakujące zadania konsol są znane. Potwierdzenia w `release-config.json` zapiszę dopiero po wykonaniu odpowiednich kontroli. Zadania wymagające przesłanego builda dokończymy po etapie 7.

## 7. Ja wysyłam betę, Ty testujesz na telefonach

**Moja kolej:** uruchomię `Release readiness → beta`. Po poprawnym wyniku przygotuję nowy tag, zwykle `v1.0.0-beta.2`, bo pierwszy numer został użyty przy ręcznej paczce Google. Automat zbuduje i wyśle aplikacje do TestFlight i Google Internal testing. Skonfiguruję testerów wskazanych przez Ciebie i przypisanie builda; podam sposób instalacji.

**Twoja kolej**

1. Zainstaluj aplikacje przez TestFlight i testy wewnętrzne Google na odpowiednich kontach testerów. Poczekaj, aż potwierdzimy konfigurację zakupów testowych; Google wymaga właściwego konta testera płatności.
2. Napisz darmową literkę do końca. Sprawdź ekran sukcesu, „Dalej”, ponowną próbę i zapis po zamknięciu aplikacji. Sprawdź też Ą z ogonkiem, obrót ekranu oraz rysik, jeśli go używasz.
3. Kliknij zablokowaną literkę: sprawdź cenę, tekst o autorze i Leonie oraz bramkę rodzica.
4. Najpierw anuluj zakup, potem wykonaj zakup testowy. Po zakupie wszystkie 74 znaki powinny być dostępne również po ponownym uruchomieniu i bez internetu.
5. Sprawdź przywrócenie po reinstalacji, oczekujący zakup i cofnięcie uprawnienia według wskazówek, które podam dla danego sklepu. Pełna lista jest w kroku 9 pierwszej instrukcji.

**Przekaż mi sterowanie:** „Testy na iOS: …; na Androidzie: …; problemy: …”. Jeśli czegoś nie udało się przetestować, zaznacz to wprost.

**Moja kolej:** naprawię wykryte problemy i przygotuję nową betę, jeśli potrzebna. Po rzeczywistym sprawdzeniu obu platform zapiszę `sandboxPurchasesVerified: true`. Testy przeglądarkowe nie zastępują transakcji w systemowym sklepie.

**Kończymy etap, gdy:** zakupy i ćwiczenia działają na obu platformach. Jeśli Google wymaga dodatkowych testów lub wniosku o dostęp do produkcji, wykonujemy je przed następnym etapem.

## 8. Pierwsza publikacja

**Moja kolej:** sprawdzę kompletność obu kart sklepowych, powiązanie pierwszego IAP Apple, wymagania kont, wyniki testów oraz `Release readiness → production`. Pokażę konkretną wersję, cenę i ewentualne pozostałe blokady. Nowy tag produkcyjny tworzymy dopiero przy gotowej konfiguracji.

**Twoja kolej:** gdy wszystko sprawdzone, napisz **„Wydaj tę wersję do obu sklepów.”** Jeśli trzeba jeszcze zaakceptować nową umowę lub uzupełnić weryfikację właściciela, najpierw wykonaj wskazany krok.

**Moja kolej:** zapiszę konfigurację na `main`, utworzę nowy tag produkcyjny (przy pierwszym wydaniu `v1.0.0`) i sprawdzę przebieg wysyłki. Automat buduje, podpisuje, wysyła i zgłasza aplikacje do oceny. Publikacja następuje po akceptacji sklepu, zgodnie z ustawieniami wydania. Sam zielony wynik wysyłki nie oznacza jeszcze obecności w sklepie.

**Kończymy etap, gdy:** wersje zostały zgłoszone do oceny; po akceptacji sprawdzamy publiczne strony aplikacji. Gdy sklep zwróci uwagi, wróć z komunikatem — poprawię aplikację lub materiały i przygotuję następne zgłoszenie.

## 9. Kolejne wydania

Po pierwszej konfiguracji zwykle wystarczy: zmiana kodu i opis zmian → zielone testy → nowy tag beta do próby → nowy tag produkcyjny. Możesz wysyłać tagi sam lub zlecać to mnie. Nie przesuwamy istniejących tagów i nie wysyłamy ponownie wykorzystanego numeru builda.

Gdy jedna platforma przyjęła paczkę, a druga odmówiła, sprawdzę przyczynę i wznowię tylko nieudane zadania. Jeśli zmienia się paczka, potrzebny jest nowy numer. Co pewien czas wrócimy do Ciebie po odnowienie członkostwa, certyfikatu lub akceptację nowych umów.

## Co już robi repo, a co wykonamy przy konfiguracji

| Czynność | Jak ją wykonamy |
|---|---|
| Testy, ikony, zrzuty, budowanie i podpisywanie | Skrypty i GitHub Actions już są w repo. |
| Wysyłka bety i zgłoszenie produkcji z taga | Pipeline już istnieje; wymaga poprawnych dostępów i gotowych kont. |
| Utworzenie rekordów aplikacji i pierwsza konfiguracja produktów | Wspólnie podczas opisanych etapów, przez API lub panel. Sam tag nie tworzy całego konta sklepowego. |
| Uzupełnianie opisów, cen i produktów | Wykonam przez dostępne API lub przeglądarkę po sprawdzeniu uprawnień. |
| Logowanie, tożsamość, umowy, bank i podatki | Twoja część, w panelach operatorów. |
| Rzeczywisty zakup i przywracanie na telefonie | Twoja próba według mojej listy; ja analizuję wynik i naprawiam problemy. |

Apple udostępnia API m.in. do metadanych, zakupów, podpisów i TestFlight ([dokumentacja Apple](https://developer.apple.com/app-store-connect/api/)). Google udostępnia tworzenie i aktualizację produktów jednorazowych ([dokumentacja Google](https://developers.google.com/android-publisher/api-ref/rest/v3/monetization.onetimeproducts/patch)). RevenueCat ma API administracyjne ([dokumentacja RevenueCat](https://www.revenuecat.com/docs/api-v2)). W każdym przypadku możliwość wykonania danej czynności zależy od uprawnień oraz stanu Twojego konta.

Instrukcja przygotowana 14 października 2026. Nazwy i układ ekranów mogą się zmienić; podczas wspólnej pracy kierujemy się rzeczywistymi panelami.
