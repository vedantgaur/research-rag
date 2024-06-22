import { OpenAIStream } from "@/utils/answer";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt, apiKey } = (await req.json()) as {
      prompt: string;
      apiKey: string;
    };

    if (!prompt || !apiKey) {
      return new Response(JSON.stringify({ error: "Missing prompt or API key" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const stream = await OpenAIStream(prompt, apiKey);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        result += decoder.decode(value);
      }

      return new Response(JSON.stringify({ answer: result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (streamError) {
      console.error("Error in OpenAIStream:", streamError);
      return new Response(JSON.stringify({ error: "Error generating stream" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("Error in handler:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export default handler;