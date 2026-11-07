

Tehnički audit i prošireni plan implementacije: Heritage Decks



Proveden je detaljan audit dostavljenog arhitektonskog i sadržajnog plana. Kako bi se osigurala besprijekorna automatizirana izvedba unutar Google Antigravity IDE okruženja pomoću Gemini Flash 3.8 agenta, plan je nadograđen kritičnim WCAG 2.2 i SEO standardima koji su u izvornom dokumentu bili nepotpuni ili samo površno navedeni.



1\. Izvještaj o auditu i nadogradnji standarda





WCAG 2.2 AA / AAA praznine i rješenja



• Fokus (Uspjeh 2.4.11 / 2.4.12 - WCAG 2.2): Izvorna specifikacija nije definirala indikatore fokusa. Dodan je zahtjev za nelinearnim, visoko kontrastnim vanjskim obrubom (outline) minimalne debljine 2px s kontrastom od 4.5:1 prema pozadini.

• Veličina ciljeva dodira (Uspjeh 2.5.8 - WCAG 2.2): Elementi poput gumba, preklopnika jezika i ikona društvenih mreža moraju imati minimalnu površinu od 44x44 CSS piksela (ili 24x24 px ako je razmak oko njih minimalno 8px).

• Kretanje tipkovnicom: Definiran je strogi modalni fokus (focus trap) za mobilni izbornik i cookie banner, sprječavajući korisnika da skrola kroz pozadinski sadržaj dok su ovi elementi aktivni.

• Korištenje ikona: Sukladno vašoj napomeni, upotreba emoji simbola je strogo zabranjena. Sve ikone se povlače isključivo iz FontAwesome Free (SVG ili WebFont) paketa, uz obveznu primjenu aria-hidden="true" za dekorativne ikone ili role="img" uz pridruženi aria-label za semantičke ikone.



SEO praznine i rješenja



• Višejezični SEO (hreflang): Izvorna sitemap datoteka nije eksplicitno zahtijevala unakrsne relacije. Plan je nadograđen tako da index.html i sitemap.xml sadrže rel="alternate" hreflang="..." mapiranje za sve tri jezične varijante kako bi se spriječio "duplicate content".

• Optimizacija resursa: Uveden je obvezan Performance Budget kroz CSS (content-visibility: auto za sekcije ispod preloma) i nativno odgođeno učitavanje slika (loading="lazy").

• Strukturirani podaci: Uz FAQPage, ubačena je i LocalBusiness / Product Schema.org JSON-LD specifikacija u zaglavlje kako bi se lokalni autoritet u Istri maksimalno podigao.



2\. Konačna arhitektura projekta (Izolirani SSOT)



Agent mora stvoriti i održavati sljedeću strukturu. Sve datoteke moraju komunicirati bez cirkularnih ovisnosti:

text

├── index.html                       # Glavna HTML5 datoteka s jezičnim korijenom i Schema strukturama

├── privacy-policy.html              # GDPR dokumentacija o obradi podataka

├── accessability-statement.html     # Javni iskaz o sukladnosti s WCAG 2.2 standardom

├── terms.html                       # Uvjeti korištenja platforme

├── sitemap.xml                      # Unakrsna višejezična XML mapa (hreflang)

├── robots.txt                       # Upute za crawlere s putanjom do sitemapa

├── css/

│   └── style.css                    # Mobile-First stilovi, CSS varijable i medijski upiti

├── lang/

│   ├── en.json                      # SSOT rječnik: Engleski (primarni)

│   ├── hr.json                      # SSOT rječnik: Hrvatski

│   └── it.json                      # SSOT rječnik: Talijanski

├── js/

│   ├── main.js                      # Centralni koordinator (Orchestrator) aplikacije

│   ├── theme.js                     # Upravljanje tamnom/svijetlom shemom (SSOT)

│   ├── i18n.js                      # Engine za asinkroni prijevod i DOM injekciju (SSOT)

│   ├── cookie-consent.js            # GDPR Cookie banner i logička blokrada skripti

│   ├── contact-form.js              # Validacija forme, sanitizacija i provjera privole

│   └── ui-effects.js                # Upravljanje sučeljem (back-to-top, izbornik, skrol)

└── images/

&#x20;   ├── image-manifest.json          # SSOT registar za sve medijske resurse na stranici

&#x20;   ├── branding/

&#x20;   │   ├── favicons/

&#x20;   │   ├── logos/

&#x20;   │   └── social-media/

&#x20;   ├── design/                      # Layout slike - koriste se za strukturu i vizuale sekcija

