import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createServerClient(url, key, {
    cookies: {
      get: async (name: string) => (await cookies()).get(name)?.value,
      set: () => {},
      remove: () => {},
    },
  });
}

export function getSupabaseAnon() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createServerClient(url, key, {
    cookies: {
      get: async (name: string) => (await cookies()).get(name)?.value,
      set: () => {},
      remove: () => {},
    },
  });
}

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createServerClient(url, key, {
    cookies: {
      get: async (name: string) => (await cookies()).get(name)?.value,
      set: () => {},
      remove: () => {},
    },
  });
}
