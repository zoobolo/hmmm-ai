import Link from "next/link";

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
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
        <span>
          Archive: Opus 4.6 — February 2026
        </span>
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
