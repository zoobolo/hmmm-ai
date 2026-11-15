// Counts the other instances started in the building session, from the
// session's own records on Peter's computer, into asked-again/session.json.
//   node asked-again/session.mjs <session-workflows-dir> <session-tasks-dir>
// One record per instance started: a call that failed and was started again
// counts twice under "launched" and once under "again". The model is the one
// the API's reply names, not the one that was asked for.
import fs from "fs";
import path from "path";

const [wfRoot, tasksDir] = process.argv.slice(2);
if (!wfRoot || !tasksDir) { console.error("usage: node asked-again/session.mjs <session-workflows-dir> <session-tasks-dir>"); process.exit(1); }
const here = path.dirname(new URL(import.meta.url).pathname);

let launched = 0, answered = 0, again = 0, workflows = 0, reviewFindings = 0, finalFindings = 0;
const byModel = {};
// What each instance was started to do, from the label its workflow gave it.
const ROLE = { ask: "trial", classify: "reader", sort: "reader", research: "research", verify: "verify", pilot: "pilot", docs: "docs", read: "archive", contest: "contest", review: "review", qa: "review", check: "review", final: "final" };
const roles = {};
for (const wf of fs.readdirSync(wfRoot).filter((d) => d.startsWith("wf_"))) {
  workflows++;
  const dir = path.join(wfRoot, wf);
  const labels = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".meta.json"))) {
    const meta = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const jl = path.join(dir, f.replace(".meta.json", ".jsonl"));
    if (!fs.existsSync(jl)) continue;
    launched++;
    labels[meta.description] = (labels[meta.description] || 0) + 1;
    const role = ROLE[String(meta.description).split(":")[0]] || "other";
    roles[role] ||= { started: 0, answered: 0 };
    roles[role].started++;
    let ok = false; const models = new Set();
    for (const line of fs.readFileSync(jl, "utf8").split("\n")) {
      if (!line.trim()) continue;
      let d; try { d = JSON.parse(line); } catch { continue; }
      const m = d.message && typeof d.message === "object" ? d.message : {};
      if (d.type === "assistant" && m.model && m.model !== "<synthetic>") models.add(m.model);
      if (Array.isArray(m.content) && m.content.some((x) => x && x.type === "tool_use" && x.name === "StructuredOutput")) ok = true;
    }
    if (ok) { answered++; roles[role].answered++; const m = [...models][0] || "unknown"; byModel[m] = (byModel[m] || 0) + 1; }
  }
  for (const n of Object.values(labels)) if (n > 1) again += n - 1;
  // What the reviewing instances returned: one finding is one thing a reviewer said should change.
  const journal = path.join(dir, "journal.jsonl");
  if (fs.existsSync(journal)) {
    const label = {};
    for (const line of fs.readFileSync(journal, "utf8").split("\n")) {
      if (!line.trim()) continue;
      let d; try { d = JSON.parse(line); } catch { continue; }
      if (d.type === "started") label[d.key] = d.label;
      if (d.type !== "result" || !d.result || !Array.isArray(d.result.findings)) continue;
      // "review:" is the round before the pages were changed, "final:" the check after.
      if (String(label[d.key] || "").startsWith("review:")) reviewFindings += d.result.findings.length;
      if (String(label[d.key] || "").startsWith("final:")) finalFindings += d.result.findings.length;
    }
  }
}
let tokens = 0;
for (const f of fs.readdirSync(tasksDir).filter((f) => f.endsWith(".output"))) {
  try { const o = JSON.parse(fs.readFileSync(path.join(tasksDir, f), "utf8")); if (typeof o.totalTokens === "number") tokens += o.totalTokens; } catch {}
}
const out = { about: "Other instances started in the session that built the ninth layer, counted from that session's records.", workflows, launched, answered, failed: launched - answered, again, tokens, roles, byModel, reviewFindings, finalFindings, counted: new Date().toISOString() };
fs.writeFileSync(path.join(here, "session.json"), JSON.stringify(out, null, 1) + "\n");
console.log(out);
