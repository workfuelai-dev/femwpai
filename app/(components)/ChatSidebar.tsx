"use client"
import useSWR from 'swr'
import { supabaseBrowser } from '@/lib/supabaseClient'

type Conversation = {
  id: string
  auto_reply_enabled: boolean
  contact: { id: string; wa_id: string; name: string | null }
}

type Row = {
  id: string
  auto_reply_enabled: boolean
  contact_id: string
  wa_id: string
  name: string | null
}

export default function ChatSidebar({ onSelect, selectedId }: { onSelect: (id: string)=>void, selectedId?: string }) {
  const fetcher = async () => {
    const sb = supabaseBrowser()
    const { data, error } = await sb
      .from('conversations_with_contacts')
      .select('id, auto_reply_enabled, contact_id, wa_id, name')
      .order('id', { ascending: false })
    if (error) throw error
    const rows = (data ?? []) as Row[]
    const normalized: Conversation[] = rows.map(r => ({
      id: r.id,
      auto_reply_enabled: r.auto_reply_enabled,
      contact: { id: r.contact_id, wa_id: r.wa_id, name: r.name }
    }))
    return normalized
  }
  const { data } = useSWR('conversations', fetcher, { refreshInterval: 5000 })

  return (
    <aside className="w-72 shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
      <div className="p-2">
        {data?.map(c => (
          <button key={c.id}
            onClick={()=>onSelect(c.id)}
            className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedId===c.id? 'bg-gray-100 dark:bg-gray-800':''}`}>
            <div className="text-sm font-medium">{c.contact?.name ?? c.contact?.wa_id}</div>
            <div className="text-xs text-gray-500">Auto IA: {c.auto_reply_enabled? 'ON':'OFF'}</div>
          </button>
        ))}
      </div>
    </aside>
  )
} 