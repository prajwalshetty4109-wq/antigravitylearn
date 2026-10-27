import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wnyyjswrwfhoosrovdfm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    (supabaseAnonKey || supabaseServiceKey) &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
);

// Client-side / public client
let publicClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey;

  if (!url || !key) return null;

  try {
    return createClient(url, key, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (error) {
    console.warn('[MediFlow] Supabase initialization failed:', error);
    return null;
  }
}

if (isSupabaseConfigured) {
  publicClient = getSupabaseClient();
}

export const supabase = publicClient;
