"use client"
import useSWR from 'swr'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useEffect } from 'react'

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

  return (
    <div className="flex-1 h-[calc(100vh-57px-64px)] overflow-y-auto p-4 space-y-2">
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
    </div>
  )
} 