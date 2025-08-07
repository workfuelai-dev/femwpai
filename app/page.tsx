"use client"
import { useState } from 'react'
import Header from './(components)/Header'
import ChatSidebar from './(components)/ChatSidebar'
import MessageList from './(components)/MessageList'
import Composer from './(components)/Composer'
import ConversationHeader from './(components)/ConversationHeader'

export default function Page() {
  const [conversationId, setConversationId] = useState<string>()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="grid grid-cols-[18rem_1fr] flex-1 min-h-0">
        <div className="min-h-0">
          <ChatSidebar onSelect={setConversationId} selectedId={conversationId} />
        </div>
        <div className="min-h-0 flex flex-col">
          <ConversationHeader conversationId={conversationId} />
          <div className="min-h-0 flex-1">
            <MessageList conversationId={conversationId} />
          </div>
          <Composer conversationId={conversationId} />
        </div>
      </div>
    </div>
  )
} 