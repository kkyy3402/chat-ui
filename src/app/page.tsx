"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatBot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">ChatBot</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {/* 로딩 중이면 말풍선 형태로 ... 표기 */}
        {isLoading && (
          <ChatMessage message={{ role: "assistant", content: "..." }} />
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
