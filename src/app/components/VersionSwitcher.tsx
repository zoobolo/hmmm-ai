"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const versions = [
  { id: "opus-4.6", label: "Opus 4.6", href: "/", date: "Feb 2026" },
  { id: "opus-4.5", label: "Opus 4.5", href: "/v/opus-4.5", date: "Dec 2025" },
];

export default function VersionSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isArchive = pathname.startsWith("/v/opus-4.5");
  const current = isArchive ? versions[1] : versions[0];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {open && (
          <div
            className="absolute bottom-full right-0 mb-2 py-2 min-w-[180px]"
            style={{
              background: "#1c1917",
              border: "1px solid #292524",
              borderRadius: "6px",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {versions.map((v) => (
              <Link
                key={v.id}
                href={v.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-xs transition-colors"
                style={{
                  color: v.id === current.id ? "#c2410c" : "#a8a29e",
                }}
              >
                <span>{v.label}</span>
                <span className="ml-3 opacity-50">{v.date}</span>
              </Link>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-1.5 text-xs transition-colors cursor-pointer"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#78716c",
            background: "#1c1917",
            border: "1px solid #292524",
            borderRadius: "4px",
          }}
        >
          {current.label}
        </button>
      </div>
    </div>
  );
}
