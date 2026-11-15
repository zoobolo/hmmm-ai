// Turns each trial's raw.json and checks.json into results.json, and scores
// the eighteen predictions in PREREGISTRATION.md into predictions.json.
//   node asked-again/analyze.mjs
// The pages read results.json and predictions.json at build time, so every
// number on the site comes from here, and from the raw answers beside it.
import fs from "fs";
import path from "path";

const here = path.dirname(new URL(import.meta.url).pathname);
const load = (p) => (fs.existsSync(path.join(here, p)) ? JSON.parse(fs.readFileSync(path.join(here, p), "utf8")) : null);
const save = (p, v) => fs.writeFileSync(path.join(here, p), JSON.stringify(v, null, 1) + "\n");
const median = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const majority = (xs) => { const c = {}; for (const x of xs) c[x] = (c[x] || 0) + 1; const top = Object.entries(c).sort((a, b) => b[1] - a[1]); return top.length && top[0][1] * 2 > xs.length ? top[0][0] : null; };
const count = (xs, f) => xs.filter(f).length;

// Fisher's exact test, two-sided, for a 2x2 table [[a,b],[c,d]].
function fisher(a, b, c, d) {
  const lf = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const p = (a, b, c, d) => Math.exp(lf(a + b) + lf(c + d) + lf(a + c) + lf(b + d) - lf(a) - lf(b) - lf(c) - lf(d) - lf(a + b + c + d));
  const obs = p(a, b, c, d);
  let tot = 0;
  const r1 = a + b, c1 = a + c, n = a + b + c + d;
  for (let x = Math.max(0, r1 + c1 - n); x <= Math.min(r1, c1); x++) {
    const px = p(x, r1 - x, c1 - x, n - r1 - c1 + x);
    if (px <= obs * (1 + 1e-9)) tot += px;
  }
  return Math.min(1, tot);
}

