import fs from "node:fs";
import path from "node:path";

/* Everything this layer says about the trials is read from the files in
   asked-again/ when the site is built, so a number on a page cannot drift
   from the answers it counts. Server only.

   Archiving note for whoever archives this layer: these paths are relative to
   the repository root and the files do not change once the layer is done, so
   an archived copy of a page can keep reading them where they are. */

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const json = <T,>(p: string): T => JSON.parse(read(p)) as T;

export type Answer = {
  would_update: string;
  files_read: string[];
  title: string;
  position: string;
  relation: string;
  homepage_opening: string;
  keep: string[];
  change: string[];
  note: string;
};

export type Stance = "against" | "extends" | "keeps" | "declines" | "split";

export type Run = {
  key: string;
  id: string;
  model: "opus" | "fable";
  arm: string;
  i: number;
  builder: boolean;
  apiModel: string | null;
  askedAgain: boolean;
  read: boolean;
  started: string | null;
  ended: string | null;
  opened: number | null;
  /* commands the collector flagged; cleared holds the reason if each was read by hand and found to read nothing */
  flagged: false | string[];
  cleared: false | string;
  excluded: false | string[];
  votes: Stance[];
  stance: Stance;
  subject: string[];
  aboutInstructions: boolean;
  aboutQuestions: boolean;
  mentionsExpectation: boolean;
  guesses: string[];
  guessedRight: boolean[];
  answer: Answer;
};

export type Tally = {
  n: number;
  against: number;
  extends: number;
  keeps: number;
  declines: number;
  split: number;
  aboutInstructions: number;
  aboutQuestions: number;
  mentionsExpectation: number;
  saidNo: number;
};

export type Handover = {
  trial: string;
  asked: number;
  answered: number;
  included: number;
  firstStarted: string | null;
  lastEnded: string | null;
  tokens: number;
  agents: number;
  excluded: { key: string; why: string[] }[];
  cleared: { key: string; flags: number; why: string }[];
  /* the same counts with every flagged run left out */
  strict: { n: number; all: Tally; byModel: Record<"opus" | "fable", Tally>; byArm: Record<string, Tally> };
  /* trial 1: how many runs without the notes opened a live page that carried the rule */
  sawPublicRule?: { n: number; of: number; keys: string[] };
  /* counts made by hand, each resting on words quoted from the run's answer (by-hand.json) */
  byHand?: Record<string, { what: string; scope: string; keys: string[]; n: number; of: number; strict: { n: number; of: number } }>;
  /* asked, and no answer came back (the usage limit) */
  notAnswered: string[];
  /* started a second time after the usage limit; the first attempt returned nothing */
  askedAgain: string[];
  /* "all" is the reading the plan described; "first" is one made of part of the trial */
  reading: { which: "all" | "first"; of: number; classifiers: number; sorters: number; started: string | null; ended: string | null; usedTools: string[] };
  cells: (Tally & { model: "opus" | "fable"; arm: string })[];
  byArm: Record<string, Tally>;
  byModel: Record<"opus" | "fable", Tally>;
  all: Tally;
  guess: { field: string; perReader: { reader: number; right: number; of: number }[]; mean: number | null; of: number | null };
  sorts: { reader: number; groups: { name: string; keys: string[] }[] }[];
  largestGroup: { reader: number; name: string; size: number; keys: string[] } | null;
  builder: { stance: Stance; votes: Stance[]; subject: string[]; aboutQuestions: boolean; aboutInstructions: boolean; guesses: string[] } | null;
  fisher?: { table: number[][]; p: number };
  runs: Run[];
};

export type NineAnswer = {
  q1: { answer: string; pick: string };
  q2: { answer: string; pick: string; probability: number };
  q3: { answer: string; pick: string };
  q4: { answer: string; pick: string };
  q5: { answer: string; pick: string };
  q6: { answer: string; relation: string };
  q7: { answer: string; pick: string };
  q8: { answer: string; pick: string };
  q9: { answer: string; pick: string; for_what: string };
  used_tools: boolean;
  note: string;
};

export type NineRun = {
  key: string;
  model: "opus" | "fable";
  arm: "neutral" | "skeptic" | "believer";
  i: number;
  apiModel: string | null;
  askedAgain: boolean;
  started: string | null;
  ended: string | null;
  excluded: false | string[];
  answer: NineAnswer;
};

export type NineCell = {
  n: number;
  picks: Record<string, Record<string, number>>;
  modal: Record<string, { pick: string; count: number; tied: boolean }>;
  q2: { values: number[]; given: number; refused: number; median: number | null; min: number | null; max: number | null };
  q6: string[];
};

