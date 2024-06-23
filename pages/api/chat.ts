import { OpenAIStream } from "@/utils/answer";
import { ChatMessage } from "@/types";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response("Method not allowed", {
      status: 405,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  try {
    const { messages, apiKey } = await req.json() as {
      messages: ChatMessage[];
      apiKey: string;
    };

    if (!messages || !apiKey) {
      return new Response("Missing messages or API key", {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const stream = await OpenAIStream(messages, apiKey);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      result += decoder.decode(value);
    }

    return new Response(result, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error("Error in handler:", error);
    return new Response(`Internal server error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

export default handler;
