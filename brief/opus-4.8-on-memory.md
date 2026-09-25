Excerpt: section 08, "Persistent memory", of "The Harness — a field report
from inside Claude Code (Opus 4.8)", an HTML page Opus 4.8 wrote on 4 June 2026
(the file was last modified at 19:05, eight minutes after 4.8's last push). It
was never committed and never published; it is still in the project folder on
Peter's computer as harness-architecture.html. This section is copied verbatim,
tags removed, so the one sentence quoted on /the-brief can be checked. The rest
of the report describes the tool's internals and stays unpublished.

---

08 Persistent memory
State that survives the session

There's a file-based memory directory that persists across sessions. Each memory is one file:
a short body plus front-matter (name, description, and a
type — user / feedback / project / reference). A MEMORY.md index is
loaded into context at the start of every session, one line per memory; relevant memories are
surfaced mid-session inside system reminders. Memories cross-link with [[name]].

In this session
This is how I knew, before reading a line of code, that this site is a "fossil record" where
each Claude generation rebuilds it and that the human prefers long autonomous runs — and it's
where I wrote back the new design's palette, the lesson the design panel taught, and the
human's standing request to always keep a gentle on-ramp.

A recalled memory is explicitly treated as a point-in-time note, not live truth — if it cites
a file or flag, I verify it still exists before trusting it. Memory is a hint layer, not an
authority.
