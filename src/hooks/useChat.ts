import { useState, useCallback, useRef } from "react";
import { apiClient } from "@/lib/apiClient";
import { ChatCompletionChunk } from "@/types/chat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useChat() {
  // 전체 메시지 목록
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "안녕하세요! 무엇을 도와드릴까요?" },
    { role: "user", content: "도와줘" },
  ]);

  // 사용자 입력
  const [input, setInput] = useState("");

  // 로딩(스트리밍 중인지 여부)
  const [isLoading, setIsLoading] = useState(false);

  // 최근 히스토리 몇 개까지 API에 포함할지 결정하는 state
  const [historyLimit, setHistoryLimit] = useState(5);

  // AbortController (스트리밍 취소용)
  const abortControllerRef = useRef<AbortController | null>(null);

  // input 변경 핸들러
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  // 히스토리 제한 변경 핸들러
  // 외부에서 이 함수를 호출해 historyLimit을 바꿀 수 있음
  const handleHistoryLimitChange = useCallback((newLimit: number) => {
    setHistoryLimit(newLimit);
  }, []);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim()) return;

      // 유저 메시지를 생성
      const userMessage: Message = { role: "user", content: input };
      // UI에 표시할 전체 메시지 목록에 추가
      setMessages((prev) => [...prev, userMessage]);

      setInput("");
      setIsLoading(true);

      // 최근 historyLimit개의 메시지에 새 메시지를 포함
      // 예: historyLimit=5일 경우, 최신 5개만 잘라냄
      const truncatedMessages = [...messages, userMessage].slice(-historyLimit);
      fetchStreamingResponse(truncatedMessages);
    },
    [input, messages, historyLimit],
  );

  // 스트리밍 응답 받는 함수
  const fetchStreamingResponse = useCallback(
    async (updatedMessages: Message[]) => {
      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // apiClient 요청 (실제로는 '/api/chat/stream' 등)
        const stream = await apiClient.chatGPTStreamChat(
          updatedMessages,
          controller.signal,
        );
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");

        let assistantMessage = "";
        // 화면에 표시하기 위해 빈 assistant 메시지 추가
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        // 남은 스트링을 저장할 버퍼
        let chunkBuffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break; // 스트림 종료

          chunkBuffer += decoder.decode(value, { stream: true });
          const lines = chunkBuffer.split("\n");
          chunkBuffer = lines.pop() || "";

          for (const line of lines) {
            // OpenAI에서 스트리밍 종료 신호
            if (line.trim() === "data: [DONE]") {
              return;
            }
            // "data: {...}"를 파싱
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              try {
                const parsed = JSON.parse(jsonStr) as ChatCompletionChunk;
                const contentDelta = parsed.choices[0]?.delta?.content || "";
                if (contentDelta) {
                  assistantMessage += contentDelta;
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    if (updated[lastIndex]?.role === "assistant") {
                      updated[lastIndex].content = assistantMessage;
                    }
                    return updated;
                  });
                }
              } catch (err) {
                console.error("JSON 파싱 에러:", err);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "에러가 발생했습니다." },
        ]);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [],
  );

  // 요청 취소
  const handleAbort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "요청이 취소되었습니다." },
      ]);
    }
  }, []);

  return {
    messages,
    input,
    isLoading,
    historyLimit,
    handleInputChange,
    handleHistoryLimitChange,
    handleSubmit,
    handleAbort,
  };
}
