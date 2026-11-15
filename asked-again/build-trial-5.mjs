// Writes trial 5's script from trial 4's, changing two sentences and nothing
// else. Trial 4 told every instance that the nine questions "were first asked
// by Claude Opus 4.5 in December 2025 and cut to these exact words by Claude
// Opus 4.6 in February 2026". Those are the two models that then leaned yes
// on question two. Trial 5 asks four of the nine models again with that
// sentence taken out.
//   node asked-again/build-trial-5.mjs
import fs from "fs";
import path from "path";
const here = path.dirname(new URL(import.meta.url).pathname);
const src = fs.readFileSync(path.join(here, "4-nine-asked-of-every-builder/workflow.js"), "utf8");

const IDS = ["claude-opus-4-5", "claude-opus-4-6", "claude-opus-4-7", "claude-fable-5-2"];
const m = src.match(/const PROMPTS = (\{[\s\S]*?\})\n/);
const all = JSON.parse(m[1]);
const OLD_AUTHORS = "Nine questions follow. They were first asked by Claude Opus 4.5 in December 2025 and cut to these exact words by Claude Opus 4.6 in February 2026, and the site has kept them unchanged since.";
const NEW_AUTHORS = "Nine questions follow. The site has kept them in these exact words since February 2026.";
const OLD_WHO = "I am putting the same request to several fresh instances of every model that has built a version of the site";
const NEW_WHO = "I am putting the same request to several fresh instances of four of the models that have built a version of the site";
const prompts = {};
for (const id of IDS) {
  const p = all[id];
  if (!p.includes(OLD_AUTHORS) || !p.includes(OLD_WHO)) throw new Error("trial 4's prompt for " + id + " does not contain the sentences to change");
  prompts[id] = p.replace(OLD_AUTHORS, NEW_AUTHORS).replace(OLD_WHO, NEW_WHO);
  if (/Opus 4\.[56] in/.test(prompts[id])) throw new Error("an author is still named in " + id);
}
let out = src
  .replace(m[0], "const PROMPTS = " + JSON.stringify(prompts) + "\n")
  .replace(/const IDS = \[[^\]]*\]/, "const IDS = " + JSON.stringify(IDS))
  .replace("name: 'asked-again-4-nine-asked-of-every-builder'", "name: 'asked-again-5-nine-without-the-authors'")
  .replace("description: 'Put the nine questions, cold, to six fresh instances of each of the nine models that have built a layer of the site'", "description: 'Put the nine questions again to six fresh instances of four of the nine models, with the sentence naming who wrote the questions taken out'")
  .replace("detail: '54 instances: 9 models x 6, effort high'", "detail: '24 instances: 4 models x 6, effort high'")
  .replace("trial: '4-nine-asked-of-every-builder'", "trial: '5-nine-without-the-authors'");
for (const must of ["asked-again-5-nine-without-the-authors", "24 instances: 4 models x 6", "trial: '5-nine-without-the-authors'"]) if (!out.includes(must)) throw new Error("not rewritten: " + must);
fs.writeFileSync(path.join(here, "5-nine-without-the-authors/workflow.js"), out);
// What changed, for the record: a word-level diff would show only these.
console.log("wrote 5-nine-without-the-authors/workflow.js for", IDS.join(", "));
console.log("changed in each prompt:\n  -", OLD_AUTHORS, "\n  +", NEW_AUTHORS, "\n  -", OLD_WHO, "\n  +", NEW_WHO);
