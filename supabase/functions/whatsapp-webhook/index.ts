// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const VERIFY = Deno.env.get('WA_VERIFY_TOKEN');
    if (mode === 'subscribe' && token && VERIFY && token === VERIFY && challenge) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('forbidden', { status: 403 });
  }

  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  const WA_TOKEN = Deno.env.get('WA_TOKEN');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const APP_API_KEY = Deno.env.get('APP_API_KEY');

  if (!WA_TOKEN || !SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing envs');
    return new Response('ok', { status: 200 });
  }

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  const body = await req.json().catch(() => ({}));
  try {
    const entries = body.entry ?? [];
    for (const entry of entries) {
      const changes = entry.changes ?? [];
      for (const change of changes) {
        const value = change.value ?? {};
        const messages = value.messages ?? [];
        const contacts = value.contacts ?? [];

        for (const msg of messages) {
          const fromWaId = msg.from as string;
          const contactInfo = contacts.find((c: any) => c.wa_id === fromWaId);

          const { data: upsertedContact, error: contactErr } = await sb
            .from('contacts')
            .upsert({ wa_id: fromWaId, name: contactInfo?.profile?.name ?? null }, { onConflict: 'wa_id' })
            .select()
            .single();
          if (contactErr) console.error(contactErr);

          // find or create conversation
          let conversationId: string | null = null;
          {
            const { data: conv, error: convErr } = await sb
              .from('conversations')
              .select('id, auto_reply_enabled')
              .eq('contact_id', upsertedContact.id)
              .limit(1)
              .single();
            if (!conv || convErr) {
              const ins = await sb
                .from('conversations')
                .insert({ contact_id: upsertedContact.id })
                .select('id, auto_reply_enabled')
                .single();
              if (ins.error) console.error(ins.error);
              conversationId = ins.data?.id ?? null;
            } else {
              conversationId = conv.id;
            }
          }
          if (!conversationId) continue;

          const baseMessage = {
            conversation_id: conversationId,
            direction: 'in',
            type: msg.type as string,
            wa_message_id: msg.id as string,
            content_text: msg.text?.body ?? null,
            payload: msg,
            status: 'received',
          };
          const { data: insertedMsg, error: msgErr } = await sb
            .from('messages')
            .insert(baseMessage as any)
            .select('id, type')
            .single();
          if (msgErr) console.error(msgErr);

          // handle media
          const mediaLike = ['image','video','audio','document','sticker'];
          if (mediaLike.includes(msg.type)) {
            const media = (msg as any)[msg.type];
            const mediaId = media?.id as string | undefined;
            if (mediaId) {
              try {
                const metaRes = await fetch(`https://graph.facebook.com/v23.0/${mediaId}`, {
                  headers: { Authorization: `Bearer ${WA_TOKEN}` }
                });
                const metaJson = await metaRes.json();
                const url = metaJson.url as string;
                if (url) {
                  const binRes = await fetch(url, { headers: { Authorization: `Bearer ${WA_TOKEN}` } });
                  const arrayBuffer = await binRes.arrayBuffer();
                  const contentType = binRes.headers.get('content-type') ?? 'application/octet-stream';
                  const fileName = `${mediaId}`;

                  const bucket = 'whatsapp-media';
                  const path = `${insertedMsg.id}/${fileName}`;
                  const upload = await sb.storage.from(bucket).upload(path, new Uint8Array(arrayBuffer), { contentType, upsert: true });
                  if (upload.error) console.error(upload.error);

                  await sb.from('attachments').insert({
                    message_id: insertedMsg.id,
                    type: msg.type,
                    storage_path: `${bucket}/${path}`,
                    mime_type: contentType,
                    sha256: metaJson.sha256 ?? null,
                    size_bytes: metaJson.file_size ?? null,
                    file_name: media?.filename ?? null
                  });
                }
              } catch (e) {
                console.error('media-download', e);
              }
            }
          }

          // auto reply
          try {
            const { data: convData } = await sb
              .from('conversations')
              .select('auto_reply_enabled')
              .eq('id', conversationId)
              .single();
            if (convData?.auto_reply_enabled && APP_API_KEY) {
              const aiRes = await fetch(`${SUPABASE_URL}/functions/v1/ai-agent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': APP_API_KEY },
                body: JSON.stringify({ conversationId })
              });
              if (!aiRes.ok) console.error('ai-agent failed');
            }
          } catch (e) {
            console.error('ai-agent error', e);
          }
        }
      }
    }
  } catch (e) {
    console.error('webhook parse error', e);
  }

  return new Response('ok', { status: 200 });
}); 