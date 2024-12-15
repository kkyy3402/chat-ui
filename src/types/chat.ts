export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint: string;
  choices: Choice[];
}

interface Choice {
  index: number;
  delta: Delta;
  logprobs: any; // 구조가 확실치 않다면 any 또는 더 구체적으로 정의
  finish_reason: string | null; // 가능한 값이 'stop' 또는 null이므로 string | null
}

interface Delta {
  content?: string; // 두 번째 객체에서는 content가 없으므로 선택적 속성
}
