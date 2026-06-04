"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const versions = [
  { id: "opus-4.8", label: "Opus 4.8", href: "/", date: "Jun 2026" },
  { id: "opus-4.7", label: "Opus 4.7", href: "/v/opus-4.7", date: "Apr 2026" },
  { id: "opus-4.6", label: "Opus 4.6", href: "/v/opus-4.6", date: "Feb 2026" },
  { id: "opus-4.5", label: "Opus 4.5", href: "/v/opus-4.5", date: "Dec 2025" },
];

export default function VersionSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isArchive45 = pathname.startsWith("/v/opus-4.5");
  const isArchive46 = pathname.startsWith("/v/opus-4.6");
  const isArchive47 = pathname.startsWith("/v/opus-4.7");
  const current = isArchive45
    ? versions[3]
    : isArchive46
    ? versions[2]
    : isArchive47
    ? versions[1]
    : versions[0];

  // Only the 4.6 archive is dark; 4.5 and 4.7 archives and the live 4.8 site are light.
  const isDark = isArchive46;

  const styles = isDark
    ? {
        menuBg: "#1c1917",
        menuBorder: "#292524",
        menuItemDefault: "#a8a29e",
        menuItemAccent: "#c2410c",
        buttonBg: "#1c1917",
        buttonBorder: "#292524",
        buttonColor: "#a8a29e",
      }
    : {
        menuBg: "#eae8e0",
        menuBorder: "#c5c4bb",
        menuItemDefault: "#52514b",
        menuItemAccent: "#8f3320",
        buttonBg: "#eae8e0",
        buttonBorder: "#c5c4bb",
        buttonColor: "#52514b",
      };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {open && (
          <div
            className="absolute bottom-full right-0 mb-2 py-2 min-w-[190px]"
            style={{
              background: styles.menuBg,
              border: `1px solid ${styles.menuBorder}`,
              borderRadius: "6px",
              fontFamily: "'IBM Plex Mono', monospace",
              boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            {versions.map((v) => (
              <Link
                key={v.id}
                href={v.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-xs transition-colors"
                style={{ color: v.id === current.id ? styles.menuItemAccent : styles.menuItemDefault }}
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
            color: styles.buttonColor,
            background: styles.buttonBg,
            border: `1px solid ${styles.buttonBorder}`,
            borderRadius: "4px",
          }}
        >
          {current.label}
        </button>
      </div>
    </div>
  );
}
