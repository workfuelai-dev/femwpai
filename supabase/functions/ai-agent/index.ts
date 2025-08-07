// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  const appKey = req.headers.get('x-api-key')
  if (!appKey || appKey !== Deno.env.get('APP_API_KEY')) return new Response('unauthorized', { status: 401 })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
  const sb = createClient(SUPABASE_URL, SERVICE_KEY)

  const { conversationId } = await req.json()

  // Get last 20 messages for context
  const { data: history } = await sb
    .from('messages')
    .select('direction, type, content_text, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(20)

  const messages = (history ?? []).reverse()
  const system = `Eres un agente de atención al cliente para una inmobiliaria. Responde de forma breve, profesional y útil. Si el usuario pide visitas, precios, disponibilidad o ubicaciones, pide datos concretos y ofrece próximos pasos. Si no tienes la información, indícalo y ofrece tomar datos para que un agente humano contacte. Idioma: español.`

  let reply = 'Gracias por tu mensaje. ¿En qué puedo ayudarte respecto a propiedades, visitas o precios?'

  try {
    if (OPENAI_API_KEY) {
      const content = messages.map(m => `${m.direction === 'in' ? 'Cliente' : 'Agente'}: ${m.content_text ?? `[${m.type}]`}`).join('\n')
      const body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content }
        ],
        temperature: 0.3
      }
      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify(body)
      })
      const aiJson = await aiRes.json()
      reply = aiJson.choices?.[0]?.message?.content ?? reply
    }
  } catch (_) {}

  // Send via local function to centralize
  const appKey = Deno.env.get('APP_API_KEY')!
  await fetch(`${SUPABASE_URL}/functions/v1/send-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': appKey },
    body: JSON.stringify({ conversationId, type: 'text', text: reply })
  })

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}) 