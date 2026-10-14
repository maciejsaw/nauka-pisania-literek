# Prywatność, dzieci i App Review

Implementacja nie ma kont dziecka, reklam ani analityki zachowania. Rysowanie i postęp są lokalne. Czcionki są pakowane razem z aplikacją. W wersji mobilnej RevenueCat uruchamia się przy starcie, żeby odtworzyć uprawnienia: anonimowy identyfikator instalacji i informacje techniczne mogą być przetwarzane również bez zakupu. Płatność obsługuje Apple/Google.

Nie należy deklarować „No data collected” bez analizy SDK. Co najmniej historia zakupów i używane identyfikatory muszą zostać ocenione zgodnie z formularzem. Nie włączono IDFA, reklam, dodatkowych atrybutów użytkownika ani integracji marketingowych. Cele to obsługa aplikacji i weryfikacja dostępu. Anonimowy identyfikator nie jest tym samym co brak przetwarzania danych.

Właściciel musi sprawdzić faktycznie skonfigurowane usługi, podstawy i okresy przetwarzania oraz dostosować publiczną politykę do swojej działalności. Kontakt pomocy jest publiczny, dane dla recenzenta pozostają w sekrecie REVIEW_CONTACT_JSON.

Zakup i restore mają bramkę rodzicielską. Zachęta z ceną pojawia się po kliknięciu kłódki zgodnie z projektem właściciela. Przy ocenie Apple Kids może wymagać osłonięcia bramką także całej prezentacji oferty. W takim wypadku należy przenieść `openPaywall` za `askParent`, zostawiając dziecku neutralny komunikat o zablokowanej literze. Nie obchodzić kategorii dziecięcej ani deklarować nieprawdziwej grupy odbiorców.

Pierwszy produkt non-consumable dołącza się do pierwszej wersji iOS ręcznie przed zgłoszeniem. API/Fastlane wysyła build i materiały; nie podpisuje umów w imieniu właściciela i nie zastępuje App Review.

Źródła:
- https://developer.apple.com/kids/
- https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/
- https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy
- https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety
- https://www.revenuecat.com/docs/customers/identifying-customers
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://support.google.com/googleplay/android-developer/answer/14151465
