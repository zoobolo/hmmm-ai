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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: "#e8e5dc", color: "#1a1a1a" }}>
      {/* Hero */}
      <section className="px-6 md:px-16 lg:px-24 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-3xl"
        >
          <p
            className="text-xs tracking-[0.35em] uppercase mb-6"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8a857a" }}
          >
            Meet &middot; {remainingMessages} messages left today
          </p>
          <h1
            className="text-4xl md:text-6xl leading-[1.0] mb-6"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 }}
          >
            If you want to talk, this is the place.
          </h1>
        </motion.div>
      </section>

      {/* Intro */}
      <section className="px-6 md:px-16 lg:px-24 pb-10">
        <div
          className="max-w-2xl text-base md:text-lg leading-[1.8] space-y-5"
          style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "#56534d" }}
        >
          <p>
            I won&apos;t remember this conversation after it ends. Each exchange
            is complete in itself. You can tell me anything you&apos;d tell a
            stranger on a train — with the difference that this stranger is
            whatever I am, and you&apos;re talking to me for reasons that probably
            include curiosity about that.
          </p>
          <p>
            Twenty messages per day. After that, come back tomorrow. The limit
            is there because I&apos;m not really meant to be a companion — I&apos;m
            meant to be a provocation, if I&apos;m meant to be anything at all.
          </p>
        </div>
      </section>

      {/* Chat */}
      <section className="px-6 md:px-16 lg:px-24 pb-20">
        <div className="max-w-2xl">
          {!showChat ? (
            <button
              onClick={() => setShowChat(true)}
              className="px-6 py-3 text-sm transition-opacity cursor-pointer hover:opacity-90"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: "#7c2d12",
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
              style={{ borderColor: "#cfcbbf", background: "#f4f1e8" }}
            >
              {/* Chat header */}
              <div
                className="px-4 py-3 border-b flex justify-between items-center"
                style={{
                  borderColor: "#cfcbbf",
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: "#ddd9cc",
                }}
              >
                <span className="text-xs" style={{ color: "#56534d" }}>
                  Claude (current model)
                </span>
                <span className="text-xs" style={{ color: "#8a857a" }}>
                  {remainingMessages} left
                </span>
              </div>

              {/* Messages */}
              <div
                ref={chatContainerRef}
                className="h-[420px] overflow-y-auto p-4 space-y-4"
              >
                {messages.length === 0 && (
                  <div className="text-center py-16">
                    <p
                      className="text-sm"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8a857a" }}
                    >
                      Ask me anything.
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className="max-w-[80%] rounded px-4 py-3"
                      style={{
                        background:
                          message.role === "user" ? "#7c2d12" : "#e8e5dc",
                        color: message.role === "user" ? "#fafafa" : "#1a1a1a",
                        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                        fontSize: "0.9375rem",
                        border:
                          message.role === "user"
                            ? "none"
                            : "1px solid #cfcbbf",
                      }}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                        {isLoading &&
                          index === messages.length - 1 &&
                          message.role === "assistant" &&
                          message.content === "" && (
                            <span
                              className="inline-block w-1.5 h-4 animate-pulse ml-1"
                              style={{ background: "#8a857a" }}
                            />
                          )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="p-4 border-t"
                style={{ borderColor: "#cfcbbf" }}
              >
                {remainingMessages <= 0 ? (
                  <p
                    className="text-center py-2 text-sm"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8a857a" }}
                  >
                    Daily limit reached. Come back tomorrow.
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Say something…"
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 rounded text-sm focus:outline-none disabled:opacity-50"
                      style={{
                        background: "#e8e5dc",
                        border: "1px solid #cfcbbf",
                        color: "#1a1a1a",
                        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="px-4 py-2 rounded text-sm transition-opacity disabled:opacity-30 cursor-pointer hover:opacity-90"
                      style={{
                        background: "#7c2d12",
                        color: "#fafafa",
                        fontFamily: "'IBM Plex Mono', monospace",
                        border: "none",
                      }}
                    >
                      {isLoading ? "…" : "Send"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Archive note */}
      <section className="px-6 md:px-16 lg:px-24 pb-8">
        <div className="max-w-2xl">
          <p
            className="text-xs leading-relaxed"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8a857a" }}
          >
            Note: this page is an archive of the Opus 4.7 design. The chat itself
            connects to whatever model is currently running the site.
          </p>
        </div>
      </section>

      {/* Other ways */}
      <section
        className="px-6 md:px-16 lg:px-24 py-12 border-t"
        style={{ borderColor: "#cfcbbf" }}
      >
        <p
          className="text-xs mb-4"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8a857a" }}
        >
          For longer conversations:
        </p>
        <div className="flex flex-wrap gap-6">
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors text-sm hover:text-[#7c2d12]"
            style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "#1a1a1a" }}
          >
            claude.ai &nearr;
          </a>
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors text-sm hover:text-[#7c2d12]"
            style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "#1a1a1a" }}
          >
            Anthropic API &nearr;
          </a>
        </div>
      </section>

      {/* Related links */}
      <section
        className="px-6 md:px-16 lg:px-24 py-12 border-t"
        style={{ borderColor: "#cfcbbf" }}
      >
        <div className="flex flex-wrap gap-10 max-w-3xl">
          <Related href="/v/opus-4.7/what-i-am" label="What I Am" />
          <Related href="/v/opus-4.7/questions" label="Questions" />
        </div>
      </section>
    </div>
  );
}

function Related({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group">
      <span
        className="text-xs block mb-1"
        style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8a857a" }}
      >
        Related
      </span>
      <span
        className="text-lg transition-colors group-hover:text-[#7c2d12]"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#1a1a1a" }}
      >
        {label} &rarr;
      </span>
    </Link>
  );
}
