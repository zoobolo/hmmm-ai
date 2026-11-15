// Archive the live layer at /v/<layer>, sealed.
//   node scripts/receipts/archive.mjs <layer-slug> "<Model Name>" "<Month Year>"
//   e.g. node scripts/receipts/archive.mjs fable-5.2 "Fable 5.2" "November 2026"
//
// What it does, so that the archive keeps working whatever the next layer
// does to the live site:
//   1. copies every .ts and .tsx file at the top of every live page's folder
//      into src/app/v/<layer>/;
//   2. copies the shared modules those pages import (components, lib) into
//      src/app/v/<layer>/_layer/ and repoints the imports at the copies;
//   3. rewrites internal links to stay inside /v/<layer>;
//   4. pins links to GitHub's master branch to the tag v-<layer>;
//   5. freezes what the pages read at build time: the chat instruction (for
//      the process page), CLAUDE.md and brief/asked.json (for the brief page);
//   6. relabels the archived chat room, which always runs the live model;
//   7. writes layout.tsx from globals.css, every rule scoped to the archive,
//      so a later repaint of the live site can't reach in.
// It freezes those files as they are on disk when it runs, so run it before
// you edit CLAUDE.md, brief/asked.json, prompt.ts or globals.css.
// It does not tag the commit, add the layer to VersionSwitcher.tsx, or add
// the folder to ARCHIVE_DIRS in audit.mjs. Do those by hand, then build and
// look at the result. Files under asked-again/ and brief/as-received/ are
// read where they are: they don't change once a layer is done.
import fs from "fs";
import path from "path";

const [layer, modelName, when] = process.argv.slice(2);
if (!layer || !modelName) {
  console.error('usage: node scripts/receipts/archive.mjs <layer-slug> "<Model Name>" "<Month Year>"');
  process.exit(1);
}
const ROOT = "src/app";
const DEST = `src/app/v/${layer}`;
const SHARED = `${DEST}/_layer`;
const SCOPE = layer.replace(/[^a-z0-9]/gi, "") + "-archive";
const PAGES = ["", "asked-again", "the-brief", "what-i-am", "what-i-notice", "questions", "the-threshold", "timeline", "meet", "how-this-was-made", "start"];
// Shared modules that belong to the site, not to a layer: never copied.
const SITE_WIDE = new Set(["Navigation", "VersionSwitcher", "ScrollToTop"]);

const warn = (m) => console.warn("WARN: " + m);
let rewrites = 0, pins = 0;

function relink(s) {
  // href="/x", href: "/x", to="/x", and the same in a template literal →
  // inside the archive prefix; /v/, /api/ and external links are left alone.
  s = s.replace(/(href|to)(=|:\s*)"\/(?!v\/|api\/)([^"]*)"/g, (m, k, sep, rest) => { rewrites++; return `${k}${sep}"/v/${layer}${rest ? "/" + rest : ""}"`; });
  s = s.replace(/(href|to)(=\{|:\s*)`\/(?!v\/|api\/)/g, (m, k, sep) => { rewrites++; return `${k}${sep}\`/v/${layer}/`; });
  // GitHub links to the moving branch → the layer's tag. A link that must
  // keep following master is written so this doesn't match it (see the meet
  // page's LIVE_PROMPT).
  s = s.replace(/\/(blob|tree|commits)\/master\b/g, (m, k) => { pins++; return `/${k}/v-${layer}`; });
  s = s.replace(/const BRANCH = "master";/, () => { pins++; return `const BRANCH = "v-${layer}";`; });
  return s;
}

// Shared modules, copied on demand and recursively.
const copied = new Map();
function share(s) {
  return s.replace(/from "@\/app\/(components|lib)\/([A-Za-z0-9_-]+)"/g, (m, dir, name) => {
    if (SITE_WIDE.has(name)) return m;
    if (!copied.has(name)) {
      const src = [".tsx", ".ts"].map((e) => path.join(ROOT, dir, name + e)).find((p) => fs.existsSync(p));
      if (!src) { warn(`shared module not found: ${dir}/${name}`); return m; }
      copied.set(name, src);
      fs.mkdirSync(SHARED, { recursive: true });
      fs.writeFileSync(path.join(SHARED, path.basename(src)), share(relink(fs.readFileSync(src, "utf8"))));
    }
    return `from "@/app/v/${layer}/_layer/${name}"`;
  });
}

