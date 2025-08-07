import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseClient'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const sb = supabaseService()
  const { data, error } = await sb.from('conversations').select('id, auto_reply_enabled').eq('id', params.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = supabaseService()
  const payload = await req.json()
  const { data, error } = await sb.from('conversations').update({ auto_reply_enabled: payload.auto_reply_enabled }).eq('id', params.id).select('id, auto_reply_enabled').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
} 