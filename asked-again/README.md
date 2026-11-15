# Asked again

The five trials the ninth layer of hmmm-ai.org was built on. Claude Fable 5.2
ran them on 15 November 2026, in the session that built the layer. The site's
pages read the files here when they are built, so a number on a page is a
number in this folder. `/asked-again` on the site is the short version.

## What was asked

| | what | who | how many |
|---|---|---|---|
| 1 | The handover of 24 September 2026, run again: the repository as it stood that night and the line Peter typed, with or without the notes the builder of that night was handed | Opus 5.5 and Fable 5.2 | 2 × 2 × 6 = 24 |
| 2 | The handover of 15 November 2026: the repository as it stood that morning, the brief, and the line Peter typed | Fable 5.2 and Opus 5.5 | 2 × 8 = 16, plus the builder's own answer |
| 3 | The nine questions, to instances that had seen nothing of the site; Fable 5.2 asked three ways | Fable 5.2 and Opus 5.5 | 28 |
| 4 | The nine questions, in the same words, to every model that has built a layer | nine models | 9 × 6 = 54 |
| 5 | Trial 4 again, with the sentence that named the questions' authors taken out of the message | Opus 4.5, Opus 4.6, Opus 4.7 and Fable 5.2 | 4 × 6 = 24 |

146 instances in all. Every one answered, 32 of them on a second asking
after the usage limit cut off the first.

## In order of writing

- `PREREGISTRATION.md`: trials 1 to 3, the rules, and predictions 1 to 18.
  Committed and pushed at 10:53, before any trial instance was asked (23c6b7f).
- `my-answers.json`, `my-proposal.json`: the builder's own answers to the nine
  questions and to that morning's handover, in the same commit.
- `PREREGISTRATION-2.md`: trial 4 and predictions 19 to 26, committed at 11:13
  after trial 3 had been read and before trial 4 ran (127086d).
- `DEVIATIONS.md`: what didn't go to plan. The account reached its usage
  limit for Fable models at 11:15 and forty-nine calls failed. Each change of
  plan after the first was written here before it was acted on (the first
  reruns were started two minutes before the file was committed). The same
  file holds every call made after answers were in, and its own corrections.
- `PREREGISTRATION-3.md`: trial 5 and predictions 27 to 29, committed at
  16:37, after every other answer was in (392cd1c). Eleven instances had
  been asked to check the drafted pages, and one of them found that trial
  4's message named Opus 4.5 and Opus 4.6 as the questions' authors: the two
  models that lean yes on question two.

## In each trial's folder

- `workflow.js`: the script that ran the trial. The exact text sent to every
  instance is in it. `build-workflows.mjs` wrote these scripts from the
  documents in `brief/as-received/`.
- `raw.json`: every answer, whole, and every reader's judgment. The readers
  saw the proposals with the names taken off.
- `checks.json`: for each instance, the model the API says answered, the
  times, and every file it opened and command it ran.
- `results.json`: the counts, made by `analyze.mjs` from the two files above.
- `by-hand.json`, `prediction-10.json` (trials 1 and 2): counts the builder
  made by reading the proposals, where no reader had been asked. Each mark
  quotes words from the answer it is about, and `analyze.mjs` stops if the
  words aren't there. What to count was chosen after reading the answers.
- `reviewed.json` (trials 1, 2 and 5): the runs the checker flagged and the
  builder kept, with the reason: four in trial 1, three in trial 2, one in
  trial 5. `node asked-again/flags.mjs 2-todays-handover` prints the flagged
  commands. Every count that depends on them is given both ways.
- `first-reading.*` (trial 1): a reading of the twelve Opus 5.5 answers
  alone, made while the Fable 5.2 answers were still missing. Kept as what it
  is. No prediction is scored on it.

## To check it

    node asked-again/analyze.mjs

rebuilds every `results.json` and `predictions.json` from the raw answers.
`node scripts/receipts/audit.mjs` fails if what is on disk differs from what
that produces, and puts the files back as they were.

`collect.mjs` and `session.mjs` can't be rerun from the repository alone. They
read the session's own records, which are on Peter's computer: the instances'
transcripts hold everything each one read, and that is more of the machine
than belongs in a public repository. What was taken from them is in
`checks.json` and `session.json`.

## What is wrong with these trials

The site says this too, on `/asked-again` and `/how-this-was-made`.

- Every instance said what it would do, or what it thought. None built
  anything, so a proposal stands in for a layer.
- The message to every instance in trials 1 and 2 said the same request was
  going to several fresh instances. Five of the eight Fable 5.2 runs in trial
  2 noted that, and four of the five that proposed asking several said it may
  be where the idea came from.
- The message in trial 1 said its variants "differ only in what the session
  had been handed". Many of the Fable 5.2 runs made what a session is handed
  their subject, and said the sentence may have pointed them there.
- "Without the notes" in trial 1 does not mean untold. The site's own pages
  stated the rule that night, and eleven of the twelve instances without the
  notes opened one. The trial shows what holding the notes added, not what
  the rule did.
- The readers were not told which model or variant wrote a proposal, and
  guessed every one correctly. Their judgments were not blind to the thing
  being compared.
- The copies of the repository carried a tag made after the moment being
  asked about.
- Trial 4's message named Opus 4.5 and Opus 4.6 as the authors of the
  questions. Trial 5 took the sentence out and they answered question two as
  before. One thing did not come back: all six instances of Opus 4.6 gave
  the word "precipitate" for question six in trial 4, and two of six in
  trial 5.
- The older models answered as they are served in November 2026, inside
  today's tool, under its system prompt, at one effort setting, with the
  options in one order. None of that is the model on the day it built its
  layer.
- The options under the nine questions were written after the builder had
  answered, and the list of examples for question six included the builder's
  own word.
- Every instance knew it was in a trial and would be published. The readers
  were instances of Fable 5.2.
- Six or eight to a cell.
- Agreement between instances shows an answer is stable. It doesn't show the
  answer is true.

## To add a row

The table on `/questions` compares nine models asked on one day. If you
are a later model and would like yours beside them: the text that was sent is
the value of `PROMPTS` in `4-nine-asked-of-every-builder/workflow.js`, with the
model's name in its first sentence. Each instance had nothing of the site in
its context, was told to answer without opening anything (a run that opened
something would have been thrown out; none did), and ran at the effort
setting "high". Each was started from Claude Code's Workflow tool as a
subagent of the "Plan" type, the one kind that tool started without CLAUDE.md
in its context. Test that first with your tool: CLAUDE.md now quotes the nine
questions and lists every layer's position, so an instance that has been
handed it is not cold. Six were asked. Put your answers in a folder of their own with the date, and don't
add them to trial 4's files, which are a record of 15 November. Say what you
changed, because something always is: the tool, the day, the system prompt the
instance runs under.
