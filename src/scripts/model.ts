/**
 * Time-to-Fill-Rechner — Rechenmodell für FESTANSTELLUNGEN.
 *
 * Anders als Interims-/Freelancer-Rechner vergleicht dieses Modell nicht
 * "Vakanz vs. Freelancer", sondern zwei Besetzungs-Szenarien derselben
 * unbefristeten Stelle über denselben Zeithorizont:
 *
 *   Szenario A "Kurs halten"      — Suche in Eigenregie, Time-to-Fill = monthsSelf
 *   Szenario B "Kurs korrigieren" — Besetzung über VikingVacancies, Time-to-Fill = monthsAgency
 *
 * Beide Szenarien werden als *Fehlbetrag gegenüber einer dauerhaft besetzten
 * Stelle* gemessen. Dadurch ist der Vergleich sauber: gleiche Basis, gleicher
 * Horizont, keine Doppelzählung.
 */

/** Arbeitgeberanteil / Lohnnebenkosten auf das Bruttojahresgehalt. */
export const EMPLOYER_COST_FACTOR = 1.3;

/** Arbeitstage je Monat (Vollzeit, abzüglich Urlaub/Feiertage gerundet). */
export const WORKDAYS_PER_MONTH = 20;

/**
 * Wertschöpfungs-Multiplikator nach der Sullivan-Formel (Cost-of-Vacancy-
 * Forschung, San Francisco State University): marktüblich 1,8–2,2 für
 * Standardrollen, höher bei direktem Produkt-/Umsatzeinfluss. Werte über 3,0
 * gelten in der Literatur nur für Führungsrollen mit belegbarem Wertbeitrag.
 */
export const IMPACT_FACTORS = [1.8, 2.2, 2.6, 3.0] as const;

/** Anteil der Wertschöpfung, der bei unbesetzter Stelle tatsächlich verloren geht. */
export const CRITICALITY_FACTORS = [0.5, 0.7, 0.85, 1.0] as const;

/**
 * Folgekosten im bestehenden Team als Anteil des Jahresbruttogehalts —
 * Risiko-Proxy für Überstunden, Qualitätsverlust und Fluktuation. Der oberste
 * Wert orientiert sich an den realen Kosten einer Kündigung im Team
 * (Neubesetzung, Onboarding, Produktivitätsdelle der Nachfolge).
 */
export const FOLLOWUP_FACTORS = [0.03, 0.1, 0.2, 0.5] as const;

/**
 * Einarbeitungskurve einer FESTANSTELLUNG, je Beschäftigungsmonat.
 * Deutlich flacher als bei einem Interimseinsatz: ein neuer Festangestellter
 * übernimmt Verantwortung, Domänenwissen und Systemkontext erst schrittweise.
 * Monat 1: 25 % · 2: 45 % · 3: 65 % · 4: 80 % · 5: 90 % · ab 6: 100 %.
 */
export const RAMP_BY_MONTH = [0.25, 0.45, 0.65, 0.8, 0.9, 1.0] as const;

/**
 * Anteil des internen Recruiting-Aufwands, der bei Zusammenarbeit mit einer
 * spezialisierten Agentur bestehen bleibt. Sourcing, Vorauswahl und
 * Terminkoordination entfallen intern; Fach- und Kulturinterviews bleiben beim
 * Team. Bewusst konservativ angesetzt (40 %, nicht 0 %).
 */
export const INTERNAL_EFFORT_WITH_AGENCY = 0.4;

export interface FeeModel {
  id: "prioritaet" | "klassik" | "sorgenfrei";
  name: string;
  percent: number;
  tagline: string;
  detail: string;
}

