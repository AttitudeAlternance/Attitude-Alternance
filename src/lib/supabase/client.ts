"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client Supabase utilisé dans les Client Components ("use client").
// Il lit automatiquement la session depuis les cookies du navigateur.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
