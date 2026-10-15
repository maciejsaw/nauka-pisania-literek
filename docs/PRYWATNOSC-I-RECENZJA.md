# Prywatność, dzieci i App Review

Implementacja nie ma kont dziecka, reklam ani analityki zachowania. Rysowanie i postęp są lokalne. Czcionki są pakowane razem z aplikacją. W wersji mobilnej RevenueCat uruchamia się przy starcie, żeby odtworzyć uprawnienia: anonimowy identyfikator instalacji i informacje techniczne mogą być przetwarzane również bez zakupu. Płatność obsługuje Apple/Google.

Nie deklarujemy „No data collected”. RevenueCat obsługuje historię zakupów, weryfikację dostępu i statystyki sprzedaży. Statystyki sprzedaży nie oznaczają analityki rysowania ani postępów dziecka. Nie włączono IDFA, reklam, dodatkowych atrybutów użytkownika ani integracji marketingowych. Nie przekazujemy własnego identyfikatora użytkownika; SDK tworzy anonimowy identyfikator. Anonimowy identyfikator nie jest tym samym co brak przetwarzania danych.

## Odpowiedzi sklepowe sprawdzone 15 października 2026

- **Apple App Privacy:** Purchase History; cele App Functionality oraz Analytics; dane nie są powiązane z tożsamością i nie służą śledzeniu. Deklaracja została opublikowana po zatwierdzeniu przez właściciela.
- **Google Data safety:** Financial info → Purchase history; dane są zbierane, szyfrowane podczas przesyłania, nie są przetwarzane wyłącznie chwilowo. Cele App functionality oraz Analytics. Brak kont użytkownika. Dane są przekazywane RevenueCat jako usługodawcy, co przy obecnej konfiguracji podlega wyłączeniu z definicji „shared” w formularzu Google. Odpowiedzi zapisano jako szkic; finalny zapis wymaga jeszcze Target audience i instrukcji dostępu recenzenta.
- Identyfikatory oceniamy zgodnie z dokumentacją SDK i obu formularzy. Obecna konfiguracja nie używa własnego App User ID ani identyfikatorów reklamowych. Jeśli dodamy logowanie, własne identyfikatory, atrybuty lub nowe integracje, deklaracje trzeba sprawdzić ponownie.
- Żądanie usunięcia danych jest opisane w publicznej [polityce prywatności](https://maciejsawicki.com/nauka-pisania-literek/legal/privacy/#usuwanie). Sam adres nie automatyzuje usuwania: właściciel weryfikuje prośbę i usuwa odpowiedni profil w RevenueCat. Historia płatności przechowywana przez sklep podlega zasadom tego sklepu; przywrócenie zakupu może ponownie utworzyć profil.

Właściciel musi sprawdzić faktycznie skonfigurowane usługi, podstawy i okresy przetwarzania oraz dostosować publiczną politykę do swojej działalności. Kontakt pomocy jest publiczny, dane dla recenzenta pozostają w sekrecie REVIEW_CONTACT_JSON.

Zakup i restore mają bramkę rodzicielską. Zachęta z ceną pojawia się po kliknięciu kłódki zgodnie z projektem właściciela. Przy ocenie Apple Kids może wymagać osłonięcia bramką także całej prezentacji oferty. W takim wypadku należy przenieść `openPaywall` za `askParent`, zostawiając dziecku neutralny komunikat o zablokowanej literze. Nie obchodzić kategorii dziecięcej ani deklarować nieprawdziwej grupy odbiorców.

Pierwszy produkt non-consumable dołącza się do pierwszej wersji iOS ręcznie przed zgłoszeniem. API/Fastlane wysyła build i materiały; nie podpisuje umów w imieniu właściciela i nie zastępuje App Review.

Google App access obejmuje również blokady płatności, nie tylko logowanie. Pięć darmowych par liter nie zapewnia recenzentowi dostępu do całej aplikacji. Przed zgłoszeniem należy przygotować działający, bezpłatny sposób dostępu do pełnej wersji i opisać go po angielsku w konsoli. Nie oznaczać wszystkich funkcji jako dostępnych bez ograniczeń. Nie dodawać ukrytego zachowania wykrywającego recenzenta.

Źródła:
- https://developer.apple.com/kids/
- https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/
- https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy
- https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety
- https://www.revenuecat.com/docs/customers/identifying-customers
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://support.google.com/googleplay/android-developer/answer/14151465