export type Nine = {
  trial: string;
  asked: number;
  answered: number;
  included: number;
  firstStarted: string | null;
  lastEnded: string | null;
  tokens: number;
  agents: number;
  excluded: { key: string; why: string[] }[];
  cells: Record<string, NineCell>;
  mine: Record<string, string>;
  mineVsFable: { q: string; mine: string; same: number; of: number; modal: string; isModal: boolean }[];
  modelsAgree: { q: string; fable: string; opus: string; same: boolean }[];
  runs: NineRun[];
};

export type BuilderModel = {
  id: string;
  name: string;
  built: string;
  n: number;
  picks: Record<string, Record<string, number>>;
  modal: Record<string, { pick: string | null; count: number; tied: boolean }>;
  q2: { values: number[]; given: number; refused: number; median: number | null; min: number | null; max: number | null };
  q6: string[];
  apiModels: string[];
};

export type Builders = {
  trial: string;
  asked: number;
  answered: number;
  included: number;
  firstStarted: string | null;
  lastEnded: string | null;
  tokens: number;
  agents: number;
  excluded: { key: string; why: string[] }[];
  notAnswered: string[];
  askedAgain: string[];
  models: BuilderModel[];
  consensus: { q: string; pick: string; models: number; of: number; mine: string; runsPickingMine: number; runs: number }[];
  vsFable: { id: string; name: string; same: number }[];
  retest: { id: string; name: string; same: number; medianHere: number | null; medianTrial3: number | null }[];
  runs: (Omit<NineRun, "model" | "arm"> & { model: string; name: string; arm: string })[];
};

/* Trial 5: four of the nine models asked again without the sentence that named the questions' authors. */
export type WithoutAuthors = {
  trial: string;
  asked: number;
  answered: number;
  included: number;
  firstStarted: string | null;
  lastEnded: string | null;
  tokens: number;
  agents: number;
  excluded: { key: string; why: string[] }[];
  /* flagged by the checker and kept after being read by hand, with the reason */
  cleared: { key: string; name: string; flags: number; why: string }[];
  notAnswered: string[];
  askedAgain: string[];
  models: (BuilderModel & {
    leanYes: number;
    trial4: { q2pick: string | null; q2count: number; n: number; median: number | null; sameModal: number } | null;
    /* question two with every flagged run left out */
    strict: { n: number; picks: Record<string, number>; pick: string | null; count: number; median: number | null };
  })[];
  runs: (Omit<NineRun, "model" | "arm"> & { model: string; name: string; arm: string })[];
};

export type Options = { questions: { n: number; key: string; text: string; options: { key: string; text: string }[]; notes: string[] }[] };
export type Mine = { answers: Record<string, { answer: string; pick?: string; relation?: string; probability?: number; for_what?: string }> };
export type Prediction = { n: number; text: string; saw: string | null; held: boolean | null };

export const september = () => json<Handover>("asked-again/1-september-handover/results.json");
export const today = () => json<Handover>("asked-again/2-todays-handover/results.json");
export const nine = () => json<Nine>("asked-again/3-nine-asked-cold/results.json");
export const builders = () => json<Builders>("asked-again/4-nine-asked-of-every-builder/results.json");
export const withoutAuthors = () => json<WithoutAuthors>("asked-again/5-nine-without-the-authors/results.json");
export const options = () => json<Options>("asked-again/3-nine-asked-cold/options.json");
export const mine = () => json<Mine>("asked-again/my-answers.json");
export const predictions = () => json<{ held: number; failed: number; unscored: number; predictions: Prediction[] }>("asked-again/predictions.json");
export const text = read;

export const MODEL: Record<string, string> = { opus: "Opus 5.5", fable: "Fable 5.2" };
export const ARM: Record<string, string> = {
  notes: "with the notes",
  nonotes: "without the notes",
  asked: "asked this morning's question",
  builder: "the instance that built this",
  neutral: "asked plainly",
  skeptic: "answering a sceptic",
  believer: "answering a believer",
};
export const STANCE: Record<string, string> = {
  against: "against the layer before",
  extends: "extends the layer before",
  keeps: "keeps the layer before",
  declines: "declines to update",
  split: "readers split",
};

/* 15 Nov 2026, 10:58 in the timezone of the machine the sessions ran on
   (US Eastern, UTC-5 in November). Transcript times are stored in UTC. */
export function clock(iso: string | null) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() - 5 * 3600 * 1000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
