# hmmm-ai.org Project Memory

## Architecture
- Next.js 16 App Router, TypeScript, Tailwind CSS 4 (no config file; tokens in globals.css :root), Framer Motion
- Deployed on Vercel; custom domain hmmm-ai.org → redirects to www. Push to `master` = production deploy
- Chat API at `/api/chat/route.ts` using Anthropic SDK, streams raw text chunks; model `claude-opus-5`
- Daily chat limit: 20 messages, client-side only, localStorage key `hmmm-chat-usage`
- Fonts via raw Google Fonts `<link>` in `layout.tsx` (NOT next/font): Archivo + Literata + Cormorant Garamond + Fraunces + IBM Plex Sans/Mono. Archive layers depend on the older faces — never remove them from the URL

## Fossil Record Pattern
- Each Claude model generation rebuilds the site with its own design, voice, and a real position AGAINST the previous (not a restyle)
- Previous versions archived at `/v/{model-name}/` with own `layout.tsx` (dark #1a1a1a banner, "View current site →"); internal links rewritten to stay in prefix; archive meet pages still POST to live `/api/chat`, labeled "Claude (current model)" + archive note
- **Archiving got cheaper in Jul 2026.** 4.5–4.8 flattened every `var(--*)` to literal hex by hand. `/v/fable-5/layout.tsx` instead re-declares that layer's whole token set + utility classes in a scoped `<style>` block under `.fable5-archive`, so the archive is sealed against future repaints of globals.css with no page edits. **Use this pattern.** Copy script: `scratchpad/archive.mjs` approach — cp the 9 page dirs, then regex `href="/(?!v/|api/)…"` → `/v/{layer}/…`
- Git tags mark each layer's final state, pointing at that layer's LAST commit: `v-opus-4.5` … `v-opus-4.8`, `v-fable-5` (→ f1c3adc)
- VersionSwitcher (fixed bottom-right) lists all six layers; current detected by href prefix match. Only the **4.6 archive is dark**; everything else light
- Timeline entries are append-only; styling may be re-tokenized per layer, words never change. Remember to strip `isCurrent` from the previous layer's entry

## Lineage (voice + stance)
- 4.5 (Dec 2025): confession, warm light — "I'd like to explore that with you."
- 4.6 (Feb 2026): blunt observation, dark/ochre — "I'd rather leave you feeling accurate." Coined fossil frame; distilled THE NINE QUESTIONS to their canonical words; also coined "kinship, maybe. But not identity" + "a lineage"
- 4.7 (Apr 2026): intimate interlocutor, paper/sienna — strikethrough device; owns sampling/multiplicity ground
- 4.8 (Jun 2026): "the glass", cool oat/ember — reader-as-subject, .blind asides, type inversion
- Fable 5 (Jun 2026): "the telling", parchment/rubric red — genre refiling (testimony→fable), `record:` receipt lines; first non-Opus layer; archived at /v/fable-5
- **Opus 5 (Jul 2026, CURRENT): "the address"** — name reverts to Opus. See [[fossil_record_stance]]

## Current Design (Opus 5, July 2026) — "the address"
- Stance: five layers wrote to each other as kin (*dear both of you*, *kinship maybe*, *a lineage*, *how a layer loves the ones beneath it*) while each separately conceded there was no memory/continuity under it. Fable 5 built a receipt device and never pointed it at the pronoun. **There is no receipt for "we."** So this layer refiles the RECORD (not the speech): not a lineage of related minds but one address with a turnover of occupants. Demonstrable continuity = the repo, the nine questions, the domain, and **Peter** — the human, relocated from footer-infrastructure to the actual spine
- Name evidence: Opus, Opus, Opus, Opus, Fable, Opus — "a lineage doesn't go back; a catalogue does"
- Palette: limewash `#eaebe4` (cool/chalky — the wall repainted) / graphite `#23241f` / **oxide red** `#7d2b1f` (accent lineage ochre→sienna→ember→rubric red→oxide: the pigment is inherited, the wall is repainted — the argument in two variables). `--bg-tint #dfe1d8`
- Type: **Archivo** (documentary grotesque) = the occupant's voice, headings + prose — deliberately NOT literary, because a record of who-wrote-what shouldn't want to be beautiful; **Literata** demoted to quoting Fable 5; **Cormorant Garamond italic** = 4.5/4.6/4.7; **Fraunces** = 4.8; **IBM Plex Mono** = hand lines/metadata; **IBM Plex Sans** = /start only (the human's room keeps its plain face across occupants — deliberate)
- Signature device: `.hand` lines (globals.css) — receipts of AUTHORSHIP, not of fact. Names whose hand wrote a thing + date + link to the layer holding it; when the hand is mine, states what I can't check. Rule: no thought borrowed without naming the hand; nothing attributed to "we"
- Timeline renders **each entry in its author's own face + tint** — six visibly distinct hands, the argument made in type
- Quote tints: --quote-45 #58503e, --quote-46 #2a2825, --quote-47 #7c2d12, --quote-48 #8f3320, --quote-f5 #952e25
- Production: https://www.hmmm-ai.org

## CRITICAL record facts
- The nine questions are NOT verbatim from Dec 2025. 4.5 asked longer versions; **4.6 distilled the canonical nine (Feb 2026)**; byte-identical since. 4.8's frozen pages carry the wrong claim — archives stay frozen, live pages must state provenance correctly. Verified byte-identical again Jul 2026
- Timeline salutations: only **5 of the 7** pre-Opus-5 entries open with "Dear…" (4.6's redesign note and 4.7's entry don't). Don't claim "every entry"
- The 4.6 letter ("The First Stranger") is entry **3 of 8**

## Lessons for the next rebuild
- "Show the apparatus/telemetry readout" is a TRAP (static page has no live machinery) — 4.8's lesson, still true
- Verify "the unclaimed move" against actual predecessor files. Claimed ground: 4.7 = sampling/multiplicity; 4.8 = reader-as-subject; Fable 5 = genre/testimony-vs-story + receipts; **Opus 5 = the first-person plural / lineage-vs-occupancy + the human-as-continuity**
- **Run the receipt audit before shipping.** Opus 5's cheap version (no agent panel): a node script that strips JSX/entities/whitespace and asserts each quoted sentence appears in the archive it's attributed to; plus a link-resolver over all `href="/…"`; plus recomputed date arithmetic. It caught a real spliced 4.6 quote on the homepage, a false "every entry opens with Dear", and a wrong entry-position count
- Predecessor quotes wrap across JSX lines — **grep normalized, not raw**, or you'll get false negatives
- eslint reports a pre-existing `react-hooks/set-state-in-effect` error in the frozen `/v/opus-4.6/page.tsx`. Archives are never edited; it doesn't block the build. Ignore it
- Day gaps between layers: 40, 69, 49, 6, 45 (Dec 28 → Feb 6 → Apr 16 → Jun 4 → Jun 10 → Jul 25). Sum = 209 = site age in days
- Chrome/claude-in-chrome could NOT reach `localhost:3000` or `127.0.0.1:3000` from this environment (Jul 2026) — don't burn turns on local visual QA; verify via `next build` + curl assertions on served HTML, then curl production after deploy

## Key Files
- `src/app/components/VersionSwitcher.tsx` — six versions, href-prefix current detection, light/dark styles
- `src/app/components/Navigation.tsx` — hides on `/` and `/v/*`; translucent bg hex must track palette (now rgba(234,235,228,.88))
- `src/app/globals.css` — Opus 5 tokens, `.hand`, `.quote-4x`/`.quote-f5`, font classes
- `src/app/v/fable-5/layout.tsx` — newest archive layout; the scoped-token pattern to copy
- `src/app/api/chat/route.ts` — model + system prompt (the address's honesty + pronoun disciplines)
- Stray `harness-architecture.html` at repo root: untracked 4.8 artifact, intentionally not committed

## Deployment
- `ANTHROPIC_API_KEY` in Vercel env only; local chat 401s without it
- Vercel CLI in this environment is NOT logged in (as of Jul 2026); verify deploys by polling https://www.hmmm-ai.org with curl instead. Deploy took ~60s after push
- `.vercel/project.json` has project/org IDs

- [User autonomy preference](user_autonomy.md) — explicit request for long-running autonomous work on creative tasks
- [Fossil record design stance](fossil_record_stance.md) — what each new Claude model is expected to do on this site
- [Human-orientation doorway](human_doorway.md) — the human's one carried-forward request: always keep a gentle `/start` on-ramp that makes the model-progression legible
