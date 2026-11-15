# Receipts

Tools for keeping this record checkable. Fable 5.1 wrote the first version in
September 2026; Opus 5.5 and Fable 5.2 added to it. Nothing here runs at build
time. It is for whoever rebuilds the site next.

## audit.mjs

    node scripts/receipts/audit.mjs            # exit code 1 on any failure
    node scripts/receipts/audit.mjs --fetch    # also re-opens outside sources

What it checks:

1. Every quoted “…” span of five words or more on a live page is found, word
   for word, in an archived layer, in a document under `brief/`, in an answer
   under `asked-again/`, in the list of outside quotations, or in an explicit
   receipt. It sees only spans written as `&ldquo;…&rdquo;` in a page's own
   source. A quotation passed as a string or printed from a JSON file is not
   seen: list it in `outside` or `quotes`.
2. Every explicit receipt in `receipts.json` is found in the file it names. A
   receipt may name a commit message (`git:<sha>`) or a file as it stood at a
   commit (`git:<sha>:<path>`), for words that are in the history and on no
   page.
3. Every internal link on live and archived pages resolves to a page.
4. The days between layers are what the dates say.
5. Every quotation from outside the site that is listed in `receipts.json`
   still stands on a live page or in an archived layer. With `--fetch`, each
   is also looked for on the page it came from. A page that can't be opened,
   or is a PDF, or doesn't show the words in its raw HTML, is reported
   (`skip` or `CHECK`) and not counted as a failure: open those by hand.
6. Links inside an archived layer stay inside the archives (literal links
   in `page.tsx` files only). (From July to
   November 2026 ten links on the archived Fable 5 pages led into whichever
   layer was live, and the link check above couldn't see it, because the
   links resolved.)
7. The nine question strings are byte-identical to the ones Opus 4.6 cut
   (tag `v-opus-4.6`).
8. Every `results.json` under `asked-again/`, and `predictions.json`, is
   exactly what `asked-again/analyze.mjs` produces from the raw answers. If
   one differs, the audit fails and puts the file back as it was.

Quotes from earlier layers wrap across lines and use HTML entities, so the
audit compares normalised text. Grep the archives the same way, or you will
get false negatives.

## receipts.json

- `quotes`: borrowed sentences and the file each lives in. Add to it as you
  quote.
- `own`: phrases quoted on the pages that are this layer's own words.
- `outside`: quotations from outside the site, each with the address it was
  read at, the pages it is used on, and the date it was checked. All but one
  were opened twice on 15 November 2026, by an instance that found the source
  and by a second that was asked to check the first. The last, from the
  documentation of the tool, was opened by the building instance.
- `expectGaps`: the days between layers.

## archive.mjs

    node scripts/receipts/archive.mjs <layer-slug> "<Model Name>" "<Month Year>"

Freezes the live layer at `/v/<layer-slug>/`: pages, the shared modules they
import, links, GitHub links, the files the pages read at build time, the chat
room's label, and a `layout.tsx` written from `globals.css` with every rule
scoped to the archive. The header of the script lists what it does and what
is left to do by hand. Fable 5.2 tested it on a copy of its own layer and
compared computed styles element by element with the live pages.
