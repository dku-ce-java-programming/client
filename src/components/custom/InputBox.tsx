import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface InputBoxProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  placeholder?: string;
  disabled?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({
  value,
  onChange,
  onSubmit,
  textareaRef,
  placeholder = "질문을 입력하세요",
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <form className="w-full px-4" onSubmit={onSubmit}>
      <div
        className={`flex rounded-lg border bg-white p-4 shadow items-end gap-2 transition-all duration-225 ease-out transform ${
          isFocused
            ? "shadow-lg border-blue-200 scale-[1.008]"
            : "shadow hover:shadow-md hover:border-gray-300"
        } ${disabled ? "opacity-75" : ""}`}
      >
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !disabled) {
              e.preventDefault();
              const form = e.currentTarget.form;
              if (form) {
                const submitEvent = new Event("submit", {
                  cancelable: true,
                  bubbles: true,
                });
                form.dispatchEvent(submitEvent);
              }
            }
          }}
          className={`flex-1 resize-none border-none rounded px-3 py-2 bg-transparent focus:outline-none transition-all duration-150 ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "placeholder:text-gray-400"
          }`}
          rows={1}
        />
        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          className={`self-end h-10 transition-all duration-150 ${
            !disabled && value.trim()
              ? "transform hover:scale-103 active:scale-97"
              : ""
          }`}
        >
          <SendHorizonal size={24} />
        </Button>
      </div>
    </form>
  );
};

export default InputBox;
