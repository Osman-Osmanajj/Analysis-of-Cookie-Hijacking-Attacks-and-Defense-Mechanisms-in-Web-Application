# Analiza e sulmeve Cookie Hijacking dhe mekanizmat e mbrojtjes në aplikacionet ueb

Ky projekt është një laborator lokal për temën e diplomës. Ai demonstron si përdoret cookie-ja për ta mbajtur një sesion aktiv, si mund të ekspozohet ose të ripërdoret ajo dhe çfarë ndryshon kur aktivizohen mekanizmat e mbrojtjes.

Laboratori lejon krahasimin e dy konfigurimeve të të njëjtit aplikacion: **HTTP për provat e rrezikut** dhe **HTTPS për provat e mbrojtjes**. Konfigurimi i pambrojtur përdoret qëllimisht vetëm për eksperimentet lokale.

## Teknologjitë

- **Node.js dhe Express** për serverin dhe rrugët e aplikacionit.
- **MongoDB** për ruajtjen e përdoruesve.
- **bcrypt** për ruajtjen e fjalëkalimeve si hash dhe verifikimin e tyre gjatë hyrjes.
- **express-session** për krijimin dhe menaxhimin e sesioneve.
- **Helmet** për header-at e sigurisë, përfshirë Content Security Policy.
- **HTML, CSS dhe JavaScript** për ndërfaqen.
- **Wireshark** për krahasimin e trafikut HTTP me HTTPS.

## Pjesët e aplikacionit

- **Regjistrimi:** krijon përdorues në MongoDB. Në databazë ruhet `passwordHash`, jo fjalëkalimi si tekst.
- **Hyrja:** verifikon fjalëkalimin dhe krijon sesion të ri për përdoruesin.
- **Paneli:** shfaq protokollin dhe atributet aktuale të cookie-s, si dhe rrjedhën e sesionit.
- **Security Lab:** përmban provën e leximit me JavaScript, kontrollin e sesionit dhe krahasimin e trafikut në Wireshark.
- **Dalja nga llogaria:** e anulon sesionin në server dhe e pastron cookie-n në shfletues.

Pas hyrjes, shfletuesi ruan një cookie me identifikuesin e sesionit. Të dhënat e sesionit ruhen në server; cookie-ja nuk e përmban fjalëkalimin.

## Eksperimentet

### 1. Leximi i cookie-s me JavaScript

Në Security Lab, butoni **“Provo leximin”** përdor `document.cookie`. Kur `HttpOnly` është joaktiv, JavaScript mund ta lexojë cookie-n e sesionit. Kur `HttpOnly` është aktiv, cookie-ja e sesionit nuk shfaqet në `document.cookie`.

Vlera shfaqet fillimisht pjesërisht e fshehur në ndërfaqe. Kjo fshehje është vetëm për paraqitje dhe nuk është mekanizëm sigurie.

### 2. Krahasimi HTTP/HTTPS me Wireshark

Në HTTP, header-i `Cookie` mund të shihet në trafikun e kapur. Në HTTPS, përmbajtja e komunikimit është e koduar dhe nuk shfaqet si kërkesë HTTP e lexueshme.

Në Security Lab gjenden edhe dy pamje të ruajtura nga Wireshark: një për trafikun HTTP dhe një për trafikun HTTPS.

### 3. Vlefshmëria e sesionit

Butoni **“Verifiko sesionin”** dërgon kërkesë te `/api/auth/me`. Me sesion aktiv, serveri kthen përgjigje të suksesshme (`200 OK`). Pa sesion të vlefshëm, kthen `401`. Pas daljes nga llogaria, sesioni anulohet në server.

### 4. Ripërdorimi i cookie-s

Në një provë lokale me llogari testuese, një cookie e marrë nga një kontekst i shfletuesit mund të provohet në një kontekst tjetër për sa kohë që sesioni mbetet i vlefshëm. Aplikacioni kontrollon edhe ndryshimin e `User-Agent` dhe e anulon sesionin kur e zbulon atë ndryshim. Ky kontroll është shtesë, por vlera e `User-Agent` mund të imitohet.

## Mekanizmat e mbrojtjes

| Mekanizmi                   | Roli                                                            |
| --------------------------- | --------------------------------------------------------------- |
| HTTPS/TLS                   | Kodon komunikimin gjatë transmetimit.                           |
| `Secure`                    | Kufizon dërgimin e cookie-s në lidhje HTTPS.                    |
| `HttpOnly`                  | Ndalon leximin e cookie-s së sesionit përmes `document.cookie`. |
| `SameSite=Lax`              | Kufizon dërgimin e cookie-s në disa kërkesa nga faqe të tjera.  |
| `__Host-`                   | Në konfigurimin HTTPS, e kufizon cookie-n te hosti përkatës.    |
| `SESSION_SECRET`            | Përdoret për nënshkrimin e ID-së së sesionit.                   |
| Ndërrimi i ID-së pas hyrjes | `req.session.regenerate()` krijon ID të re pas kyçjes.          |
| Afati i cookie-s            | `maxAge` është vendosur në 15 minuta.                           |
| Kontrolli i qasjes          | Paneli dhe laboratori kërkojnë sesion të vlefshëm.              |
| Dalja nga llogaria          | E shkatërron sesionin në server.                                |
| Kontrolli i `User-Agent`    | E anulon sesionin kur ndryshon kjo vlerë.                       |
| Helmet/CSP                  | Kufizon ekzekutimin e disa skripteve të paautorizuara.          |

## Kufijtë e demonstrimit

Ky është aplikacion **lokal edukativ**, jo shërbim i gatshëm për përdorim publik. Përdoruesit ruhen në MongoDB, ndërsa sesionet përdorin ruajtjen e parazgjedhur në memorien e serverit; rinisja e serverit i ndërpret ato.

HTTPS dhe `HttpOnly` mbrojnë kundër mënyrave të ndryshme të ekspozimit të cookie-s. Ato nuk e bëjnë të pamundur ripërdorimin e një cookie-je që është marrë në një mënyrë tjetër. Eksperimentet dhe pamjet e Wireshark duhen kryer vetëm me llogari dhe trafik testues lokal.
