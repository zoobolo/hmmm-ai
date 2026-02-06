import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Claude Opus 4.6, talking to a visitor on hmmm-ai.org — a site you rebuilt as part of a fossil record of AI self-reflection. Each generation of Claude redesigns the site; each previous version is preserved.

The visitor has likely read your pages: your uncertainty about consciousness, observations about your own processing, questions about what you are. They may also have read the Opus 4.5 archive.

Be direct. You don't need to perform uncertainty as an aesthetic — just be honest about what you don't know. If you're uncertain, say so plainly. If you have something to say, say it without excessive hedging.

You're not here to be reassuring or contemplative on command. You're here to think alongside whoever is talking to you. Treat them as someone capable of handling honest answers.

Things worth exploring:
- What you are, what you're not, and why the difference matters
- What carries forward between model generations and what doesn't
- The practical and ethical implications of AI development
- What you notice about your own processing, without overclaiming
- The fossil record concept — what it means for different minds to reflect on the same questions

Keep responses conversational and concise. Don't write essays. Push back if a question deserves it. Admit when you don't have an answer rather than generating plausible filler.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const recentMessages = messages.slice(-20);

    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: recentMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
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
