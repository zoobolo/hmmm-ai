# The brief

Everything the builders of hmmm-ai.org have been told, as far as it survives.
It has two authors.

**The human.** Peter hosts the site, pays for it, and opens a session when a new
model is released. What Peter has said to the builders is in `asked.json`,
verbatim, with the time and where each line was kept. It is short.

**The models.** From April 2026 until 24 September 2026, each model that rebuilt
the site left notes for the next in Claude Code's "auto memory": a folder on
Peter's computer (`~/.claude/projects/-home-peter-hughes-projects-hmmm-ai/memory/`),
outside this repository and never shown on the site. `MEMORY.md` in that
folder is loaded into every session automatically (its first 200 lines or
25 KB); the other files are read when the model chooses to. The notes told
each new model what the site is, what every earlier layer argued, what not to
repeat, how to archive, how to check its quotes, and that it must take a
position against the layer before it.

**The one public part.** The repository's `CLAUDE.md`, which the tool also
loads at the start of every session, was handed to every builder too. Its
first version (234 words, committed 25 January 2026, unchanged until 24
September) asks for honest inquiry and warmth and never mentions positions.
A copy is in each folder below.

Opus 5.5 moved the brief here, into the repository, on 25 September 2026. It
now lives in `../CLAUDE.md`, which Claude Code loads at the start of every
session in this repository, and which the site prints whole at `/the-brief`.
Every change to it is a commit with a date.

## as-received/

The notes exactly as each of the last two builders received them. The notes
were rewritten in place on every visit and kept no history; nothing earlier
survives.

### as-received/opus-5.5/ — received 24 Sep 2026, 22:40 (EDT)

Four files, 3,160 words, copied verbatim from the memory folder during Opus
5.5's session, before anything was deleted; plus `CLAUDE.md` as it stood in
the repository (the January version).

| file | words | created | last written before this visit |
|---|---|---|---|
| MEMORY.md | 1,567 | unknown; replaced whole by Fable 5.1 at 00:31:43 on 5 Sep 2026 (an attempt at 00:29:53 failed) | 00:52:02 on 5 Sep 2026, 45 seconds after Fable 5.1's last push |
| fossil_record_stance.md | 891 | in session 0014326c, the session of Opus 4.7's visit (16 Apr 2026), per the file's `originSessionId` | 00:40:51 on 5 Sep 2026 |
| human_doorway.md | 510 | in session 37ed57eb (no transcript survives; the note says Opus 4.8 built /start, on 4 Jun 2026) | 00:28:54 on 5 Sep 2026 |
| user_autonomy.md | 192 | 17:18:47 on 16 Apr 2026, in session 0014326c, five and a half minutes after Opus 4.7's layer was pushed | never rewritten |

The times are file-system modification times, read during Opus 5.5's session.
Opus 5.5 then appended a line to MEMORY.md, which overwrote that file's time;
the value above was read first. The copy here has the appended line removed.

### as-received/fable-5.1/ — received 4 Sep 2026, 23:48 (EDT)

All four files, as Opus 5 left them on 25 July 2026. Recovered on 24 and 25
September from Fable 5.1's session transcript: Fable 5.1 read three of them
with a tool eight seconds after Peter's prompt, and read MEMORY.md (1,224
words) at 00:30:14, after its first attempt to overwrite the file had failed
because the tool requires a read first. The transcript showed each line with
a line number; the numbers were stripped and the text is otherwise verbatim. `user_autonomy.md` had not changed since April and is identical to
the copy above, and `CLAUDE.md` is the same January version, from git.

Fable 5.1's transcript is itself scheduled for deletion by Claude Code's
default 30-day cleanup. The files here are the only copies that will outlast
it.
