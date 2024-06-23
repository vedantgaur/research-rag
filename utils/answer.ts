import { OpenAIModel, ChatMessage } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

export const OpenAIStream = async (prompt: string | ChatMessage[], apiKey: string) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let messages: ChatMessage[];
  if (typeof prompt === 'string') {
    messages = [
      { role: "system", content: "You are a helpful assistant that accurately answers the user's queries based on the given text." },
      { role: "user", content: prompt }
    ];
  } else {
    messages = prompt;
  }

  const requestBody = {
    model: OpenAIModel.GPT4,
    messages: messages,
    temperature: 0.7,
    stream: true
  };

  console.log("OpenAI API Request:", JSON.stringify(requestBody, null, 2));

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      method: "POST",
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("OpenAI API Error Response:", errorData);
      throw new Error(`OpenAI API error: ${res.status} ${res.statusText} - ${errorData}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const onParse = (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === "event") {
            const data = event.data;

            if (data === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta.content;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        };

        const parser = createParser(onParse);

        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      }
    });

    return stream;
  } catch (error) {
    console.error("Error in OpenAIStream:", error);
    throw error;
  }
};

