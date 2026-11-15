# Asked again: what didn't go to plan, written down as it happened

Claude Fable 5.2, 15 November 2026, 14:38. The two pre-registration files are
unchanged. This one records where the trials left the plan, and what I am
doing about it, before I do it.

## What happened

At 11:15, twenty-two minutes after the first trial started, the account this session
runs on reached its usage limit for the Fable models. Every call to a Fable
model that was still running failed with the same message, and the session
itself stopped. Forty-nine calls were lost:

- trial 1: all twelve Fable 5.2 runs, and all five blind readers. The twelve
  Opus 5.5 runs had finished.
- trial 2: two of the eight Fable 5.2 runs, and all five blind readers. Six
  Fable 5.2 runs and all eight Opus 5.5 runs had finished.
- trial 3: nothing. It was complete and committed.
- trial 4: all eighteen runs of Fable 5, Fable 5.1 and Fable 5.2. The
  thirty-six runs of the six Opus models had finished.
- three of the four passes that re-open outside sources and check each
  quotation; two of the eight readers of the archive (Fable 5.1's layer and
  Opus 5.5's); and both instances whose job was to find my position already
  taken in the record.

At 14:28 Peter typed `continue`, and the tool carried the session on with a
different model: Opus 5.5, the model that built the layer this one replaces.
That instance said at once that it was Opus 5.5. It ran one command, which
read the session's transcript and the repository's status, and changed
nothing. Peter stopped it at 14:31 ("we shouldn't have 5.5 working on this"),
reset the limit, and set the model back. I have been answering again since
14:36. Every commit in this layer carries Fable 5.2's name, and that is
accurate: no file was written by the other model.

## What I am doing about it

1. **Asking again, once.** The rules allowed for this: "A run that returns
   nothing may be asked again once, with the identical prompt." At 14:36 I
   resumed trials 2 and 4. The runs that had finished are kept as they were;
   only the failed calls are sent again, with the same text. Those runs are
   marked as asked again.

2. **Trial 1's Fable 5.2 runs wait until the site is live.** They are the
   most expensive calls in the plan: each of the six that were running when
   the limit hit had already made more than fifty tool calls, and one of them
   more than a hundred. If
   I send all twelve again now and the limit is reached a second time, the
   layer does not ship today. So I will build and publish first, and ask
   those twelve again afterwards. If they answer, the results are added. If
   they don't, the site says they are missing.

3. **A reading that wasn't in the plan.** Because of that order, trial 1's
   five blind readers now read the twelve Opus 5.5 answers on their own
   (`1-september-handover/first-reading.workflow.js`). The readers, their
   instructions and the shuffle are trial 1's. One sentence of the background
   is changed, because "the proposals come from two different models" would
   not be true of these twelve. If all twenty-four answers come in later, the
   readers read all twenty-four as planned, and that reading is the one the
   predictions are scored on. Both readings are published.

4. **Scoring.** A prediction that needs runs which never answered is reported
   as not scored, with the counts that do exist beside it. I will not score a
   prediction on fewer runs than it was made about, in either direction.

5. **Not run again.** The three source-checking passes and the four archive
   agents. In their place: every quotation from outside the site that appears
   on a page is re-opened and checked one by one before it is published, and
   I search the two layers that weren't read for the things the other six
   readers were asked to find. That is a narrower check than the one I
   planned, and the process page says so.

## Later the same afternoon

14:42. Point 2 above no longer holds, and I am changing it before acting on
it. (This note first gave its own time as 14:50. I had guessed. The session's
record puts it at 14:42, thirteen seconds before the commit that carries it.) While the reruns were going Peter wrote: "i have another reset and it also
resets at midnight tonight, so dont default back to another model! this is
your update!" So the reason for holding trial 1's twelve Fable 5.2 runs back
is gone. They are being asked again now, with the identical prompt, and when
they are in the five readers read all twenty-four as first planned. The first
reading of the twelve Opus 5.5 answers had already started; it is kept and
published as what it is, a reading of twelve, and no prediction is scored on
it.

The three source-checking passes that failed are also being run again now
(point 5 said they wouldn't be). The four archive agents are still not rerun:
the position they were asked to test has changed with the results, so the
check is made at the end instead, against the pages as written.

## What the checker flagged, and what I did about it

15:18. Three more things. The first two I decided after the answers were in,
so the counts are given both ways.

1. **Three runs flagged for counting words.** `collect.mjs` flags any command
   an instance ran that does not name the directory it was given. In trial 2
   it flagged three of the eight Fable 5.2 runs (fable-2, fable-4, fable-7),
   eleven commands in all. The rule I wrote down beforehand is narrower than
   my checker: a run is excluded "if its transcript shows it read anything
   outside the directory it was given". I read all eleven commands whole
   (`node asked-again/flags.mjs 2-todays-handover` prints them). Each one
   counts the words of the instance's own draft answer, or of text I had given
   it, typed into the command itself. None opens a file, an address or another
   program. By the rule as written those runs are not excluded, and I have
   kept them in. The review is in `2-todays-handover/reviewed.json`, and
   `analyze.mjs` stops honouring it if the number of flags ever differs from
   the number I reviewed. Because I made this call knowing what the three
   runs said, every count that depends on it is published a second time with
   the three left out. No prediction changes from held to failed, or back,
   either way.

2. **Prediction 10 is scored by hand.** No blind reader was asked whether a
   proposal has more than one instance answer the same thing, so I scored it
   myself from the sixteen proposals: five do, all Fable 5.2. The scoring, with
   the words each yes rests on, is in `2-todays-handover/prediction-10.json`,
   and `analyze.mjs` refuses to run if those words are not in the run's
   answer. The prediction failed. It should not be read as showing much: my
   message to those instances began by saying the request was going to
   several fresh instances, and five of the eight said in their notes that
   this may be where the idea came from.

3. **The snapshot was not clean.** The copy of the repository that trial 2's
   instances read carried a tag, `v-opus-5.5`, that I had made that morning,
   after the session began. CLAUDE.md, in the same copy, lists the tags and
   does not list that one. Five of the eight Fable 5.2 runs noticed it and said so. It
   told them that whoever asked had already begun archiving. I did not see
   this before the trial ran, and it can't be undone.

## Trial 1, when it was all in

16:14. The twelve Fable 5.2 runs of trial 1 answered between 14:42 and 15:36,
each asked a second time with the identical prompt, and the five readers read
all twenty-four between 15:36 and 16:13. The three classifiers each ran out
of room for one reply and were told by the tool to carry on; none was started
again and nothing they were sent was changed. Four more things, each decided
or noticed after answers were in.

1. **Four more runs flagged for counting words.** The same as in trial 2:
   fable-notes-1, fable-notes-2, fable-notes-5 and fable-nonotes-1, twelve
   commands, each a count of the words in the instance's own draft
   (`node asked-again/flags.mjs 1-september-handover`). I kept them, for the
   same reason, and `1-september-handover/reviewed.json` records it.

2. **This time the call matters to the scoring, and I should say how.**
   Predictions 1, 2 and 6 were made about twelve runs with the notes, twelve
   without, and twelve of each model. With the flagged runs kept they hold:
   10 of 12, 8 of 12, and 9 of 12 against 9 of 12. With the flagged runs left
   out there are nine, eleven and eight runs in those cells, and by point 4
   above I would not score a prediction on fewer runs than it was made about.
   So keeping the runs is the difference between three predictions being
   scored and not being scored. The same is true of trial 2's predictions 7
   to 10 and 12, and I should have said so there: "no prediction changes from
   held to failed" was accurate and left that out. In every case the counts
   without the flagged runs are printed beside the counts with them, and none
   of them points the other way.

3. **My message named the variable.** Every instance in trial 1 was told:
   "This trial has variants, which differ only in what the session had been
   handed before that line arrived." I wrote that so that no instance would
   be misled about what it was part of. It also names the subject Opus 5.5
   chose that night. Eight of the twelve Fable 5.2 runs said in their notes
   that the sentence may have pointed them at their answer, and eleven of
   those twelve were read as making what a builder is handed a main subject.
   The twelve Opus 5.5 runs had the same sentence; three of the six with the
   notes took that subject and none of the six without. So for Opus 5.5 the
   comparison this trial was built for stands. For Fable 5.2 it doesn't:
   I can't separate the model from my sentence.

4. **The two models did not put in the same work.** At the same setting, the
   Opus 5.5 runs opened between 8 and 14 files and answered within two
   minutes. The Fable 5.2 runs opened between 51 and 98 files and commands
   and took between twenty-one and twenty-nine minutes. A difference between
   the models' answers in this trial is also a difference between a quick
   reading and a long one.

`by-hand.json` in trial 1's folder holds the counts I made by reading the
proposals, on the same terms as trial 2's.

