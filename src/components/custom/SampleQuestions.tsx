import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SampleQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  className?: string;
  isVisible?: boolean;
}

const SampleQuestions: React.FC<SampleQuestionsProps> = ({
  questions,
  onQuestionClick,
  className = "",
  isVisible = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // 초기 스크롤 상태 체크
  useEffect(() => {
    checkScrollButtons();
  }, [checkScrollButtons]);

  return (
    <div
      className={`w-full px-4 mt-4 transform transition-all duration-450 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      } ${className}`}
    >
      <div className="relative flex items-start">
        {/* 왼쪽 화살표 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollLeft}
          className={`absolute left-0 z-10 h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200 transition-opacity ${
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={16} />
        </Button>

        {/* 스크롤 가능한 버튼 컨테이너 */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide mx-10"
          onScroll={checkScrollButtons}
        >
          <div className="flex gap-3 min-w-max">
            {questions.map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                onClick={() => onQuestionClick(question)}
                className="whitespace-nowrap text-sm text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 flex-shrink-0"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* 오른쪽 화살표 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollRight}
          className={`absolute right-0 z-10 h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200 transition-opacity ${
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default SampleQuestions;
