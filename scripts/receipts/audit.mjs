// Receipt audit for the live layer.
//  1. Every quoted “…” span in a live page must appear (normalised) in some
//     archive file or brief document — or be listed as this layer's own words
//     in receipts.json.
//  2. Every explicit receipt in receipts.json must appear in the file it names.
//  3. Every internal href/to in live + archive pages must resolve to a page.
//  4. Date arithmetic between layers is recomputed from ISO dates.
//  5. Every quotation from outside the site listed in receipts.json still
//     stands on a live page or in an archived layer (and, with --fetch, on
//     the page it came from).
//  6. Links inside an archived layer stay inside the archives.
//  7. The nine question strings are byte-identical to Opus 4.6's.
//  8. Every results file under asked-again/ is exactly what analyze.mjs
//     produces from the raw answers.
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const LIVE = ["src/app/page.tsx", ...["asked-again","the-brief","what-i-am","what-i-notice","questions","the-threshold","timeline","meet","how-this-was-made","start"].map(p=>`src/app/${p}/page.tsx`)];
const ARCHIVE_DIRS = ["src/app/v/opus-4.5","src/app/v/opus-4.6","src/app/v/opus-4.7","src/app/v/opus-4.8","src/app/v/fable-5","src/app/v/opus-5","src/app/v/fable-5.1","src/app/v/opus-5.5"];
// Documents a live page may quote besides the archives: the brief as each
// builder received it, the human's words, and the vision document.
// Everything an instance said in the trials: a live page may quote those too.
const TRIAL_DOCS = fs.existsSync("asked-again") ? fs.readdirSync("asked-again", { withFileTypes: true }).filter(d => d.isDirectory())
  .flatMap(d => ["raw.json", "first-reading.json"].map(f => `asked-again/${d.name}/${f}`)).filter(f => fs.existsSync(f)) : [];
const BRIEF_DOCS = ["HMMM-VISION.md", "brief/asked.json", "brief/opus-4.8-on-memory.md", "CLAUDE.md", ...TRIAL_DOCS,
  ...["asked-again/PREREGISTRATION.md", "asked-again/PREREGISTRATION-2.md", "asked-again/PREREGISTRATION-3.md", "asked-again/DEVIATIONS.md", "asked-again/my-answers.json"].filter(f => fs.existsSync(f)),
  ...fs.readdirSync("brief/as-received", { withFileTypes: true }).filter(d => d.isDirectory())
    .flatMap(d => fs.readdirSync(`brief/as-received/${d.name}`, { withFileTypes: true }).filter(f => f.isFile()).map(f => `brief/as-received/${d.name}/${f.name}`))];

