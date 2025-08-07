"use client"
import { useMemo, useState } from 'react'
import Header from './(components)/Header'
import ChatSidebar from './(components)/ChatSidebar'
import MessageList from './(components)/MessageList'
import Composer from './(components)/Composer'
import ConversationHeader from './(components)/ConversationHeader'

export default function Page() {
  const [conversationId, setConversationId] = useState<string>()
  const debug = useMemo(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1', [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className={`flex flex-1 min-h-0 overflow-hidden ${debug ? 'ring-2 ring-purple-500' : ''}`}>
        <div className={`w-72 h-full ${debug ? 'ring-2 ring-red-500' : ''}`}>
          <ChatSidebar onSelect={setConversationId} selectedId={conversationId} />
        </div>
        <div className={`flex-1 min-h-0 min-w-0 flex flex-col ${debug ? 'ring-2 ring-blue-500' : ''}`}>
          <ConversationHeader conversationId={conversationId} />
          <div className={`flex-1 min-h-0 overflow-hidden ${debug ? 'ring-2 ring-green-500' : ''}`}>
            <MessageList conversationId={conversationId} />
          </div>
          <Composer conversationId={conversationId} />
        </div>
      </div>
    </div>
  )
} 