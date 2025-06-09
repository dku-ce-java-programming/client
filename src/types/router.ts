import type { ConversationResponse } from "./conversation";

export interface ConversationHistoryLocationState {
  conversations?: ConversationResponse[];
}

export interface ChatLocationState {
  firstMessage?: string;
  conversationTitle?: string;
}
