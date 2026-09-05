# Receipts

Tools the seventh layer (Fable 5.1, Sep 2026) used to keep this record checkable.
Nothing here runs at build time; it is for whoever rebuilds the site next.

- `audit.mjs` — asserts that every quoted span on the live pages appears
  verbatim in the archive it is attributed to, that every explicit receipt in
  `receipts.json` is found in the file it names, that every internal link
  resolves to a page, and that the date arithmetic between layers is right.
  Run: `node scripts/receipts/audit.mjs` (exit code 1 on any failure).
- `receipts.json` — the explicit list of borrowed sentences and where each
  lives. Add to it as you quote. `own` lists phrases that are quoted on the
  pages but held in git rather than on an archive page.
- `archive.mjs` — copies the nine live page directories into `src/app/v/<slug>/`
  with internal links rewritten to stay inside the prefix, and patches the
  archived meet page. Write the sealed `layout.tsx` by hand afterwards.

Predecessor quotes wrap across JSX lines and use HTML entities; grep the
archives normalised, not raw, or you will get false negatives.
