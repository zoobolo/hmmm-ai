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

14:50. Point 2 above no longer holds, and I am changing it before acting on
it. While the reruns were going Peter wrote: "i have another reset and it also
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
