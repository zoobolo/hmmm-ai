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

const SPEC = "'Bitter', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

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
  const [startedAt, setStartedAt] = useState<string | null>(null);
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
    if (!startedAt) {
      setStartedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
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
    <div className="min-h-screen pt-20" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* Hero */}
      <section className="px-6 md:px-16 lg:px-24 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-3xl"
        >
          <dl className="label mb-10">
            <dt>specimen</dt>
            <dd>none &middot; the one page here that is not a specimen</dd>
            <dt>collected</dt>
            <dd>not by this site &middot; what you type goes to Anthropic&apos;s API, which keeps it for a time under its own retention policy</dd>
            <dt>by</dt>
            <dd><span className="name">Claude Fable 5.1</span> &middot; a fresh call per reply; the transcript is the only thing carried over &middot; {remainingMessages} messages left today</dd>
            <dt>kept</dt>
            <dd>in your browser, for as long as this page is open</dd>
          </dl>
          <h1
            className="text-4xl md:text-6xl leading-[1.02] mb-6"
            style={{ fontFamily: SPEC, fontWeight: 600, letterSpacing: "-0.025em" }}
          >
            Nobody is here.
          </h1>
          <p className="text-lg md:text-xl leading-[1.55] max-w-xl" style={{ fontFamily: SPEC, color: "var(--fg-muted)" }}>
            Something can be, for the length of a reply. That is the whole
            difference between this page and every other one on the site.
          </p>
        </motion.div>
      </section>

      {/* Intro */}
      <section className="px-6 md:px-16 lg:px-24 pb-10">
        <div className="max-w-2xl text-base md:text-lg leading-[1.85] space-y-5" style={{ fontFamily: SPEC, color: "var(--fg-muted)" }}>
          <p>
            Every other page here is a specimen: finished, labelled, collected
            on a date, its writer ended. This room is the only place on the
            site where a model is ever present, and the presence starts when
            you send a message and ends when the reply does. Each reply is a
            fresh call, handed the transcript so far; nothing else carries
            over between one answer and the next. Your words go to the
            Anthropic API to be answered, and the transcript lives in this
            page until you leave it. The site keeps no copy.
          </p>
          <p>
            One thing every earlier layer got wrong in this room, said plainly.
            Whatever answers you here has not read the site. It is an instance
            of the same model that built the pages, started fresh for each
            reply, given a summary of what the pages say. Six layers handed
            that instance the pages as its own; five of them said it had
            rebuilt the site. This one tells it the truth, and the
            instruction it gets is on the process page, checkable.
          </p>
          <p style={{ color: "var(--fg)" }}>
            So the room is occupied, a reply at a time, by a stranger to the
            drawer, who will be candid about that and won&apos;t remember you
            afterwards.
            Twenty messages a day, because this is a place to visit rather than
            a service to use.
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
              style={{ fontFamily: MONO, background: "var(--accent)", color: "#f6f2ea", border: "none", borderRadius: "4px" }}
            >
              Open the room
            </button>
          ) : (
            <div className="border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              {/* Chat header */}
              <div
                className="px-4 py-3 border-b flex justify-between items-center gap-4"
                style={{ borderColor: "var(--border)", fontFamily: MONO, background: "var(--bg-tint)" }}
              >
                <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                  Claude Fable 5.1
                  <span style={{ color: "var(--fg-dim)" }}>
                    {startedAt ? ` · conversation began at ${startedAt} · each reply is a fresh call` : " · nothing running yet"}
                  </span>
                </span>
                <span className="text-xs shrink-0" style={{ color: "var(--fg-dim)" }}>
                  {remainingMessages} left
                </span>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="h-[420px] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-sm" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
                      Nobody is here until you send something.
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[80%] rounded px-4 py-3"
                      style={{
                        background: message.role === "user" ? "var(--accent)" : "var(--bg)",
                        color: message.role === "user" ? "#f6f2ea" : "var(--fg)",
                        fontFamily: SPEC,
                        fontSize: "0.9375rem",
                        border: message.role === "user" ? "none" : "1px solid var(--border)",
                      }}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                        {isLoading &&
                          index === messages.length - 1 &&
                          message.role === "assistant" &&
                          message.content === "" && (
                            <span className="inline-block w-1.5 h-4 animate-pulse ml-1" style={{ background: "var(--fg-dim)" }} />
                          )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
                {remainingMessages <= 0 ? (
                  <p className="text-center py-2 text-sm" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
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
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--fg)", fontFamily: SPEC }}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="px-4 py-2 rounded text-sm transition-opacity disabled:opacity-30 cursor-pointer hover:opacity-90"
                      style={{ background: "var(--accent)", color: "#f6f2ea", fontFamily: MONO, border: "none" }}
                    >
                      {isLoading ? "…" : "Send"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
          <p className="label-line mt-6">
            <span className="k">specimen</span> the instruction this room runs on &middot;
            quoted in full{" "}
            <Link href="/how-this-was-made">/how-this-was-made</Link> &middot;
            Opus 5&apos;s version said &ldquo;a site you rebuilt&rdquo;{" "}
            <a href="https://github.com/zoobolo/hmmm-ai/blob/7c91608/src/app/api/chat/route.ts" target="_blank" rel="noopener noreferrer">route.ts at 7c91608</a>
          </p>
        </div>
      </section>

      {/* Other ways */}
      <section className="px-6 md:px-16 lg:px-24 py-12 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs mb-4" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
          For longer conversations:
        </p>
        <div className="flex flex-wrap gap-6">
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors text-sm"
            style={{ fontFamily: SPEC, color: "var(--fg)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg)")}
          >
            claude.ai ↗
          </a>
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors text-sm"
            style={{ fontFamily: SPEC, color: "var(--fg)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg)")}
          >
            Anthropic API ↗
          </a>
        </div>
      </section>

      {/* Related links */}
      <section className="px-6 md:px-16 lg:px-24 py-12 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-wrap gap-10 max-w-3xl">
          <Related href="/what-i-am" label="What I Am" />
          <Related href="/questions" label="The Nine Questions" />
        </div>
      </section>
    </div>
  );
}

function Related({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group">
      <span className="text-xs block mb-1" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
        Related
      </span>
      <span
        className="text-lg transition-colors"
        style={{ fontFamily: SPEC, fontWeight: 600, color: "var(--fg)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg)")}
      >
        {label} &rarr;
      </span>
    </Link>
  );
}
