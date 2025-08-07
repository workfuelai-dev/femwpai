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
      <div className="flex flex-1 min-h-0">
        <ChatSidebar onSelect={setConversationId} selectedId={conversationId} />
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          <ConversationHeader conversationId={conversationId} />
          <MessageList conversationId={conversationId} />
          <Composer conversationId={conversationId} />
        </div>
      </div>
    </div>
  )
} 