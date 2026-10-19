import { prisma } from "./db";
import { filtreProjets, session } from "./auth";
import type { Role } from "./session";

/** Contrôle d'accès d'une route de téléchargement : session, rôle, projet dans le périmètre. */
export async function projetPourExport(idTexte: string, roles: Role[]) {
  const s = await session();
  if (!s || !roles.includes(s.role)) return null;
  const id = Number(idTexte);
  if (!Number.isInteger(id)) return null;
  const projet = await prisma.projet.findFirst({ where: { id, ...filtreProjets(s) }, include: { client: true, chef: true } });
  return projet ? { s, projet } : null;
}

export const refus = () => new Response("Introuvable ou non autorisé", { status: 404 });

/** Nom de fichier sans accents ni espaces. */
export const nomFichier = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-");
