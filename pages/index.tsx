import { useState } from "react";
import { Search } from "@/components/Search";
import { Answer } from "@/components/Answer";
import { ChatInterface } from "@/components/ChatInterface";
import { SearchQuery, ChatMessage } from "@/types";
import Head from "next/head";
import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<SearchQuery | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState<boolean>(false);

  const handleSearch = (query: SearchQuery) => {
    setSearchQuery(query);
    setShowChat(false);
    setChatHistory([]);
  };

  const handleAnswerUpdate = (newAnswer: string) => {
    setAnswer(newAnswer);
  };

  const handleDone = (isDone: boolean) => {
    setDone(isDone);
    if (isDone) {
      setShowChat(true);
    }
  };

  const handleNewMessage = async (message: string) => {
    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...chatHistory, newUserMessage],
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Raw chat response:", responseText);

      const aiResponse: ChatMessage = { role: 'assistant', content: responseText.trim() };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage: ChatMessage = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  return (
    <>
      <Head>
        <title>Research AI</title>
        <meta name="description" content="AI-powered research paper search." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="h-screen overflow-auto bg-[#18181C] text-[#D4D4D8]">
        <a className="absolute top-0 right-12 p-4 cursor-pointer" href="https://twitter.com/ved4ntg" target="_blank" rel="noreferrer">
          <IconBrandTwitter />
        </a>
        <a className="absolute top-0 right-2 p-4 cursor-pointer" href="https://github.com/vedantgaur" target="_blank" rel="noreferrer">
          <IconBrandGithub />
        </a>

        {!searchQuery ? (
          <Search onSearch={handleSearch} onAnswerUpdate={handleAnswerUpdate} onDone={handleDone} />
        ) : (
          <>
            <Answer searchQuery={searchQuery} answer={answer} done={done} onReset={() => setSearchQuery(null)} />
            {showChat && (
              <ChatInterface chatHistory={chatHistory} onSendMessage={handleNewMessage} />
            )}
          </>
        )}
      </div>
    </>
  );
}