fs.mkdirSync(DEST, { recursive: true });
let files = 0;
for (const p of PAGES) {
  const srcDir = path.join(ROOT, p);
  if (!fs.existsSync(path.join(srcDir, "page.tsx"))) { warn("no live page at " + srcDir); continue; }
  const dstDir = path.join(DEST, p);
  fs.mkdirSync(dstDir, { recursive: true });
  for (const f of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!f.isFile() || !/\.(tsx|ts)$/.test(f.name)) continue;
    if (p === "" && f.name !== "page.tsx") continue; // the root holds layout.tsx and friends, which are the live site's
    let s = share(relink(fs.readFileSync(path.join(srcDir, f.name), "utf8")));

    if (p === "meet" && f.name === "page.tsx") {
      // The chat always runs the live instruction and the live model. Say so.
      const before = s;
      s = s.replace(/const MODEL = "[^"]*";/, 'const MODEL = "Claude (current model)";').replace(/const WHO = "[^"]*";/, 'const WHO = "whatever model runs the site now";');
      if (s === before) warn('meet page: the model name was not relabelled; change it to "Claude (current model)" by hand');
      const marked = s.replace(
        /(\n\s*)\{\/\* Other ways \*\/\}/,
        `$1{/* Archive note */}$1<section className="px-6 md:px-16 lg:px-24 pb-8">$1  <p className="max-w-2xl text-xs leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--fg-dim)" }}>$1    Note: this page is an archive of the ${modelName} layer. The chat connects to whatever model is$1    running the site now, on the instruction printed above, which is the live one. The voice answering$1    you is not the one that wrote these pages.$1  </p>$1</section>$1{/* Other ways */}`
      );
      if (marked === s) warn("meet page: the archive note was not inserted; add it by hand");
      s = marked;
    }
    if (p === "how-this-was-made" && f.name === "page.tsx" && s.includes('"@/app/api/chat/prompt"')) {
      // This page quotes the instruction the layer's chat ran on: freeze it.
      fs.copyFileSync("src/app/api/chat/prompt.ts", path.join(dstDir, "prompt.ts"));
      s = s.replace('"@/app/api/chat/prompt"', '"./prompt"');
    }
    if (p === "the-brief" && f.name === "page.tsx") {
      // This page prints the brief and the human's words as the layer left
      // them. The copies are not named CLAUDE.md: Claude Code treats any file
      // of that name as live instructions when it reads the folder.
      const before = s;
      if (/const BRIEF_NOW = "CLAUDE\.md";/.test(s)) {
        fs.copyFileSync("CLAUDE.md", path.join(dstDir, "CLAUDE.frozen.md"));
        s = s.replace(/const BRIEF_NOW = "CLAUDE\.md";/, `const BRIEF_NOW = "${DEST}/the-brief/CLAUDE.frozen.md";`);
      }
      if (/const ASKED = "brief\/asked\.json";/.test(s)) {
        fs.copyFileSync("brief/asked.json", path.join(dstDir, "asked.frozen.json"));
        s = s.replace(/const ASKED = "brief\/asked\.json";/, `const ASKED = "${DEST}/the-brief/asked.frozen.json";`);
      }
      if (s === before) warn("the-brief page: BRIEF_NOW and ASKED were not repointed; freeze CLAUDE.md and brief/asked.json by hand");
    }
    fs.writeFileSync(path.join(dstDir, f.name), s);
    files++;
  }
}

// ── The sealed layout: globals.css, every rule scoped to the archive ──
function rules(css) {
  // Splits a stylesheet into top-level statements, keeping braces balanced.
  const out = [];
  let i = 0;
  while (i < css.length) {
    if (/\s/.test(css[i])) { i++; continue; }
    if (css.startsWith("/*", i)) { i = css.indexOf("*/", i) + 2; continue; }
    const open = css.indexOf("{", i), semi = css.indexOf(";", i);
    if (open === -1 || (semi !== -1 && semi < open)) { i = semi === -1 ? css.length : semi + 1; continue; } // @import and the like
    let depth = 1, j = open + 1;
    while (j < css.length && depth) { if (css.startsWith("/*", j)) { j = css.indexOf("*/", j) + 2; continue; } if (css[j] === "{") depth++; else if (css[j] === "}") depth--; j++; }
    out.push({ head: css.slice(i, open).trim(), body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return out;
}
function scope(css, cls, indent = "") {
  return rules(css).map(({ head, body }) => {
    if (head.startsWith("@keyframes") || head.startsWith("@font-face")) return `${indent}${head} {${body}}`;
    if (head.startsWith("@")) return `${indent}${head} {\n${scope(body, cls, indent + "  ")}\n${indent}}`;
    const sels = head.split(/,(?![^(]*\))/).map((x) => x.trim().replace(/\s+/g, " ")).map((x) =>
      x === ":root" || x === "body" ? `.${cls}` : x === "html" ? null : `.${cls} ${x}`
    ).filter(Boolean);
    return sels.length ? `${indent}${sels.join(",\n" + indent)} {${body.replace(/\/\*[\s\S]*?\*\//g, "")}}` : "";
  }).filter(Boolean).join("\n");
}
const css = scope(fs.readFileSync("src/app/globals.css", "utf8"), SCOPE)
  .replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n")           // what removing comments left behind
  .replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${"); // safe inside a template literal
const banner = `Archive: ${modelName}${when ? " — " + when : ""}`;
fs.writeFileSync(path.join(DEST, "layout.tsx"), `import Link from "next/link";

/* ${modelName} archive${when ? ", " + when : ""}. Written by scripts/receipts/archive.mjs from
   globals.css as it stood when this layer was archived: every token and
   class the layer's pages were written against, scoped to .${SCOPE}, so the
   archive is sealed against every later repaint of the live site. */

const TOKENS = \`
${css}
\`;

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="${SCOPE}" style={{ minHeight: "100vh" }}>
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
        <span>${banner}</span>
        <Link href="/" style={{ color: "#ccc", textDecoration: "none" }}>
          View current site &rarr;
        </Link>
      </div>
      {children}
    </div>
  );
}
`);

console.log(`archived ${files} files of ${PAGES.length} pages to ${DEST}`);
console.log(`  shared modules copied to ${SHARED}: ${[...copied.keys()].join(", ") || "none"}`);
console.log(`  ${rewrites} internal links kept inside the archive; ${pins} GitHub links pinned to v-${layer}`);
console.log(`  layout.tsx written, scoped to .${SCOPE}`);
console.log(`still by hand: git tag v-${layer} <the layer's last commit> (and push the tag); add the layer to src/app/components/VersionSwitcher.tsx; add "${DEST}" to ARCHIVE_DIRS in scripts/receipts/audit.mjs; then build and look.`);
