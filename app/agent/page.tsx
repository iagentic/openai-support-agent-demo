"use client";
import React, { useEffect } from "react";
import useConversationStore from "@/stores/useConversationStore";
import { Item } from "@/lib/assistant";
import ContextPanel from "@/components/ContextPanel";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Info } from "lucide-react";
import Chat from "@/components/Chat";
import { useSocket } from "@/lib/useSocket";
import { useSearchParams } from "next/navigation";
import { tools } from "@/lib/tools/tools";

export default function AgentView() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session') || 'default-session';
  console.log('Agent view using session:', sessionId);
  
  const { 
    chatMessages, 
    addConversationItem, 
    addChatMessage, 
    setChatMessages,
    setConversationItems,
    setIsConnected 
  } = useConversationStore();

  const { isConnected, sendMessage, updateConversation, sendTyping } = useSocket({
    sessionId,
    onMessage: (message) => {
      // Handle incoming messages from other clients
      console.log('Agent received message:', message);
      
      // Handle different message types
      if (message.type === 'ai_suggestion') {
        console.log('Agent received AI suggestion:', message);
        // Set this as a suggested message for the agent to review
        const suggestedMessage = {
          type: "message",
          role: "agent",
          id: message.id,
          content: message.content,
        } as any;
        useConversationStore.getState().setSuggestedMessage(suggestedMessage);
        useConversationStore.getState().setSuggestedMessageDone(true);
      } else if (message.role === 'user' || message.role === 'assistant') {
        console.log('Agent processing message:', message);
        const newItem: Item = {
          type: message.type,
          role: message.role,
          content: message.content,
          id: message.id
        };
        addChatMessage(newItem);
        
        // Also add to conversation items for AI processing
        const conversationItem = {
          role: message.role,
          content: Array.isArray(message.content) ? message.content[0]?.text || '' : message.content
        };
        addConversationItem(conversationItem);
      } else {
        console.log('Agent ignoring message with role:', message.role);
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
      if (data.role === 'user') {
        // Update user typing status
      }
    }
  });

  useEffect(() => {
    setIsConnected(isConnected);
  }, [isConnected, setIsConnected]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const agentItem: Item = {
      type: "message",
      role: "agent",
      content: [{ type: "input_text", text: message.trim() }],
    };
    const agentMessage: any = {
      role: "assistant",
      content: message.trim(),
    };

    // Add to local state
    addConversationItem(agentMessage);
    addChatMessage(agentItem);
    
    // Send via WebSocket
    sendMessage({
      id: Date.now().toString(),
      type: "message",
      role: "agent",
      content: [{ type: "input_text", text: message.trim() }]
    });
  };

  return (
    <div className="relative flex flex-1 min-h-0 bg-white rounded-lg p-4 gap-4">
      <div className="w-full md:w-3/5">
        <div className="mb-4 text-sm text-gray-500">
          Session: {sessionId} | Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        <Chat
          items={chatMessages}
          view="agent"
          onSendMessage={handleSendMessage}
        />
      </div>

      <div className="hidden md:block md:w-2/5">
        <ContextPanel className="h-full" />
      </div>
      <Drawer>
        <DrawerTrigger asChild>
          <button
            className="absolute top-4 right-4 md:hidden"
            aria-label="Open Context Panel"
          >
            <Info className="text-zinc-500" />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-sm">Case Context</DrawerTitle>
          </DrawerHeader>
          <div className="px-2 pb-10 flex flex-col h-[75vh]">
            <ContextPanel className="flex-1 overflow-y-auto h-[50vh]" />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
