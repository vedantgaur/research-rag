// utils/gptSummary.ts

import { OpenAIStream } from "./answer";

export async function GPTSummary(text: string, apiKey: string): Promise<string> {
  const prompt = `Summarize the following text in 2-3 key points:\n\n${text}`;
  const stream = await OpenAIStream(prompt, apiKey);
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let summary = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    summary += decoder.decode(value);
  }

  return summary.trim();
}
