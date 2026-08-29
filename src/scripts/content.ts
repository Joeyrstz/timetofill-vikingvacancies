/** Beschriftungen und Hilfetexte des Rechners — geteilt von SSR und Client. */

export const IMPACT_LABELS = ["Unterstützend", "Spürbar", "Tragend", "Geschäftskritisch"] as const;

export const IMPACT_HINTS = [
  "Zuarbeitende Rolle. Das Team liefert auch ohne sie weiter, nur langsamer.",
  "Senior-Rolle mit klarem Beitrag zu Produkt oder Roadmap, aber ohne Ergebnisverantwortung.",
  "Die Rolle trägt ein Produkt, eine Plattform oder ein Kernsystem. Ohne sie stockt eine ganze Linie.",
  "Direkter, messbarer Einfluss auf Umsatz, Time-to-Market oder Ausfallsicherheit.",
] as const;

export const CRITICALITY_LABELS = ["Planbar", "Spürbar", "Ernst", "Akut"] as const;

export const CRITICALITY_HINTS = [
  "Aufgaben lassen sich verschieben. Es tut weh, aber nichts brennt.",
  "Verzögert laufende Projekte, aber kein akuter Notstand.",
  "Roadmap-Termine wackeln, Zusagen an Kunden geraten unter Druck.",
  "Wissensmonopol oder Single Point of Failure. Der Betrieb hängt an dieser Stelle.",
] as const;

export const FOLLOWUP_LABELS = ["Gering", "Mittel", "Erhöht", "Kritisch"] as const;

export const FOLLOWUP_HINTS = [
  "Das Team fängt die Lücke ohne spürbare Belastung auf.",
  "Team trägt die Last mit, einzelne Überstunden, aber kein akutes Risiko.",
  "Dauerhafte Überlast, sinkende Qualität, erste Abwanderungssignale im Team.",
  "Konkretes Kündigungsrisiko bei Leistungsträgern. Aus einer Vakanz werden zwei.",
] as const;

/**
 * Richtwerte für Bruttojahresgehälter, Senior-Level (5+ Jahre), Vollzeit,
 * Region NRW (Köln, Düsseldorf, Bonn). Bandbreiten, keine Zusicherung —
 * Branche, Unternehmensgröße und Tech-Stack verschieben die Spanne deutlich.
 */
export const SALARY_BENCHMARKS: readonly { role: string; from: number; to: number }[] = [
  { role: "PHP-/Laravel-/Symfony-Entwickler", from: 65000, to: 85000 },
  { role: "JavaScript-/TypeScript-Entwickler", from: 68000, to: 88000 },
  { role: "Frontend-Entwickler (React, Vue)", from: 65000, to: 85000 },
  { role: "Fullstack-Entwickler", from: 70000, to: 90000 },
  { role: "Shopware-/E-Commerce-Entwickler", from: 60000, to: 80000 },
  { role: "Software-Architekt", from: 85000, to: 115000 },
  { role: "DevOps-/Platform-Engineer", from: 75000, to: 100000 },
  { role: "Data Engineer", from: 75000, to: 100000 },
  { role: "IT-Security-Engineer", from: 75000, to: 100000 },
  { role: "QA-/Test-Engineer", from: 55000, to: 75000 },
  { role: "Product Owner (Tech)", from: 70000, to: 95000 },
  { role: "Engineering Manager / Teamlead", from: 90000, to: 120000 },
] as const;

export const FAQ: readonly { q: string; a: string }[] = [
  {
    q: "Warum rechnet ihr mit dem 1,8- bis 3-fachen der Personalkosten?",
    a: "Weil eine Stelle mehr erwirtschaften muss, als sie kostet — sonst gäbe es sie nicht. Die Cost-of-Vacancy-Forschung (Sullivan-Formel) setzt für Standardrollen den Faktor 1,8 bis 2,2 auf die Gesamtpersonalkosten an, für Rollen mit direktem Produkt- oder Umsatzeinfluss höher. Wer den eigenen Wertbeitrag genauer kennt, überschreibt den Vorschlag einfach mit dem Regler darunter.",
  },
  {
    q: "Ist der Vergleich nicht zu deinen Gunsten gerechnet?",
    a: "An den entscheidenden Stellen rechnet das Modell gegen mich. Die Einarbeitung des neuen Mitarbeiters belastet nur das Agentur-Szenario, obwohl sie in Eigenregie genauso anfällt — nur später. Der interne Recruiting-Aufwand sinkt mit Agentur nur auf 40 %, nicht auf null. Und das Honorar steht mit dem vollen Prozentsatz in der Rechnung, ohne Ratenlogik und ohne Abzinsung. Fällt das Ergebnis trotzdem negativ aus, zeigt der Rechner genau das an, statt die Zahl zu schönen.",
  },
  {
    q: "Wie schnell liefere ich erste Profile?",
    a: "Durch die Spezialisierung auf PHP- und JavaScript-/TypeScript-Experten in NRW kann ich passende Profile manchmal sofort vorstellen. Bei sehr speziellen Anforderungen liefere ich erste passgenaue Kandidaten in der Regel spätestens nach 7 Tagen.",
  },
  {
    q: "Was passiert, wenn die Besetzung nicht hält?",
    a: "Beim Modell „Sorgenfrei“ zahlt ihr die Raten nur, solange der Kandidat zum jeweiligen Zeitpunkt noch im Unternehmen ist: 50 % bei Vermittlung, 30 % beim Start, 20 % zur Mitte der Probezeit. Dazu kommt Post-Placement-Care — ich bleibe die gesamte Probezeit mit euch und dem neuen Mitarbeiter im Austausch.",
  },
  {
    q: "Rechnet der Rechner mit Teilzeit?",
    a: "Nein. Alle Werte gehen von einer Vollzeitstelle mit 20 Arbeitstagen je Monat aus. Für Teilzeit rechnet ihr Gehalt und Wertschöpfung anteilig herunter.",
  },
] as const;

export const TRUST_POINTS: readonly string[] = [
  "9 Jahre Erfahrung im IT-Recruiting, spezialisiert auf PHP und JavaScript/TypeScript.",
  "Filterung der Top 5 %: fachlich und kulturell geprüft, kein CV-Forwarding.",
  "Erste passgenaue Profile in der Regel innerhalb von 7 Tagen.",
  "Aus der Region, für die Region — NRW mit Fokus auf Köln, Düsseldorf und Bonn.",
  "Persönliche Betreuung statt Account-Rotation. Kein Massenversand, keine Datenbank-Bombardierung.",
  "Post-Placement-Care über die gesamte Probezeit — für euch und den neuen Mitarbeiter.",
  "100 % deutscher Datenschutz, deutsches CRM auf deutschen Servern. Kein KI-Training mit euren Daten.",
] as const;
