import Link from "next/link";
import { ArrowRight, BarChart3, BellRing, FileSpreadsheet, HardHat, LayoutDashboard, LogIn, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { session } from "@/lib/auth";
import { Logo, LogoComplet, NOM_APPLICATION } from "@/components/app/Logo";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { classeBoutonPrimaire } from "@/components/app/ui";
import { cn } from "@/lib/utils";

const ATOUTS = [
  { icone: Wallet, titre: "Budget ventilé", texte: "Un budget prévisionnel par lot et par poste, révisé par avenants motivés, comparé aux dépenses réelles." },
  { icone: BarChart3, titre: "Analyse statistique", texte: "Répartition, Pareto, dispersion des prix, coût au m² et prévision du coût final par régression." },
  { icone: BellRing, titre: "Alertes", texte: "Budget à 80 % puis dépassé, poste qui dérape, prix inhabituel, fonds insuffisants." },
  { icone: FileSpreadsheet, titre: "Rapports", texte: "Rapport récapitulatif en PDF et export complet en Excel, pour chaque chantier." },
];

const ACTEURS = [
  { icone: ShieldCheck, titre: "Ingénieure", texte: "Crée les projets, fixe les budgets, valide et analyse." },
  { icone: HardHat, titre: "Chef de chantier", texte: "Saisit les dépenses et l'avancement depuis le chantier." },
  { icone: UserRound, titre: "Client", texte: "Suit l'avancement de son projet et ses versements." },
];

export default async function Accueil() {
  const s = await session();
  const cible = s ? "/projets" : "/connexion";
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.14)_0%,transparent_55%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.2)_0%,transparent_55%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2.5 font-bold">
          <Logo taille={36} /> {NOM_APPLICATION}
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href={cible} className={cn("inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold", classeBoutonPrimaire)}>
            {s ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {s ? "Mes projets" : "Connexion"}
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <section className="flex flex-col items-center pb-16 pt-10 text-center">
          <LogoComplet largeur={240} className="shadow-xl shadow-pink-500/10" />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Gestion des coûts de construction</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Chaque franc de votre chantier, <span className="text-primary">suivi et expliqué</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Collectez les dépenses des maisons et des bâtiments, comparez-les au budget en temps réel et anticipez les dépassements avant
            qu&apos;ils n&apos;arrivent.
          </p>
          <Link href={cible} className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold shadow-sm hover:border-primary/50">
            {s ? "Ouvrir mes projets" : "Accéder à l'application"}
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ATOUTS.map((a) => (
            <div key={a.titre} className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                <a.icone className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-semibold">{a.titre}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{a.texte}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="text-center text-xl font-bold">Un espace pour chaque acteur</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {ACTEURS.map((a) => (
              <div key={a.titre} className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4">
                <a.icone className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{a.titre}</p>
                  <p className="text-xs text-muted-foreground">{a.texte}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">Toutes les opérations sont tracées : qui a saisi, validé ou modifié quoi, et quand.</p>
        </section>
      </main>
    </div>
  );
}
