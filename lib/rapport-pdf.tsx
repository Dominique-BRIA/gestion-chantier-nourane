/**
 * Rapport récapitulatif d'un projet au format PDF : budget prévu, dépenses
 * effectuées, solde disponible, répartition des coûts et analyse statistique.
 *
 * Mise en page avec @react-pdf/renderer, police Helvetica intégrée au PDF :
 * elle ne connaît que le jeu de caractères Windows-1252, d'où le nettoyage
 * des espaces fines et des symboles mathématiques par `t()`.
 */
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Analyse } from "./analyse";
import { CATEGORIES, STATUTS_PROJET, TYPES_OUVRAGE } from "./labels";
import { date, fcfa, nombre, pct } from "./format";
import type { StatutProjet, TypeOuvrage } from "@prisma/client";

const ROSE = "#db2777";
const ROSE_PALE = "#fce7f3";
const ENCRE = "#262b33";
const GRIS = "#6b7280";
const FILET = "#f3d5e4";
const BLEU = "#2a78d6";

/** Remplace ce que Helvetica (Windows-1252) ne sait pas afficher. */
export function t(v: unknown): string {
  return String(v ?? "")
    .replace(/[   ]/g, " ")
    .replace(/[−–]/g, "-")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/×/g, "x")
    .replace(/[√Σᵢ]/g, (c) => ({ "√": "racine ", Σ: "somme ", ᵢ: "i" })[c] ?? c)
    .replace(/[“”«»]/g, '"')
    .replace(/→/g, "->");
}

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 48, paddingHorizontal: 36, fontSize: 9, fontFamily: "Helvetica", color: ENCRE },
  entete: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: ROSE, marginBottom: 14 },
  logo: { width: 52, height: 52, marginRight: 10 },
  titre: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  sousTitre: { fontSize: 8.5, color: GRIS, marginTop: 2 },
  section: { marginTop: 14 },
  h2: { fontSize: 11, fontFamily: "Helvetica-Bold", color: ROSE, marginBottom: 6 },
  note: { fontSize: 7.5, color: GRIS, marginTop: 4 },
  grille: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -3 },
  carte: { width: "25%", padding: 3 },
  carteInt: { borderWidth: 1, borderColor: FILET, borderRadius: 6, padding: 7 },
  carteNom: { fontSize: 7.5, color: GRIS },
  carteVal: { fontSize: 10.5, fontFamily: "Helvetica-Bold", marginTop: 2 },
  ligne: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: FILET, paddingVertical: 3.5 },
  enteteTab: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: ENCRE, paddingBottom: 3, marginBottom: 1 },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: GRIS },
  alerte: { borderLeftWidth: 3, paddingLeft: 6, paddingVertical: 3, marginBottom: 5 },
  barreFond: { height: 5, backgroundColor: ROSE_PALE, borderRadius: 3, marginTop: 2 },
  pied: { position: "absolute", bottom: 20, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: GRIS },
});

function Tableau({ colonnes, lignes, droite = [] }: { colonnes: [string, number][]; lignes: (string | React.ReactNode)[][]; droite?: number[] }) {
  return (
    <View>
      <View style={s.enteteTab} fixed>
        {colonnes.map(([nom, largeur], i) => (
          <Text key={nom} style={[s.th, { width: `${largeur}%`, textAlign: droite.includes(i) ? "right" : "left", paddingRight: 4 }]}>
            {t(nom)}
          </Text>
        ))}
      </View>
      {lignes.map((l, i) => (
        <View key={i} style={s.ligne} wrap={false}>
          {l.map((c, j) => (
            <View key={j} style={{ width: `${colonnes[j][1]}%`, paddingRight: 4 }}>
              {typeof c === "string" ? <Text style={{ textAlign: droite.includes(j) ? "right" : "left" }}>{t(c)}</Text> : c}
            </View>
          ))}
        </View>
      ))}
      {!lignes.length && <Text style={s.note}>Aucune donnée.</Text>}
    </View>
  );
}

function Barre({ valeur, couleur = ROSE }: { valeur: number | null; couleur?: string }) {
  const v = valeur != null && Number.isFinite(valeur) ? Math.max(0, Math.min(100, valeur)) : 0;
  return (
    <View style={s.barreFond}>
      <View style={{ width: `${v}%`, height: 5, backgroundColor: (valeur ?? 0) > 100 ? "#d03b3b" : couleur, borderRadius: 3 }} />
    </View>
  );
}

