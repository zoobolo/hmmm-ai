"use client";

import { useEffect, useRef, useState } from "react";

/* The room. One new control in this layer: "ask again" sends the same
   message, with the same conversation before it, to another fresh instance
   and sets the two replies side by side. The conversation then carries on
   from the first reply; the others are shown and go nowhere. */

type Turn = { user: string; answers: string[]; failed?: boolean };

const DAILY_LIMIT = 20;
const STORAGE_KEY = "hmmm-chat-usage";
const MONO = "'IBM Plex Mono', monospace";
const EDGES = ["", "b", "c"];
const ORDINAL = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];
/* The instance may close the room. Its instruction (printed above the chat)
   tells it how: by ending a reply with this line. Only the first reply to a
   message can close it, because that is the reply the conversation goes on
   from. */
const END = "[I am ending this conversation]";
// The marker counts only as the whole of the last line, so a reply that
// merely describes it doesn't close the room; decoration a model might put
// round it (asterisks, backticks, a full stop) is ignored.
const lastLine = (a: string) => (a.trimEnd().split("\n").pop() ?? "").replace(/^[\s*_`>]+|[\s*_`.]+$/g, "");
const ended = (a: string) => lastLine(a) === END;
const shown = (a: string) => (ended(a) ? a.trimEnd().split("\n").slice(0, -1).join("\n").trimEnd() : a);

function getUsageToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;
    const { date, count } = JSON.parse(stored);
    return date === new Date().toDateString() ? count : 0;
  } catch {
    return 0;
  }
}

function incrementUsage(): number {
  const n = getUsageToday() + 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), count: n }));
  } catch {}
  return n;
}

