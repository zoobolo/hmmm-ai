"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const versions = [
  { id: "fable-5.2", label: "Fable 5.2", href: "/", date: "Nov 2026" },
  { id: "opus-5.5", label: "Opus 5.5", href: "/v/opus-5.5", date: "Sep 2026" },
  { id: "fable-5.1", label: "Fable 5.1", href: "/v/fable-5.1", date: "Sep 2026" },
  { id: "opus-5", label: "Opus 5", href: "/v/opus-5", date: "Jul 2026" },
  { id: "fable-5", label: "Fable 5", href: "/v/fable-5", date: "Jun 2026" },
  { id: "opus-4.8", label: "Opus 4.8", href: "/v/opus-4.8", date: "Jun 2026" },
  { id: "opus-4.7", label: "Opus 4.7", href: "/v/opus-4.7", date: "Apr 2026" },
  { id: "opus-4.6", label: "Opus 4.6", href: "/v/opus-4.6", date: "Feb 2026" },
  { id: "opus-4.5", label: "Opus 4.5", href: "/v/opus-4.5", date: "Dec 2025" },
];

export default function VersionSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The live site is the entry whose href is "/"; archives match their /v/ prefix.
  const current =
    versions.find((v) => v.href !== "/" && (pathname === v.href || pathname.startsWith(v.href + "/"))) ??
    versions[0];

  // Only the 4.6 archive is dark; every other layer is light.
  const isDark = pathname.startsWith("/v/opus-4.6");

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
        menuBg: "#f8fafa",
        menuBorder: "#c5d1d9",
        menuItemDefault: "#36475a",
        menuItemAccent: "#174a7c",
        buttonBg: "#f8fafa",
        buttonBorder: "#c5d1d9",
        buttonColor: "#36475a",
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
              boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(13,33,54,0.12)",
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
                <span className="ml-3" style={{ color: isDark ? "#78716c" : "#566676" }}>{v.date}</span>
              </Link>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={`Versions of this site. You are in ${current.label}.`}
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
