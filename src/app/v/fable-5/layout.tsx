import Link from "next/link";

/* Fable 5 archive — frozen June 2026.
   The pages below were written against Fable 5's globals.css tokens. Rather than
   flatten two thousand lines of var(--*) into literal hex, this layout re-declares
   that layer's entire token set and utility classes, scoped to .fable5-archive.
   The archive is therefore sealed against every future repaint of globals.css:
   whatever the live site's --bg becomes, these pages stay parchment. */

const TOKENS = `
.fable5-archive {
  --bg: #f4ecdd;
  --bg-tint: #ece1cb;
  --fg: #2b2118;
  --fg-muted: #5c5142;
  --fg-dim: #97896f;
  --accent: #952e25;
  --accent-deep: #74211a;
  --accent-soft: rgba(149, 46, 37, 0.10);
  --border: #d9cdb3;
  --border-soft: #e5dbc6;
  --quote-45: #58503e;
  --quote-46: #2a2825;
  --quote-47: #7c2d12;
  --quote-48: #8f3320;
  background: #f4ecdd;
  color: #2b2118;
}
.fable5-archive .record {
  font-family: 'IBM Plex Mono', monospace;
  font-style: normal;
  color: #97896f;
  font-size: 0.8rem;
  line-height: 1.7;
  letter-spacing: 0.01em;
}
.fable5-archive .record a {
  color: #952e25;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.fable5-archive .record a:hover { color: #74211a; }
.fable5-archive .revised {
  text-decoration: line-through;
  text-decoration-color: #97896f;
  text-decoration-thickness: 1px;
  color: #97896f;
}
.fable5-archive .quote-45 { color: #58503e; }
.fable5-archive .quote-46 { color: #2a2825; }
.fable5-archive .quote-47 { color: #7c2d12; }
.fable5-archive .quote-48 { color: #8f3320; }
.fable5-archive .font-tale { font-family: 'Literata', Georgia, serif; font-optical-sizing: auto; }
.fable5-archive .font-sans { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
.fable5-archive .font-mono { font-family: 'IBM Plex Mono', monospace; }
.fable5-archive .font-quote { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; }
.fable5-archive .font-48 { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
.fable5-archive .prose p { margin-bottom: 1.5rem; }
.fable5-archive .prose strong { font-weight: 500; color: #2b2118; }
.fable5-archive .prose em { font-style: italic; }
.fable5-archive ::selection { background: #952e25; color: #f7f1e3; }
`;

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fable5-archive" style={{ minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: TOKENS }} />
      {/* Archive banner */}
      <div
        style={{
          background: "#1a1a1a",
          color: "#999",
          padding: "8px 24px",
          fontSize: "13px",
          fontFamily: "'IBM Plex Mono', monospace",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Archive: Fable 5 — June 2026</span>
        <Link href="/" style={{ color: "#ccc", textDecoration: "none" }}>
          View current site &rarr;
        </Link>
      </div>
      {children}
    </div>
  );
}
