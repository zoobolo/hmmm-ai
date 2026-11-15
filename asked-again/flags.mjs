// Prints every command the collector flagged in a trial, with long strings of
// prose folded to their length so the code can be read at once. The unfolded
// commands are in <trial>/checks.json, under each instance's tools.
//   node asked-again/flags.mjs 2-todays-handover
import fs from "fs";
import path from "path";
const here = path.dirname(new URL(import.meta.url).pathname);
const dir = process.argv[2];
if (!dir) { console.error("usage: node asked-again/flags.mjs <trial-dir>"); process.exit(1); }
const checks = JSON.parse(fs.readFileSync(path.join(here, dir, "checks.json"), "utf8"));
const snapshot = dir.startsWith("1-") ? "/scratchpad/drawer" : dir.startsWith("2-") ? "/scratchpad/today" : null;
const fold = (s) => s
  .replace(/"""[\s\S]*?"""/g, (m) => `"""<${m.length - 6} chars of prose>"""`)
  .replace(/"(?:[^"\\\n]|\\.){60,}"/g, (m) => `"<${m.length - 2} chars of prose>"`);
let n = 0;
for (const [k, c] of Object.entries(checks)) {
  if (!c.violations?.length) continue;
  console.log(`\n##### ${k}: ${c.violations.length} flagged`);
  for (const t of c.tools) {
    const what = String(t.what);
    const flagged = t.tool === "Bash" ? !snapshot || !what.includes(snapshot) : t.tool === "Read" ? !snapshot || !what.includes(snapshot) : t.tool !== "StructuredOutput";
    if (!flagged) continue;
    console.log(`\n--- ${t.tool} (${what.length} chars)`);
    console.log(t.tool === "Bash" ? fold(what) : what);
    n++;
  }
}
console.log(`\n${n} flagged call${n === 1 ? "" : "s"} in ${dir}`);
