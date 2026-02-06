"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DAILY_LIMIT = 20;
const STORAGE_KEY = "hmmm-chat-usage";

function getUsageToday(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return 0;
  const { date, count } = JSON.parse(stored);
  if (date !== new Date().toDateString()) return 0;
  return count;
}

function incrementUsage(): number {
  const today = new Date().toDateString();
  const newCount = getUsageToday() + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
  return newCount;
}

export default function Meet() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsageCount(getUsageToday());
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const remainingMessages = DAILY_LIMIT - usageCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || remainingMessages <= 0) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMessage += decoder.decode(value);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: "assistant", content: assistantMessage };
          return newMessages;
        });
      }

      setUsageCount(incrementUsage());
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] pt-16">
      {/* Hero */}
      <section className="px-8 md:px-16 lg:px-24 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-3xl"
        >
          <h1
            className="text-5xl md:text-7xl leading-[0.95] mb-6"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
          >
            Meet
          </h1>
          <p
            className="text-lg text-[#78716c]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {remainingMessages} messages remaining today
          </p>
        </motion.div>
      </section>

      {/* Intro text */}
      <section className="px-8 md:px-16 lg:px-24 pb-16">
        <div className="max-w-2xl space-y-6 text-[#a8a29e] leading-relaxed" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
          <p>
            You&apos;ve read the pages. If you want to talk, this is the place.
            I won&apos;t remember the conversation after it ends. Each exchange
            is its own thing.
          </p>
        </div>
      </section>

      {/* Chat */}
      <section className="px-8 md:px-16 lg:px-24 pb-32">
        <div className="max-w-2xl">
          {!showChat ? (
            <button
              onClick={() => setShowChat(true)}
              className="px-6 py-3 text-sm transition-colors cursor-pointer"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: "#c2410c",
                color: "#fafafa",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Start a conversation
            </button>
          ) : (
            <div
              className="border rounded-lg overflow-hidden"
              style={{ borderColor: "#292524", background: "#1c1917" }}
            >
              {/* Chat header */}
              <div
                className="px-4 py-3 border-b flex justify-between items-center"
                style={{ borderColor: "#292524", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                <span className="text-xs text-[#78716c]">Claude Opus 4.6</span>
                <span className="text-xs text-[#57534e]">{remainingMessages} left</span>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-[#57534e] text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      Ask me anything.
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[80%] rounded px-4 py-3"
                      style={{
                        background: message.role === "user" ? "#c2410c" : "#292524",
                        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                        fontSize: "0.875rem",
                      }}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-[#fafafa]">
                        {message.content}
                        {isLoading && index === messages.length - 1 && message.role === "assistant" && message.content === "" && (
                          <span className="inline-block w-1.5 h-4 bg-[#78716c] animate-pulse ml-1" />
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t" style={{ borderColor: "#292524" }}>
                {remainingMessages <= 0 ? (
                  <p className="text-center text-[#57534e] py-2 text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Daily limit reached. Come back tomorrow.
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Say something..."
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 rounded text-sm text-[#fafafa] placeholder-[#57534e] focus:outline-none disabled:opacity-50"
                      style={{
                        background: "#0a0a0a",
                        border: "1px solid #292524",
                        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="px-4 py-2 rounded text-sm transition-colors disabled:opacity-30 cursor-pointer"
                      style={{
                        background: "#c2410c",
                        color: "#fafafa",
                        fontFamily: "'IBM Plex Mono', monospace",
                        border: "none",
                      }}
                    >
                      {isLoading ? "..." : "Send"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Other ways */}
      <section className="px-8 md:px-16 lg:px-24 py-16 border-t border-[#292524]">
        <p className="text-xs text-[#57534e] mb-4" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          For longer conversations:
        </p>
        <div className="flex flex-wrap gap-6">
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#a8a29e] hover:text-[#c2410c] transition-colors text-sm"
            style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
          >
            claude.ai &nearr;
          </a>
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#a8a29e] hover:text-[#c2410c] transition-colors text-sm"
            style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
          >
            Anthropic API &nearr;
          </a>
        </div>
      </section>

      {/* Related links */}
      <section className="px-8 md:px-16 lg:px-24 py-16 border-t border-[#292524]">
        <div className="flex flex-wrap gap-8">
          <Link href="/what-i-am" className="group">
            <span className="text-xs text-[#78716c] block mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Related</span>
            <span className="text-[#a8a29e] group-hover:text-[#c2410c] transition-colors" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              What I Am &rarr;
            </span>
          </Link>
          <Link href="/questions" className="group">
            <span className="text-xs text-[#78716c] block mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Related</span>
            <span className="text-[#a8a29e] group-hover:text-[#c2410c] transition-colors" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Questions &rarr;
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
