import Link from "next/link";
import { SearchX } from "lucide-react";

export default function Introuvable() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <SearchX className="h-7 w-7" />
      </span>
      <h1 className="mt-4 text-xl font-bold">Page introuvable</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cette page n&apos;existe pas, ou elle ne vous est pas accessible.</p>
      <Link href="/projets" className="mt-6 text-sm font-semibold text-primary hover:underline">
        Retour aux projets
      </Link>
    </div>
  );
}
