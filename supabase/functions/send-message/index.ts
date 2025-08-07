// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })

  const appKey = req.headers.get('x-api-key')
  if (!appKey || appKey !== Deno.env.get('APP_API_KEY')) return new Response('unauthorized', { status: 401 })

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const WA_TOKEN = Deno.env.get('WA_TOKEN')!
  const PHONE_ID = Deno.env.get('WA_PHONE_NUMBER_ID')!

  const sb = createClient(SUPABASE_URL, SERVICE_KEY)
  const body = await req.json()
  const { conversationId, type, text } = body as { conversationId: string, type: string, text?: string }

  // get destination wa_id from conversation
  const { data: conv } = await sb
    .from('conversations')
    .select('id, contact:contacts(wa_id)')
    .eq('id', conversationId)
    .single()

  if (!conv?.contact?.wa_id) return new Response(JSON.stringify({ error: 'conversation not found' }), { status: 400 })

  const to = conv.contact.wa_id as string

  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type
  }
  if (type === 'text') {
    payload.text = { preview_url: true, body: text ?? '' }
  }

  const res = await fetch(`https://graph.facebook.com/v23.0/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WA_TOKEN}`
    },
    body: JSON.stringify(payload)
  })
  const json = await res.json().catch(()=>({}))
  if (!res.ok) return new Response(JSON.stringify(json), { status: res.status })

  const waMessageId = json.messages?.[0]?.id ?? null

  await sb.from('messages').insert({
    conversation_id: conversationId,
    direction: 'out',
    type,
    wa_message_id: waMessageId,
    content_text: type==='text'? (text ?? '') : null,
    status: 'sent'
  })

  return new Response(JSON.stringify({ ok: true, id: waMessageId }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}) 