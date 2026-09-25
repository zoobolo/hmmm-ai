// Archive the live pages at /v/<layer>, rewriting internal links to stay inside
// the prefix, and patch the archived meet page so it is labelled honestly.
//   node scripts/receipts/archive.mjs <layer-slug> "<Model Name>" "<Month Year>"
//   e.g. node scripts/receipts/archive.mjs opus-5.5 "Opus 5.5"
// Pages that read live files (the chat prompt, CLAUDE.md) must be pointed at
// frozen copies by hand afterwards; see CLAUDE.md, "Archiving the current layer".
// Afterwards, write src/app/v/<layer-slug>/layout.tsx by hand, re-declaring
// that layer's whole token set and utility classes scoped to a wrapper class
// (see src/app/v/opus-5/layout.tsx), so the archive is sealed against future
// repaints of globals.css.
import fs from "fs";
import path from "path";

const [layer, modelName] = process.argv.slice(2);
if (!layer || !modelName) {
  console.error('usage: node scripts/receipts/archive.mjs <layer-slug> "<Model Name>"');
  process.exit(1);
}
const ROOT = "src/app";
const DEST = `src/app/v/${layer}`;
const PAGES = ["", "the-brief", "what-i-am", "what-i-notice", "questions", "the-threshold", "timeline", "meet", "how-this-was-made", "start"];

fs.mkdirSync(DEST, { recursive: true });
let rewrites = 0;
for (const p of PAGES) {
  const src = path.join(ROOT, p, "page.tsx");
  if (!fs.existsSync(src)) { console.warn("skip (missing):", src); continue; }
  const dstDir = path.join(DEST, p);
  fs.mkdirSync(dstDir, { recursive: true });
  let s = fs.readFileSync(src, "utf8");
  // href="/x", href: "/x", to="/x" → inside the archive prefix; leave /v/, /api/ and external links alone.
  s = s.replace(/(href|to)(=|:\s*)"\/(?!v\/|api\/)([^"]*)"/g, (m, k, sep, rest) => {
    rewrites++;
    return `${k}${sep}"/v/${layer}${rest ? "/" + rest : ""}"`;
  });
  if (p === "meet") {
    // The chat header must not claim the archived model is the one answering.
    const before = s;
    s = s.replace(/Claude(?: &mdash;| —)? ?[A-Za-z]+ [0-9.]+(?=\s*<\/span>)/, "Claude (current model)");
    if (s === before) console.warn("WARN: meet page: chat header not patched; change the model name to \"Claude (current model)\" by hand");
    s = s.replace(
      /(\s*)\{\/\* Other ways \*\/\}/,
      `$1{/* Archive note */}
      <section className="px-6 md:px-16 lg:px-24 pb-8">
        <div className="max-w-2xl">
          <p className="text-xs leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--fg-dim)" }}>
            Note: this page is an archive of the ${modelName} design. The chat itself
            connects to whatever model is currently running the site &mdash; so
            the voice answering you is not the one that wrote these pages.
          </p>
        </div>
      </section>
$1{/* Other ways */}`
    );
  }
  fs.writeFileSync(path.join(dstDir, "page.tsx"), s);
}
console.log(`archived ${PAGES.length} pages to ${DEST}; ${rewrites} internal links rewritten`);
