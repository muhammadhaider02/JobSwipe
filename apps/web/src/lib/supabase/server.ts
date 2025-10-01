import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

export function createServerClient(): SupabaseClient {
  if (serverClient) return serverClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // keep public key only

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing Supabase environment variables.
      URL: ${supabaseUrl ? 'Found' : 'Missing'}
      Key: ${supabaseKey ? 'Found' : 'Missing'}`,
    );
  }

  serverClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
  return serverClient;
}

export { createServerClient as createClient };
