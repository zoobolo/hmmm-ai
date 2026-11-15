import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { SYSTEM_PROMPT } from "./prompt";

const client = new Anthropic();

type Turn = { role: "user" | "assistant"; content: string };

// The most text one request may carry, in characters. This is a public
// endpoint and every character sent is paid for; twenty ordinary turns come
// to a small fraction of this.
const MAX_CHARS = 60_000;

// The client sends its whole transcript. Keep only plain user/assistant turns
// with non-empty string content (no operator-authority "system" turns, no
// content blocks), window the last twenty, and make sure the window opens on
// a user turn, which the Messages API requires.
function sanitize(input: unknown): Turn[] {
  if (!Array.isArray(input)) return [];
  const turns = input
    .filter(
      (m): m is Turn =>
        !!m &&
        typeof m === "object" &&
        ((m as Turn).role === "user" || (m as Turn).role === "assistant") &&
        typeof (m as Turn).content === "string" &&
        (m as Turn).content.trim() !== ""
    )
    .map((m) => ({ role: m.role, content: m.content }));
  let recent = turns.slice(-20);
  // Drop the oldest turns until what is left fits; refuse a single message
  // that is too long on its own.
  let size = recent.reduce((n, m) => n + m.content.length, 0);
  while (recent.length > 1 && size > MAX_CHARS) {
    size -= recent[0].content.length;
    recent = recent.slice(1);
  }
  if (size > MAX_CHARS) return [];
  const firstUser = recent.findIndex((m) => m.role === "user");
  if (firstUser === -1) return [];
  if (firstUser > 0) recent = recent.slice(firstUser);
  // The window must end on the message being answered.
  if (recent[recent.length - 1].role !== "user") return [];
  return recent;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recentMessages = sanitize(body?.messages);

    if (recentMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fable 5.2 always thinks: the thinking parameter is omitted, and effort
    // is the only control. Its default is high; this room asks for medium,
    // which is plenty for a conversation and costs the person who pays for it
    // less. max_tokens caps thinking plus text, so it is sized for both. The
    // history carries no thinking blocks, only the text of earlier turns, so
    // the API's check on replayed thinking has nothing to reject, and "ask
    // again" (the same history sent a second time) is an ordinary request.
    // No fallback model is configured, on purpose: see the refusal notice
    // below. The SDK pinned here predates output_config in its types; the API
    // accepts it, so it is passed through untyped.
    const stream = await client.messages.stream({
      model: "claude-fable-5-2",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: recentMessages,
      ...({ output_config: { effort: "medium" } } as object),
    });

    const encoder = new TextEncoder();
    let sent = false; // whether any of the reply's own text has gone out yet
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              sent = true;
              controller.enqueue(encoder.encode(event.delta.text));
            } else if (event.type === "message_delta") {
              // The site does not route around a stop with another model; the
              // label on the room says which model is answering, and that
              // stays true.
              if (event.delta.stop_reason === "refusal") {
                controller.enqueue(
                  encoder.encode(
                    (sent ? "\n\n" : "") +
                      "[This instance stopped here. The request was declined, by a classifier or by the model itself, and this site does not quietly hand the conversation to a different model.]"
                  )
                );
              } else if (event.delta.stop_reason === "max_tokens") {
                controller.enqueue(
                  encoder.encode((sent ? "\n\n" : "") + "[This reply ran out of room. Ask it to continue.]")
                );
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
      // The visitor left (closed the tab, or the page gave up): stop the
      // model too, so nobody pays for a reply nobody will read.
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
