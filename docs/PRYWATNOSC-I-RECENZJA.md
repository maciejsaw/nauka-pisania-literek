# Prywatność, dzieci i App Review

Implementacja nie ma kont dziecka, reklam ani analityki zachowania. Rysowanie i postęp są lokalne. Czcionki są pakowane razem z aplikacją. W wersji mobilnej RevenueCat uruchamia się przy starcie, żeby odtworzyć uprawnienia: anonimowy identyfikator instalacji i informacje techniczne mogą być przetwarzane również bez zakupu. Płatność obsługuje Apple/Google.

Nie deklarujemy „No data collected”. RevenueCat obsługuje historię zakupów, weryfikację dostępu i statystyki sprzedaży. Statystyki sprzedaży nie oznaczają analityki rysowania ani postępów dziecka. Nie włączono IDFA, reklam, dodatkowych atrybutów użytkownika ani integracji marketingowych. Nie przekazujemy własnego identyfikatora użytkownika; SDK tworzy anonimowy identyfikator. Anonimowy identyfikator nie jest tym samym co brak przetwarzania danych.

## Odpowiedzi sklepowe sprawdzone 15 października 2026

- **Apple App Privacy:** Purchase History; cele App Functionality oraz Analytics; dane nie są powiązane z tożsamością i nie służą śledzeniu. Deklaracja została opublikowana po zatwierdzeniu przez właściciela.
- **Google Data safety:** Financial info → Purchase history; dane są zbierane, szyfrowane podczas przesyłania, nie są przetwarzane wyłącznie chwilowo. Cele App functionality oraz Analytics. Brak kont użytkownika. Dane są przekazywane RevenueCat jako usługodawcy, co przy obecnej konfiguracji podlega wyłączeniu z definicji „shared” w formularzu Google. Deklaracja została zapisana w Publishing overview, gotowa do oceny razem z aplikacją. Nie jest to jeszcze opublikowana karta sklepowa. Właściciel zatwierdził grupę 6–8 lat i wymagania Families; Google App content nie pokazuje już żadnych brakujących deklaracji.
- Identyfikatory oceniamy zgodnie z dokumentacją SDK i obu formularzy. Obecna konfiguracja nie używa własnego App User ID ani identyfikatorów reklamowych. Jeśli dodamy logowanie, własne identyfikatory, atrybuty lub nowe integracje, deklaracje trzeba sprawdzić ponownie.
- Żądanie usunięcia danych jest opisane w publicznej [polityce prywatności](https://maciejsawicki.com/nauka-pisania-literek/legal/privacy/#usuwanie). Sam adres nie automatyzuje usuwania: właściciel weryfikuje prośbę i usuwa odpowiedni profil w RevenueCat. Historia płatności przechowywana przez sklep podlega zasadom tego sklepu; przywrócenie zakupu może ponownie utworzyć profil.

Właściciel musi sprawdzić faktycznie skonfigurowane usługi, podstawy i okresy przetwarzania oraz dostosować publiczną politykę do swojej działalności. Kontakt pomocy jest publiczny, dane dla recenzenta pozostają w sekrecie REVIEW_CONTACT_JSON.

Zakup i restore mają bramkę rodzicielską. Zachęta z ceną pojawia się po kliknięciu kłódki zgodnie z projektem właściciela. Przy ocenie Apple Kids może wymagać osłonięcia bramką także całej prezentacji oferty. W takim wypadku należy przenieść `openPaywall` za `askParent`, zostawiając dziecku neutralny komunikat o zablokowanej literze. Nie obchodzić kategorii dziecięcej ani deklarować nieprawdziwej grupy odbiorców.

Pierwszy produkt non-consumable dołącza się do pierwszej wersji iOS ręcznie przed zgłoszeniem. API/Fastlane wysyła build i materiały; nie podpisuje umów w imieniu właściciela i nie zastępuje App Review.

Google App access obejmuje również blokady płatności, nie tylko logowanie. Bezpłatne litery nie zapewniają recenzentowi dostępu do całej aplikacji. Od Android build 1000003 dostępny jest jawny przycisk Ustawienia → Dostęp kodem, za bramką rodzicielską. Prywatny kod pozwala bezpłatnie uruchomić te same ćwiczenia co zakupiona pełna wersja; nie zmienia historii zakupów ani zachowania gry i nie wykrywa recenzentów. W Google należy wybrać dostęp ograniczony i podać instrukcję z kodem. Szczegóły przechowywania i testowania: [Dostęp dla recenzenta Google](DOSTEP-DLA-RECENZENTA-GOOGLE.md).

Bramka rodzica prosi o czterocyfrowy rok urodzenia osoby dorosłej. Sprawdzenie odbywa się lokalnie; rok nie jest zapisywany ani przesyłany do sklepu lub RevenueCat, a pole jest czyszczone po zamknięciu. To bramka rodzicielska, nie potwierdzenie tożsamości. Prywatność i poradnik rodzica pozostają dostępne bez bramki.

Źródła:
- https://developer.apple.com/kids/
- https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/
- https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy
- https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety
- https://www.revenuecat.com/docs/customers/identifying-customers
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/15748846

## Zakupy po poprawkach UX (beta.6)

Kliknięcie kłódki pokazuje ofertę. Dopiero „Kup pełną wersję” uruchamia weryfikację rodzica z rokiem urodzenia, potem spinner i systemowy ekran płatności. To kolejność wybrana przez właściciela. Po potwierdzeniu aplikacja odblokowuje ćwiczenia i pokazuje podziękowanie z Pajączkiem oraz przyciskiem „Gotowe”. Anulowanie przywraca ofertę; oczekująca płatność nie odblokowuje ćwiczeń bez potwierdzonego uprawnienia.

Przy cenie w PLN aplikacja używa aktualnej wartości ze sklepu. Od beta.8 przy metadanych w innej walucie pokazuje zatwierdzony przez właściciela tekst „4,99 zł jednorazowo”, bez dodatkowego dopisku. Dotyczy to polskiej oferty, której cena pozostaje ustawiona w sklepach. To nie jest przeliczenie waluty ani gwarancja ceny dla zagranicznego konta. [RevenueCat opisuje rozbieżność USD/PLN w TestFlight](https://www.revenuecat.com/docs/test-and-launch/sandbox/apple-app-store). Gdy zmieni się polska cena produktu, zaktualizuj również cenę odniesienia w `src/paywall-price.js` i wersji WWW.

Testy obejmują opóźnione potwierdzenie, anulowanie, błąd połączenia, przywrócenie, ponowne uruchomienie, spóźnioną odpowiedź po zamknięciu okna, cofnięcie dostępu oraz bezpieczne odstępy na iPhonie. Sklepy są w nich symulowane. 16 października właściciel potwierdził, że bezpłatne płatności testowe działają na kontach testerskich w iOS i Androidzie. Do sprawdzenia pozostają szczegóły zachowania po zakupie, anulowanie, offline i przywracanie; listę oraz wyniki zapisujemy w [stanie konfiguracji](STAN-KONFIGURACJI-SKLEPOW.md#co-teraz-sprawdzić-na-androidzie-i-ios). `sandboxPurchasesVerified` pozostaje `false` do zakończenia pełnej kontroli na telefonach.

## Dobrowolna ocena aplikacji (beta.7)

Przycisk z gwiazdką **Ustawienia → Oceń aplikację** jest dostępny w wersjach mobilnych. Najpierw otwiera tę samą bramkę rodzica co zakup. Nie pojawiają się automatyczne prośby po uruchomieniu, ćwiczeniu, odznace ani przybiciu piątki. Ocena nie daje nagród ani dostępu do płatnych liter; aplikacja nie sprawdza, czy rodzic wystawił ocenę.

Po przejściu bramki wersja produkcyjna otwiera formularz recenzji App Store albo kartę aplikacji w Google Play. To świadomy wybór: [Apple](https://developer.apple.com/documentation/StoreKit/requesting-app-store-reviews) i [Google](https://developer.android.com/guide/playcore/in-app-review) zalecają link do sklepu dla ręcznego przycisku, ponieważ systemowy prompt może się w ogóle nie wyświetlić przez limity sklepu. Błąd otwierania sklepu pokazuje możliwość ponowienia.

Buildy beta pokazują krótkie podziękowanie i informację o ocenach po premierze, bez odsyłania do nieopublikowanej karty. Kanał jest wyliczany z tego samego `RELEASE_TAG`, który numeruje wydanie; dopiero tag produkcyjny włącza linki do ocen. Lokalny zwykły build zachowuje się jak beta. Testy E2E bez taga sprawdzają ścieżkę produkcyjną, a z `RELEASE_TAG=v1.0.0-beta.7` ścieżkę beta; żaden z nich nie wysyła prawdziwej oceny.
