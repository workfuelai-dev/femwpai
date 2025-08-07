import { createClient } from '@supabase/supabase-js'

export const supabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anon)
}

export const supabaseService = () => {
  const url = process.env.SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, service)
} 