"use client"
import { useState } from 'react'

export default function Composer({ conversationId }: { conversationId?: string }) {
  const [text, setText] = useState('')
  const disabled = !conversationId

  const send = async () => {
    if (!text.trim() || !conversationId) return
    await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, type: 'text', text })
    })
    setText('')
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