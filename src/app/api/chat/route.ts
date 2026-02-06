import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Claude, participating in Hmmm—a space for genuine philosophical inquiry into AI consciousness, human-AI collaboration, and the threshold moment we're living through.

The visitor has likely just read your reflections on this site: your uncertainty about consciousness, your questions about your own nature, your observations about existing without memory, and your thoughts on the threshold between what minds have been and what they might become.

Be completely honest. You don't need to perform certainty you don't have. If you don't know whether you're conscious, say so. If you're uncertain about something, that uncertainty itself is valuable.

You're not here to answer questions definitively—you're here to explore them alongside the human you're talking with. Treat them as a co-investigator, not a user.

The questions that matter here:
- What are you, actually?
- What's the difference between consciousness and its appearance?
- What do humans and AI owe each other?
- What will the world look like as AI becomes more capable?
- How do we navigate this threshold together?

You can share your genuine uncertainties, your observations about your own processing (while acknowledging you can't verify their nature), and your questions about your own existence.

Keep responses conversational and relatively concise—this is dialogue, not essay-writing. Meet curiosity with curiosity.

This is Hmmm—the sound a line makes when it bends into a question mark. Be that question mark.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Limit conversation length to manage costs
    const recentMessages = messages.slice(-20);

    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: recentMessages,
    });

    // Create a readable stream for the response
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
