import { OpenAIStream } from "./answer";

export async function GPTSummary(text: string, apiKey: string): Promise<string> {
  const prompt = `Summarize the following text in 2-3 key points:\n\n${text}`;
  console.log("GPTSummary prompt:", prompt);
  console.log("API Key (first 5 chars):", apiKey.substring(0, 5));

  try {
    const stream = await OpenAIStream(prompt, apiKey);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let summary = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      summary += decoder.decode(value);
    }

    console.log("GPTSummary result:", summary);
    return summary.trim();
  } catch (error) {
    console.error("Error in GPTSummary:", error);
    throw error;
  }
}
