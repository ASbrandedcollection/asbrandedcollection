import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Browser / Client Components ──────────────
// Uses anon key. Respects RLS policies.
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ── Server / API Routes ───────────────────────
// Uses service role key. Bypasses RLS.
// Called as a function so it only runs server-side, never on client.
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