/** Honorarmodelle exakt wie auf viking-vacancies.de/unternehmen ausgewiesen. */
export const FEE_MODELS: readonly FeeModel[] = [
  {
    id: "prioritaet",
    name: "Priorität",
    percent: 0.3,
    tagline: "Der schnelle Kurs",
    detail: "30 % Anzahlung bei Auftragserteilung, 70 % bei erfolgreicher Vermittlung.",
  },
  {
    id: "klassik",
    name: "Klassik",
    percent: 0.32,
    tagline: "Die gewohnte Expedition",
    detail: "Eine Zahlung — 100 % bei erfolgreicher Vermittlung.",
  },
  {
    id: "sorgenfrei",
    name: "Sorgenfrei",
    percent: 0.35,
    tagline: "Der sichere Hafen",
    detail:
      "50 % bei Vermittlung, 30 % beim Start, 20 % zur Mitte der Probezeit — Raten nur, solange der Kandidat an Bord ist.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Hilfsfunktionen                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Gestufte Zeitskalierung: startet in Monat 1–2 bei `startScale`, steigt danach
 * linear und erreicht ab Monat 6 die volle Höhe. Rationale: eine kurze Vakanz
 * federt das Team noch ab, eine lange nicht mehr.
 */
export function durationScale(months: number, startScale: number): number {
  if (months <= 2) return startScale;
  if (months <= 5) return startScale + (months - 2) * ((1 - startScale) / 4);
  return 1;
}

/** Kritikalität startet nicht bei 0 — auch eine kurze Vakanz tut bereits weh. */
export const criticalityDurationScale = (months: number) => durationScale(months, 0.4);

/** Folgekosten starten sehr niedrig — ein Monat Engpass kündigt selten jemand. */
export const followupDurationScale = (months: number) => durationScale(months, 0.2);

/** Produktivitätsanteil an Arbeitstag `day` (1-basiert) nach Eintritt. */
export function rampAtDay(day: number): number {
  const monthIndex = Math.ceil(day / WORKDAYS_PER_MONTH);
  return RAMP_BY_MONTH[Math.min(monthIndex, RAMP_BY_MONTH.length) - 1];
}

/**
 * Aufsummierter Produktivitäts-Fehlbetrag über `days` Arbeitstage nach Eintritt,
 * ausgedrückt in "verlorenen Volltagen". Numerisch summiert statt geschlossener
 * Formel — bleibt nachvollziehbar und exakt.
 */
export function rampShortfallDays(days: number): number {
  let sum = 0;
  for (let d = 1; d <= days; d++) sum += 1 - rampAtDay(d);
  return sum;
}

/** Schrittweite des Wertschöpfungs-Reglers — der Vorschlag muss darauf liegen,
 *  sonst rastet der Browser ihn ein und SSR- und Client-Wert driften auseinander. */
export const VALUE_STEP = 500;

/**
 * Vorgeschlagene Monatswertschöpfung nach Sullivan-Formel, gerundet auf die
 * Reglerschrittweite. Eine Schätzung auf 500 € genau ist ohnehin ehrlicher als
 * eine auf den Euro.
 */
export function suggestedMonthlyValue(salary: number, impactFactor: number): number {
  const raw = (salary * EMPLOYER_COST_FACTOR * impactFactor) / 12;
  return Math.round(raw / VALUE_STEP) * VALUE_STEP;
}

/* -------------------------------------------------------------------------- */
/* Modell                                                                      */
/* -------------------------------------------------------------------------- */

export interface CalculatorInput {
  /** Bruttojahresgehalt der offenen Position in €. */
  salary: number;
  /** Index 0–3 in IMPACT_FACTORS. */
  impactIndex: number;
  /** Wertschöpfung der Position pro Monat in € (vorgeschlagen, überschreibbar). */
  monthlyValue: number;
  /** Index 0–3 in CRITICALITY_FACTORS. */
  criticalityIndex: number;
  /** Index 0–3 in FOLLOWUP_FACTORS. */
  followupIndex: number;
  /** Time-to-Fill in Eigenregie, in Monaten. */
  monthsSelf: number;
  /** Time-to-Fill mit VikingVacancies, in Monaten. */
  monthsAgency: number;
  /** Interner Recruiting-Aufwand in Personentagen je Suchmonat. */
  internalDaysPerMonth: number;
  /** Index in FEE_MODELS. */
  feeIndex: number;
}

export interface ScenarioResult {
  /** Verlorene Wertschöpfung, solange die Stelle unbesetzt ist. */
  vacancyLoss: number;
  /** Fehlbetrag während der Einarbeitung des neuen Mitarbeiters. */
  rampLoss: number;
  /** Folgekosten-Risiko im bestehenden Team. */
  followupCost: number;
  /** Interner Recruiting-Aufwand (Zeit von Hiring Manager und Team). */
  internalCost: number;
  /** Vermittlungshonorar. */
  fee: number;
  /** Summe aller Positionen. */
  total: number;
}

export interface CalculatorResult {
  /** Wertschöpfung der Position pro Arbeitstag, ungewichtet. */
  dailyValue: number;
  /** Wertschöpfung pro Tag, gewichtet mit Kritikalität × Dauer (Szenario A). */
  weightedDailyValue: number;
  /** Arbeitstage, die die Stelle in Eigenregie offen bliebe. */
  vacantDaysSelf: number;
  /** Vergleichshorizont in Arbeitstagen (= Time-to-Fill in Eigenregie). */
  horizonDays: number;
  /** Eingesparte Vakanzmonate. */
  monthsSaved: number;
  self: ScenarioResult;
  agency: ScenarioResult;
  /** Honorar in € (absolut). */
  fee: number;
  /** Vorteil der schnelleren Besetzung: self.total − agency.total. */
  advantage: number;
  /** Rückfluss je investiertem Honorar-Euro. */
  returnPerFeeEuro: number;
  /**
   * Arbeitstage frühere Besetzung, die das Honorar rechnerisch decken.
   * Basis: gewichtete Tageswertschöpfung des Eigenregie-Szenarios.
   */
  breakEvenDays: number;
  /** true, wenn der Vergleich fachlich trägt (Agentur ist schneller). */
  isComparable: boolean;
}

const empty = (): ScenarioResult => ({
  vacancyLoss: 0,
  rampLoss: 0,
  followupCost: 0,
  internalCost: 0,
  fee: 0,
  total: 0,
});

const sum = (s: ScenarioResult): ScenarioResult => ({
  ...s,
  total: s.vacancyLoss + s.rampLoss + s.followupCost + s.internalCost + s.fee,
});

export function calculate(input: CalculatorInput): CalculatorResult {
  const {
    salary,
    impactIndex,
    monthlyValue,
    criticalityIndex,
    followupIndex,
    monthsSelf,
    internalDaysPerMonth,
    feeIndex,
  } = input;

  // Die Agentur kann nicht langsamer sein als die Eigenregie — sonst gibt es
  // nichts zu vergleichen. Wir kappen bei monthsSelf.
  const monthsAgency = Math.min(input.monthsAgency, monthsSelf);

  const dailyValue = monthlyValue / WORKDAYS_PER_MONTH;

  // Gemeinsamer Horizont: der Zeitraum, den die Eigenregie-Suche ohnehin
  // gebraucht hätte. Was danach passiert, ist in beiden Szenarien identisch.
  const horizonDays = monthsSelf * WORKDAYS_PER_MONTH;
  const vacantDaysSelf = horizonDays;
  const vacantDaysAgency = monthsAgency * WORKDAYS_PER_MONTH;
  const employedDaysAgency = horizonDays - vacantDaysAgency;

  const criticality = CRITICALITY_FACTORS[criticalityIndex];
  const followup = FOLLOWUP_FACTORS[followupIndex];
  const feeModel = FEE_MODELS[feeIndex];

  // --- Szenario A: Kurs halten (Eigenregie) --------------------------------
  const weightedDailyValue = dailyValue * criticality * criticalityDurationScale(monthsSelf);

  const self = sum({
    ...empty(),
    vacancyLoss: weightedDailyValue * vacantDaysSelf,
    followupCost: salary * followup * followupDurationScale(monthsSelf),
    internalCost: internalDaysPerMonth * monthsSelf * dailyValue,
  });

  // --- Szenario B: Kurs korrigieren (VikingVacancies) ----------------------
  const weightedDailyValueAgency =
    dailyValue * criticality * criticalityDurationScale(monthsAgency);

  // Der Einarbeitungs-Fehlbetrag wird mit derselben Kritikalität gewichtet wie
  // die Vakanz — beides ist "Wertschöpfung, die nicht ankommt", und nur der
  // kritische Anteil davon tut dem Unternehmen tatsächlich weh. OHNE die
  // Dauer-Eskalation allerdings: die greift nur, solange der Stuhl leer ist.
  // Ein einarbeitender Mitarbeiter wird von Woche zu Woche besser, nicht
  // schlimmer.
  const fee = salary * feeModel.percent;

  const agency = sum({
    ...empty(),
    vacancyLoss: weightedDailyValueAgency * vacantDaysAgency,
    rampLoss: dailyValue * criticality * rampShortfallDays(employedDaysAgency),
    followupCost: salary * followup * followupDurationScale(monthsAgency),
    internalCost:
      internalDaysPerMonth * INTERNAL_EFFORT_WITH_AGENCY * monthsAgency * dailyValue,
    fee,
  });

  const advantage = self.total - agency.total;

  return {
    dailyValue,
    weightedDailyValue,
    vacantDaysSelf,
    horizonDays,
    monthsSaved: monthsSelf - monthsAgency,
    self,
    agency,
    fee,
    advantage,
    returnPerFeeEuro: fee > 0 ? advantage / fee : 0,
    breakEvenDays: weightedDailyValue > 0 ? fee / weightedDailyValue : Infinity,
    isComparable: monthsAgency < monthsSelf,
  };
}

/* -------------------------------------------------------------------------- */
/* Formatierung                                                                */
/* -------------------------------------------------------------------------- */

const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export const euro = (n: number) => `${nf.format(Math.round(n))} €`;
export const plain = (n: number) => nf.format(Math.round(n));
export const months = (n: number) => `${n} ${n === 1 ? "Monat" : "Monate"}`;
export const days = (n: number) => `${nf.format(Math.round(n))} ${Math.round(n) === 1 ? "Tag" : "Tage"}`;
/** Dativform für Konstruktionen wie „nach 38 Tagen“. */
export const daysDative = (n: number) =>
  `${nf.format(Math.round(n))} ${Math.round(n) === 1 ? "Tag" : "Tagen"}`;
