import { createBrowserClient } from "@supabase/ssr"

// Tarayıcı tarafı için singleton Supabase istemcisi
let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseBrowser = () => {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseBrowserClient
}
