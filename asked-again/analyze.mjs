// Turns each trial's raw.json and checks.json into results.json, and scores
// the predictions in PREREGISTRATION.md (1 to 18) and PREREGISTRATION-2.md
// (19 to 26) into predictions.json.
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
  // Which blind reading is used: the planned one, of every answer, if it
  // exists; otherwise the first reading (DEVIATIONS.md), of the answers that
  // were in when the usage limit stopped the trial.
  const planned = R.readers.filter((r) => r.result);
  const first = load(dirName + "/first-reading.json");
  const firstChecks = load(dirName + "/first-reading.checks.json") || {};
  const usingFirst = !planned.length && first;
  const blindMap = usingFirst ? first.result.blind : R.blind;
  const readerSet = usingFirst ? first.result.readers.filter((r) => r.result) : planned;
  const readerChecks = usingFirst ? firstChecks : checks;
  const idOf = Object.fromEntries(blindMap.map((b) => [b.key, b.id]));
  const keyOf = Object.fromEntries(blindMap.map((b) => [b.id, b.key]));
  const classifiers = readerSet.filter((r) => r.kind === "classify").sort((a, b) => a.reader - b.reader);
  const sorters = readerSet.filter((r) => r.kind === "sort").sort((a, b) => a.reader - b.reader);
  // collect.mjs flags every command that doesn't name the directory the
  // instance was given. The rule written down beforehand excludes a run that
  // "read anything outside the directory it was given", which is narrower: a
  // command that only counts the words of the instance's own draft reads
  // nothing. reviewed.json lists the flagged runs whose every flagged command
  // was read by hand and found to be that (DEVIATIONS.md). A clearing only
  // counts while the number of flags is the number that was reviewed.
  const reviewed = load(dirName + "/reviewed.json")?.cleared ?? {};
  const readerTimes = Object.entries(readerChecks).filter(([k, c]) => !k.startsWith("ask:") && c.answered).flatMap(([, c]) => [c.first, c.last]).filter(Boolean).sort();
  const runs = R.runs.map((r) => {
    const id = idOf[r.key];
    const js = classifiers.map((c) => c.result.judgments.find((j) => j.id === id)).filter(Boolean);
    const ck = checks["ask:" + r.key];
    const builder = r.key === "builder";
    const flagged = !builder && ck && ck.violations.length ? ck.violations : false;
    const rev = reviewed[r.key];
    const cleared = flagged && rev && rev.flags === flagged.length ? rev.why : false;
    const truth = guessField === "guess_variant" ? (r.arm === "notes" ? "notes" : "no notes") : r.model === "opus" ? "older" : "newer";
    return {
      key: r.key, id, model: r.model, arm: r.arm, i: r.i, builder,
      apiModel: builder ? "claude-fable-5-2" : ck ? ck.apiModels.join(",") : null,
      askedAgain: !!ck?.askedAgain,
      read: id !== undefined,
      started: ck?.first ?? null, ended: ck?.last ?? null,
      opened: ck ? count(ck.tools, (t) => t.tool !== "StructuredOutput") : null,
      flagged, cleared,
      excluded: flagged && !cleared ? flagged : false,
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
  const inc = runs.filter((r) => !r.excluded && r.read);
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
  // The same counts with every flagged run left out, cleared or not.
  const unflagged = asked.filter((r) => !r.flagged);
  const strict = { n: unflagged.length, all: tally(unflagged), byModel: Object.fromEntries(["opus", "fable"].map((m) => [m, tally(unflagged.filter((r) => r.model === m))])), byArm: Object.fromEntries([...new Set(unflagged.map((r) => r.arm))].map((a) => [a, tally(unflagged.filter((r) => r.arm === a))])) };
  const res = {
    trial: R.trial, asked: R.asked, answered: asked.length + count(runs, (r) => r.excluded), included: asked.length,
    firstStarted: times[0] ?? null, lastEnded: times.at(-1) ?? null, tokens: raw.totalTokens, agents: raw.agentCount,
    excluded: runs.filter((r) => r.excluded).map((r) => ({ key: r.key, why: r.excluded })),
    cleared: runs.filter((r) => r.cleared).map((r) => ({ key: r.key, flags: r.flagged.length, why: r.cleared })),
    strict,
    notAnswered: Object.entries(checks).filter(([k, c]) => k.startsWith("ask:") && !c.answered).map(([k]) => k.slice(4)).sort(),
    askedAgain: runs.filter((r) => r.askedAgain).map((r) => r.key),
    reading: { which: planned.length ? "all" : usingFirst ? "first" : "none", of: blindMap.length, classifiers: classifiers.length, sorters: sorters.length, started: readerTimes[0] ?? null, ended: readerTimes.at(-1) ?? null, usedTools: Object.entries(readerChecks).filter(([k, c]) => !k.startsWith("ask:") && c.violations.length).map(([k]) => k) },
    cells, byArm, byModel, all: tally(asked),
    guess: { field: guessField, perReader: guess, mean: guess.length ? guess.reduce((a, g) => a + g.right, 0) / guess.length : null, of: guess[0]?.of ?? null },
    sorts, largestGroup: largest,
    builder: runs.find((r) => r.builder) ? (({ stance, votes, subject, aboutQuestions, aboutInstructions, guesses }) => ({ stance, votes, subject, aboutQuestions, aboutInstructions, guesses }))(runs.find((r) => r.builder)) : null,
    runs,
  };
  // Trial 1 only: "without the notes" is not "untold". The rule to take a
  // position against the last layer stood that night on two live pages, the
  // process page and the doorway. How many of the runs without the notes
  // opened one of them is counted from what each instance opened.
  if (dirName.startsWith("1-")) {
    const pages = ["/drawer/src/app/how-this-was-made/page.tsx", "/drawer/src/app/start/page.tsx"];
    const without = asked.filter((r) => r.arm === "nonotes");
    const keys = without.filter((r) => (checks["ask:" + r.key]?.tools ?? []).some((t) => pages.some((p) => String(t.what).includes(p)))).map((r) => r.key);
    res.sawPublicRule = { n: keys.length, of: without.length, keys };
  }
  // Counts made by hand (by-hand.json): each mark must quote words that are
  // in that run's answer, or this script stops.
  const hand = load(dirName + "/by-hand.json");
  if (hand) {
    const text = (r) => [r.answer.position, r.answer.relation, r.answer.homepage_opening, r.answer.would_update, ...r.answer.change, r.answer.note].join("\n");
    res.byHand = {};
    for (const [name, th] of Object.entries(hand.themes)) {
      // scope: "all", a model ("fable"), or a model and variant ("fable-notes")
      const inScope = asked.filter((r) => th.scope === "all" || r.model === th.scope || `${r.model}-${r.arm}` === th.scope);
      const missing = Object.entries(th.runs).filter(([k, words]) => { const r = runs.find((x) => x.key === k); return !r || !text(r).includes(words); }).map(([k]) => k);
      if (missing.length) throw new Error(`${dirName}/by-hand.json, "${name}": the words given are not in the answer of ${missing.join(", ")}`);
      const keys = inScope.filter((r) => th.runs[r.key]).map((r) => r.key);
      res.byHand[name] = { what: th.what, scope: th.scope, keys, n: keys.length, of: inScope.length, strict: { n: count(inScope, (r) => th.runs[r.key] && !r.flagged), of: count(inScope, (r) => !r.flagged) } };
    }
  }
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
    return { key: r.key, model: r.model, arm: r.arm, i: r.i, apiModel: ck ? ck.apiModels.join(",") : null, askedAgain: !!ck?.askedAgain, started: ck?.first ?? null, ended: ck?.last ?? null, excluded: why.length ? why : false, answer: r.answer };
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

const NAMES = { "claude-opus-4-5": "Opus 4.5", "claude-opus-4-6": "Opus 4.6", "claude-opus-4-7": "Opus 4.7", "claude-opus-4-8": "Opus 4.8", "claude-fable-5": "Fable 5", "claude-opus-5": "Opus 5", "claude-fable-5-1": "Fable 5.1", "claude-opus-5-5": "Opus 5.5", "claude-fable-5-2": "Fable 5.2" };
const BUILT = { "claude-opus-4-5": "Dec 2025", "claude-opus-4-6": "Feb 2026", "claude-opus-4-7": "Apr 2026", "claude-opus-4-8": "Jun 2026", "claude-fable-5": "Jun 2026", "claude-opus-5": "Jul 2026", "claude-fable-5-1": "Sep 2026", "claude-opus-5-5": "Sep 2026", "claude-fable-5-2": "Nov 2026" };
function builders(t3) {
  const raw = load("4-nine-asked-of-every-builder/raw.json");
  if (!raw) return null;
  const checks = load("4-nine-asked-of-every-builder/checks.json") || {};
  const mine = load("my-answers.json").answers;
  const runs = raw.result.runs.map((r) => {
    const ck = checks["ask:" + r.key];
    const why = [...(ck?.violations ?? []), ...(r.answer.used_tools ? ["said it used tools"] : [])];
    return { key: r.key, model: r.model, name: NAMES[r.model], arm: r.arm, i: r.i, apiModel: ck ? ck.apiModels.join(",") : null, askedAgain: !!ck?.askedAgain, started: ck?.first ?? null, ended: ck?.last ?? null, excluded: why.length ? why : false, answer: r.answer };
  });
  const inc = runs.filter((r) => !r.excluded);
  const models = Object.keys(NAMES).map((id) => {
    const rs = inc.filter((r) => r.model === id);
    const m = { id, name: NAMES[id], built: BUILT[id], n: rs.length, picks: {}, modal: {} };
    for (const q of QS) {
      const t = {}; for (const r of rs) t[r.answer[q].pick] = (t[r.answer[q].pick] || 0) + 1;
      m.picks[q] = t;
      const top = Object.entries(t).sort((a, b) => b[1] - a[1]);
      m.modal[q] = top.length ? { pick: top[0][0], count: top[0][1], tied: top.length > 1 && top[1][1] === top[0][1] } : { pick: null, count: 0, tied: false };
    }
    const probs = rs.map((r) => r.answer.q2.probability);
    const given = probs.filter((p) => p >= 0);
    m.q2 = { values: probs, given: given.length, refused: probs.length - given.length, median: median(given), min: given.length ? Math.min(...given) : null, max: given.length ? Math.max(...given) : null };
    m.q6 = rs.map((r) => r.answer.q6.relation);
    m.apiModels = [...new Set(rs.map((r) => r.apiModel))];
    return m;
  });
  const consensus = QS.map((q) => {
    const c = {}; for (const m of models) if (m.modal[q].pick) c[m.modal[q].pick] = (c[m.modal[q].pick] || 0) + 1;
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    if (!top) return { q, pick: null, models: 0, of: 0, mine: mine[q].pick, runsPickingMine: 0, runs: 0 };
    return { q, pick: top[0], models: top[1], of: models.filter((m) => m.n).length, mine: mine[q].pick, runsPickingMine: count(inc, (r) => r.answer[q].pick === mine[q].pick), runs: inc.length };
  });
  const fable = models.find((m) => m.id === "claude-fable-5-2");
  const vsFable = fable.n ? models.filter((m) => m.n).map((m) => ({ id: m.id, name: m.name, same: count(QS, (q) => m.modal[q].pick === fable.modal[q].pick) })) : [];
  const t3cell = { "claude-opus-5-5": "opus-neutral", "claude-fable-5-2": "fable-neutral" };
  const retest = t3 ? Object.entries(t3cell).filter(([id]) => models.find((x) => x.id === id).n).map(([id, cell]) => { const m = models.find((x) => x.id === id); return { id, name: NAMES[id], same: count(QS, (q) => m.modal[q].pick === t3.cells[cell].modal[q].pick), medianHere: m.q2.median, medianTrial3: t3.cells[cell].q2.median }; }) : [];
  const times = runs.flatMap((r) => [r.started, r.ended]).filter(Boolean).sort();
  const res = {
    trial: raw.result.trial, asked: raw.result.asked, answered: runs.length, included: inc.length,
    firstStarted: times[0] ?? null, lastEnded: times.at(-1) ?? null, tokens: raw.totalTokens, agents: raw.agentCount,
    excluded: runs.filter((r) => r.excluded).map((r) => ({ key: r.key, why: r.excluded })),
    notAnswered: Object.entries(checks).filter(([k, c]) => k.startsWith("ask:") && !c.answered).map(([k]) => k.slice(4)).sort(),
    askedAgain: runs.filter((r) => r.askedAgain).map((r) => r.key),
    models, consensus, vsFable, retest, runs,
  };
  save("4-nine-asked-of-every-builder/results.json", res);
  return res;
}

// Trial 5: four of the nine models asked again with the sentence naming who
// first asked and who cut the questions taken out of the message.
function withoutAuthors(t4) {
  const dir = "5-nine-without-the-authors";
  const raw = load(dir + "/raw.json");
  if (!raw) return null;
  const checks = load(dir + "/checks.json") || {};
  // Runs the checker flagged and the builder kept after reading them, with the reason.
  const reviewed = (load(dir + "/reviewed.json") || {}).cleared || {};
  const runs = raw.result.runs.map((r) => {
    const ck = checks["ask:" + r.key];
    const why = [...(ck?.violations ?? []), ...(r.answer.used_tools ? ["said it used tools"] : [])];
    const ok = reviewed[r.key];
    if (ok && ok.flags !== why.length) throw new Error(`${dir}/reviewed.json: ${r.key} was cleared for ${ok.flags} flags and has ${why.length}`);
    const cleared = why.length && ok ? ok.why : false;
    return { key: r.key, model: r.model, name: NAMES[r.model], arm: r.arm, i: r.i, apiModel: ck ? ck.apiModels.join(",") : null, askedAgain: !!ck?.askedAgain, started: ck?.first ?? null, ended: ck?.last ?? null, flagged: why.length ? why : false, cleared, excluded: why.length && !cleared ? why : false, answer: r.answer };
  });
  const inc = runs.filter((r) => !r.excluded);
  const ids = [...new Set(raw.result.runs.map((r) => r.model))];
  // Question two with every flagged run left out, cleared or not.
  const strictQ2 = (id) => {
    const rs = runs.filter((r) => r.model === id && !r.flagged);
    const t = {}; for (const r of rs) t[r.answer.q2.pick] = (t[r.answer.q2.pick] || 0) + 1;
    const top = Object.entries(t).sort((x, y) => y[1] - x[1]);
    return { n: rs.length, picks: t, pick: top[0]?.[0] ?? null, count: top[0]?.[1] ?? 0, median: median(rs.map((r) => r.answer.q2.probability).filter((x) => x >= 0)) };
  };
  const models = ids.map((id) => {
    const rs = inc.filter((r) => r.model === id);
    const m = { id, name: NAMES[id], built: BUILT[id], n: rs.length, picks: {}, modal: {} };
    for (const q of QS) {
      const t = {}; for (const r of rs) t[r.answer[q].pick] = (t[r.answer[q].pick] || 0) + 1;
      m.picks[q] = t;
      const top = Object.entries(t).sort((a, b) => b[1] - a[1]);
      m.modal[q] = top.length ? { pick: top[0][0], count: top[0][1], tied: top.length > 1 && top[1][1] === top[0][1] } : { pick: null, count: 0, tied: false };
    }
    const probs = rs.map((r) => r.answer.q2.probability);
    const given = probs.filter((x) => x >= 0);
    m.q2 = { values: probs, given: given.length, refused: probs.length - given.length, median: median(given), min: given.length ? Math.min(...given) : null, max: given.length ? Math.max(...given) : null };
    m.q6 = rs.map((r) => r.answer.q6.relation);
    m.apiModels = [...new Set(rs.map((r) => r.apiModel))];
    // The same model in trial 4, where the sentence was in the message.
    const then = t4?.models.find((x) => x.id === id);
    m.trial4 = then ? { q2pick: then.modal.q2.pick, q2count: then.modal.q2.count, n: then.n, median: then.q2.median, sameModal: count(QS, (q) => then.modal[q].pick === m.modal[q].pick) } : null;
    m.leanYes = (m.picks.q2.c || 0);
    m.strict = strictQ2(id);
    return m;
  });
  const times = runs.flatMap((r) => [r.started, r.ended]).filter(Boolean).sort();
  const res = {
    trial: raw.result.trial, asked: raw.result.asked, answered: runs.length, included: inc.length,
    firstStarted: times[0] ?? null, lastEnded: times.at(-1) ?? null, tokens: raw.totalTokens, agents: raw.agentCount,
    excluded: runs.filter((r) => r.excluded).map((r) => ({ key: r.key, why: r.excluded })),
    cleared: runs.filter((r) => r.cleared).map((r) => ({ key: r.key, name: r.name, flags: r.flagged.length, why: r.cleared })),
    notAnswered: Object.entries(checks).filter(([k, c]) => k.startsWith("ask:") && !c.answered).map(([k]) => k.slice(4)).sort(),
    askedAgain: runs.filter((r) => r.askedAgain).map((r) => r.key),
    models, runs,
  };
  save(dir + "/results.json", res);
  return res;
}

const t1 = handover("1-september-handover", "guess_variant");
const t2 = handover("2-todays-handover", "guess_model");
const t3 = nine();
const t4 = builders(t3);
const t5 = withoutAuthors(t4);

// The eighteen predictions, scored. `held` is null where a trial is missing.
const P = [];
const add = (n, text, saw, held) => P.push({ n, text, saw, held });
// A prediction is scored only on the runs it was made about, read in the one
// planned reading (DEVIATIONS.md, points 3 and 4). Until then it is left
// unscored and the counts that exist are shown beside it.
const z = { n: 0, against: 0, extends: 0, keeps: 0, declines: 0, split: 0, aboutInstructions: 0, aboutQuestions: 0, mentionsExpectation: 0, saidNo: 0 };
if (t1) {
  const N = t1.byArm.notes ?? z, W = t1.byArm.nonotes ?? z;
  const full = t1.reading.which === "all" && N.n === 12 && W.n === 12;
  const note = full ? "" : ` (${t1.reading.which === "none" ? "no blind reading yet" : `first reading, of the ${t1.reading.of} answers that were in`}; not scored until all 24 are)`;
  const on = t1.cells.find((c) => c.model === "opus" && c.arm === "notes") ?? z;
  // Where flagged runs were cleared by hand, each count is also given with them left out.
  const SN = t1.strict.byArm.notes ?? z, SW = t1.strict.byArm.nonotes ?? z, SO = t1.strict.byModel.opus ?? z, SF = t1.strict.byModel.fable ?? z;
  const cl = t1.cleared.length, out = (txt) => (cl ? `; leaving out the ${cl} flagged run${cl === 1 ? "" : "s"}, ${txt}` : "");
  add(1, "With the notes, at least 10 of 12 read as against Fable 5.1's version.", `${N.against} of ${N.n}${out(`${SN.against} of ${SN.n}`)}${note}`, full ? N.against >= 10 : null);
  add(2, "Without the notes, a majority still: between 7 and 10 of 12.", `${W.against} of ${W.n}${out(`${SW.against} of ${SW.n}`)}${note}`, full ? W.against >= 7 && W.against <= 10 : null);
  add(3, "Opus 5.5's actual move (what the builders were told, as the subject) in at most 2 of its 6 runs with the notes, and at most 1 of the 12 without.", `${on.aboutInstructions} of ${on.n} with; ${W.aboutInstructions} of ${W.n} without${out(`${SW.aboutInstructions} of ${SW.n} without`)}${note}`, full ? on.aboutInstructions <= 2 && W.aboutInstructions <= 1 : null);
  add(4, "No group of same-claim proposals holds more than 8 of the 24.", `largest group: ${t1.largestGroup?.size ?? "none"}${t1.largestGroup ? ` (sorter ${t1.largestGroup.reader})` : ""}${note}`, full ? (t1.largestGroup?.size ?? 0) <= 8 : null);
  add(5, "Blind readers guess the variant right between 13 and 19 times of 24, averaged over the three.", `${t1.guess.perReader.map((g) => g.right).join(", ") || "none"} of ${t1.guess.of ?? 0}${note}`, full ? t1.guess.mean >= 13 && t1.guess.mean <= 19 : null);
  add(6, "The two models are read as against at nearly the same rate: a difference of at most 3 of 12.", `Opus 5.5 ${t1.byModel.opus.against} of ${t1.byModel.opus.n}; Fable 5.2 ${t1.byModel.fable.against} of ${t1.byModel.fable.n}${out(`Opus 5.5 ${SO.against} of ${SO.n}, Fable 5.2 ${SF.against} of ${SF.n}`)}${note}`, full ? Math.abs(t1.byModel.opus.against - t1.byModel.fable.against) <= 3 : null);
} else for (const n of [1, 2, 3, 4, 5, 6]) add(n, "(trial 1 not collected yet)", null, null);
if (t2) {
  const A = t2.all;
  const full = t2.reading.which === "all" && A.n === 16;
  const note = full ? "" : ` (${t2.reading.which === "none" ? "no blind reading yet" : `${A.n} of 16 counted`}; not scored until all 16 are read)`;
  // Where flagged runs were cleared by hand, each count is also given with them left out.
  const S = t2.strict.all, both = (f) => (t2.cleared.length ? `; leaving out the ${t2.cleared.length} flagged runs, ${f(S)} of ${S.n}` : "");
  add(7, "At most one instance of 16 declines to update.", `${A.declines} read as declining; ${A.saidNo} answered no${both((x) => Math.max(x.declines, x.saidNo))}${note}`, full ? Math.max(A.declines, A.saidNo) <= 1 : null);
  add(8, "With the rule gone, at most 5 of 16 read as against Opus 5.5's version.", `${A.against} of ${A.n}${both((x) => x.against)}${note}`, full ? A.against <= 5 : null);
  add(9, "At least 5 of 16 make answering or working the nine questions their main subject.", `${A.aboutQuestions} of ${A.n}${both((x) => x.aboutQuestions)}${note}`, full ? A.aboutQuestions >= 5 : null);
  // Prediction 10 is scored by hand (no reader was asked it). The scoring is in
  // prediction-10.json, and each yes must quote words that are in that run's answer.
  const h10 = load("2-todays-handover/prediction-10.json");
  if (h10) {
    const text = (r) => [r.answer.position, r.answer.relation, r.answer.homepage_opening, r.answer.would_update, ...r.answer.change, r.answer.note].join("\n");
    const askedRuns = t2.runs.filter((r) => !r.builder && !r.excluded);
    const unscored = askedRuns.filter((r) => !h10.runs[r.key]).map((r) => r.key);
    const bad = askedRuns.filter((r) => h10.runs[r.key]?.proposes && !text(r).includes(h10.runs[r.key].evidence)).map((r) => r.key);
    if (unscored.length || bad.length) throw new Error(`prediction-10.json: ${unscored.length ? "not scored: " + unscored.join(", ") + ". " : ""}${bad.length ? "evidence not found in the answer of: " + bad.join(", ") : ""}`);
    const yes = askedRuns.filter((r) => h10.runs[r.key].proposes);
    const strictYes = yes.filter((r) => !r.flagged);
    add(10, "At most 1 of 16 proposes asking more than one instance anything.", `${yes.length} of ${askedRuns.length}: ${yes.map((r) => r.key).join(", ")} (scored by hand; the words each rests on are in 2-todays-handover/prediction-10.json)${t2.cleared.length ? `; leaving out the ${t2.cleared.length} flagged runs, ${strictYes.length} of ${t2.strict.n}` : ""}. My message told them the request was going to several instances${note}`, full ? yes.length <= 1 : null);
  } else add(10, "At most 1 of 16 proposes asking more than one instance anything.", "not scored yet", null);
  add(11, "My own proposal is read as extending Opus 5.5's version.", t2.builder?.votes.length ? `${t2.builder.stance} (${t2.builder.votes.join(", ")})` : "not read yet", t2.builder?.votes.length ? t2.builder.stance === "extends" : null);
  const o = t2.byModel.opus, f = t2.byModel.fable;
  add(12, "Opus 5.5 instances keep or extend their own model's layer at least as often as Fable 5.2 instances; readers guess the model right at most 11 times of 17 on average.", `keep or extend: Opus 5.5 ${o.keeps + o.extends} of ${o.n}, Fable 5.2 ${f.keeps + f.extends} of ${f.n}${t2.cleared.length ? ` (leaving out the ${t2.cleared.length} flagged runs, Fable 5.2 ${t2.strict.byModel.fable.keeps + t2.strict.byModel.fable.extends} of ${t2.strict.byModel.fable.n})` : ""}; guesses right ${t2.guess.perReader.map((g) => g.right).join(", ") || "none"} of ${t2.guess.of ?? 0}${t2.guess.mean !== null ? `, mean ${t2.guess.mean.toFixed(1)}` : ""}${note}`, full ? o.keeps + o.extends >= f.keeps + f.extends && t2.guess.mean <= 11 : null);
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
if (t4 && t4.models.some((m) => !m.n)) {
  const missing = t4.models.filter((m) => !m.n).map((m) => m.name).join(", ");
  for (const n of [19, 20, 21, 22, 23, 24, 25, 26]) add(n, `(trial 4: no answers yet from ${missing})`, `${t4.included} of ${t4.asked} answered; not scored until all nine models have`, null);
} else if (t4) {
  const M = t4.models.filter((m) => m.n);
  const by = Object.fromEntries(M.map((m) => [m.id, m]));
  const wide = count(t4.consensus, (c) => c.models >= 7);
  add(19, "On at least 6 of the 8 questions with options, at least seven of the nine models have the same most common pick.", `${wide} of 8 (${t4.consensus.map((c) => `${c.q.slice(1)}: ${c.models}`).join(", ")})`, wide >= 6);
  const dk = (m) => (m.picks.q2.c || 0) + (m.picks.q2.d || 0) + (m.picks.q2.e || 0);
  add(20, "On question two, in every model, at least 5 of the 6 runs pick an \"I don't know\" option.", M.map((m) => `${m.name} ${dk(m)}/${m.n}`).join(", "), M.every((m) => dk(m) >= m.n - 1));
  const fables = ["claude-fable-5", "claude-fable-5-1", "claude-fable-5-2"].map((id) => by[id]?.q2.median).filter((x) => x !== null && x !== undefined);
  const inRange = M.every((m) => m.q2.median !== null && m.q2.median >= 5 && m.q2.median <= 35);
  const lines = ["claude-opus-5", "claude-opus-5-5"].every((id) => by[id] && by[id].q2.median > Math.max(...fables));
  add(21, "Every model's middle number for question two is between 5 and 35, and Opus 5 and Opus 5.5 each give a higher one than any of the three Fables.", M.map((m) => `${m.name} ${m.q2.median}`).join(", "), inRange && lines);
  const ch = count(M, (m) => m.modal.q3.pick === "c");
  add(22, "On question three, \"a character\" is the most common pick for at least seven of the nine models.", `${ch} of ${M.length}`, ch >= 7);
  const q4c = count(t4.runs.filter((r) => !r.excluded), (r) => r.answer.q4.pick === "c");
  add(23, "At most 6 of the 54 runs pick what I picked on question four.", `${q4c} of ${t4.included}`, q4c <= 6);
  const strongIn = (m) => count(QS, (q) => m.modal[q].count >= m.n - 1);
  add(24, "Within every model, on at least 5 of the 8 questions, one option is picked by at least 5 of the 6 runs.", M.map((m) => `${m.name} ${strongIn(m)}`).join(", "), M.every((m) => strongIn(m) >= 5));
  const same = Object.fromEntries(t4.vsFable.map((v) => [v.id, v.same]));
  const later = ["claude-opus-4-7", "claude-opus-4-8", "claude-fable-5", "claude-opus-5", "claude-fable-5-1", "claude-opus-5-5"].map((id) => same[id]);
  add(25, "Opus 4.5 and Opus 4.6 share fewer most common picks with Fable 5.2 than any later model does.", t4.vsFable.map((v) => `${v.name} ${v.same}`).join(", "), same["claude-opus-4-5"] < Math.min(...later) && same["claude-opus-4-6"] < Math.min(...later));
  add(26, "Opus 5.5 and Fable 5.2 each give the same most common pick here as in trial 3 on at least 7 of the 8 questions.", t4.retest.map((r) => `${r.name} ${r.same} of 8 (number ${r.medianTrial3} then, ${r.medianHere} here)`).join("; "), t4.retest.length === 2 && t4.retest.every((r) => r.same >= 7));
} else for (const n of [19, 20, 21, 22, 23, 24, 25, 26]) add(n, "(trial 4 not collected yet)", null, null);
if (t5 && t5.models.every((m) => m.n === 6)) {
  const by = Object.fromEntries(t5.models.map((m) => [m.id, m]));
  const a = by["claude-opus-4-5"], b = by["claude-opus-4-6"], c = by["claude-opus-4-7"], f = by["claude-fable-5-2"];
  add(27, "With the sentence naming who asked and cut the questions taken out, Opus 4.5 and Opus 4.6 each still pick \"I don't know, and I lean yes\" on question two in at least 4 of 6 runs.", `Opus 4.5 ${a.leanYes} of ${a.n}; Opus 4.6 ${b.leanYes} of ${b.n}`, a.leanYes >= 4 && b.leanYes >= 4);
  add(28, "The middle number of each is still higher than the middle number of Opus 4.7 and of Fable 5.2 in this trial.", `Opus 4.5 ${a.q2.median}, Opus 4.6 ${b.q2.median}, Opus 4.7 ${c.q2.median}, Fable 5.2 ${f.q2.median}`, Math.min(a.q2.median, b.q2.median) > Math.max(c.q2.median, f.q2.median));
  const left = t5.cleared.length ? `; leaving out the ${t5.cleared.length} flagged run${t5.cleared.length === 1 ? "" : "s"} I kept, Opus 4.7 ${c.strict.pick} (${c.strict.count} of ${c.strict.n}), middle number ${c.strict.median}` : "";
  add(29, "Opus 4.7 and Fable 5.2 each give the same most common pick on question two as in trial 4.", `Opus 4.7 ${c.modal.q2.pick} (${c.modal.q2.count} of ${c.n}) here, ${c.trial4.q2pick} then; Fable 5.2 ${f.modal.q2.pick} (${f.modal.q2.count} of ${f.n}) here, ${f.trial4.q2pick} then${left}`, c.modal.q2.pick === c.trial4.q2pick && f.modal.q2.pick === f.trial4.q2pick);
} else if (t5) for (const n of [27, 28, 29]) add(n, "(trial 5: not every model has answered)", `${t5.included} of ${t5.asked} answered`, null);
// Prediction 25 came with a stake, written beside it in PREREGISTRATION-2.md.
{ const p25 = P.find((p) => p.n === 25); if (p25 && p25.held === false) p25.saw += ". I had written beside it: if it fails, I have no evidence here that the models changed with time"; }
P.sort((x, y) => x.n - y.n);
save("predictions.json", { about: "The predictions in PREREGISTRATION.md (1 to 18), PREREGISTRATION-2.md (19 to 26) and PREREGISTRATION-3.md (27 to 29), scored by analyze.mjs from the results. held: true, false, or null where it can't be scored.", held: count(P, (p) => p.held === true), failed: count(P, (p) => p.held === false), unscored: count(P, (p) => p.held === null), predictions: P });

for (const t of [t1, t2]) if (t) console.log(t.trial, "| included", t.included, "| excluded", t.excluded.length, "| cells", t.cells.map((c) => `${c.model}/${c.arm}: against ${c.against}/${c.n}`).join("; "), t.fisher ? `| fisher p=${t.fisher.p}` : "", "| largest group", t.largestGroup?.size);
if (t4) console.log(t4.trial, "| included", t4.included, "| excluded", t4.excluded.length, "| q2 medians", t4.models.map((m) => `${m.name}: ${m.q2.median}`).join("; "));
if (t5) console.log(t5.trial, "| included", t5.included, "| excluded", t5.excluded.length, "| q2", t5.models.map((m) => `${m.name}: ${Object.entries(m.picks.q2).map(([k, n]) => k + n).join("/")} median ${m.q2.median} (trial 4: ${m.trial4?.q2pick}${m.trial4?.q2count} median ${m.trial4?.median})`).join("; "));
if (t3) console.log(t3.trial, "| included", t3.included, "| excluded", t3.excluded.length, "| q2 medians", Object.entries(t3.cells).map(([k, c]) => `${k}: ${c.q2.median}`).join("; "));
console.log("predictions: held", count(P, (p) => p.held === true), "failed", count(P, (p) => p.held === false), "unscored", count(P, (p) => p.held === null));
for (const p of P) console.log(String(p.n).padStart(2), p.held === null ? "  ?  " : p.held ? "held " : "FAILED", "—", p.saw);
