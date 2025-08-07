"use client"
import { useState } from 'react'
import { useSWRConfig } from 'swr'

export default function Composer({ conversationId }: { conversationId?: string }) {
  const [text, setText] = useState('')
  const disabled = !conversationId
  const { mutate } = useSWRConfig()

  const send = async () => {
    if (!text.trim() || !conversationId) return

    // Optimistic append
    const key = `messages:${conversationId}`
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId,
      conversation_id: conversationId,
      direction: 'out' as const,
      type: 'text',
      content_text: text,
      created_at: new Date().toISOString(),
    }
    mutate(key, (prev: any) => ([...(prev ?? []), optimistic]), false)

    // Send via Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, type: 'text', text })
      })

      if (!res.ok) throw new Error('send failed')

      // Remove optimistic and revalidate
      mutate(key, (prev: any) => (prev ?? []).filter((m: any) => m.id !== tempId), false)
      mutate(key)
      window.dispatchEvent(new CustomEvent('message:sent', { detail: { conversationId } }))
    } catch (_) {
      // Rollback optimistic and notify
      mutate(key, (prev: any) => (prev ?? []).filter((m: any) => m.id !== tempId), false)
      alert('No se pudo enviar el mensaje. Inténtalo de nuevo.')
    } finally {
      setText('')
    }
  }

  return (
    <div className="h-16 border-t border-gray-200 dark:border-gray-800 px-4 flex items-center gap-2">
      <input
        value={text}
        onChange={e=>setText(e.target.value)}
        onKeyDown={(e)=>{ if(e.key==='Enter'){ send() } }}
        placeholder={disabled? 'Selecciona una conversación':'Escribe un mensaje...'}
        className="flex-1 bg-transparent outline-none"
        disabled={disabled}
      />
      <button onClick={send} disabled={disabled} className="px-3 py-2 rounded-md bg-brand text-white disabled:opacity-40">Enviar</button>
    </div>
  )
} 