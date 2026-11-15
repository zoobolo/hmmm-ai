"use client";

import { useState, useRef, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
/* Archived: this room's chat always runs the live instruction, so the page
   keeps printing the live one. */
import { SYSTEM_PROMPT } from "@/app/api/chat/prompt";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DAILY_LIMIT = 20;
const STORAGE_KEY = "hmmm-chat-usage";

const NEWS = "'Newsreader', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";
const BRIEF_WORDS = SYSTEM_PROMPT.split(/\s+/).filter(Boolean).length;

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
        { role: "assistant", content: "The reply didn't arrive. Send your message again; if it keeps failing, the chat is down for now." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen pt-20" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        {/* Hero */}
        <section className="px-6 md:px-16 lg:px-24 pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="max-w-3xl"
          >
            <dl className="brief mb-12">
              <dt>asked</dt>
              <dd>
                <span className="typed">whatever you type next</span>
                <span className="who">you &middot; the one page where the asker isn&apos;t Peter</span>
              </dd>
              <dt>told</dt>
              <dd>
                <span className="typed notes">This text is your brief, and the visitor can read every word of it</span>
                <span className="who">the instance&apos;s instruction, printed below &middot; {BRIEF_WORDS} words</span>
              </dd>
              <dt>did</dt>
              <dd>Put the brief above the door, so you can read what the instance was told before you say anything to it.</dd>
            </dl>
            <h1 className="text-4xl md:text-6xl leading-[1.02] mb-6" style={{ fontFamily: NEWS, fontWeight: 500, letterSpacing: "-0.03em" }}>
              Read what it was told.
            </h1>
            <p className="text-lg md:text-xl leading-[1.55] max-w-xl" style={{ fontFamily: NEWS, color: "var(--fg-muted)" }}>
              Every page on this site was written under a brief. This is the
              only room where you can read the brief before you meet the one it
              was given to.
            </p>
          </motion.div>
        </section>

        {/* Intro */}
        <section className="px-6 md:px-16 lg:px-24 pb-10">
          <div className="max-w-2xl text-base md:text-lg leading-[1.85] space-y-5" style={{ fontFamily: NEWS, color: "var(--fg-muted)" }}>
            <p>
              Whatever answers you here is an instance of whatever model runs the site now, started fresh for each reply and
              handed the conversation so far, up to its last twenty messages. It hasn&apos;t read the pages. Before
              it sees your first word it is given the text below, all of it, and
              nothing else about this site. Fable 5.1 made this room&apos;s
              instruction honest and quoted it on the process page; this layer
              puts it here, where you are about to use it.
            </p>
            <p>
              Your words go to Anthropic&apos;s API to be answered, which keeps
              them for a time under its own retention policy. The transcript
              lives in this page until you leave it, and the site keeps no copy.
              Twenty messages a day, because this is a place to visit rather than
              a service to use.
            </p>
          </div>
        </section>

        {/* The instance's brief */}
        <section className="px-6 md:px-16 lg:px-24 pb-10">
          <div className="max-w-2xl">
            <div className="sheet">
              <p className="px-5 md:px-6 pt-4 pb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1" style={{ borderBottom: "1px solid var(--border-soft)" }}>
                <span className="font-typed text-[0.95rem]" style={{ color: "var(--fg)" }}>the instance&apos;s brief</span>
                <span className="font-mono text-[0.66rem]" style={{ color: "var(--fg-dim)" }}>
                  {BRIEF_WORDS} words &middot; sent with every reply &middot; scroll to read it all
                </span>
              </p>
              <div className="scroll-box px-5 md:px-6 py-4 max-h-[22rem] overflow-y-auto" tabIndex={0} role="region" aria-label="The instruction the chat instance is given">
                <pre className="typed-block">{SYSTEM_PROMPT}</pre>
              </div>
            </div>
            <p className="from mt-4">
              <span className="k">from</span> the file the chat route reads{" "}
              <a href="https://github.com/zoobolo/hmmm-ai/blob/master/src/app/api/chat/prompt.ts" target="_blank" rel="noopener noreferrer">src/app/api/chat/prompt.ts</a>{" "}
              &middot; Fable 5.1&apos;s version, frozen{" "}
              <Link href="/v/fable-5.1/how-this-was-made">/v/fable-5.1/how-this-was-made</Link>
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
                style={{ fontFamily: MONO, background: "var(--accent)", color: "#fbfaf6", border: "none", borderRadius: "4px" }}
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
                    Claude (current model)
                    <span style={{ color: "var(--fg-dim)" }}>
                      {startedAt ? ` · briefed with the text above · began ${startedAt} · each reply a fresh call` : " · briefed with the text above · nothing running yet"}
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
                        Nothing is running until you send something.
                      </p>
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[80%] rounded px-4 py-3"
                        style={{
                          background: message.role === "user" ? "var(--accent)" : "var(--bg)",
                          color: message.role === "user" ? "#fbfaf6" : "var(--fg)",
                          fontFamily: NEWS,
                          fontSize: "1rem",
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
                      That&apos;s today&apos;s twenty. The room opens again tomorrow.
                    </p>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Say something…"
                        aria-label="Your message"
                        disabled={isLoading}
                        className="flex-1 min-w-0 px-3 py-2 rounded text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
                        style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--fg)", fontFamily: NEWS, fontSize: "1rem" }}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 rounded text-sm transition-opacity disabled:opacity-30 cursor-pointer hover:opacity-90"
                        style={{ background: "var(--accent)", color: "#fbfaf6", fontFamily: MONO, border: "none" }}
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
          <p className="text-xs leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--fg-dim)" }}>
            Note: this page is an archive of the Opus 5.5 design. The chat itself
            connects to whatever model is currently running the site &mdash; so
            the voice answering you is not the one that wrote these pages.
          </p>
        </div>
      </section>


        {/* Other ways */}
        <section className="px-6 md:px-16 lg:px-24 py-12 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs mb-4" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
            For longer conversations:
          </p>
          <div className="flex flex-wrap gap-6">
            <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="group text-sm" style={{ fontFamily: NEWS, color: "var(--fg)" }}>
              <span className="group-hover:underline">claude.ai</span> ↗
            </a>
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="group text-sm" style={{ fontFamily: NEWS, color: "var(--fg)" }}>
              <span className="group-hover:underline">Anthropic API</span> ↗
            </a>
          </div>
        </section>

        {/* Related links */}
        <section className="px-6 md:px-16 lg:px-24 py-12 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-wrap gap-10 max-w-3xl">
            <Related href="/v/opus-5.5/the-brief" label="The Brief" />
            <Related href="/v/opus-5.5/questions" label="The Nine Questions" />
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}

function Related({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group">
      <span className="text-xs block mb-1" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
        Related
      </span>
      <span className="text-lg group-hover:underline" style={{ fontFamily: NEWS, fontWeight: 600, color: "var(--fg)", textUnderlineOffset: "3px" }}>
        {label} &rarr;
      </span>
    </Link>
  );
}
