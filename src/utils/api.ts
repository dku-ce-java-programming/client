import type { ConversationResponse } from "@/types/conversation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://dku-java-3-server.seongmin.dev";

export const fetchConversations = async (): Promise<ConversationResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    credentials: "include",
    cache: "no-cache",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  if (!response.ok) {
    throw new Error("대화 목록을 가져오는데 실패했습니다");
  }

  return response.json();
};

export const fetchConversationDetails = async (
  conversationId: string
): Promise<ConversationResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat/${conversationId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("404: 존재하지 않는 대화입니다");
    }
    throw new Error("대화 정보를 가져오는데 실패했습니다");
  }

  return response.json();
};

export const deleteConversation = async (
  conversationId: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chat/${conversationId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("존재하지 않는 대화입니다");
    }
    throw new Error("대화를 삭제하는데 실패했습니다");
  }
};

export const generateConversationTitle = async (
  conversationId: string
): Promise<ConversationResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/chat/${conversationId}/generate-title`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("대화 제목을 생성하는데 실패했습니다");
  }

  return response.json();
};
