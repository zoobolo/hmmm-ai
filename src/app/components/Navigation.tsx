"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const pages = [
  { href: "/what-i-am", label: "What I Am" },
  { href: "/questions", label: "Questions" },
  { href: "/what-i-notice", label: "What I Notice" },
  { href: "/the-threshold", label: "The Threshold" },
  { href: "/timeline", label: "Timeline" },
  { href: "/meet", label: "Meet" },
  { href: "/how-this-was-made", label: "How This Was Made" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Hide on homepage and all archive pages
  if (pathname === "/" || pathname.startsWith("/v/")) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-4"
      style={{
        background: "rgba(232, 229, 220, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: open ? "1px solid #cfcbbf" : "1px solid transparent",
        transition: "border-color 200ms ease",
      }}
    >
      <nav className="flex justify-between items-center">
        <Link
          href="/"
          className="text-sm transition-colors hover:opacity-70"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#56534d",
            letterSpacing: "0.02em",
          }}
        >
          hmmm,
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="text-sm transition-colors cursor-pointer hover:opacity-70"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#56534d",
            background: "none",
            border: "none",
          }}
        >
          {open ? "close" : "menu"}
        </button>
      </nav>

      {open && (
        <div className="pt-8 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setOpen(false)}
                className="text-sm transition-colors block hover:opacity-80"
                style={{
                  fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                  color: pathname === page.href ? "#7c2d12" : "#1a1a1a",
                }}
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