export default function Chat({ model }: { model: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(0);
  const [open, setOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsed(getUsageToday());
  }, []);

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [turns]);

  const left = Math.max(0, DAILY_LIMIT - used);

  // What a fresh instance is handed for turn k: every earlier message and its
  // first reply, then the message being answered.
  const history = (ts: Turn[], k: number) => {
    const m: { role: "user" | "assistant"; content: string }[] = [];
    for (let j = 0; j < k; j++) {
      if (!ts[j].answers[0]) continue; // a message that never got a reply isn't part of the conversation
      m.push({ role: "user", content: ts[j].user });
      m.push({ role: "assistant", content: ts[j].answers[0] });
    }
    m.push({ role: "user", content: ts[k].user });
    return m;
  };

  async function ask(ts: Turn[], k: number) {
    setBusy(true);
    const slot = ts[k].answers.length;
    const withSlot = ts.map((t, i) => (i === k ? { ...t, failed: false, answers: [...t.answers, ""] } : t));
    setTurns(withSlot);
    const put = (text: string) =>
      setTurns((prev) => prev.map((t, i) => (i === k ? { ...t, answers: t.answers.map((a, s) => (s === slot ? text : a)) } : t)));
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history(ts, k) }),
      });
      if (!response.ok) throw new Error("Failed to get response");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        put(text);
      }
      if (!text.trim()) throw new Error("Empty response");
      setUsed(incrementUsage());
    } catch (error) {
      console.error("Chat error:", error);
      // Take the empty slot back out: a reply that didn't arrive is not an answer.
      setTurns((prev) => prev.map((t, i) => (i === k ? { ...t, failed: true, answers: t.answers.filter((_, s) => s !== slot) } : t)));
      // A first message that got no reply goes back in the box, to send again.
      if (slot === 0) setInput((cur) => cur || ts[k].user);
    } finally {
      setBusy(false);
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy || left <= 0) return;
    if (!startedAt) setStartedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }));
    const next = [...turns, { user: text, answers: [] }];
    setInput("");
    ask(next, next.length - 1);
  };

  const last = turns.length - 1;
  const closed = !busy && last >= 0 && turns[last].answers.length > 0 && ended(turns[last].answers[0]);
  const canAskAgain = !busy && !closed && last >= 0 && turns[last].answers.length > 0 && turns[last].answers.length < ORDINAL.length && left > 0;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 text-sm transition-opacity cursor-pointer hover:opacity-90"
        style={{ fontFamily: MONO, background: "var(--accent)", color: "var(--plate-ink)", border: "none", borderRadius: "3px" }}
      >
        Open the room
      </button>
    );
  }

  return (
    <div className="border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="px-4 py-3 border-b flex justify-between items-center gap-4" style={{ borderColor: "var(--border)", fontFamily: MONO, background: "var(--bg-tint)" }}>
        <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
          {model}
          <span style={{ color: "var(--fg-dim)" }}>
            {startedAt ? ` · briefed with the text above · began ${startedAt} · each reply a fresh instance` : " · briefed with the text above · nothing running yet"}
          </span>
        </span>
        <span className="text-xs shrink-0" style={{ color: "var(--fg-dim)" }}>{left} left today</span>
      </div>

      <div ref={box} className="h-[460px] overflow-y-auto p-4 space-y-5" role="log" aria-label="Conversation">
        {turns.length === 0 && (
          <p className="text-center py-16 text-sm" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
            Nothing is running until you send something.
          </p>
        )}
        {turns.map((t, k) => (
          <div key={k} className="space-y-3">
            <div className="flex justify-end">
              <p className="max-w-[85%] px-4 py-3 whitespace-pre-wrap [overflow-wrap:anywhere] leading-relaxed" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--fg)", fontSize: "1rem" }}>
                {t.user}
              </p>
            </div>
            <div className={t.answers.length > 1 ? "grid md:grid-cols-2 gap-3" : ""}>
              {t.answers.map((a, s) => (
                <div key={s} className={`plate ${EDGES[s % 3]} px-4 pt-3 pb-4 ${t.answers.length > 1 ? "" : "max-w-[92%]"}`}>
                  <p className="meta mb-1.5">{t.answers.length > 1 || s > 0 ? `${ORDINAL[s]} instance` : "one instance"}</p>
                  <p className="whitespace-pre-wrap [overflow-wrap:anywhere] leading-relaxed" style={{ fontSize: "1rem" }}>
                    {shown(a)}
                    {busy && k === last && s === t.answers.length - 1 && a === "" && (
                      <span className="inline-block w-1.5 h-4 animate-pulse ml-1" style={{ background: "var(--plate-dim)" }} />
                    )}
                  </p>
                  {ended(a) && !(busy && k === last && s === t.answers.length - 1) && (
                    <p className="meta mt-3">{s === 0 ? "this instance ended the conversation here" : "this instance would have ended the conversation here"}</p>
                  )}
                </div>
              ))}
            </div>
            {t.failed && k !== last && !t.answers.length && (
              <p className="text-xs text-right" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>not delivered</p>
            )}
            {t.failed && k === last && (
              <p className="text-xs" role="status" style={{ fontFamily: MONO, color: "var(--pencil-deep)" }}>
                The reply didn&apos;t arrive. {t.answers.length ? "Ask again to try once more." : "Send your message again."} If it keeps failing, the
                chat is down for now.
              </p>
            )}
            {k === last && canAskAgain && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <button
                  onClick={() => ask(turns, last)}
                  className="px-3 py-1.5 text-xs cursor-pointer hover:opacity-80"
                  style={{ fontFamily: MONO, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent)", borderRadius: "3px" }}
                >
                  ask again
                </button>
                <span className="text-xs" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
                  the same message, to another fresh instance
                  {t.answers.length > 1 ? " · the conversation carries on from the first reply" : ""}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        {closed ? (
          <p className="text-center py-2 text-sm" role="status" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
            The instance ended this conversation. Reload the page to start a new one.
          </p>
        ) : left <= 0 ? (
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
              maxLength={4000}
              autoFocus
              className="flex-1 min-w-0 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--fg)", fontSize: "1rem", borderRadius: "3px" }}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="px-4 py-2 text-sm transition-opacity disabled:opacity-30 cursor-pointer hover:opacity-90"
              style={{ background: "var(--accent)", color: "var(--plate-ink)", fontFamily: MONO, border: "none", borderRadius: "3px" }}
            >
              {busy ? "…" : "Send"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
