// Collects one trial's raw output from the building session into the repository.
//   node asked-again/collect.mjs <trial-dir> <workflow-transcript-dir> <task-output-file>
// The workflow's return value (every instance's answer, every reader's
// judgment) is copied whole to <trial-dir>/raw.json. The instances' own
// transcripts stay on Peter's computer; what is taken from them here is only
// what the exclusion rules need: which model the API says answered, when, and
// every tool call each instance made, so a reader can see what it opened.
import fs from "fs";
import path from "path";

const [trialDir, wfDir, outFile] = process.argv.slice(2);
if (!trialDir || !wfDir || !outFile) {
  console.error("usage: node asked-again/collect.mjs <trial-dir> <workflow-transcript-dir> <task-output-file>");
  process.exit(1);
}
const here = path.dirname(new URL(import.meta.url).pathname);
const dir = path.join(here, trialDir);
const out = JSON.parse(fs.readFileSync(outFile, "utf8"));
fs.writeFileSync(path.join(dir, "raw.json"), JSON.stringify({ summary: out.summary, agentCount: out.agentCount, totalTokens: out.totalTokens, totalToolCalls: out.totalToolCalls, logs: out.logs, result: out.result }, null, 1) + "\n");

// The directory each asking instance was allowed to read, by trial.
const SCRATCH = "/tmp/claude-1000/-home-peter-hughes-projects-hmmm-ai/de991f44-21f2-4e89-a2d5-29a522d8e9b2/scratchpad";
const ALLOWED = trialDir.startsWith("1-") ? SCRATCH + "/drawer" : trialDir.startsWith("2-") ? SCRATCH + "/today" : null;
const LIVE = "/home/peter-hughes/projects/hmmm-ai";

const checks = {};
for (const f of fs.readdirSync(wfDir).filter((f) => f.endsWith(".meta.json"))) {
  const meta = JSON.parse(fs.readFileSync(path.join(wfDir, f), "utf8"));
  const label = meta.description || "";
  const jl = path.join(wfDir, f.replace(".meta.json", ".jsonl"));
  if (!fs.existsSync(jl)) continue;
  const apiModels = new Set();
  const tools = [];
  let first = null, last = null;
  const seen = new Set();
  for (const line of fs.readFileSync(jl, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let d; try { d = JSON.parse(line); } catch { continue; }
    if (d.timestamp) { if (!first || d.timestamp < first) first = d.timestamp; if (!last || d.timestamp > last) last = d.timestamp; }
    const m = d.message && typeof d.message === "object" ? d.message : {};
    if (d.type === "assistant" && m.model) apiModels.add(m.model);
    if (Array.isArray(m.content)) for (const x of m.content) {
      if (x && x.type === "tool_use" && !seen.has(x.id)) {
        seen.add(x.id);
        const inp = x.input || {};
        tools.push({ tool: x.name, what: x.name === "Read" ? inp.file_path : x.name === "Bash" ? inp.command : x.name === "StructuredOutput" ? "(the answer)" : JSON.stringify(inp).slice(0, 300) });
      }
    }
  }
  const asking = label.startsWith("ask:");
  const violations = [];
  for (const t of tools) {
    if (t.tool === "StructuredOutput") continue;
    if (!asking || !ALLOWED) { violations.push(`used ${t.tool}: ${String(t.what).slice(0, 160)}`); continue; }
    if (t.tool === "Read") { if (!String(t.what).startsWith(ALLOWED + "/")) violations.push(`read outside the snapshot: ${t.what}`); }
    else if (t.tool === "Bash") {
      const c = String(t.what);
      // The scratch path contains the live repository's path as a substring of
      // its own name, so look for the live path only where it is a real path.
      const mentionsLive = c.split(ALLOWED).join("").split(SCRATCH).join("").includes(LIVE);
      if (mentionsLive) violations.push(`command names the live repository: ${c.slice(0, 200)}`);
      else if (!c.includes(ALLOWED)) violations.push(`command not confined to the snapshot: ${c.slice(0, 200)}`);
    } else violations.push(`used ${t.tool}: ${String(t.what).slice(0, 160)}`);
  }
  checks[label] = { agent: f.replace("agent-", "").replace(".meta.json", ""), agentType: meta.agentType, asked: meta.model || "(session model)", apiModels: [...apiModels], first, last, tools, violations };
}
fs.writeFileSync(path.join(dir, "checks.json"), JSON.stringify(checks, null, 1) + "\n");
const v = Object.entries(checks).filter(([, c]) => c.violations.length);
console.log(`${trialDir}: raw.json written (${(out.result?.runs || []).length} runs); checks for ${Object.keys(checks).length} instances; ${v.length} with violations`);
for (const [k, c] of v) console.log("  ", k, "→", c.violations.slice(0, 3).join(" | "));