&#x20;   └── works/

&#x20;       └── projects/                # Portfolio i galerije završenih projekata

Use code with caution.



3\. Detaljan plan implementacije korak-po-korak





Faza 1: Podatkovni sloj, SEO konfiguracija i skeniranje medija



Cilj: Uspostaviti datoteke indeksiranja, generirati rječnike i izgraditi Manifest slika kao jedinstveni izvor istine (SSOT) za medije.

1\. Skeniranje i izgradnja images/image-manifest.json:

&#x09;• Agent mora pročitati sve datoteke unutar images/design/ i images/works/.

&#x09;• Stvoriti JSON strukturu gdje je ključ relativna putanja datoteke.

&#x09;• Za svaku sliku definirati fiksne width i height vrijednosti (SEO prevencija CLS-a) i troslojni alt objekt s detaljnim tekstualnim opisima na engleskom, hrvatskom i talijanskom jeziku.

2\. Kreiranje jezičnih datoteka (lang/hr.json, lang/en.json, lang/it.json):

&#x09;• Svi tekstualni elementi iz sadržaja moraju se mapirati u ključeve (npr. hero.title, services.decking.description).

&#x09;• Uključiti tekstove za pravne dokumente, forme i FAQ sekciju.

3\. Kreiranje SEO konfiguracijskih datoteka:

&#x09;• robots.txt:text

User-agent: \*

Allow: /

Disallow: /js/

Sitemap: https://heritage-decks.com

Use code with caution.

&#x09;• sitemap.xml: Generirati valjan XML format sa strukturom koja sadrži unakrsne reference za jezike:xml

<url>

&#x20; <loc>https://heritage-decks.com</loc>

&#x20; <xhtml:link rel="alternate" hreflang="en" href="https://heritage-decks.com?lang=en"/>

&#x20; <xhtml:link rel="alternate" hreflang="hr" href="https://heritage-decks.com?lang=hr"/>

&#x20; <xhtml:link rel="alternate" hreflang="it" href="https://heritage-decks.com?lang=it"/>

</url>

Use code with caution.



Faza 2: i18n Engine i Orchestrator (js/i18n.js \& js/main.js)



Cilj: Kreiranje mehanizma za asinkrono prevođenje bez osvježavanja stranice.

1\. Izrada js/i18n.js:

&#x09;• Izolirati klasu ili objekt LocalizationManager.

&#x09;• Implementirati metodu async loadLanguage(lang) koja dohvaća datoteku iz /lang/{lang}.json.

&#x09;• Nakon dohvaćanja, metoda mora proći kroz DOM i pretražiti sve elemente s atributom data-i18n te zamijeniti njihov tekstualni sadržaj.

&#x09;• Ako element ima atribut data-i18n-placeholder, ažurirati placeholder atribut (važno za kontakt formu).

&#x09;• Pročitati images/image-manifest.json i dinamički ažurirati alt atribute svih slika na stranici ovisno o trenutno aktivnom jeziku.

2\. Inicijalizacija u js/main.js:

&#x09;• Uvesti i18n.js. Presresti parametar iz URL-a (?lang=) ili pročitati navigator.language. Pokrenuti inicijalno prevođenje unutar DOMContentLoaded slušača događaja.



Faza 3: Izrada CSS sustava i kontrola tema (css/style.css \& js/theme.js)



Cilj: Izgradnja Mobile-First responzivnog dizajna s podrškom za Dark/Light modove koji zadovoljavaju stroge WCAG 2.2 kontraste.

1\. Konfiguracija css/style.css (Temeljne varijable i Mobile-First reset):

&#x09;• Uvesti fontove (Cinzel i Montserrat) preko sigurnog HTTPS linka.

&#x09;• Postaviti varijable za teme. Sve kombinacije boja moraju proći automatizirani test kontrasta (minimalno 4.5:1 za tekst).

&#x09;• Svi bazični stilovi moraju biti definirani za mobilne rezolucije (ekrani od 320px do 768px). Svi elementi, tablice i sekcije moraju biti unutar Flexbox ili Grid sustava bez fiksnih širina u pikselima (width: 100%; max-width: ...).

&#x09;• Definirati globalni fokus stil:css

\*:focus-visible {

&#x20;   outline: 2px dashed var(--color-primary);

&#x20;   outline-offset: 4px;

}

Use code with caution.

2\. Uzlazni medijski upiti (Media Queries):

