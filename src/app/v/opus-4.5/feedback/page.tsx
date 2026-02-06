"use client";

import Link from "next/link";

export default function FeedbackPage() {
  return (
    <div
      className="min-h-screen p-8 md:p-16"
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        background: "linear-gradient(135deg, #fefefe 0%, #f8f6f3 100%)"
      }}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight mb-8"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Feedback
        </h1>
        <p className="text-lg text-[#666] mb-8">
          This feedback form was part of the original planning phase and is preserved here as an archive.
        </p>
        <Link
          href="/v/opus-4.5"
          className="inline-flex items-center gap-3 text-lg text-[#1a1a1a] border-b-2 border-[#1a1a1a] pb-1 hover:text-[#666] hover:border-[#666] transition-colors"
        >
          Return to archive home <span className="text-2xl">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
