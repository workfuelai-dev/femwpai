"use client"
import useSWR from 'swr'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useEffect, useRef, useState } from 'react'

export type Message = {
  id: string
  conversation_id: string
  direction: 'in'|'out'
  type: string
  content_text: string | null
  created_at: string
  pending?: boolean
}

export default function MessageList({ conversationId }: { conversationId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [stickToBottom, setStickToBottom] = useState(true)

  const fetcher = async () => {
    if (!conversationId) return [] as Message[]
    const sb = supabaseBrowser()
    const { data, error } = await sb
      .from('messages')
      .select('id, conversation_id, direction, type, content_text, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data as Message[]
  }

  const { data, mutate } = useSWR(conversationId ? `messages:${conversationId}` : null, fetcher, { refreshInterval: 2000 })

  useEffect(() => {
    if (!conversationId) return
    const sb = supabaseBrowser()
    const channel = sb.channel(`realtime:messages:${conversationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, () => mutate())
      .subscribe()
    return () => { sb.removeChannel(channel) }
  }, [conversationId])

  useEffect(() => {
    const handler = (e: any) => { if (e?.detail?.conversationId === conversationId) mutate() }
    window.addEventListener('message:sent', handler)
    return () => window.removeEventListener('message:sent', handler)
  }, [conversationId])

  // Sentinel para saber si estamos al fondo
  useEffect(() => {
    const el = containerRef.current
    const sentinel = bottomRef.current
    if (!el || !sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setStickToBottom(entry.isIntersecting)
      },
      { root: el, threshold: 1.0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [conversationId])

  const scrollToBottom = (behavior: ScrollBehavior) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  // Al cambiar de conversación, baja siempre
  useEffect(() => { if (conversationId) scrollToBottom('auto') }, [conversationId])
  // En nuevos mensajes, baja solo si el usuario está al fondo
  useEffect(() => { if (stickToBottom) scrollToBottom('smooth') }, [data?.length, stickToBottom])

  return (
    <div ref={containerRef} className="h-full overflow-auto">
      <div className="p-4 space-y-2">
        {data?.map(m => {
          const isOut = m.direction==='out'
          const isPending = m.pending || m.id.startsWith('temp-')
          return (
            <div key={m.id} className={`max-w-[75%] rounded-lg px-3 py-2 ${isOut? 'bg-brand text-white ml-auto':'bg-gray-100 dark:bg-gray-800'} ${isPending? 'opacity-70':''}`}>
              <div className="text-sm whitespace-pre-wrap break-words">
                {m.type === 'text' ? (m.content_text ?? '') : `[${m.type}]`}
              </div>
              <div className="text-[10px] opacity-70 mt-1 flex items-center gap-2">
                <span>{new Date(m.created_at).toLocaleString()}</span>
                {isPending && <span>Enviando…</span>}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
} 