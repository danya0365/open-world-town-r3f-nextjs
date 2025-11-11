import { createBrowserClient } from "@supabase/ssr";

/**
 * Create Supabase client for client-side usage
 * Used in Client Components and browser-side operations
 */
export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
