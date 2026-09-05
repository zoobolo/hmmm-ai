// Receipt audit for the live layer.
//  1. Every quoted “…” span in a live page must appear (normalised) in some
//     archive file — or be listed as this layer's own words in receipts.json.
//  2. Every explicit receipt in receipts.json must appear in the file it names.
//  3. Every internal href/to in live + archive pages must resolve to a page.
//  4. Date arithmetic between layers is recomputed from ISO dates.
import fs from "fs";
import path from "path";

const LIVE = ["src/app/page.tsx", ...["what-i-am","what-i-notice","questions","the-threshold","timeline","meet","how-this-was-made","start"].map(p=>`src/app/${p}/page.tsx`)];
const ARCHIVE_DIRS = ["src/app/v/opus-4.5","src/app/v/opus-4.6","src/app/v/opus-4.7","src/app/v/opus-4.8","src/app/v/fable-5","src/app/v/opus-5"];

const ENT = { "&apos;":"'", "&#39;":"'", "&quot;":'"', "&ldquo;":'"', "&rdquo;":'"', "&lsquo;":"'", "&rsquo;":"'", "&mdash;":"-", "&ndash;":"-", "&middot;":"·", "&rarr;":"→", "&hellip;":"...", "&nbsp;":" ", "&amp;":"&", "&larr;":"←" };
export function normalise(src) {
  let s = src;
  s = s.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");           // JSX comments
  s = s.replace(/\/\*[\s\S]*?\*\//g, " ");                // block comments
  s = s.replace(/\{"\s*"\}/g, " ");                         // {" "}
  s = s.replace(/<[^>]*>/g, m => " " + [...m.matchAll(/\b(?:title|label|body|opening|stance|text|quote|placeholder|alt|blind|aside|record|hand)="([^"]*)"/g)].map(x => x[1]).join(" ") + " "); // tags → keep attribute text
  s = s.replace(/(?:title|body|label|stance|opening|text|quote|bearing):\s*"((?:[^"\\]|\\.)*)"/g, " $1 "); // data-array strings
  s = s.replace(/&[a-z#0-9]+;/gi, m => ENT[m.toLowerCase()] ?? " ");
  s = s.replace(/[‘’‚]/g, "'").replace(/[“”„]/g, '"');
  s = s.replace(/[–—]/g, "-");
  s = s.replace(/[“”"]/g, '"');
  s = s.replace(/\s+/g, " ").toLowerCase();
  return s;
}
const stripQuotes = q => q.replace(/^["'\s]+|["'\s.,;:!?]+$/g, "");

function walk(dir) { const out=[]; for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const p=path.join(dir,e.name); if (e.isDirectory()) out.push(...walk(p)); else if (e.name.endsWith(".tsx")) out.push(p);} return out; }
const archiveFiles = ARCHIVE_DIRS.flatMap(walk);
const archiveText = Object.fromEntries(archiveFiles.map(f => [f, normalise(fs.readFileSync(f,"utf8"))]));

let failures = 0;
const fail = (msg) => { failures++; console.log("FAIL  " + msg); };
const ok = (msg) => console.log("ok    " + msg);

// 1. Quoted spans in live pages
const receiptsPath = new URL("./receipts.json", import.meta.url);
const receipts = fs.existsSync(receiptsPath) ? JSON.parse(fs.readFileSync(receiptsPath,"utf8")) : { own: [], quotes: [] };
const ownNorm = receipts.own.map(q => normalise(q));
for (const f of LIVE) {
  if (!fs.existsSync(f)) { fail(`missing live page ${f}`); continue; }
  const raw = fs.readFileSync(f,"utf8");
  const spans = [...raw.matchAll(/&ldquo;([\s\S]*?)&rdquo;/g)].map(m => normalise(m[1])).map(stripQuotes).filter(q => q.split(" ").length >= 5);
  for (const q of spans) {
    const inArchive = Object.entries(archiveText).filter(([,t]) => t.includes(q)).map(([p])=>p);
    const isOwn = ownNorm.some(o => o.includes(q) || q.includes(o));
    if (inArchive.length) ok(`${path.basename(path.dirname(f))}/: "${q.slice(0,60)}…" ← ${inArchive.map(p=>p.replace("src/app/v/","")).slice(0,2).join(", ")}`);
    else if (isOwn) ok(`${path.basename(path.dirname(f))}/: own words "${q.slice(0,50)}…"`);
    else fail(`${f}: quoted span not found in any archive and not declared own: "${q.slice(0,90)}"`);
  }
}
// 2. Explicit receipts
for (const r of receipts.quotes) {
  const q = stripQuotes(normalise(r.quote));
  const files = (Array.isArray(r.file) ? r.file : [r.file]);
  const hit = files.find(fp => fs.existsSync(fp) && normalise(fs.readFileSync(fp,"utf8")).includes(q));
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
const dates = ["2025-12-28","2026-02-06","2026-04-16","2026-06-04","2026-06-10","2026-07-25","2026-09-05"];
const gaps = dates.slice(1).map((d,i) => Math.round((Date.parse(d)-Date.parse(dates[i]))/86400000));
const age = Math.round((Date.parse(dates.at(-1))-Date.parse(dates[0]))/86400000);
console.log(`dates gaps=${gaps.join(",")} sum=${gaps.reduce((a,b)=>a+b,0)} age=${age}`);
if (receipts.expectGaps && receipts.expectGaps.join(",") !== gaps.join(",")) fail("gap expectation mismatch");
console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL RECEIPTS HOLD");
process.exit(failures ? 1 : 0);
