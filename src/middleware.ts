import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Applique le middleware uniquement aux pages de l'espace connecté.
     * Les pages publiques (landing, guide, conseils...) n'ont pas besoin de
     * vérifier la session à chaque requête, ce qui évite un aller-retour
     * réseau inutile vers Supabase et accélère leur affichage.
     */
    "/dashboard/:path*",
  ],
};
