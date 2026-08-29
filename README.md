# Time-to-Fill-Rechner — VikingVacancies

Ein Vakanzkosten-Rechner für **Festanstellungen** im Tech-Recruiting, in Design,
Sprache und Marke von [viking-vacancies.de](https://www.viking-vacancies.de/).

Konzeptioneller Ausgangspunkt war der [Time-to-Fill-Rechner von Agile Get
Together](https://agile-gt.com/time-to-fill-rechner/). Dessen Cost-of-Vacancy-Teil
(Sullivan-Formel, Kritikalität, Folgekosten, Dauer-Eskalation) ist fachlich
übernommen; die zweite Hälfte — dort ein Freelancer-Vergleich mit Tagessatz und
Anlaufkurve — wurde vollständig ersetzt, weil VikingVacancies ausschließlich
dauerhaft vermittelt.

## Das Rechenmodell

Verglichen werden zwei Besetzungswege für **dieselbe unbefristete Stelle** über
**denselben Zeithorizont** (= die Time-to-Fill in Eigenregie). Beide Szenarien
werden als Fehlbetrag gegenüber einer dauerhaft besetzten Stelle gemessen —
gleiche Basis, gleiches Fenster, keine Doppelzählung.

| Posten | Kurs halten (Eigenregie) | Kurs korrigieren (VikingVacancies) |
| --- | --- | --- |
| Verlorene Wertschöpfung | volle Laufzeit | nur bis zur Besetzung |
| Einarbeitungs-Fehlbetrag | — (fällt erst nach dem Fenster an) | volle 6-Monats-Kurve |
| Folgekosten im Team | nach Dauer skaliert | nach kürzerer Dauer skaliert |
| Interner Recruiting-Aufwand | 100 % | 40 % |
| Vermittlungshonorar | — | 30 / 32 / 35 % vom Jahresbrutto |

Das Modell rechnet an drei Stellen bewusst **gegen** die schnelle Besetzung:
die Einarbeitung belastet nur das Agentur-Szenario (obwohl sie in Eigenregie
ebenso anfällt, nur später), der interne Aufwand sinkt nur auf 40 % statt auf
null, und das Honorar steht ohne Ratenlogik und ohne Abzinsung in der Rechnung.
Fällt das Ergebnis negativ aus — kurze Time-to-Fill, geringe Kritikalität —,
zeigt der Rechner genau das an.

Alle Konstanten und ihre Herleitung stehen kommentiert in
[`src/scripts/model.ts`](src/scripts/model.ts) und für Besucher lesbar im
Abschnitt „Anmerkungen zur Berechnung“.

## Struktur

```
src/
├── layouts/Base.astro          HTML-Gerüst, Schriften, Meta/OG
├── components/
│   ├── Calculator.astro        Rechner: Markup, SSR-Vorbelegung, Client-Skript
│   ├── Slider.astro            Wiederverwendbarer Regler
│   ├── Contour.astro           Höhenlinien-Motiv (<use> auf ContourDefs)
│   └── ContourDefs.astro       SVG-<symbol>, einmal pro Seite
├── scripts/
│   ├── model.ts                Rechenmodell, reine Funktionen
│   └── content.ts              Beschriftungen, Gehaltsrichtwerte, FAQ
└── styles/global.css           Design-Tokens der Marke
```

`model.ts` und `content.ts` werden von SSR *und* Client importiert — die Seite
zeigt ohne JavaScript dieselbe vollständige Rechnung wie mit.

## Marken-Tokens

Aus viking-vacancies.de übernommen: Crimson Text (Display) + Inter (UI),
Bernstein `#e69811` auf Tiefsee-Navy `#212a36`, Pill-Buttons, Kicker mit
vorangestelltem Strich, Höhenlinien als Sektionsmotiv.

## Entwicklung

```
astro dev --background     # Start (Verwaltung: astro dev status | logs | stop)
npm run build              # statischer Build nach dist/
npm run preview            # gebauten Stand aus dist/ servieren
```

Die Seite läuft lokal unter dem konfigurierten `base`-Pfad, also
`http://localhost:4321/timetofill-vikingvacancies/`.

## Deployment

`.github/workflows/deploy.yml` baut bei jedem Push auf `main` (und auf Zuruf über
*Actions → Deploy to GitHub Pages → Run workflow*) und veröffentlicht `dist/`
über GitHub Pages.

`site` und `base` kommen im CI aus den Outputs von `actions/configure-pages`,
nicht aus fest verdrahteten Werten — das Deployment bleibt damit korrekt, wenn
das Repo umbenannt oder später eine eigene Domain hinterlegt wird. Lokal greifen
die Defaults aus `astro.config.mjs`; überschreiben lassen sie sich jederzeit:

```
SITE=https://www.viking-vacancies.de BASE_PATH=/ npm run build
```

**Einmalige Einrichtung:** unter *Settings → Pages* als *Source* den Eintrag
**GitHub Actions** wählen. GitHub Pages ist für **private** Repositories nur mit
GitHub Pro/Team/Enterprise verfügbar — bei einem kostenlosen Konto muss das Repo
öffentlich sein.
