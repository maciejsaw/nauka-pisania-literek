# Darmowa pełna wersja dla znajomych i blogerów

Od beta.4 aplikacja ma w ustawieniach przycisk **Aktywuj kodem**. Korzysta z oficjalnych kodów App Store i Google Play. Nie ma wspólnego lokalnego hasła `PRZYJACIEL`: kod musi najpierw powstać w odpowiednim sklepie. Apple pozwala nadać własną nazwę kodowi, a Google dla naszego jednorazowego produktu generuje osobne kody do jednokrotnego użycia.

## Jak odbiorca używa kodu

1. Instaluje Pajączka ze sklepu, dla którego otrzymał kod.
2. Otwiera **Ustawienia → Aktywuj kodem**. Przycisk znika po odblokowaniu pełnej wersji.
3. Dorosły podaje swój rok urodzenia (bez zapisywania go), wpisuje kod i wybiera aktywację w sklepie.
4. W App Store lub Google Play potwierdza bezpłatną ofertę na swoim koncie. Jeśli sklep nie rozpoznaje kodu lub pokazuje zwykłą płatność, nie finalizuje jej.
5. Wraca do Pajączka. Aplikacja sprawdza potwierdzenie i odblokowuje wszystkie litery oraz cyfry. Jeśli potwierdzenie jeszcze nie dotarło, wybiera **Sprawdź odblokowanie**. Po reinstalacji może użyć **Przywróć zakup** na tym samym koncie sklepu.

Samo wpisanie kodu lub otwarcie sklepu nie przyznaje dostępu. Potwierdzenie pochodzi ze sklepu przez RevenueCat. Kod Google nie działa w App Store ani odwrotnie. Aplikacja nie zapisuje wpisanego kodu i nie wysyła go autorowi; przekazuje go do właściwego sklepu.

## Apple

Najpierw umowa **Paid Apps Agreement** musi być **Active**, z uzupełnionymi danymi podatkowymi i bankowymi. Na etapie beta można przygotować ofertę i kody sandbox. Kody dla odbiorców aplikacji publicznej wymagają statusu aplikacji **Ready for Distribution** oraz zakupu `full_version` **Approved**.

1. App Store Connect → Pajączek → In-App Purchases → `full_version` → Offer Codes → Create Offer.
2. Wybierz bezpłatną ofertę (**Free Offer**), odbiorców oraz Polskę. Dla znajomych, którzy jeszcze nie kupili aplikacji, uwzględnij **Never purchased within your app**.
3. Po spełnieniu warunków publikacji utwórz **Custom Code**, np. `PRZYJACIEL`, i ustaw limit realizacji. Kod może zostać wykorzystany przez wiele kont do tego limitu. Nie działa, zanim zostanie utworzony w Apple.
4. Alternatywnie wygeneruj osobne jednorazowe kody i przekazuj po jednym odbiorcy. Każdy klient może wykorzystać jeden kod danej oferty.

Stan 15 października: kod `PRZYJACIEL` nie został jeszcze utworzony w Apple. Umowa ma status **Pending User Info**; brakuje rachunku bankowego i formularza podatkowego. Samo zainstalowanie aplikacji z TestFlight nie usuwa tej blokady. Nie rozdajemy kodów sandbox jako kodów dla publicznej aplikacji.

[Instrukcja Apple dotycząca ofert i kodów](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-offer-codes-for-in-app-purchases).

## Google Play

1. Play Console → Pajączek → Monetize with Play → Promo codes / Promotions → Create promotion.
2. Wybierz produkt jednorazowy `full_version`, daty ważności i potrzebną liczbę kodów. Nie wybieraj promocji płatnej aplikacji — samo pobranie Pajączka jest bezpłatne.
3. Pobierz kody i przechowuj je prywatnie. Każdemu odbiorcy przekaż inny kod.
4. Dla jednorazowych produktów Google generuje kody do jednokrotnego użycia; własne kody wielokrotnego użycia dotyczą subskrypcji. Pajączek nie ma subskrypcji.

Nie wygenerowano jeszcze kampanii dla blogerów. Zrób to po ustaleniu daty udostępnienia aplikacji, aby kody nie traciły ważności przed możliwością instalacji.

[Instrukcja Google dotycząca promocji](https://support.google.com/googleplay/android-developer/answer/6321495).

## Dotychczasowy kod recenzenta Google

To osobny, losowy kod w prywatnym pliku `secrets/google-review-code.txt`, już przekazany Google za zgodą właściciela. Na Androidzie działa przez **Ustawienia → Dostęp kodem**. Nie zastąpiono go i nie zmieniono instrukcji w Google. Odblokowuje ćwiczenia lokalnie, bez transakcji; po reinstalacji należy wpisać go ponownie. Nie działa na iOS.

Szczegóły przechowywania i wyłączania: [dostęp recenzenta](DOSTEP-DLA-RECENZENTA-GOOGLE.md). Do rozdawania znajomym i blogerom używaj kodów sklepowych opisanych wyżej.

## Kontrola przed wydaniem

Testy automatyczne symulują sklepy i sprawdzają bramkę rodzica, właściwy adres realizacji, anulowanie, błąd połączenia, odblokowanie po potwierdzeniu i ukrywanie przycisku po zakupie. Przed wydaniem trzeba wykonać rzeczywistą realizację kodu na obu platformach, powrót do aplikacji oraz przywrócenie dostępu po reinstalacji.
