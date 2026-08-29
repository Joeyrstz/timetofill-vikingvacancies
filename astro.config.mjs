// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Deployziel: GitHub Pages als Project Site.
 * Die Seite liegt dort unter https://joeyrstz.github.io/timetofill-vikingvacancies/,
 * deshalb `site` = Origin und `base` = Repo-Pfad. Beides lässt sich über
 * Umgebungsvariablen überschreiben — für eine eigene Domain (z. B. später unter
 * viking-vacancies.de) genügt SITE=https://www.viking-vacancies.de BASE_PATH=/
 * ohne Codeänderung.
 */
const site = process.env.SITE ?? 'https://joeyrstz.github.io';
const base = process.env.BASE_PATH ?? '/timetofill-vikingvacancies';

// https://astro.build/config
export default defineConfig({
  site,
  base,
});
