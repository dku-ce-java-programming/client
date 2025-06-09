import ConversationList from "@/components/custom/ConversationList";
import { Header } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import type { ConversationResponse } from "@/types/conversation";
import { fetchConversations } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";

function ConversationHistory() {
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    []
  );
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null
  );

  useLocation();
  useAuth();

  // 대화 목록 로드 함수
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      setConversationsError(null);
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error("대화 목록 로드 실패:", error);
      setConversationsError("대화 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // 대화 목록 로드 (항상 최신 데이터를 서버에서 가져옴)
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 대화 삭제 후 목록 새로고침
  const handleConversationsChange = async (
    updatedConversations: ConversationResponse[]
  ) => {
    // 즉시 UI 업데이트 (낙관적 업데이트)
    setConversations(updatedConversations);

    // 서버에서 최신 목록 다시 로드
    try {
      await loadConversations();
    } catch (error) {
      console.error("대화 목록 새로고침 실패:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 통일된 상단바 */}
      <Header />

      {/* 대화 목록 섹션 */}
      <div className="flex-1 w-full flex justify-center pt-8 pb-8 px-4">
        <ConversationList
          conversations={conversations}
          isLoading={isLoadingConversations}
          error={conversationsError}
          // showLimit 없음 = 모든 대화 표시
          showViewAllButton={false}
          onConversationsChange={handleConversationsChange}
        />
      </div>
    </div>
  );
}

export default ConversationHistory;
