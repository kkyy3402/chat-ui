// apiClient.ts
import { Message } from "@/types/chat";

export const apiClient = {
  chatGPTStreamChat: async (
    messages: Message[],
    signal?: AbortSignal,
    stream: boolean = true,
    model: string = "gpt-4o",
  ): Promise<ReadableStream<Uint8Array>> => {
    const body = {
      messages: messages,
      model: model,
      stream: stream,
    };

    const accessToken = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!accessToken) {
      throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
    }

    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error("스트리밍 요청에 실패했습니다.");
    }

    return response.body;
  },

  // 다른 일반 POST 요청용 메서드 (필요하다면)
  post: async (
    endpoint: string,
    data: never,
    signal?: AbortSignal,
  ): Promise<unknown> => {
    const baseUrl = "/api";
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal,
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${endpoint}`);
    }

    // 일반 JSON 반환
    return response.json();
  },
};
