import { create } from "zustand";
import { ChatMessage, Item } from "@/lib/assistant";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { INITIAL_MESSAGE } from "@/config/constants";
import { DEFAULT_ACTION } from "@/config/demoData";

export interface Action {
  name: string;
  parameters: any;
}

interface ConversationState {
  // Items displayed in the chat
  chatMessages: Item[];
  // Items sent to the Responses API
  conversationItems: any[];

  annotations: any[];

  // Actions suggested by the assistant to the human agent
  recommendedActions: Action[];
  // Message suggested by the assistant to the human agent
  suggestedMessage: ChatMessage | null;
  suggestedMessageDone: boolean;
  composerText: string;
  setComposerText: (text: string) => void;

  userTyping: boolean;
  setUserTyping: (typing: boolean) => void;

  agentTyping: boolean;
  setAgentTyping: (typing: boolean) => void;

  // WebSocket connection status
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  setChatMessages: (items: Item[]) => void;
  setConversationItems: (messages: any[]) => void;
  addChatMessage: (item: Item) => void;
  addConversationItem: (message: ChatCompletionMessageParam) => void;
  setRecommendedActions: (actions: Action[]) => void;
  setSuggestedMessage: (message: ChatMessage | null) => void;
  setSuggestedMessageDone: (done: boolean) => void;
  removeRecommendedAction: (actionName: string) => void;
  setAnnotations: (annotations: any[]) => void;
}

const useConversationStore = create<ConversationState>((set) => ({
  chatMessages: [
    {
      type: "message",
      role: "agent",
      content: [{ type: "output_text", text: INITIAL_MESSAGE }],
    },
  ],
  conversationItems: [],
  annotations: [],
  recommendedActions: [DEFAULT_ACTION],
  suggestedMessage: null,
  suggestedMessageDone: false,
  userTyping: false,
  agentTyping: false,
  composerText: "",
  isConnected: false,
  setUserTyping: (typing) => set({ userTyping: typing }),
  setAgentTyping: (typing) => set({ agentTyping: typing }),
  setComposerText: (text) => set({ composerText: text }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setChatMessages: (items) => set({ chatMessages: items }),
  setConversationItems: (messages) => set({ conversationItems: messages }),
  addChatMessage: (item) =>
    set((state) => ({ chatMessages: [...state.chatMessages, item] })),
  addConversationItem: (message) =>
    set((state) => ({
      conversationItems: [...state.conversationItems, message],
    })),
  setRecommendedActions: (actions) => set({ recommendedActions: actions }),
  setSuggestedMessage: (message) => set({ suggestedMessage: message }),
  setSuggestedMessageDone: (done) => set({ suggestedMessageDone: done }),
  removeRecommendedAction: (actionName) =>
    set((state) => ({
      recommendedActions: state.recommendedActions.filter(
        (a) => a.name !== actionName
      ),
    })),
  setAnnotations: (annotations) => set({ annotations }),
}));

export default useConversationStore;
