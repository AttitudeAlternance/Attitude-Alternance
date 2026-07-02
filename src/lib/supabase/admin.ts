import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase utilisant la clé "service_role", qui contourne les policies RLS.
 *
 * ⚠️ Ne jamais utiliser côté navigateur ni dans une route accessible par les utilisateurs :
 * réservé exclusivement aux tâches serveur de confiance (ici, la tâche planifiée de rappels
 * de relance, qui a besoin de lire les candidatures de tous les utilisateurs).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
