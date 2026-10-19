import type { MetadataRoute } from "next";

// Installable sur le téléphone du chef de chantier comme une application.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nourane Génie Civil — coûts de construction",
    short_name: "Nourane GC",
    description: "Suivi des dépenses et du budget des chantiers de construction",
    start_url: "/projets",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#db2777",
    lang: "fr",
    icons: [
      { src: "/embleme-192.png", sizes: "192x192", type: "image/png" },
      { src: "/embleme-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
