import ConversationList from "@/components/custom/ConversationList";
import InputBox from "@/components/custom/InputBox";
import SampleQuestions from "@/components/custom/SampleQuestions";
import { Header } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import type { ConversationResponse } from "@/types/conversation";
import { fetchConversations } from "@/utils/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://dku-java-3-server.seongmin.dev";

// 예시 질문 데이터
const SAMPLE_QUESTIONS = [
  "CSUSB의 기숙사는 어때?",
  "Kent State University를 위한 서류 준비는 어떻게 해야 해?",
  "Wichita State University 주변에 여행할 곳에 대해 알려줄래?",
];

function Home() {
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    []
  );
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const [pageLoaded, setPageLoaded] = useState(false);

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

  // 대화 목록 로드
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

  // 페이지 로드 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ question: question.trim() }),
        });

        const result = await response.json();
        console.log("POST 요청 결과:", result);

        // conversationId를 사용하여 동적 경로로 이동
        if (result.conversationId) {
          navigate(`/chat/${result.conversationId}`, {
            state: { firstMessage: question },
          });
        } else {
          console.error("서버 응답에 conversationId가 없습니다:", result);
          // fallback으로 기본 경로 이동 (임시)
          navigate("/chat/unknown", { state: { firstMessage: question } });
        }
      } catch (error) {
        console.error("POST 요청 중 오류가 발생했습니다:", error);
        // 오류가 발생했을 때는 페이지 이동하지 않음
        alert("채팅을 시작하는 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 예시 질문 클릭 핸들러
  const handleSampleQuestionClick = async (selectedQuestion: string) => {
    setQuestion(selectedQuestion);

    // 텍스트영역 높이 조정
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }

    // 자동 전송
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ question: selectedQuestion }),
      });

      const result = await response.json();
      console.log("예시 질문 POST 요청 결과:", result);

      // conversationId를 사용하여 동적 경로로 이동
      if (result.conversationId) {
        navigate(`/chat/${result.conversationId}`, {
          state: { firstMessage: selectedQuestion },
        });
      } else {
        console.error("서버 응답에 conversationId가 없습니다:", result);
        // fallback으로 기본 경로 이동 (임시)
        navigate("/chat/unknown", {
          state: { firstMessage: selectedQuestion },
        });
      }
    } catch (error) {
      console.error("예시 질문 POST 요청 중 오류가 발생했습니다:", error);
      // 오류가 발생했을 때는 페이지 이동하지 않음
      alert("채팅을 시작하는 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* 통일된 상단바 */}
      <Header />

      {/* 중앙 질문 입력 영역 */}
      <div className="flex-1 w-full flex flex-col items-center justify-center overflow-hidden">
        <div
          className={`w-full max-w-3xl px-4 transform transition-all duration-450 ease-out ${
            pageLoaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <span
            className={`text-3xl font-semibold text-gray-800 mb-7 block text-center transform transition-all duration-450 ease-out ${
              pageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-1.5 opacity-0"
            }`}
            style={{ transitionDelay: "125ms" }}
          >
            어디로 떠나고 싶으신가요?
          </span>
          <div
            className={`transform transition-all duration-450 ease-out ${
              pageLoaded
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-1.5 opacity-0 scale-99"
            }`}
            style={{ transitionDelay: "250ms" }}
          >
            <InputBox
              value={question}
              onChange={handleInput}
              onSubmit={handleSubmit}
              textareaRef={textareaRef}
              placeholder="질문을 입력하세요"
            />
          </div>

          {/* 예시 질문 섹션 */}
          <div
            className={`mt-6 transform transition-all duration-450 ease-out ${
              pageLoaded
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-1.5 opacity-0 scale-99"
            }`}
            style={{ transitionDelay: "375ms" }}
          >
            <SampleQuestions
              questions={SAMPLE_QUESTIONS}
              onQuestionClick={handleSampleQuestionClick}
              isVisible={pageLoaded}
            />
          </div>
        </div>
      </div>

      {/* 최근 대화 섹션 */}
      <div
        className={`w-full flex justify-center pb-8 px-4 transform transition-all duration-450 ease-out ${
          pageLoaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        style={{ transitionDelay: "375ms" }}
      >
        <ConversationList
          conversations={conversations}
          isLoading={isLoadingConversations}
          error={conversationsError}
          showLimit={4}
          showViewAllButton={true}
          onConversationsChange={handleConversationsChange}
        />
      </div>
    </div>
  );
}

export default Home;