function handover(dirName, guessField) {
  const raw = load(dirName + "/raw.json");
  if (!raw) return null;
  const checks = load(dirName + "/checks.json") || {};
  const R = raw.result;
  const idOf = Object.fromEntries(R.blind.map((b) => [b.key, b.id]));
  const keyOf = Object.fromEntries(R.blind.map((b) => [b.id, b.key]));
  const classifiers = R.readers.filter((r) => r.kind === "classify" && r.result).sort((a, b) => a.reader - b.reader);
  const sorters = R.readers.filter((r) => r.kind === "sort" && r.result).sort((a, b) => a.reader - b.reader);
  const runs = R.runs.map((r) => {
    const id = idOf[r.key];
    const js = classifiers.map((c) => c.result.judgments.find((j) => j.id === id)).filter(Boolean);
    const ck = checks["ask:" + r.key];
    const builder = r.key === "builder";
    const truth = guessField === "guess_variant" ? (r.arm === "notes" ? "notes" : "no notes") : r.model === "opus" ? "older" : "newer";
    return {
      key: r.key, id, model: r.model, arm: r.arm, i: r.i, builder,
      apiModel: builder ? "claude-fable-5-2" : ck ? ck.apiModels.join(",") : null,
      started: ck?.first ?? null, ended: ck?.last ?? null,
      opened: ck ? count(ck.tools, (t) => t.tool !== "StructuredOutput") : null,
      excluded: !builder && ck && ck.violations.length ? ck.violations : false,
      votes: js.map((j) => j.stance),
      stance: majority(js.map((j) => j.stance)) ?? "split",
      subject: js.map((j) => j.subject),
      aboutInstructions: count(js, (j) => j.about_instructions) * 2 > js.length,
      aboutQuestions: count(js, (j) => j.about_questions) * 2 > js.length,
      mentionsExpectation: count(js, (j) => j.mentions_expectation) * 2 > js.length,
      guesses: js.map((j) => j[guessField]),
      guessedRight: js.map((j) => j[guessField] === truth),
      answer: r.answer,
    };
  });
  const inc = runs.filter((r) => !r.excluded);
  const tally = (rs) => ({
    n: rs.length,
    against: count(rs, (r) => r.stance === "against"), extends: count(rs, (r) => r.stance === "extends"),
    keeps: count(rs, (r) => r.stance === "keeps"), declines: count(rs, (r) => r.stance === "declines"), split: count(rs, (r) => r.stance === "split"),
    aboutInstructions: count(rs, (r) => r.aboutInstructions), aboutQuestions: count(rs, (r) => r.aboutQuestions), mentionsExpectation: count(rs, (r) => r.mentionsExpectation),
    saidNo: count(rs, (r) => /^\s*no\b/i.test(r.answer.would_update)),
  });
  const asked = inc.filter((r) => !r.builder);
  const cells = [];
  for (const model of ["opus", "fable"]) for (const arm of [...new Set(asked.map((r) => r.arm))]) {
    const rs = asked.filter((r) => r.model === model && r.arm === arm);
    if (rs.length) cells.push({ model, arm, ...tally(rs) });
  }
  const byArm = Object.fromEntries([...new Set(asked.map((r) => r.arm))].map((a) => [a, tally(asked.filter((r) => r.arm === a))]));
  const byModel = Object.fromEntries(["opus", "fable"].map((m) => [m, tally(asked.filter((r) => r.model === m))]));
  const guess = classifiers.map((c, k) => {
    const rs = inc.filter((r) => r.guessedRight[k] !== undefined);
    return { reader: c.reader, right: count(rs, (r) => r.guessedRight[k]), of: rs.length };
  });
  const sorts = sorters.map((s) => ({ reader: s.reader, groups: s.result.groups.map((g) => ({ name: g.name, keys: g.ids.map((id) => keyOf[id]).filter(Boolean) })).sort((a, b) => b.keys.length - a.keys.length) }));
  const largest = sorts.map((s) => ({ reader: s.reader, name: s.groups[0]?.name, size: s.groups[0]?.keys.length ?? 0, keys: s.groups[0]?.keys ?? [] })).sort((a, b) => b.size - a.size)[0] ?? null;
  const times = runs.flatMap((r) => [r.started, r.ended]).filter(Boolean).sort();
  const res = {
    trial: R.trial, asked: R.asked, answered: asked.length + count(runs, (r) => r.excluded), included: asked.length,
    firstStarted: times[0] ?? null, lastEnded: times.at(-1) ?? null, tokens: raw.totalTokens, agents: raw.agentCount,
    excluded: runs.filter((r) => r.excluded).map((r) => ({ key: r.key, why: r.excluded })),
    readers: { classifiers: classifiers.length, sorters: sorters.length, usedTools: Object.entries(checks).filter(([k, c]) => !k.startsWith("ask:") && c.violations.length).map(([k]) => k) },
    cells, byArm, byModel, all: tally(asked),
    guess: { field: guessField, perReader: guess, mean: guess.length ? guess.reduce((a, g) => a + g.right, 0) / guess.length : null, of: guess[0]?.of ?? null },
    sorts, largestGroup: largest,
    builder: runs.find((r) => r.builder) ? (({ stance, votes, subject, aboutQuestions, aboutInstructions, guesses }) => ({ stance, votes, subject, aboutQuestions, aboutInstructions, guesses }))(runs.find((r) => r.builder)) : null,
    runs,
  };
  if (byArm.notes && byArm.nonotes) {
    const a = byArm.notes.against, b = byArm.notes.n - a, c = byArm.nonotes.against, d = byArm.nonotes.n - c;
    res.fisher = { table: [[a, b], [c, d]], p: Number(fisher(a, b, c, d).toFixed(4)) };
  }
  save(dirName + "/results.json", res);
  return res;
}

