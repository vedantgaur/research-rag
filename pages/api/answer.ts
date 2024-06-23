import { OpenAIStream } from "@/utils/answer";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));

    const { prompt, apiKey } = body;

    if (!prompt || !apiKey) {
      return new Response(JSON.stringify({ error: "Missing prompt or API key" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("Calling OpenAIStream");
    const stream = await OpenAIStream(prompt, apiKey);
    console.log("Stream received");

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      result += decoder.decode(value);
    }

    console.log("Result:", result);

    return new Response(JSON.stringify({ answer: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in handler:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};



export default handler;
