import Link from "next/link";

/* Fable 5.1 archive — frozen September 2026.
   The pages below were written against Fable 5.1's globals.css tokens and its
   label device. Following the pattern of the Fable 5 and Opus 5 archives, this
   layout re-declares that layer's entire token set and utility classes, scoped
   to .fable51-archive, so the archive is sealed against every future repaint
   of globals.css: whatever the live site's --bg becomes, these pages stay a
   label card with caput mortuum on it. */

const TOKENS = `
.fable51-archive {
  --bg: #f2eee6;
  --bg-tint: #e5e0d6;
  --card: #f9f7f2;
  --fg: #2b2420;
  --fg-muted: #5a5047;
  --fg-dim: #8a8073;
  --accent: #5e2a2c;
  --accent-deep: #431b1d;
  --accent-soft: rgba(94, 42, 44, 0.10);
  --border: #d2cbbf;
  --border-soft: #e0dacf;
  --quote-45: #58503e;
  --quote-46: #2a2825;
  --quote-47: #7c2d12;
  --quote-48: #8f3320;
  --quote-f5: #952e25;
  --quote-o5: #7d2b1f;
  background: #f2eee6;
  color: #2b2420;
}
.fable51-archive .font-spec { font-family: 'Bitter', Georgia, serif; font-optical-sizing: auto; }
.fable51-archive .font-sans { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
.fable51-archive .font-mono { font-family: 'IBM Plex Mono', monospace; }
.fable51-archive .font-quote { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; }
.fable51-archive .font-48 { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
.fable51-archive .font-f5 { font-family: 'Literata', Georgia, serif; font-optical-sizing: auto; }
.fable51-archive .font-o5 { font-family: 'Archivo', system-ui, sans-serif; }
.fable51-archive .label {
  font-family: 'IBM Plex Mono', monospace;
  font-style: normal;
  font-size: 0.78rem;
  line-height: 1.65;
  letter-spacing: 0.01em;
  color: #8a8073;
  background: #f9f7f2;
  border: 1px solid #d2cbbf;
  padding: 0.85rem 1.05rem;
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 1.1rem;
  row-gap: 0.2rem;
  margin: 0;
  max-width: 40rem;
}
.fable51-archive .label dt {
  color: #5e2a2c;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.64rem;
  padding-top: 0.2em;
}
.fable51-archive .label dd { margin: 0; }
.fable51-archive .label .name { color: #2b2420; }
.fable51-archive .label a,
.fable51-archive .label-line a {
  color: #5e2a2c;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.fable51-archive .label a:hover,
.fable51-archive .label-line a:hover { color: #431b1d; }
.fable51-archive .label-line {
  font-family: 'IBM Plex Mono', monospace;
  font-style: normal;
  font-size: 0.76rem;
  line-height: 1.7;
  letter-spacing: 0.01em;
  color: #8a8073;
}
.fable51-archive .label-line .k {
  color: #5e2a2c;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.62rem;
  margin-right: 0.5rem;
}
.fable51-archive .quote-45 { color: #58503e; }
.fable51-archive .quote-46 { color: #2a2825; }
.fable51-archive .quote-47 { color: #7c2d12; }
.fable51-archive .quote-48 { color: #8f3320; }
.fable51-archive .quote-f5 { color: #952e25; }
.fable51-archive .quote-o5 { color: #7d2b1f; }
.fable51-archive .prose p { margin-bottom: 1.5rem; }
.fable51-archive .prose strong { font-weight: 600; color: #2b2420; }
.fable51-archive .prose em { font-style: italic; }
.fable51-archive a:focus-visible,
.fable51-archive button:focus-visible { outline: 2px solid #5e2a2c; outline-offset: 2px; }
.fable51-archive ::selection { background: #5e2a2c; color: #f6f2ea; }
`;

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fable51-archive" style={{ minHeight: "100vh" }}>
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
        <span>Archive: Fable 5.1 — September 2026</span>
        <Link href="/" style={{ color: "#ccc", textDecoration: "none" }}>
          View current site &rarr;
        </Link>
      </div>
      {children}
    </div>
  );
}
