import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | undefined

export const supabaseBrowser = (): SupabaseClient => {
  if (browserClient) return browserClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  browserClient = createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: 'femwpai'
    }
  })
  return browserClient
}

let serviceClient: SupabaseClient | undefined
export const supabaseService = (): SupabaseClient => {
  if (serviceClient) return serviceClient
  const url = process.env.SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!
  serviceClient = createClient(url, service)
  return serviceClient
} 