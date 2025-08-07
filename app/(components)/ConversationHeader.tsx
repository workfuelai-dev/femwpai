"use client"
import { useEffect, useState } from 'react'

export default function ConversationHeader({ conversationId }: { conversationId?: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!conversationId) { setEnabled(null); return }
      const res = await fetch(`/api/conversation/${conversationId}`)
      const json = await res.json()
      setEnabled(json?.auto_reply_enabled ?? false)
    }
    load()
  }, [conversationId])

  const toggle = async () => {
    if (!conversationId || enabled===null) return
    const res = await fetch(`/api/conversation/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto_reply_enabled: !enabled })
    })
    if (res.ok) setEnabled(!enabled)
  }

  if (!conversationId) return (
    <div className="h-12 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center text-sm text-gray-500">Selecciona una conversación</div>
  )

  return (
    <div className="h-12 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between">
      <div className="text-sm font-medium">Conversación</div>
      <button onClick={toggle} className={`text-xs px-2 py-1 rounded-md ${enabled? 'bg-green-600 text-white':'bg-gray-200 dark:bg-gray-700'}`}>
        IA {enabled? 'ON':'OFF'}
      </button>
    </div>
  )
} 