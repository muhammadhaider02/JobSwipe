import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // removed SUPABASE_ANON_KEY fallback

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing Supabase environment variables.
      URL: ${supabaseUrl ? 'Found' : 'Missing'}
      Key: ${supabaseKey ? 'Found' : 'Missing'}`,
    );
  }

  client = createSupabaseClient(supabaseUrl, supabaseKey);
  return client;
}
