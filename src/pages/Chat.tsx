import InputBox from "@/components/custom/InputBox";
import MessageRenderer from "@/components/custom/MessageRenderer";
import { Header } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatLocationState } from "@/types/router";
import {
  fetchConversationDetails,
  generateConversationTitle,
} from "@/utils/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

type Message = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  isStreaming?: boolean;
};

type HistoryMessage = {
  messageId: string;
  role: "USER" | "ASSISTANT";
  content: string;
};

function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [_, setStreamingMessageId] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [conversationTitle, setConversationTitle] = useState<string>("");
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);
  const [animatedMessages, setAnimatedMessages] = useState<Set<string>>(
    new Set()
  );
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();

  useAuth();

  // conversationId 로깅 (개발용)
  useEffect(() => {
    console.log("현재 conversationId:", conversationId);
  }, [conversationId]);

  // 대화 제목 로드 함수
  const loadConversationTitle = useCallback(
    async (convId: string) => {
      try {
        setIsLoadingTitle(true);
        const conversationDetails = await fetchConversationDetails(convId);
        setConversationTitle(conversationDetails.title);
      } catch (error) {
        console.error("대화 제목 로드 에러:", error);
        if (error instanceof Error && error.message.includes("404")) {
          // 404 에러인 경우 NotFound 페이지로 리다이렉트
          navigate("/404", { replace: true });
          return;
        }
        setConversationTitle("채팅");
      } finally {
        setIsLoadingTitle(false);
      }
    },
    [navigate]
  );

  // 대화 제목 생성 함수
  const generateTitle = useCallback(async (convId: string) => {
    try {
      setIsLoadingTitle(true);
      const conversationDetails = await generateConversationTitle(convId);
      setConversationTitle(conversationDetails.title);
      console.log("대화 제목 생성 완료:", conversationDetails.title);
    } catch (error) {
      console.error("대화 제목 생성 에러:", error);
      // 제목 생성 실패 시 기존 제목 유지
    } finally {
      setIsLoadingTitle(false);
    }
  }, []);

  // 히스토리 로드 함수
  const loadChatHistory = useCallback(
    async (convId: string): Promise<Message[]> => {
      try {
        const response = await fetch(
          `http://localhost:8080/chat/${convId}/history`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          if (response.status === 404) {
            // 404 에러인 경우 NotFound 페이지로 리다이렉트
            navigate("/404", { replace: true });
            return [];
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const historyData: HistoryMessage[] = await response.json();

        return historyData.map((msg) => ({
          id: msg.messageId,
          role: msg.role,
          content: msg.content,
          isStreaming: false,
        }));
      } catch (error) {
        console.error("히스토리 로드 에러:", error);
        return [];
      }
    },
    [navigate]
  );

  // SSE 연결 정리 함수
  const cleanupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanupEventSource();
    };
  }, [cleanupEventSource]);

  // SSE 스트리밍 함수
  const startSSEStreaming = useCallback(
    (messageContent: string, botMessageId: string) => {
      if (!conversationId) {
        console.error("conversationId가 없습니다.");
        return;
      }

      // 기존 연결이 있다면 정리
      cleanupEventSource();

      const url = `http://localhost:8080/chat/completion?conversationId=${encodeURIComponent(
        conversationId
      )}&content=${encodeURIComponent(messageContent)}`;

      console.log("SSE 연결 시작:", url);

      const eventSource = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = eventSource;
      setIsStreaming(true);
      setStreamingMessageId(botMessageId);

      eventSource.onmessage = (event) => {
        const data = event.data;
        console.log("SSE 메시지 수신:", JSON.stringify(data));

        if (data === "[CONNECTED]") {
          console.log("SSE 연결 확인됨");
          return;
        }

        if (data === "[ERROR]") {
          console.error("SSE 스트리밍 중 오류 발생");
          setIsStreaming(false);
          setStreamingMessageId(null);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    content:
                      msg.content ||
                      "응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
                    isStreaming: false,
                  }
                : msg
            )
          );
          cleanupEventSource();
          return;
        }

        if (data === "[DONE]") {
          console.log("SSE 스트리밍 완료");
          setIsStreaming(false);
          setStreamingMessageId(null);
          setMessages((prev) => {
            const updatedMessages = prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
            );

            // 첫 번째 봇 응답 완료 시 제목 생성 (메시지 개수가 2개인 경우)
            if (updatedMessages.length === 2 && conversationId) {
              console.log("첫 번째 봇 응답 완료, 제목 생성 시작");
              setTimeout(() => generateTitle(conversationId), 100);
            }

            return updatedMessages;
          });

          // isFirstMessage 플래그 초기화
          if (isFirstMessage) {
            setIsFirstMessage(false);
          }

          cleanupEventSource();
          return;
        }

        // 메시지 청크 처리
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, content: msg.content + data }
              : msg
          )
        );
      };

      eventSource.onerror = (error) => {
        console.error("SSE 연결 에러:", error);
        setIsStreaming(false);
        setStreamingMessageId(null);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  content: msg.content || "연결 오류가 발생했습니다.",
                  isStreaming: false,
                }
              : msg
          )
        );
        cleanupEventSource();
      };
    },
    [conversationId, cleanupEventSource, isFirstMessage, generateTitle]
  );

  // 대화 제목 로드 (라우터 state 우선, 없으면 API 호출)
  useEffect(() => {
    if (!conversationId) {
      setConversationTitle("");
      return;
    }

    const locationState = location.state as ChatLocationState | null;
    const passedTitle = locationState?.conversationTitle;

    if (passedTitle) {
      // 라우터 state에서 전달받은 제목 사용
      setConversationTitle(passedTitle);
    } else {
      // 제목이 없으면 API 호출
      loadConversationTitle(conversationId);
    }
  }, [conversationId, location.state, loadConversationTitle]);

  useEffect(() => {
    if (!conversationId || hasInitialized) return;

    // 항상 히스토리를 먼저 확인
    loadChatHistory(conversationId).then((historyMessages) => {
      console.log("히스토리 로드 완료:", historyMessages.length, "개 메시지");

      if (historyMessages.length > 0) {
        // 기존 대화가 있는 경우: 히스토리 표시
        setMessages(historyMessages);
        setHasInitialized(true);
      } else if (
        location.state &&
        typeof (location.state as ChatLocationState).firstMessage === "string"
      ) {
        // 기존 대화가 없고 홈에서 온 경우: 첫 메시지로 새 대화 시작
        const firstMessage = (location.state as ChatLocationState).firstMessage;
        if (!firstMessage) return;
        const userMessage: Message = {
          id: generateId(),
          role: "USER",
          content: firstMessage,
        };
        const botMessageId = generateId();
        const botMessage: Message = {
          id: botMessageId,
          role: "ASSISTANT",
          content: "",
          isStreaming: true,
        };

        setMessages([userMessage, botMessage]);
        setHasInitialized(true);
        setIsFirstMessage(true); // 첫 번째 메시지임을 표시

        // 첫 메시지에 대한 SSE 스트리밍 시작
        setTimeout(() => {
          startSSEStreaming(firstMessage, botMessageId);
        }, 100);
      } else {
        // 히스토리도 없고 firstMessage도 없는 경우: 빈 상태
        setMessages([]);
        setHasInitialized(true);
      }
    });
  }, [
    conversationId,
    location.state,
    generateId,
    startSSEStreaming,
    loadChatHistory,
    hasInitialized,
  ]);

  // 메시지 애니메이션 처리 (중간 속도) - 스트리밍 메시지 포함
  useEffect(() => {
    messages.forEach((message, index) => {
      if (!animatedMessages.has(message.id)) {
        // 스트리밍 메시지는 즉시 애니메이션 적용, 일반 메시지는 순차적 적용
        const delay = message.isStreaming ? 0 : index * 100;
        setTimeout(() => {
          setAnimatedMessages((prev) => new Set([...prev, message.id]));
        }, delay);
      }
    });
  }, [messages, animatedMessages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        250
      )}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isStreaming) {
      const userMessage: Message = {
        id: generateId(),
        role: "USER",
        content: question.trim(),
      };

      const botMessageId = generateId();
      const botMessage: Message = {
        id: botMessageId,
        role: "ASSISTANT",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => {
        const newMessages = [...prev, userMessage, botMessage];

        // 첫 번째 메시지인 경우 플래그 설정
        if (prev.length === 0) {
          setIsFirstMessage(true);
        }

        return newMessages;
      });

      // SSE 스트리밍 시작
      startSSEStreaming(question.trim(), botMessageId);

      setQuestion("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 통일된 상단바 */}
      <Header>
        <div className="text-sm text-gray-600">
          {isLoadingTitle ? "제목 생성 중..." : conversationTitle || "채팅"}
        </div>
      </Header>

      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 flex flex-col space-y-2">
          {messages.map((msg, index) => {
            const isAnimated = animatedMessages.has(msg.id);
            return (
              <div
                key={msg.id}
                className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"} transform transition-all duration-350 ease-out ${
                  isAnimated
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-3 opacity-0 scale-97"
                }`}
                style={{
                  transitionDelay: isAnimated ? "0ms" : `${index * 65}ms`,
                }}
              >
                <div
                  className={`px-4 py-2 rounded-lg break-words ${
                    msg.role === "USER"
                      ? "bg-gray-200 text-gray-800 max-w-[70%]"
                      : "bg-white text-gray-900 w-full"
                  }`}
                >
                  <MessageRenderer
                    content={msg.content}
                    role={msg.role}
                    isStreaming={msg.isStreaming}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto mb-6">
        <InputBox
          value={question}
          onChange={handleInput}
          onSubmit={handleSubmit}
          textareaRef={textareaRef}
          placeholder={
            isStreaming ? "응답을 기다리는 중..." : "질문을 입력하세요"
          }
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}

export default Chat;