export interface DonneesRapport {
  projet: {
    code: string;
    nom: string;
    type: TypeOuvrage;
    statut: StatutProjet;
    localisation: string;
    surface: number;
    dateDebut: Date;
    dateFinPrevue: Date;
    client: string;
    chef: string;
  };
  auteur: string;
  logo: string;
  a: Analyse;
}

export function RapportProjet({ projet: p, auteur, logo, a }: DonneesRapport) {
  const va = a.valeurAcquise;
  const d = a.descriptives;
  const r = a.regression;
  const periode = a.mensuel.length ? `${a.mensuel[0].mois} à ${a.mensuel[a.mensuel.length - 1].mois}` : "aucune dépense";
  const cartes: [string, string][] = [
    ["Budget initial", fcfa(a.budgetInitial)],
    ["Budget révisé", fcfa(a.budgetRevise)],
    ["Dépenses validées", fcfa(a.reel)],
    ["Solde disponible (budget)", fcfa(a.reste)],
    ["Budget consommé", pct(a.consommation)],
    ["Travaux réalisés", pct(va.avancement)],
    ["CPI (performance des coûts)", va.cpi == null ? "non calculable" : nombre(va.cpi, 2)],
    ["Coût estimé à l'achèvement", va.eac == null ? "non calculable" : fcfa(va.eac)],
    ["Versements du client", fcfa(a.versementsRecus)],
    ["Trésorerie", fcfa(a.tresorerie)],
    ["Coût au m² réel", a.coutM2.reel == null ? "-" : fcfa(a.coutM2.reel)],
    ["Coût au m² budgété", a.coutM2.budget == null ? "-" : fcfa(a.coutM2.budget)],
  ];

  return (
    <Document title={`Rapport ${p.code}`} author={auteur} subject="Rapport récapitulatif des coûts" creator="Nourane Génie Civil">
      <Page size="A4" style={s.page}>
        <View style={s.entete}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={logo} style={s.logo} />
            <View style={{ flex: 1 }}>
              <Text style={s.titre}>{t(`Rapport des coûts - ${p.nom}`)}</Text>
              <Text style={s.sousTitre}>{t(`${p.code} · ${TYPES_OUVRAGE[p.type]} · ${p.localisation} · ${nombre(p.surface, 0)} m² · ${STATUTS_PROJET[p.statut]}`)}</Text>
              <Text style={s.sousTitre}>{t(`Client : ${p.client} · Chef de chantier : ${p.chef} · Du ${date(p.dateDebut)} au ${date(p.dateFinPrevue)}`)}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 8, color: GRIS }}>{t(`Édité le ${date(new Date())}`)}</Text>
            <Text style={{ fontSize: 8, color: GRIS }}>{t(`par ${auteur}`)}</Text>
            <Text style={{ fontSize: 8, color: GRIS }}>{t(`Période : ${periode}`)}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.h2}>1. Synthèse</Text>
          <View style={s.grille}>
            {cartes.map(([nom, val]) => (
              <View key={nom} style={s.carte}>
                <View style={s.carteInt}>
                  <Text style={s.carteNom}>{t(nom)}</Text>
                  <Text style={s.carteVal}>{t(val)}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={s.note}>
            {t("Seules les dépenses validées par l'ingénieure sont comptées. CPI = valeur acquise / coût réel : sous 1, les travaux coûtent plus cher que prévu. Coût estimé à l'achèvement = budget révisé / CPI.")}
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.h2}>{t(`2. Alertes (${a.alertes.length})`)}</Text>
          {a.alertes.length === 0 && <Text>Aucune alerte : tous les indicateurs sont dans leurs seuils.</Text>}
          {a.alertes.map((al, i) => (
            <View key={i} style={[s.alerte, { borderLeftColor: al.niveau === "critique" ? "#d03b3b" : al.niveau === "attention" ? "#f59e0b" : BLEU }]} wrap={false}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{t(al.titre)}</Text>
              <Text>{t(al.detail)}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.h2}>3. Budget et dépenses par catégorie</Text>
          <Tableau
            colonnes={[["Catégorie", 24], ["Budget révisé", 18], ["Dépensé", 18], ["Écart", 16], ["Consommé", 24]]}
            droite={[1, 2, 3]}
            lignes={a.parCategorie.map((x) => [
              CATEGORIES[x.categorie],
              fcfa(x.revise),
              fcfa(x.reel),
              `${x.ecart > 0 ? "+" : ""}${fcfa(x.ecart)}`,
              <View key="b" style={{ paddingLeft: 10 }}>
                <Text>{t(`${pct(x.consommation)} · ${pct(x.part)} du total`)}</Text>
                <Barre valeur={x.consommation} />
              </View>,
            ])}
          />
        </View>

        <View style={s.section}>
          <Text style={s.h2}>4. Budget, dépenses et avancement par lot</Text>
          <Tableau
            colonnes={[["Lot", 26], ["Budget révisé", 17], ["Dépensé", 17], ["Consommé", 20], ["Réalisé", 20]]}
            droite={[1, 2]}
            lignes={a.parLot.map((l) => [
              l.nom,
              fcfa(l.revise),
              fcfa(l.reel),
              <View key="c" style={{ paddingLeft: 10 }}>
                <Text>{t(pct(l.consommation))}</Text>
                <Barre valeur={l.consommation} />
              </View>,
              <View key="r">
                <Text>{t(pct(l.avancement))}</Text>
                <Barre valeur={l.avancement} couleur={BLEU} />
              </View>,
            ])}
          />
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.h2}>5. Dépenses par mois</Text>
          <Tableau
            colonnes={[["Mois", 16], ...Object.values(CATEGORIES).map((c): [string, number] => [c, 14]), ["Total", 14]]}
            droite={[1, 2, 3, 4, 5, 6]}
            lignes={a.mensuel.map((m) => [m.mois, ...Object.keys(CATEGORIES).map((c) => nombre(m.parCategorie[c as keyof typeof m.parCategorie], 0)), nombre(m.total, 0)])}
          />
          <Text style={s.note}>Montants en FCFA.</Text>
        </View>

        <View style={s.section}>
          <Text style={s.h2}>6. Principaux postes de coût (Pareto)</Text>
          <Tableau
            colonnes={[["Rang", 7], ["Article ou libellé", 43], ["Montant", 18], ["Part", 11], ["Cumul", 11], ["Classe", 10]]}
            droite={[2, 3, 4]}
            lignes={a.pareto.slice(0, 12).map((l, i) => [String(i + 1), l.nom, fcfa(l.valeur), pct(l.part), pct(l.partCumulee), l.classe])}
          />
          <Text style={s.note}>{t(`Classe A : articles qui représentent ensemble 80 % du coût total (${a.pareto.filter((l) => l.classe === "A").length} sur ${a.pareto.length}).`)}</Text>
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.h2}>7. Analyse statistique</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 3 }}>Montant des dépenses validées (FCFA)</Text>
          <Tableau
            colonnes={[["n", 8], ["Moyenne", 15], ["Médiane", 15], ["Écart-type", 15], ["Q1 / Q3", 25], ["CV", 9], ["IC 95 %", 13]]}
            lignes={[
              [
                String(d.n),
                fcfa(d.moyenne),
                fcfa(d.mediane),
                fcfa(d.ecartType),
                `${fcfa(d.q1)} / ${fcfa(d.q3)}`,
                pct(d.cv),
                d.ic95 ? `${nombre(d.ic95.bas / 1000, 0)}k - ${nombre(d.ic95.haut / 1000, 0)}k` : "-",
              ],
            ]}
          />
          <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 3 }}>Prévision du coût final par régression linéaire</Text>
          <Text>
            {t(
              r
                ? `Coût cumulé = ${nombre(r.a, 0)} x jour ${r.b >= 0 ? "+" : "-"} ${nombre(Math.abs(r.b), 0)} (R² = ${nombre(r.r2, 3)}, n = ${r.n} jours de dépense). Coût prévu à la fin : ${fcfa(r.coutFinal)}, intervalle de prévision à 95 % de ${fcfa(r.bas)} à ${fcfa(r.haut)}.`
                : "Pas assez de jours de dépense validés pour ajuster une tendance.",
            )}
          </Text>
          <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 3 }}>Prix unitaires des principaux articles</Text>
          <Tableau
            colonnes={[["Article", 34], ["Achats", 9], ["Prix moyen", 16], ["Min - max", 23], ["CV", 9], ["Variation", 9]]}
            droite={[1, 2, 4, 5]}
            lignes={a.prix.slice(0, 8).map((x) => [x.article, String(x.n), fcfa(x.moyenne), `${nombre(x.min, 0)} - ${nombre(x.max, 0)}`, x.cv == null ? "-" : pct(x.cv), x.variation == null ? "-" : pct(x.variation)])}
          />
        </View>

        <View style={s.pied} fixed>
          <Text>{t(`${p.code} · Rapport des coûts · Nourane Génie Civil`)}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
