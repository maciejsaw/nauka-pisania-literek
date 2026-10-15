# Pajączek — stan konfiguracji sklepów

Stan sprawdzony 15 października 2026. To zapis wykonanych czynności, nie potwierdzenie gotowości do publicznej sprzedaży. Przy wznowieniu sprawdź stan paneli i nie generuj ponownie istniejących kluczy.

## Co już działa

- Repo: `maciejsaw/nauka-pisania-literek`; identyfikator obu aplikacji: `com.maciejsawicki.pajaczek`.
- Pełny przebieg taga **v1.0.0-beta.2** zakończył się powodzeniem: testy, podpisanie i wysłanie obu aplikacji. [Wynik GitHub Actions](https://github.com/maciejsaw/nauka-pisania-literek/actions/runs/38730803103).
- Android: wersja 1.0.0, build **1000002**, aktywne testy wewnętrzne. Trzy konta wskazane przez właściciela są testerami aplikacji i zakupów. [Dołącz do testów na Androidzie](https://play.google.com/apps/internaltest/4701129001410143384). Zaloguj się jednym z tych kont; nazwa w Play może jeszcze zawierać `(unreviewed)`.
- Apple: wersja 1.0.0, build **100.0.2** przetworzony w TestFlight. Grupa `Pajaczek — testy wewnetrzne` automatycznie otrzymuje kolejne buildy. Konto właściciela otrzymało zaproszenie.
- Apple Distribution i profil App Store są poprawne i zostały użyte przez GitHub. Profil jest ważny do 15 października 2027. Mac z Intelem wystarcza; buildy wykonuje GitHub.
- GitHub ma klucze podpisów, dostęp do Apple i Google oraz publiczne klucze RevenueCat. Prywatny kontakt recenzenta `REVIEW_CONTACT_JSON` pozostaje do uzupełnienia.
- Produkt **full_version** jest w obu sklepach i w RevenueCat, przypisany do uprawnienia o tej samej nazwie. Zakup jest jednorazowy. Apple: 4,99 zł / 0,99 EUR; Google: 4,99 zł w Polsce / 1,09 EUR w Niemczech i Francji. Aplikacja wyświetla lokalną cenę otrzymaną ze sklepu.
- Google: produkt aktywny, opcja zakupu `full-version`, zgodność wsteczna włączona. Profil sprzedawcy utworzony.
- RevenueCat: poświadczenia obu sklepów mają status **Valid credentials**. Powiadomienie testowe Google dotarło do RevenueCat 15 października o 12:07 UTC.
- Apple: oba adresy powiadomień (sandbox i produkcja) kierują do RevenueCat. Próba sandbox przez oficjalne API zwróciła **SUCCESS**, a panel RevenueCat potwierdził odbiór 15 października o 12:32 UTC. Próba produkcyjna zwróciła **HTTP 401** — ponowić po aktywacji umowy i sprawdzić przy pierwszym wydaniu. Przyczyna odmowy nie jest jeszcze potwierdzona. Nie jest to test zakupu.
- Materiały sklepowe wysłane przez **Prepare store listings**: polskie opisy, grafiki Google, 3 zrzuty Android i 6 zrzutów Apple. [Udany przebieg](https://github.com/maciejsaw/nauka-pisania-literek/actions/runs/38734192683). Workflow nie wysyła ani nie promuje builda; Google może automatycznie skierować metadane do oceny.
- Apple App Privacy opublikowane za zgodą właściciela: historia zakupów, App Functionality + Analytics, bez powiązania z tożsamością, bez śledzenia reklamowego. Polityka prywatności i strona pomocy są publiczne.
- Google Data safety: odpowiedzi zapisane jako szkic. Historia zakupów, szyfrowanie, brak kont użytkownika, brak udostępniania poza usługodawcą; adres zgłoszeń usunięcia danych. Finalny zapis zależy od grupy odbiorców i dostępu dla recenzenta.
- Apple: kategoria Education, klasyfikacja 4+, w formularzu wybrano grupę dzieci 6–8 lat jako odbiorców nauki pisania. Właściciel powinien potwierdzić tę grupę przed pierwszą publikacją.
- Apple: cena pobrania aplikacji 0 zł, kraj bazowy Polska; dostępność po wydaniu w 175 krajach i regionach. Wydanie obejmuje iPhone/iPad; automatyczna dostępność na Macach Apple Silicon i Vision Pro wyłączona do czasu sprawdzenia tych urządzeń. Build 100.0.2 przypisany do szkicu pierwszej wersji.

## Teraz właściciel

1. **Apple Business:** dokończ Paid Apps Agreement, dane podatkowe i bankowe, a następnie Complete Compliance Requirements ze zgodnym z sytuacją statusem sprzedawcy w UE. Aktualizacja danych właściciela nie oznacza automatycznego podpisania umowy. Jeśli trwa weryfikacja Apple, poczekaj na zmianę statusu.
2. **Kontakt dla Apple App Review:** w prywatnym pliku `secrets/review-contact.json` uzupełnij `phone` z prefiksem kraju. Nie wklejaj go do publicznego repo. Po zgodzie właściciela asystent zapisze komplet w Apple oraz w GitHub Secrets.
3. **Zainstaluj betę:** Android przez powyższy link, iPhone/iPad przez otrzymane zaproszenie TestFlight. W Google upewnij się, że instalujesz i kupujesz tym samym kontem testera.
4. **Sprawdź zakupy:** najpierw anulowanie, potem testowe odblokowanie, ponowne uruchomienie, tryb offline oraz przywrócenie po reinstalacji. Google powinien pokazać testową formę płatności. Jeśli widzisz zwykłą płatność bez oznaczenia testu, anuluj i zgłoś problem. TestFlight używa środowiska testowego.
5. **Sprawdź ćwiczenie:** ukończ darmową literę, zobacz ekran sukcesu, użyj „Dalej”, sprawdź zapis postępu i wielkie Ą. Zgłoś wynik osobno dla obu platform.
6. **Zrzut dla oceny zakupu Apple:** zrób zrzut dialogu pełnej wersji w rzeczywistej aplikacji iOS z TestFlight. Potrzebny jest ekran IAP; grafika dialogu z wersji WWW pokazuje inne informacje. Plik pozwoli asystentowi zakończyć materiały produktu.
7. Sprawdź opisy i zrzuty sklepu oraz docelowy wiek dzieci. Zachowaj prywatną kopię katalogu `secrets/` i haseł. Google może jeszcze wymagać metody wypłat na koncie sprzedawcy.

## Potem asystent

1. Dokończyć klasyfikację IARC po zgodzie na jej warunki.
2. Zapewnić recenzentowi Google darmowy dostęp do płatnej części i zapisać konkretne instrukcje po angielsku. Nie zaznaczać, że wszystkie funkcje są bez ograniczeń. Obecna aplikacja nie ma kont użytkowników; sposób dostępu recenzenta wymaga jeszcze przygotowania i sprawdzenia. Sprawdzono oficjalne Promo codes: dla zakupu jednorazowego kody są jednorazowe i wygasają, więc nie zapewniają stałego dostępu przy kolejnych ocenach. Ich utworzenie wymaga dodatkowego regulaminu, którego jeszcze nie zaakceptowano. [Zasady Google](https://support.google.com/googleplay/android-developer/answer/6321495).
3. Dokończyć Target audience oraz Data safety w Google. Sprawdzić Managed publishing i kraj dystrybucji.
4. W Apple dodać zrzut produktu i przypisać pierwszy IAP do pierwszej wersji. Cena samej aplikacji i dostępność są ustawione. Uzupełnić prywatny kontakt recenzenta i sprawdzić aktywację umów.
5. Po faktycznych testach zaznaczyć potwierdzenia w `release-config.json`. Dopiero wtedy uruchomić **Release readiness → production** i przygotować pierwsze zgłoszenie.

## Następne tagi

`v1.0.0-beta.1` i `v1.0.0-beta.2` są wykorzystane. Kolejna zmieniona paczka: **v1.0.0-beta.3**. Pierwszy tag produkcyjny: **v1.0.0**, dopiero po zakończeniu powyższych kroków. Nie przesuwaj istniejących tagów. Tag produkcyjny zgłasza wydanie do oceny; decyzja i termin publikacji należą do sklepów.

## Dane techniczne bez sekretów

- Google app ID: `4974262256182594112`; internal track: `4701129001410143384`.
- Apple app ID: `6823056260`; IAP ID: `6823060950`.
- RevenueCat project: `65c82d6a`; iOS app: `app7720f0ccdc`; Google app: `app965c1c6c64`.
- GCP: `pajaczek-nauka-literek`; topic: `Play-Store-Notifications`.
- Konto Google GitHub Release ma dostęp tylko do Pajączka, w tym zatwierdzone „Edit and delete draft apps”, wymagane do zapisu pierwszej karty sklepowej. Konto RevenueCat jest osobne. Oficjalny nadawca Google ma Pub/Sub Publisher tylko na powyższym kanale.
- `scripts/test-apple-notifications.mjs` pozwala sprawdzić doręczenie testowego powiadomienia z lokalnym kluczem IAP; nie wykonuje zakupów ani zwrotów.