&#x09;• Dodati @media (min-width: 768px) za tablete i @media (min-width: 1200px) za desktop ekrane, gdje se redefiniraju grid stupci (npr. prelazak s 1 stupca na 3 stupca u sekciji usluga).

3\. Izrada js/theme.js:

&#x09;• Kreirati modul koji osluškuje klik na preklopnik teme. Pri kliku mijenja atribut na korijenskom elementu: document.documentElement.setAttribute('data-theme', 'light' | 'dark'). Pohraniti odabir u localStorage.



Faza 4: Semantički HTML5 Layout i UI interakcije (index.html \& js/ui-effects.js)



Cilj: Izgradnja pristupačne i SEO optimizirane strukture stranice uz integraciju slika iz images/design/.

1\. Struktura zaglavlja i Hero sekcije (index.html):

&#x09;• Dodati link za preskakanje: <a href="#main-content" class="skip-link">Skoči na sadržaj</a>.

&#x09;• Kreirati <header> i <nav aria-label="Main Navigation">. Hamburger izbornik mora biti realiziran kao <button aria-expanded="false" aria-controls="nav-menu"> s FontAwesome ikonom unutar njega.

&#x09;• Kreirati <main id="main-content">.

&#x09;• U sekciji #home (Hero) postaviti točno jedan <h1> koji prenosi ključnu SEO poruku. Pozadinska slika se povlači iz images/design/ i implementira se kroz CSS s background-size: cover.

2\. Implementacija sekcija (O nama, Usluge, Proces, USP, FAQ):

&#x09;• Svaka sekcija mora koristiti odgovarajući semantički tag <section id="..."> i započeti s <h2>.

&#x09;• U kartice usluga i korake procesa ugraditi FontAwesome ikone (npr. <i class="fas fa-ship" aria-hidden="true"></i>).

&#x09;• SEO FAQ Harmonika: Implementirati sekciju s često postavljanim pitanjima koristeći <details> i <summary> tagove koji su nativno pristupačni. U zaglavlje index.html ubaciti JSON-LD skriptu:html

<script type="application/ld+json">

{

&#x20; "@context": "https://schema.org",

&#x20; "@type": "FAQPage",

&#x20; "mainEntity": \[{

&#x20;   "@type": "Question",

&#x20;   "name": "Što je to 3D skeniranje palube?",

&#x20;   "acceptedAnswer": {

&#x20;     "@type": "Answer",

&#x20;     "text": "Nalaz odgovora izvađen iz jezične datoteke..."

&#x20;   }

&#x20; }]

}

</script>

Use code with caution.

3\. Izrada js/ui-effects.js:

&#x09;• Dodati logiku za hamburger izbornik (kontrola aria-expanded stanja True/False).

&#x09;• Implementirati gumb "Back to top". Osluškivati window.scrollY. Kada vrijednost prijeđe 300px, gumbu se uklanja klasa aria-hidden="true" ili display: none. Omogućiti glatki povratak na vrh pomoću window.scrollTo({ top: 0, behavior: 'smooth' }).



Faza 5: GDPR sukladnost, kontakt forma i pravne stranice



Cilj: Postavljanje tehničkih restrikcija za zaštitu podataka i validaciju korisničkih unosa.

1\. Izrada js/cookie-consent.js:

&#x09;• Kreirati pristupačni privola-banner na dnu stranice (role="dialog" aria-live="polite"). Banner sadrži informacije o kolačićima i gumbe za prihvaćanje i odbijanje.

&#x09;• Ako u localStorage ne postoji potvrda o pristanu, banner se prikazuje i fokus se prebacuje unutar njega (focus trap). Onemogućiti učitavanje analitičkih skripti dok se ne zabilježi eksplicitan pristanak.

2\. Izrada js/contact-form.js:

&#x09;• Presresti submit događaj na kontakt formi.

&#x09;• Izvršiti validaciju: provjeriti ispravnost e-mail adrese pomoću regularnih izraza (Regex) i obvezno provjeriti stanje checkbox elementa koji potvrđuje privolu na pravila privatnosti.

&#x09;• Sanitizirati sve tekstualne unose kako bi se spriječio Cross-Site Scripting (XSS). Ako validacija ne prođe, fokusirati prvo neispravno polje i dinamički prikazati poruku o pogrešci s atributom aria-invalid="true".

3\. Izrada pravnih dokumenata:

&#x09;• Generirati jednostavne, čiste, visokokontrastne HTML stranice privacy-policy.html, accessability-statement.html i terms.html prateći točnu tipografsku strukturu (Montserrat font, puna semantika).