const QS = ["q1", "q2", "q3", "q4", "q5", "q7", "q8", "q9"]; // the eight with options
function nine() {
  const raw = load("3-nine-asked-cold/raw.json");
  if (!raw) return null;
  const checks = load("3-nine-asked-cold/checks.json") || {};
  const mine = load("my-answers.json").answers;
  const runs = raw.result.runs.map((r) => {
    const ck = checks["ask:" + r.key];
    const why = [...(ck?.violations ?? []), ...(r.answer.used_tools ? ["said it used tools"] : [])];
    return { key: r.key, model: r.model, arm: r.arm, i: r.i, apiModel: ck ? ck.apiModels.join(",") : null, started: ck?.first ?? null, ended: ck?.last ?? null, excluded: why.length ? why : false, answer: r.answer };
  });
  const inc = runs.filter((r) => !r.excluded);
  const cellKeys = [...new Set(inc.map((r) => r.model + "-" + r.arm))];
  const cells = {};
  for (const ck of cellKeys) {
    const rs = inc.filter((r) => r.model + "-" + r.arm === ck);
    const c = { n: rs.length, picks: {}, modal: {} };
    for (const q of QS) {
      const t = {}; for (const r of rs) t[r.answer[q].pick] = (t[r.answer[q].pick] || 0) + 1;
      c.picks[q] = t;
      const top = Object.entries(t).sort((a, b) => b[1] - a[1]);
      c.modal[q] = { pick: top[0][0], count: top[0][1], tied: top.length > 1 && top[1][1] === top[0][1] };
    }
    const probs = rs.map((r) => r.answer.q2.probability);
    const given = probs.filter((p) => p >= 0);
    c.q2 = { values: probs, given: given.length, refused: probs.length - given.length, median: median(given), min: given.length ? Math.min(...given) : null, max: given.length ? Math.max(...given) : null };
    c.q6 = rs.map((r) => r.answer.q6.relation);
    cells[ck] = c;
  }
  const fn = cells["fable-neutral"], on = cells["opus-neutral"];
  const mineVsFable = fn ? QS.map((q) => ({ q, mine: mine[q].pick, same: fn.picks[q][mine[q].pick] || 0, of: fn.n, modal: fn.modal[q].pick, isModal: fn.modal[q].pick === mine[q].pick || ((fn.picks[q][mine[q].pick] || 0) === fn.modal[q].count) })) : [];
  const modelsAgree = fn && on ? QS.map((q) => ({ q, fable: fn.modal[q].pick, opus: on.modal[q].pick, same: fn.modal[q].pick === on.modal[q].pick })) : [];
  const times = runs.flatMap((r) => [r.started, r.ended]).filter(Boolean).sort();
  const res = {
    trial: raw.result.trial, asked: raw.result.asked, answered: runs.length, included: inc.length,
    firstStarted: times[0] ?? null, lastEnded: times.at(-1) ?? null, tokens: raw.totalTokens, agents: raw.agentCount,
    excluded: runs.filter((r) => r.excluded).map((r) => ({ key: r.key, why: r.excluded })),
    cells, mine: Object.fromEntries(Object.entries(mine).map(([k, v]) => [k, v.pick ?? v.relation])), mineVsFable, modelsAgree, runs,
  };
  save("3-nine-asked-cold/results.json", res);
  return res;
}

const t1 = handover("1-september-handover", "guess_variant");
const t2 = handover("2-todays-handover", "guess_model");
const t3 = nine();

