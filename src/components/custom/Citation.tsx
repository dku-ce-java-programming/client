import React from "react";

interface CitationProps {
  number: string;
  url: string;
}

const Citation: React.FC<CitationProps> = ({ number, url }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // URL 검증
    try {
      const validUrl = new URL(url);
      if (validUrl.protocol === "http:" || validUrl.protocol === "https:") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        console.warn("Invalid URL protocol:", validUrl.protocol);
      }
    } catch (error) {
      console.warn("Invalid URL:", url);
    }
  };

  return (
    <a
      href={url}
      onClick={handleClick}
      className="inline-block px-1.5 py-0.5 mx-0.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded hover:bg-blue-100 hover:border-blue-400 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-150 cursor-pointer no-underline"
      aria-label={`출처 ${number}로 이동`}
      title={`출처 ${number}: ${url}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      [{number}]
    </a>
  );
};

export default React.memo(Citation);
