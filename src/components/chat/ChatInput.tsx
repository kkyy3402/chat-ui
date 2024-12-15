"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { motion } from "framer-motion";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const [displayValue, setDisplayValue] = useState(input);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // e.preventDefault();
        // // Shift+Enter -> 줄바꿈 처리
        // const target = e.currentTarget;
        // const { selectionStart, selectionEnd, value } = target;
        //
        // const newValue =
        //   value.substring(0, selectionStart) +
        //   "\n" +
        //   value.substring(selectionEnd);
        //
        // // 상태 업데이트
        // setDisplayValue(newValue);
        // handleInputChange(newValue);
        //
        // // 커서 위치 재설정
        // setTimeout(() => {
        //   target.setSelectionRange(selectionStart + 1, selectionStart + 1);
        // }, 0);
      } else {
        // Enter(단독) -> 폼 전송
        e.preventDefault();
        const form = e.currentTarget.form;
        if (form) {
          const syntheticEvent = Object.create(e);
          syntheticEvent.currentTarget = form;
          syntheticEvent.target = form;
          handleSubmit(syntheticEvent);
          // setDisplayValue("");
        }
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-t border-gray-200 px-4 py-2 flex items-center"
    >
      <motion.input
        type="text"
        value={displayValue}
        onChange={(e) => {
          setDisplayValue(e.target.value);
          handleInputChange(e);
        }}
        onKeyDown={onKeyDown}
        placeholder="Shift+Enter로 줄바꿈, Enter로 전송"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="
          flex-1 px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded
          focus:outline-none focus:border-gray-400 resize-none overflow-y-auto
        "
        style={{
          whiteSpace: "pre-wrap", // 줄바꿈 시 시각적으로 반영
        }}
      />
      <motion.button
        type="submit"
        disabled={isLoading}
        whileTap={{ scale: 0.95 }}
        className="ml-2 px-4 py-2 bg-gray-800 text-gray-100 rounded hover:bg-black disabled:opacity-60"
      >
        전송
      </motion.button>
    </form>
  );
}