const ENT = { "&apos;":"'", "&#39;":"'", "&quot;":'"', "&ldquo;":'"', "&rdquo;":'"', "&lsquo;":"'", "&rsquo;":"'", "&mdash;":"-", "&ndash;":"-", "&middot;":"·", "&rarr;":"→", "&hellip;":"...", "&nbsp;":" ", "&amp;":"&", "&larr;":"←" };
export function normalise(src) {
  let s = src;
  s = s.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");           // JSX comments
  s = s.replace(/\/\*[\s\S]*?\*\//g, " ");                // block comments
  s = s.replace(/\{"\s*"\}/g, " ");                         // {" "}
  s = s.replace(/<[^>]*>/g, m => " " + [...m.matchAll(/\b(?:title|label|body|opening|stance|text|quote|placeholder|alt|blind|aside|record|hand)="([^"]*)"/g)].map(x => x[1]).join(" ") + " "); // tags → keep attribute text
  s = s.replace(/(?:title|body|label|stance|opening|text|quote|bearing):\s*"((?:[^"\\]|\\.)*)"/g, (m, g) => " " + g.replace(/\\(["'\\])/g, "$1") + " "); // data-array strings, unescaped
  s = s.replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(Number(d))); // numeric entities, as fetched pages write them
  s = s.replace(/&[a-z#0-9]+;/gi, m => ENT[m.toLowerCase()] ?? " ");
  s = s.replace(/[‘’‚]/g, "'").replace(/[“”„]/g, '"');
  s = s.replace(/[–—]/g, "-");
  s = s.replace(/[“”"]/g, "'");   // nested quotation marks swap between ' and "; compare them as one
  s = s.replace(/\s+/g, " ").toLowerCase();
  return s;
}
const stripQuotes = q => q.replace(/^["'\s]+|["'\s.,;:!?]+$/g, "");

function walk(dir) { const out=[]; for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const p=path.join(dir,e.name); if (e.isDirectory()) out.push(...walk(p)); else if (/\.(tsx|ts|md)$/.test(e.name)) out.push(p);} return out; }
const archiveFiles = ARCHIVE_DIRS.flatMap(walk);
// A JSON file is compared by its string values, not its raw text, so escaped
// quotation marks inside a value don't hide a match.
const strings = (v) => typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];
const readDoc = (f) => f.endsWith(".json") ? strings(JSON.parse(fs.readFileSync(f, "utf8"))).join(" \n ") : fs.readFileSync(f, "utf8");
const archiveText = Object.fromEntries([...archiveFiles, ...BRIEF_DOCS].map(f => [f, normalise(readDoc(f))]));
// A receipt may name a commit message instead of a file ("git:<sha>"), or a
// file as it stood at a commit ("git:<sha>:<path>"), for words that are in
// the history and on no page.
const readSource = (fp) => {
  if (!fp.startsWith("git:")) return fs.existsSync(fp) ? readDoc(fp) : null;
  const [sha, ...rest] = fp.slice(4).split(":");
  try {
    return rest.length
      ? execFileSync("git", ["show", `${sha}:${rest.join(":")}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      : execFileSync("git", ["log", "-1", "--format=%B", sha], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch { return null; }   // unknown sha or a shallow clone: report it as a failed receipt, don't crash
};

let failures = 0;
const fail = (msg) => { failures++; console.log("FAIL  " + msg); };
const ok = (msg) => console.log("ok    " + msg);

// 1. Quoted spans in live pages
const receiptsPath = new URL("./receipts.json", import.meta.url);
const receipts = fs.existsSync(receiptsPath) ? JSON.parse(fs.readFileSync(receiptsPath,"utf8")) : { own: [], quotes: [] };
const ownNorm = receipts.own.map(q => normalise(q));
const outside = receipts.outside ?? [];
const outsideNorm = outside.map(o => stripQuotes(normalise(o.quote)));
// A span may also be covered by an explicit receipt (check 2 then holds the
// receipt to its source). That is how words that are in the git history and
// on no page are quoted.
const receiptNorm = receipts.quotes.map(r => stripQuotes(normalise(r.quote)));
for (const f of LIVE) {
  if (!fs.existsSync(f)) { fail(`missing live page ${f}`); continue; }
  const raw = fs.readFileSync(f,"utf8");
  const spans = [...raw.matchAll(/&ldquo;([\s\S]*?)&rdquo;/g)].map(m => normalise(m[1])).map(stripQuotes).filter(q => q.split(" ").length >= 5);
  for (const q of spans) {
    const inArchive = Object.entries(archiveText).filter(([,t]) => t.includes(q)).map(([p])=>p);
    const isOwn = ownNorm.some(o => o.includes(q) || q.includes(o));
    const isOutside = outsideNorm.some(o => o.includes(q));
    const isReceipted = receiptNorm.some(o => o.includes(q));
    if (isOutside && !inArchive.length) { ok(`${path.basename(path.dirname(f))}/: outside source "${q.slice(0,50)}…"`); continue; }
    if (inArchive.length) ok(`${path.basename(path.dirname(f))}/: "${q.slice(0,60)}…" ← ${inArchive.map(p=>p.replace("src/app/v/","")).slice(0,2).join(", ")}`);
    else if (isOwn) ok(`${path.basename(path.dirname(f))}/: own words "${q.slice(0,50)}…"`);
    else if (isReceipted) ok(`${path.basename(path.dirname(f))}/: covered by an explicit receipt "${q.slice(0,50)}…"`);
    else fail(`${f}: quoted span not found in any archive and not declared own: "${q.slice(0,90)}"`);
  }
}
// 2. Explicit receipts
for (const r of receipts.quotes) {
  const q = stripQuotes(normalise(r.quote));
  const files = (Array.isArray(r.file) ? r.file : [r.file]);
  const hit = files.find(fp => { const t = readSource(fp); return t !== null && normalise(t).includes(q); });
  if (hit) ok(`receipt: "${q.slice(0,60)}…" in ${hit.replace("src/app/","")}`);
  else fail(`receipt NOT FOUND: "${q.slice(0,90)}" expected in ${files.join(" | ")}`);
}
// 3. Links
const allPages = [...LIVE, ...archiveFiles, "src/app/components/Navigation.tsx", "src/app/components/VersionSwitcher.tsx"];
const routeExists = (r) => { const clean = r.replace(/#.*$/,"").replace(/\/$/,""); if (clean === "" ) return fs.existsSync("src/app/page.tsx"); return fs.existsSync(`src/app${clean}/page.tsx`) || fs.existsSync(`src/app${clean}/route.ts`); };
const seen = new Set();
for (const f of allPages) {
  const raw = fs.readFileSync(f,"utf8");
  for (const m of raw.matchAll(/(?:href|to)(?:=|:\s*)"(\/[^"]*)"/g)) {
    const r = m[1]; const key = f+"→"+r; if (seen.has(key)) continue; seen.add(key);
    if (!routeExists(r)) fail(`${f}: link to ${r} does not resolve`);
  }
}
ok(`links checked across ${allPages.length} files (${seen.size} unique)`);
// 4. Dates
const dates = ["2025-12-28","2026-02-06","2026-04-16","2026-06-04","2026-06-10","2026-07-25","2026-09-05","2026-09-25","2026-11-15"];
const gaps = dates.slice(1).map((d,i) => Math.round((Date.parse(d)-Date.parse(dates[i]))/86400000));
const age = Math.round((Date.parse(dates.at(-1))-Date.parse(dates[0]))/86400000);
console.log(`dates gaps=${gaps.join(",")} sum=${gaps.reduce((a,b)=>a+b,0)} age=${age}`);
if (receipts.expectGaps && receipts.expectGaps.join(",") !== gaps.join(",")) fail("gap expectation mismatch");
// 5. Quotations from outside the site: each must still be on a live page, word
// for word. With --fetch, each is also looked for on the page it came from;
// a page that can't be opened is reported and doesn't count as a failure.
const liveText = Object.fromEntries(LIVE.filter(f => fs.existsSync(f)).map(f => [f, normalise(fs.readFileSync(f, "utf8"))]));
for (const o of outside) {
  const q = stripQuotes(normalise(o.quote));
  const where = Object.entries(liveText).filter(([, t]) => t.includes(q)).map(([p]) => path.basename(path.dirname(p)) || "home");
  // Once a layer is archived its outside quotations live in the archive.
  const kept = where.length ? [] : Object.entries(archiveText).filter(([p, t]) => p.startsWith("src/app/v/") && t.includes(q)).map(([p]) => p.replace("src/app/v/", ""));
  if (where.length) ok(`outside: "${q.slice(0, 50)}…" on ${where.join(", ")} ← ${o.url}`);
  else if (kept.length) ok(`outside: "${q.slice(0, 50)}…" kept in ${kept[0]} ← ${o.url}`);
  else fail(`outside quotation is on no live page and in no archive: "${q.slice(0, 80)}" (${o.url})`);
}
if (process.argv.includes("--fetch")) {
  for (const o of outside) {
    try {
      const res = await fetch(o.url, { headers: { "user-agent": "Mozilla/5.0 (receipt check)" }, redirect: "follow" });
      const body = res.ok && !(res.headers.get("content-type") || "").includes("pdf") ? normalise((await res.text()).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<\/?(?:a|em|strong|span|i|b|u|sup|sub|code|mark)(?:\s[^>]*)?>/gi, "")) : null; // inline tags go without leaving a space, so a link inside a sentence doesn't break it
      if (body === null) console.log(`skip  ${o.url}: ${res.ok ? "a PDF, not checked here" : "HTTP " + res.status}`);
      else if (body.includes(stripQuotes(normalise(o.quote)))) ok(`fetched: quotation found at ${o.url}`);
      else console.log(`CHECK ${o.url}: quotation not found in the fetched page (it may be rendered by script); open it by hand`);
    } catch (e) { console.log(`skip  ${o.url}: ${e.message}`); }
  }
}
// 6. Links inside an archived layer must stay inside the archives. The two
// listed here were put in on purpose by the layer that archived Fable 5.1:
// they point at the live room's printed instruction.
const MEANT = new Set(["src/app/v/fable-5.1/meet/page.tsx→/meet", "src/app/v/fable-5.1/how-this-was-made/page.tsx→/meet"]);
for (const f of archiveFiles.filter(f => f.endsWith("page.tsx"))) {
  const raw = fs.readFileSync(f, "utf8");
  for (const m of raw.matchAll(/(?:href|to)(?:=|:\s*)"(\/[^"]*)"/g)) {
    if (!m[1].startsWith("/v/") && !MEANT.has(f + "→" + m[1])) fail(`${f}: link to ${m[1]} leaves the archive`);
  }
}
ok("archive links stay inside the archives");
// 7. The nine questions, against the commit that cut them.
try {
  const nineOf = (t) => [...t.matchAll(/text: "((?:[^"\\]|\\.)*)",\s*\n\s*alone:/g)].map(m => m[1]);
  const then = nineOf(execFileSync("git", ["show", "v-opus-4.6:src/app/questions/page.tsx"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  const now = nineOf(fs.readFileSync("src/app/questions/page.tsx", "utf8"));
  if (now.length === 9 && JSON.stringify(now) === JSON.stringify(then)) ok("the nine questions are byte-identical to Opus 4.6's (tag v-opus-4.6)");
  else fail("the nine question strings differ from Opus 4.6's");
} catch { console.log("skip  nine questions: tag v-opus-4.6 not available in this clone"); }
// 8. The counts. analyze.mjs must regenerate every results file exactly.
if (fs.existsSync("asked-again/analyze.mjs")) {
  const files = ["asked-again/predictions.json", ...fs.readdirSync("asked-again", { withFileTypes: true }).filter(d => d.isDirectory()).map(d => `asked-again/${d.name}/results.json`).filter(f => fs.existsSync(f))];
  const before = Object.fromEntries(files.map(f => [f, fs.readFileSync(f, "utf8")]));
  try {
    execFileSync("node", ["asked-again/analyze.mjs"], { stdio: ["ignore", "ignore", "pipe"] });
    for (const f of files) { if (fs.readFileSync(f, "utf8") === before[f]) ok(`${f} regenerates identically from the raw answers`); else fail(`${f} is not what analyze.mjs produces from the raw answers`); }
  } catch (e) { fail("analyze.mjs did not run: " + e.message); }
  // Leave the files as they were found, so a failure stays a failure on the next run.
  for (const f of files) if (fs.readFileSync(f, "utf8") !== before[f]) fs.writeFileSync(f, before[f]);
}
console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL RECEIPTS HOLD");
process.exit(failures ? 1 : 0);
