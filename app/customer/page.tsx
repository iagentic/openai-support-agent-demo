"use client";
import React, { useEffect, useState } from "react";
import Chat from "@/components/Chat";
import useConversationStore from "@/stores/useConversationStore";
import { Item, processMessages } from "@/lib/assistant";
import { useSocket } from "@/lib/useSocket";
import { useSearchParams } from "next/navigation";
import { tools } from "@/lib/tools/tools";

export default function CustomerView() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session') || 'default-session';
  console.log('Customer view using session:', sessionId);
  
  const { 
    chatMessages, 
    addConversationItem, 
    addChatMessage, 
    setChatMessages,
    setConversationItems,
    setIsConnected 
  } = useConversationStore();

  const [isInitialized, setIsInitialized] = useState(false);

  const { isConnected, sendMessage, updateConversation, sendTyping } = useSocket({
    sessionId,
    onMessage: (message) => {
      // Handle incoming messages from other clients
      console.log('Customer received message:', message);
      
      // Only add messages from agent or assistant (AI), not from self
      if (message.role === 'agent' || message.role === 'assistant') {
        console.log('Customer processing AI message:', message);
        const newItem: Item = {
          type: message.type,
          role: message.role,
          content: message.content,
          id: message.id
        };
        addChatMessage(newItem);
        
        // Also add to conversation items for AI processing
        // Convert agent role to assistant for OpenAI API compatibility
        const conversationItem = {
          role: message.role === 'agent' ? 'assistant' : message.role,
          content: Array.isArray(message.content) ? message.content[0]?.text || '' : message.content
        };
        addConversationItem(conversationItem);
      }
    },
    onConversationState: (state) => {
      // Sync conversation state from server
      if (state.messages && state.messages.length > 0) {
        const items: Item[] = state.messages.map((msg: any) => ({
          type: msg.type,
          role: msg.role,
          content: msg.content,
          id: msg.id
        }));
        setChatMessages(items);
        
        const conversationItems = state.messages.map((msg: any) => ({
          role: msg.role,
          content: Array.isArray(msg.content) ? msg.content[0]?.text || '' : msg.content
        }));
        setConversationItems(conversationItems);
      }
    },
    onTyping: (data) => {
      // Handle typing indicators from other clients
      if (data.role === 'agent') {
        // Update agent typing status
      }
    }
  });

  useEffect(() => {
    setIsConnected(isConnected);
  }, [isConnected, setIsConnected]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userItem: Item = {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: message.trim() }],
    };
    const userMessage: any = {
      role: "user",
      content: message.trim(),
    };

    try {
      // Add to local state
      addConversationItem(userMessage);
      addChatMessage(userItem);
      
      // Send via WebSocket
      const messageToSend = {
        id: Date.now().toString(),
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: message.trim() }]
      };
      console.log('Customer sending message:', messageToSend);
      sendMessage(messageToSend);

      // Process with AI - this will generate a response
      await processMessages((aiSuggestion) => {
        // Send AI suggestion to agent view via WebSocket
        sendMessage(aiSuggestion);
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  return (
    <div className="flex-1 w-full bg-white rounded-lg p-4 overflow-hidden">
      <div className="mb-4 text-sm text-gray-500">
        Session: {sessionId} | Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      <Chat
        items={chatMessages}
        view="user"
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
