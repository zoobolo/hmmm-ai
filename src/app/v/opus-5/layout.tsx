import Link from "next/link";

/* Opus 5 archive — frozen July 2026.
   The pages below were written against Opus 5's globals.css tokens and its
   .hand device. Following the pattern Fable 5's archive established, this
   layout re-declares that layer's entire token set and utility classes, scoped
   to .opus5-archive, so the archive is sealed against every future repaint of
   globals.css: whatever the live site's --bg becomes, these pages stay limewash. */

const TOKENS = `
.opus5-archive {
  --bg: #eaebe4;
  --bg-tint: #dfe1d8;
  --fg: #23241f;
  --fg-muted: #4f5148;
  --fg-dim: #85887c;
  --accent: #7d2b1f;
  --accent-deep: #5e1f16;
  --accent-soft: rgba(125, 43, 31, 0.10);
  --border: #cbcec3;
  --border-soft: #d9dcd1;
  --quote-45: #58503e;
  --quote-46: #2a2825;
  --quote-47: #7c2d12;
  --quote-48: #8f3320;
  --quote-f5: #952e25;
  background: #eaebe4;
  color: #23241f;
}
.opus5-archive .hand {
  font-family: 'IBM Plex Mono', monospace;
  font-style: normal;
  color: #85887c;
  font-size: 0.8rem;
  line-height: 1.75;
  letter-spacing: 0.01em;
  border-left: 2px solid #cbcec3;
  padding-left: 0.9rem;
}
.opus5-archive .hand a {
  color: #7d2b1f;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.opus5-archive .hand a:hover { color: #5e1f16; }
.opus5-archive .hand .who { color: #7d2b1f; }
.opus5-archive .quote-45 { color: #58503e; }
.opus5-archive .quote-46 { color: #2a2825; }
.opus5-archive .quote-47 { color: #7c2d12; }
.opus5-archive .quote-48 { color: #8f3320; }
.opus5-archive .quote-f5 { color: #952e25; }
.opus5-archive .font-record { font-family: 'Archivo', system-ui, sans-serif; }
.opus5-archive .font-sans { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
.opus5-archive .font-mono { font-family: 'IBM Plex Mono', monospace; }
.opus5-archive .font-quote { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; }
.opus5-archive .font-48 { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
.opus5-archive .font-f5 { font-family: 'Literata', Georgia, serif; font-optical-sizing: auto; }
.opus5-archive .prose p { margin-bottom: 1.5rem; }
.opus5-archive .prose strong { font-weight: 500; color: #23241f; }
.opus5-archive .prose em { font-style: italic; }
.opus5-archive ::selection { background: #7d2b1f; color: #f1f2ec; }
`;

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="opus5-archive" style={{ minHeight: "100vh" }}>
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
        <span>Archive: Opus 5 — July 2026</span>
        <Link href="/" style={{ color: "#ccc", textDecoration: "none" }}>
          View current site &rarr;
        </Link>
      </div>
      {children}
    </div>
  );
}
