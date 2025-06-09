import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageRendererProps {
  content: string;
  role: "USER" | "ASSISTANT";
  isStreaming?: boolean;
}

// Citation 태그를 일반 마크다운 링크로 변환하는 함수
const processCitationTags = (text: string): string => {
  const citationPattern =
    /<citation>\[(\d+)\]\((https?:\/\/[^\)]+)\)<\/citation>/g;

  // 연속된 citation 처리를 위해 각 citation 뒤에 공백 추가
  return text
    .replace(citationPattern, (_, number, url) => {
      return `[${number}](${url}) `;
    })
    .trim(); // 마지막 공백 제거
};

const MessageRenderer = ({
  content,
  role,
  isStreaming,
}: MessageRendererProps) => {
  if (role === "USER") {
    // 사용자 메시지는 일반 텍스트로 표시
    return <div>{content}</div>;
  }

  // 봇 메시지에서 citation 태그를 마크다운 링크로 변환
  const processedContent = React.useMemo(() => {
    if (content.includes("<citation>")) {
      return processCitationTags(content);
    }
    return content;
  }, [content]);

  // 봇 메시지는 마크다운으로 렌더링 (기존 로직)
  return (
    <div
      className={`markdown-content ${isStreaming ? "streaming-animation" : ""}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 제목 스타일링
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-2 text-gray-900">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-2 text-gray-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mb-1 text-gray-900">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-bold mb-1 text-gray-900">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-bold mb-1 text-gray-900">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-bold mb-1 text-gray-900">{children}</h6>
          ),

          // 단락 스타일링
          p: ({ children }) => (
            <p className="mb-2 text-gray-900 leading-relaxed">{children}</p>
          ),

          // 강조 텍스트
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-900">{children}</em>
          ),

          // 링크 스타일링
          a: ({ href, children }) => {
            // Citation 링크인지 확인 (숫자 형태)
            const isCitation =
              typeof children === "string" && /^\d+$/.test(children);

            if (isCitation) {
              return (
                <a
                  href={href}
                  className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-2 mx-0.5 text-xs font-semibold text-gray-700 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 rounded-md shadow-sm hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 hover:shadow-md active:from-gray-200 active:to-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-150 cursor-pointer no-underline group"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    try {
                      const validUrl = new URL(href || "");
                      if (
                        validUrl.protocol === "http:" ||
                        validUrl.protocol === "https:"
                      ) {
                        window.open(href, "_blank", "noopener,noreferrer");
                      }
                    } catch (error) {
                      console.warn("Invalid URL:", href);
                    }
                  }}
                  style={{ textDecoration: "none" }}
                  title={`출처: ${href}`}
                >
                  <span className="transform group-hover:scale-103 transition-transform duration-110">
                    {children}
                  </span>
                </a>
              );
            }

            // 일반 링크
            return (
              <a
                href={href}
                className="text-sky-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },

          // 리스트 스타일링
          ul: ({ children }) => (
            <ul className="list-disc ml-4 mb-2 text-gray-900">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-4 mb-2 text-gray-900">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="mb-1 text-gray-900">{children}</li>
          ),

          // 코드 스타일링
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-100 p-2 rounded text-sm font-mono text-gray-800 overflow-x-auto">
                {children}
              </code>
            );
          },

          // 코드 블록 스타일링
          pre: ({ children }) => (
            <pre className="bg-gray-100 p-3 rounded mb-2 overflow-x-auto">
              {children}
            </pre>
          ),

          // 테이블 스타일링
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-gray-300">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-3 py-2 text-left font-bold text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-3 py-2 text-gray-900">
              {children}
            </td>
          ),

          // 인용구 스타일링
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-2 italic text-gray-700">
              {children}
            </blockquote>
          ),

          // 구분선 스타일링
          hr: () => <hr className="border-gray-300 my-4" />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse">
          |
        </span>
      )}
    </div>
  );
};

export default MessageRenderer;
