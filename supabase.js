// config/supabase.js
//
// Configuration placeholder for Supabase.
// This file does NOT connect to Supabase yet — it only centralises
// the environment variables the Supabase client/service will need
// once it is implemented in a later phase.
//
// Required environment variables (set these in Vercel Project Settings,
// never commit real values):
//   SUPABASE_URL              - Project URL
//   SUPABASE_ANON_KEY         - Public anon key (safe for client-side use)
//   SUPABASE_SERVICE_ROLE_KEY - Service role key (server-side only, NEVER expose)

const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

/**
 * Confirms the required Supabase environment variables are present.
 * Does not throw — callers decide how to handle a missing config
 * (e.g. return a 500 from an API route with a clear message).
 */
function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.serviceRoleKey);
}

module.exports = {
  supabaseConfig,
  isSupabaseConfigured
};
