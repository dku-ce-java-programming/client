import type { ConversationResponse } from "@/types/conversation";
import { deleteConversation } from "@/utils/api";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface ConversationListProps {
  conversations: ConversationResponse[];
  isLoading: boolean;
  error: string | null;
  showLimit?: number;
  showViewAllButton?: boolean;
  onConversationsChange?: (conversations: ConversationResponse[]) => void;
}

const ConversationList = ({
  conversations,
  isLoading,
  error,
  showLimit,
  showViewAllButton = false,
  onConversationsChange,
}: ConversationListProps) => {
  const navigate = useNavigate();
  const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set());
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleConversationClick = (conversation: ConversationResponse) => {
    navigate(`/chat/${conversation.conversationId}`, {
      state: { conversationTitle: conversation.title },
    });
  };

  const handleDropdownToggle = (
    conversationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setShowDropdown(showDropdown === conversationId ? null : conversationId);
  };

  const handleDeleteConversation = async (
    conversationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setShowDropdown(null);
    setIsDeleting(conversationId);

    try {
      await deleteConversation(conversationId);

      // 성공 시 목록에서 제거
      if (onConversationsChange) {
        const updatedConversations = conversations.filter(
          (conv) => conv.conversationId !== conversationId
        );
        onConversationsChange(updatedConversations);
      }

      toast.success("대화가 삭제되었습니다");
    } catch (error) {
      console.error("대화 삭제 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "대화를 삭제하는데 실패했습니다"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(null);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // 대화 목록이 로드되면 순차적으로 애니메이션 실행
  useEffect(() => {
    if (!isLoading && conversations.length > 0) {
      setAnimatedItems(new Set()); // 초기화

      const displayedConversations = showLimit
        ? conversations.slice(0, showLimit)
        : conversations;

      displayedConversations.forEach((conversation, index) => {
        setTimeout(() => {
          setAnimatedItems(
            (prev) => new Set([...prev, conversation.conversationId])
          );
        }, index * 65); // 각 항목마다 65ms 간격 (기존 100ms와 30ms의 중간)
      });
    }
  }, [conversations, isLoading, showLimit]);

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">최근 대화</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={`skeleton-${Date.now()}-${index}`}
              className="p-4 border border-gray-200 rounded-lg bg-white animate-pulse"
            >
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="flex-1 min-w-0">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">최근 대화</h3>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="w-full max-w-3xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">최근 대화</h3>
        <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
          <div className="text-gray-500 mb-2">📝</div>
          <p className="text-gray-600">아직 대화가 없습니다</p>
          <p className="text-sm text-gray-500 mt-1">
            위에서 첫 질문을 시작해보세요!
          </p>
        </div>
      </div>
    );
  }

  const displayedConversations = showLimit
    ? conversations.slice(0, showLimit)
    : conversations;

  return (
    <div className="w-full max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          {showLimit ? "최근 대화" : "모든 대화"}
        </h3>
        {showViewAllButton && conversations.length > (showLimit || 0) && (
          <button
            type="button"
            onClick={() =>
              navigate("/conversations", {
                state: { conversations },
              })
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 font-medium border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <span className="whitespace-nowrap">모든 대화 보기</span>
            <span className="px-1.5 py-0.5 text-xs text-gray-600 bg-gray-100 rounded-full font-medium">
              {conversations.length}
            </span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-label="화살표"
            >
              <title>화살표</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {displayedConversations.map((conversation, index) => {
          const isAnimated = animatedItems.has(conversation.conversationId);
          const isConversationDeleting =
            isDeleting === conversation.conversationId;
          return (
            <div
              key={conversation.conversationId}
              className={`relative p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 group transform transition-all duration-350 ease-out ${
                isAnimated
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-3 opacity-0 scale-97"
              } ${isConversationDeleting ? "opacity-50 pointer-events-none" : ""} ${
                showDropdown === conversation.conversationId ? "z-50" : "z-10"
              }`}
              style={{
                transitionDelay: isAnimated ? "0ms" : `${index * 35}ms`,
              }}
            >
              <button
                type="button"
                onClick={() => handleConversationClick(conversation)}
                className="w-full text-left cursor-pointer"
                disabled={isConversationDeleting}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-150">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700 transition-colors duration-150">
                      {conversation.title}
                    </p>
                  </div>
                </div>
              </button>

              {/* 3점 메뉴 버튼 */}
              <button
                type="button"
                onClick={(e) =>
                  handleDropdownToggle(conversation.conversationId, e)
                }
                className="absolute top-1/2 right-2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                disabled={isConversationDeleting}
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>더보기</title>
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {showDropdown === conversation.conversationId && (
                <div
                  ref={dropdownRef}
                  className="absolute top-10 right-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32"
                >
                  <button
                    type="button"
                    onClick={(e) =>
                      handleDeleteConversation(conversation.conversationId, e)
                    }
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <title>삭제</title>
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>대화 삭제</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;
