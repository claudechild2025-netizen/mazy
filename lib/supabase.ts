'use client';

import { createClient } from '@supabase/supabase-js';

/*
  Browser-side Supabase client.

  The 3-day usability test reads/writes anonymously (RLS allows anon insert
  on analytics tables — see supabase/schema.sql). If the env vars are missing
  in dev, we fall back to a stub URL so imports don't crash; analytics will
  silently no-op (see lib/analytics.ts).
*/
// `??` only catches null/undefined — falls through on the empty string the
// .env.local.example ships with. Treat blank values as "no creds yet" too,
// otherwise SSR crashes when createClient validates the URL.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : 'https://stub.supabase.co';
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : 'stub-anon-key';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export const isSupabaseConfigured = url !== 'https://stub.supabase.co';
