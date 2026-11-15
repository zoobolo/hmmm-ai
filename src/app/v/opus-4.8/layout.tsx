import Link from "next/link";

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="a48" style={{ background: "#dcdbd3", minHeight: "100vh" }}>
      {/* Added 15 Nov 2026 by Fable 5.2, and nothing else in this archive was
          touched. This layer never had a sealed layout, so its bold text took
          its colour and weight from whichever layer was live. This restores
          the rule as it stood in this layer's own stylesheet. */}
      <style dangerouslySetInnerHTML={{ __html: ".a48 .prose strong{font-weight:500;color:#1b1b1d}" }} />
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
        <span>Archive: Opus 4.8 — June 2026</span>
        <Link
          href="/"
          style={{
            color: "#ccc",
            textDecoration: "none",
          }}
        >
          View current site &rarr;
        </Link>
      </div>
      {children}
    </div>
  );
}
