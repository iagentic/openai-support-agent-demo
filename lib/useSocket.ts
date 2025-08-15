import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  sessionId: string;
  onMessage?: (message: any) => void;
  onConversationState?: (state: any) => void;
  onTyping?: (data: { isTyping: boolean; role: 'user' | 'agent' }) => void;
}

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null;
let globalSessionId: string | null = null;

export const useSocket = ({ sessionId, onMessage, onConversationState, onTyping }: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const callbacksRef = useRef({ onMessage, onConversationState, onTyping });

  // Update callbacks without re-creating socket
  useEffect(() => {
    callbacksRef.current = { onMessage, onConversationState, onTyping };
  }, [onMessage, onConversationState, onTyping]);

  useEffect(() => {
    console.log('useSocket effect called for session:', sessionId);
    
    // If we already have a socket for this session, just update connection status
    if (globalSocket && globalSessionId === sessionId) {
      setIsConnected(globalSocket.connected);
      return;
    }

    // If we have a different session, disconnect the old one
    if (globalSocket && globalSessionId !== sessionId) {
      console.log('Disconnecting old session:', globalSessionId);
      globalSocket.disconnect();
      globalSocket = null;
      globalSessionId = null;
    }

    // Create new socket if we don't have one
    if (!globalSocket) {
      console.log('Creating new socket for session:', sessionId);
      globalSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
      });
      globalSessionId = sessionId;

      globalSocket.on('connect', () => {
        console.log('Socket connected, joining session:', sessionId);
        setIsConnected(true);
        globalSocket?.emit('join-session', sessionId);
      });

      globalSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      globalSocket.on('new-message', (message) => {
        console.log('Received message:', message);
        callbacksRef.current.onMessage?.(message);
      });

      globalSocket.on('conversation-state', (state) => {
        console.log('Received conversation state:', state);
        callbacksRef.current.onConversationState?.(state);
      });

      globalSocket.on('conversation-updated', (messages) => {
        console.log('Conversation updated:', messages);
        callbacksRef.current.onConversationState?.({ messages, sessionId });
      });

      globalSocket.on('user-typing', (data) => {
        console.log('User typing:', data);
        callbacksRef.current.onTyping?.(data);
      });
    }

    // Cleanup function
    return () => {
      // Only disconnect if this is the last component using this session
      if (globalSocket && globalSessionId === sessionId) {
        console.log('Component unmounting, but keeping socket alive for session:', sessionId);
      }
    };
  }, [sessionId]); // Only depend on sessionId

  const sendMessage = useCallback((message: any) => {
    if (globalSocket && isConnected) {
      console.log('Sending message:', message);
      globalSocket.emit('send-message', {
        sessionId,
        message: {
          ...message,
          timestamp: Date.now()
        }
      });
    } else {
      console.log('Cannot send message - socket not connected');
    }
  }, [sessionId, isConnected]);

  const updateConversation = useCallback((messages: any[]) => {
    if (globalSocket && isConnected) {
      globalSocket.emit('update-conversation', {
        sessionId,
        messages
      });
    }
  }, [sessionId, isConnected]);

  const sendTyping = useCallback((isTyping: boolean, role: 'user' | 'agent') => {
    if (globalSocket && isConnected) {
      globalSocket.emit('typing', {
        sessionId,
        isTyping,
        role
      });
    }
  }, [sessionId, isConnected]);

  return {
    isConnected,
    sendMessage,
    updateConversation,
    sendTyping
  };
};
