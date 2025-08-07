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
      <div className="h-[calc(100vh-57px)] overflow-hidden">
        <div className="grid grid-cols-[18rem_1fr] h-full">
          <ChatSidebar onSelect={setConversationId} selectedId={conversationId} />
          <div className="h-full grid grid-rows-[auto_1fr_auto]">
            <ConversationHeader conversationId={conversationId} />
            <div className="min-h-0 overflow-hidden">
              <MessageList conversationId={conversationId} />
            </div>
            <Composer conversationId={conversationId} />
          </div>
        </div>
      </div>
    </div>
  )
} 