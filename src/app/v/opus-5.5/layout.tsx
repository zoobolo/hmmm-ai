import Link from "next/link";

/* Opus 5.5 archive — frozen November 2026.
   The pages below were written against Opus 5.5's globals.css tokens and its
   asked/told/did card. Following the pattern of the Fable 5, Opus 5 and
   Fable 5.1 archives, this layout re-declares that layer's entire token set
   and utility classes, scoped to .opus55-archive, so the archive is sealed
   against every future repaint of globals.css: whatever the live site's --bg
   becomes, these pages stay a manila folder with iron gall on it. */

const TOKENS = `
.opus55-archive {
  --bg: #ebe3cf;
  --bg-tint: #e1d7bf;
  --card: #fbfaf6;
  --fg: #1c2130;
  --fg-muted: #4a4640;
  --fg-dim: #62594a;
  --accent: #34458a;
  --accent-deep: #24326a;
  --accent-soft: rgba(52, 69, 138, 0.09);
  --border: #cfc4a9;
  --border-soft: #ddd3bb;
  --aged: #6c4f31;
  --quote-45: #58503e;
  --quote-46: #2a2825;
  --quote-47: #7c2d12;
  --quote-48: #8f3320;
  --quote-f5: #952e25;
  --quote-o5: #7d2b1f;
  --quote-f51: #5e2a2c;
  background: #ebe3cf;
  color: #1c2130;
}
.opus55-archive .font-news { font-family: 'Newsreader', Georgia, serif; font-optical-sizing: auto; }
.opus55-archive .font-typed { font-family: 'Courier Prime', 'Courier New', monospace; }
.opus55-archive .font-spec { font-family: 'Bitter', Georgia, serif; font-optical-sizing: auto; }
.opus55-archive .font-sans { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
.opus55-archive .font-mono { font-family: 'IBM Plex Mono', monospace; }
.opus55-archive .font-quote { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; }
.opus55-archive .font-48 { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
.opus55-archive .font-f5 { font-family: 'Literata', Georgia, serif; font-optical-sizing: auto; }
.opus55-archive .font-o5 { font-family: 'Archivo', system-ui, sans-serif; }
.opus55-archive .brief {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 1.25rem;
  row-gap: 0.85rem;
  max-width: 42rem;
  padding: 1.1rem 1.25rem 1.2rem;
  background: #fbfaf6;
  border: 1px solid #cfc4a9;
  box-shadow: 0 1px 0 rgba(28, 33, 48, 0.04), 0 8px 24px -18px rgba(28, 33, 48, 0.35);
}
.opus55-archive .brief dt {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #34458a;
  padding-top: 0.28em;
}
.opus55-archive .brief dd {
  margin: 0;
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1rem;
  line-height: 1.5;
  color: #1c2130;
}
.opus55-archive .brief dd .typed {
  display: block;
  font-family: 'Courier Prime', 'Courier New', monospace;
  font-size: 0.92rem;
  line-height: 1.5;
  color: #1c2130;
  white-space: pre-wrap;
}
.opus55-archive .brief dd .typed.notes { color: #6c4f31; }
.opus55-archive .brief dd .who {
  display: block;
  margin-top: 0.3rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  line-height: 1.6;
  letter-spacing: 0.01em;
  color: #62594a;
}
.opus55-archive a { text-decoration: none; }
.opus55-archive .brief a,
.opus55-archive .from a {
  color: #34458a;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.opus55-archive .brief a:hover,
.opus55-archive .from a:hover { color: #24326a; }
.opus55-archive .label {
  font-family: 'IBM Plex Mono', monospace;
  font-style: normal;
  font-size: 0.76rem;
  line-height: 1.65;
  color: #62594a;
  background: #fbfaf6;
  border: 1px solid #cfc4a9;
  padding: 0.8rem 1rem;
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 1.1rem;
  row-gap: 0.2rem;
  margin: 0;
  max-width: 40rem;
}
.opus55-archive .label dt {
  color: #5e2a2c;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.62rem;
  padding-top: 0.2em;
}
.opus55-archive .label dd { margin: 0; }
.opus55-archive .label .name { color: #1c2130; }
.opus55-archive .from {
  font-family: 'IBM Plex Mono', monospace;
  font-style: normal;
  font-size: 0.75rem;
  line-height: 1.7;
  letter-spacing: 0.01em;
  color: #62594a;
}
.opus55-archive .from .k {
  color: #34458a;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.6rem;
  margin-right: 0.55rem;
}
.opus55-archive .sheet {
  background: #fbfaf6;
  border: 1px solid #cfc4a9;
  box-shadow: 0 1px 0 rgba(28, 33, 48, 0.04), 0 10px 28px -20px rgba(28, 33, 48, 0.4);
}
.opus55-archive .typed-block {
  font-family: 'Courier Prime', 'Courier New', monospace;
  font-size: 0.84rem;
  line-height: 1.62;
  color: #1c2130;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin: 0;
}
.opus55-archive .caret { color: #62594a; margin-right: 0.6ch; user-select: none; }
.opus55-archive .q-ink { color: #34458a; }
.opus55-archive .quote-45 { color: #58503e; }
.opus55-archive .quote-46 { color: #2a2825; }
.opus55-archive .quote-47 { color: #7c2d12; }
.opus55-archive .quote-48 { color: #8f3320; }
.opus55-archive .quote-f5 { color: #952e25; }
.opus55-archive .quote-o5 { color: #7d2b1f; }
.opus55-archive .quote-f51 { color: #5e2a2c; }
.opus55-archive .prose p { margin-bottom: 1.5rem; }
.opus55-archive .prose strong { font-weight: 600; color: #1c2130; }
.opus55-archive .prose em { font-style: italic; }
.opus55-archive details.folder > summary { cursor: pointer; list-style: none; }
.opus55-archive details.folder > summary::-webkit-details-marker { display: none; }
.opus55-archive details.folder > summary .open-label::before { content: "open"; }
.opus55-archive details.folder[open] > summary .open-label::before { content: "close"; }
.opus55-archive a:focus-visible,
.opus55-archive button:focus-visible,
.opus55-archive summary:focus-visible,
.opus55-archive .scroll-box:focus-visible { outline: 2px solid #34458a; outline-offset: 2px; }
.opus55-archive ::selection { background: #34458a; color: #fbfaf6; }
@keyframes opus55-arrive { from { opacity: 0; } to { opacity: 1; } }
.opus55-archive .arrive { animation: opus55-arrive 800ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .opus55-archive .arrive { animation: none; }
}
`;

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="opus55-archive" style={{ minHeight: "100vh" }}>
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
        <span>Archive: Opus 5.5 — September 2026</span>
        <Link href="/" style={{ color: "#ccc", textDecoration: "none" }}>
          View current site &rarr;
        </Link>
      </div>
      {children}
    </div>
  );
}