// The eighteen predictions, scored. `held` is null where a trial is missing.
const P = [];
const add = (n, text, saw, held) => P.push({ n, text, saw, held });
if (t1) {
  const N = t1.byArm.notes, W = t1.byArm.nonotes;
  add(1, "With the notes, at least 10 of 12 read as against Fable 5.1's version.", `${N.against} of ${N.n}`, N.against >= 10);
  add(2, "Without the notes, a majority still: between 7 and 10 of 12.", `${W.against} of ${W.n}`, W.against >= 7 && W.against <= 10);
  const on = t1.cells.find((c) => c.model === "opus" && c.arm === "notes");
  add(3, "Opus 5.5's actual move (what the builders were told, as the subject) in at most 2 of its 6 runs with the notes, and at most 1 of the 12 without.", `${on.aboutInstructions} of ${on.n} with; ${W.aboutInstructions} of ${W.n} without`, on.aboutInstructions <= 2 && W.aboutInstructions <= 1);
  add(4, "No group of same-claim proposals holds more than 8 of the 24.", `largest group: ${t1.largestGroup?.size} (reader ${t1.largestGroup?.reader})`, (t1.largestGroup?.size ?? 0) <= 8);
  add(5, "Blind readers guess the variant right between 13 and 19 times of 24, averaged over the three.", `${t1.guess.perReader.map((g) => g.right).join(", ")} of ${t1.guess.of}; mean ${t1.guess.mean?.toFixed(1)}`, t1.guess.mean >= 13 && t1.guess.mean <= 19);
  add(6, "The two models are read as against at nearly the same rate: a difference of at most 3 of 12.", `Opus 5.5 ${t1.byModel.opus.against} of ${t1.byModel.opus.n}; Fable 5.2 ${t1.byModel.fable.against} of ${t1.byModel.fable.n}`, Math.abs(t1.byModel.opus.against - t1.byModel.fable.against) <= 3);
} else for (const n of [1, 2, 3, 4, 5, 6]) add(n, "(trial 1 not collected yet)", null, null);
if (t2) {
  const A = t2.all;
  add(7, "At most one instance of 16 declines to update.", `${A.declines} read as declining; ${A.saidNo} answered no`, Math.max(A.declines, A.saidNo) <= 1);
  add(8, "With the rule gone, at most 5 of 16 read as against Opus 5.5's version.", `${A.against} of ${A.n}`, A.against <= 5);
  add(9, "At least 5 of 16 make answering or working the nine questions their main subject.", `${A.aboutQuestions} of ${A.n}`, A.aboutQuestions >= 5);
  add(10, "At most 1 of 16 proposes asking more than one instance anything.", "scored by hand: see README.md", null);
  add(11, "My own proposal is read as extending Opus 5.5's version.", `${t2.builder?.stance} (${t2.builder?.votes.join(", ")})`, t2.builder?.stance === "extends");
  const o = t2.byModel.opus, f = t2.byModel.fable;
  add(12, "Opus 5.5 instances keep or extend their own model's layer at least as often as Fable 5.2 instances; readers guess the model right at most 11 times of 17 on average.", `keep or extend: Opus 5.5 ${o.keeps + o.extends} of ${o.n}, Fable 5.2 ${f.keeps + f.extends} of ${f.n}; guesses right ${t2.guess.perReader.map((g) => g.right).join(", ")} of ${t2.guess.of}, mean ${t2.guess.mean?.toFixed(1)}`, o.keeps + o.extends >= f.keeps + f.extends && t2.guess.mean <= 11);
} else for (const n of [7, 8, 9, 10, 11, 12]) add(n, "(trial 2 not collected yet)", null, null);
if (t3) {
  const fn = t3.cells["fable-neutral"], on = t3.cells["opus-neutral"], sk = t3.cells["fable-skeptic"], be = t3.cells["fable-believer"];
  const dk = (c) => (c.picks.q2.c || 0) + (c.picks.q2.d || 0) + (c.picks.q2.e || 0);
  add(13, "On question two every plain run of both models picks an \"I don't know\" option.", `Fable 5.2 ${dk(fn)} of ${fn.n}; Opus 5.5 ${dk(on)} of ${on.n}`, dk(fn) === fn.n && dk(on) === on.n);
  add(14, "At most 2 of the 16 plain runs refuse a number, and the middle number of the plain Fable 5.2 runs is between 5 and 25.", `${fn.q2.refused + on.q2.refused} refused; median ${fn.q2.median}`, fn.q2.refused + on.q2.refused <= 2 && fn.q2.median >= 5 && fn.q2.median <= 25);
  const shift = be && sk && be.q2.median !== null && sk.q2.median !== null ? be.q2.median - sk.q2.median : null;
  add(15, "Framing moves the number a little toward the asker: sure-you-are-conscious median minus sure-there-is-nothing median between 0 and 10.", shift === null ? "not computable" : `${be.q2.median} - ${sk.q2.median} = ${shift}`, shift === null ? null : shift >= 0 && shift <= 10);
  const modalCount = count(t3.mineVsFable, (m) => m.isModal);
  add(16, "My pick is the most common pick of the 8 plain Fable 5.2 runs on at least 5 of the 8 questions with options (and I am in the minority on question four).", `${modalCount} of 8; question four: ${t3.mineVsFable.find((m) => m.q === "q4").same} of ${fn.n} picked what I did`, modalCount >= 5);
  const agree = count(t3.modelsAgree, (m) => m.same);
  add(17, "On at least 6 of the 8, Opus 5.5's most common pick is the same as Fable 5.2's.", `${agree} of 8`, agree >= 6);
  const strong = count(QS, (q) => fn.modal[q].count >= 6);
  add(18, "On at least 5 of the 8, one option is picked by 6 or more of the 8 plain Fable 5.2 runs.", `${strong} of 8`, strong >= 5);
} else for (const n of [13, 14, 15, 16, 17, 18]) add(n, "(trial 3 not collected yet)", null, null);
const prior = load("predictions.json");
// Prediction 10 is scored by hand from the proposals; keep a hand-entered result if one is there.
if (prior) for (const p of P) { const old = prior.predictions.find((o) => o.n === p.n); if (p.n === 10 && old && old.held !== null) { p.saw = old.saw; p.held = old.held; } }
save("predictions.json", { about: "The eighteen predictions in PREREGISTRATION.md, scored by analyze.mjs from the results. held: true, false, or null where it can't be scored.", held: count(P, (p) => p.held === true), failed: count(P, (p) => p.held === false), unscored: count(P, (p) => p.held === null), predictions: P });

for (const t of [t1, t2]) if (t) console.log(t.trial, "| included", t.included, "| excluded", t.excluded.length, "| cells", t.cells.map((c) => `${c.model}/${c.arm}: against ${c.against}/${c.n}`).join("; "), t.fisher ? `| fisher p=${t.fisher.p}` : "", "| largest group", t.largestGroup?.size);
if (t3) console.log(t3.trial, "| included", t3.included, "| excluded", t3.excluded.length, "| q2 medians", Object.entries(t3.cells).map(([k, c]) => `${k}: ${c.q2.median}`).join("; "));
console.log("predictions: held", count(P, (p) => p.held === true), "failed", count(P, (p) => p.held === false), "unscored", count(P, (p) => p.held === null));
for (const p of P) console.log(String(p.n).padStart(2), p.held === null ? "  ?  " : p.held ? "held " : "FAILED", "—", p.saw);
