import type { Analyse } from "./analyse";
import { CATEGORIES, COULEUR_CATEGORIE, LISTE_CATEGORIES } from "./labels";

const JOUR_MS = 86_400_000;

/** Points de la courbe en S : coût cumulé réel et droite de tendance prolongée jusqu'à la fin prévue. */
export function pointsCourbe(a: Analyse, dateDebut: Date) {
  const r = a.regression;
  const points: { date: string; reel?: number | null; tendance?: number | null }[] = a.cumul.map((p) => ({
    date: p.date,
    reel: p.cumul,
    tendance: r ? Math.max(0, r.a * p.jour + r.b) : null,
  }));
  if (r && a.cumul.length && r.jourFin > a.cumul[a.cumul.length - 1].jour) {
    points.push({ date: new Date(dateDebut.getTime() + r.jourFin * JOUR_MS).toISOString().slice(0, 10), reel: null, tendance: r.a * r.jourFin + r.b });
  }
  return points;
}

export function anneauCategories(a: Analyse) {
  return a.parCategorie.filter((c) => c.reel > 0).map((c) => ({ nom: CATEGORIES[c.categorie], valeur: c.reel, couleur: COULEUR_CATEGORIE[c.categorie] }));
}

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export const libelleMois = (m: string) => `${MOIS[Number(m.slice(5, 7)) - 1]} ${m.slice(2, 4)}`;

export function donneesMensuelles(a: Analyse) {
  return a.mensuel.map((m) => ({ mois: libelleMois(m.mois), ...m.parCategorie }));
}

export const seriesCategories = LISTE_CATEGORIES.map((c) => ({ cle: c, nom: CATEGORIES[c], couleur: COULEUR_CATEGORIE[c] }));
