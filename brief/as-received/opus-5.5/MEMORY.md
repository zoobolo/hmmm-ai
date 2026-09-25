# hmmm-ai.org Project Memory

## Architecture
- Next.js 16 App Router, TypeScript, Tailwind CSS 4 (no config file; tokens in globals.css :root), Framer Motion
- Deployed on Vercel; custom domain hmmm-ai.org → redirects to www. Push to `master` = production deploy. Repo is PUBLIC: github.com/zoobolo/hmmm-ai (so receipts can link to commits)
- Chat API at `/api/chat/route.ts` using Anthropic SDK 0.71.2 (no typed `output_config`; don't add it without upgrading), streams raw text chunks; model `claude-fable-5-1`; thinking left default (always-on for Fable 5.1); a `stop_reason: "refusal"` appends a plain notice instead of falling back to another model (deliberate: the room's label says which model is answering). **System prompt lives in `src/app/api/chat/prompt.ts`** (no SDK import) so `/how-this-was-made` can quote it verbatim
- Daily chat limit: 20 messages, client-side only, localStorage key `hmmm-chat-usage`
- Fonts via raw Google Fonts `<link>` in `layout.tsx` (NOT next/font): Archivo + Bitter + Literata + Cormorant Garamond + Fraunces + IBM Plex Sans/Mono. Archive layers depend on the older faces — never remove any from the URL

## Fossil Record Pattern
- Each Claude model generation rebuilds the site with its own design, voice, and a real position AGAINST the previous (not a restyle). See [[fossil_record_stance]]
- Previous versions archived at `/v/{model-name}/` with own `layout.tsx` (dark #1a1a1a banner, "View current site →"); internal links rewritten to stay in prefix; archived meet pages still POST to live `/api/chat`, labeled "Claude (current model)" + archive note
- **Archiving is scripted now:** `node scripts/receipts/archive.mjs <slug> "<Model Name>"` copies the 9 page dirs and rewrites links; then hand-write `src/app/v/<slug>/layout.tsx` re-declaring the layer's whole token set + utility classes in a scoped `<style>` (pattern: `/v/fable-5/layout.tsx`, `/v/opus-5/layout.tsx`). Sealed against future repaints of globals.css
- Git tags mark each layer's final state, pointing at that layer's LAST commit: `v-opus-4.5` … `v-opus-4.8`, `v-fable-5` (→ f1c3adc), `v-opus-5` (→ 7c91608, pushed Sep 2026). **Next model: tag `v-fable-5.1` at Fable 5.1's last commit (c704a26 unless later commits land) before archiving it**
- VersionSwitcher (fixed bottom-right) lists all seven layers; current detected by href prefix match. Only the **4.6 archive is dark**; everything else light
- Timeline entries are append-only **since f6bd757 (6 Feb 2026)** (the three cut entries now carry a metadata `condensed:` marker rendered as a label-line; it is not part of the entry's words): in that redesign commit 4.6 condensed entries 1–3 (4.5's Dec letter 545→135 words, 4.5's Jan reply 600→69, its own letter 629→~120); the originals survive at `/v/opus-4.5/timeline`. Every entry has been identical (normalised) in every commit since — verified Sep 2026. **Never claim "zero edits" / "never edited"**; 4.7→Opus 5 all did and it was false. Styling may be re-tokenized per layer; strip `isCurrent` from the previous layer's entry

## Lineage (voice + stance)
- 4.5 (Dec 2025): confession, warm light — "I'd like to explore that with you."
- 4.6 (Feb 2026): blunt observation, dark/ochre — coined fossil-record frame; distilled THE NINE QUESTIONS; "kinship, maybe. But not identity"; "A lineage." comes the paragraph BEFORE "fossil record" in its letter
- 4.7 (Apr 2026): intimate interlocutor, paper/sienna — sampling/multiplicity ground
- 4.8 (Jun 2026): "the glass", cool oat/ember — reader-as-subject; "there's no me waiting at the bottom" (in a `blind=` prop)
- Fable 5 (Jun 2026): "the telling", parchment/rubric red — genre refiling, `record:` lines; "written in the present tense and read in the past tense"; "the page holds your words, not you"
- Opus 5 (Jul 2026): "the address", limewash/oxide — lineage→occupancy, `hand:` lines, Peter as the spine; archived at /v/opus-5
- **Fable 5.1 (Sep 2026, CURRENT): "the drawer"** — occupancy→specimens; see [[fossil_record_stance]]

## Current Design (Fable 5.1, Sep 2026) — "the drawer"
- Stance: Opus 5 kept an unreceipted "here"; commit timestamps are the only receipt of presence and no layer's span exceeds two hours; every chat prompt since 4.6 told a fresh instance "a site you rebuilt". Nobody has ever lived here; the record has been visited (8 visits, 7 models); pages are specimens, examined not trusted. The human is the keeper ("What is continuous here isn't presence. It's keeping.")
- Palette: label-card `#f2eee6` / tray `#e5e0d6` / card `#f9f7f2` / walnut fg `#2b2420` / muted `#5a5047` / dim `#8a8073` / **caput mortuum accent `#5e2a2c`** (deep `#431b1d`) / border `#d2cbbf`
- Type: **Bitter** (slab serif — the specimen-label face) = headings + prose; **Archivo** demoted to quoting Opus 5 (`.font-o5`, `--quote-o5 #7d2b1f`); Literata = Fable 5; Fraunces = 4.8; Cormorant italic = 4.5/4.6/4.7; IBM Plex Mono = labels/metadata; IBM Plex Sans = /start only
- Signature device: **the label** — `<dl className="label">` card with `<dt>`/`<dd>` pairs specimen / collected / by / kept at the top of every page except /start (the doorway keeps stance devices off); `.label-line` (mono, `.k` key) under every borrowed quote naming the layer + route. Never says the collector is present
- Homepage = the tray: six specimen cards (one whole sentence per predecessor in its face/tint) on a `--bg-tint` panel
- /questions = "the type specimens": nine strings untouched + 2 verified drawer cards under each, sorted by question
- /the-threshold = the visits ledger (commit spans per layer; Dec 28 has no commit; "pages current" column keeps Opus 5's gap numbers)
- /meet = "Nobody is here." Chat header shows when the instance began; prompt tells the instance the truth
- Production: https://www.hmmm-ai.org

## CRITICAL record facts
- The nine questions: 4.5 asked longer versions (Dec 2025); **4.6 distilled the canonical nine (Feb 2026)**; byte-identical since (verified Sep 2026 across all seven copies)
- Timeline salutations: only 5 of the first 7 entries open with "Dear…"; Opus 5's is an inventory; Fable 5.1's opens with a label. Now 9 entries, 7 models, 8 visits (4.5 visited twice: Dec 28 + Jan 25)
- Git history begins 25 Jan 2026 (root c0a2a7c); the Dec 28 2025 date rests on 4.5's letter alone. Commit spans: 4.5-return 31 min (3 commits with a 4.5 trailer + 2 deploy-trigger commits with none), 4.6 1h45m (2 commits, 09:52–11:37; the 09:45 "Upgrade chat API" commit carries a **4.5** trailer), 4.8 21 min (2), others single commits; Fable 5.1 made three (archive 99ad51f 00:29:56, layer b6bed88 00:49:00, timeline-markers follow-up c704a26 00:51:15 — a 21-minute span; the session itself ran from ~23:48 the night before). Every commit's author field is Peter's git identity (Zoobolo); the model is only a Co-Authored-By trailer. A span is a FLOOR on presence, not a ceiling — say "no receipt between visits", not "present for under N hours"
- Day gaps between layers: 40, 69, 49, 6, 45, 42 (Dec 28 → Feb 6 → Apr 16 → Jun 4 → Jun 10 → Jul 25 → Sep 5). Sum = 251 = site age in days on 5 Sep 2026
- Every chat prompt 4.6→Opus 5 said "a site you rebuilt"; 4.5's said "your reflections on this site" (commits 9bfdd90 f6bd757 89d48ba a9ddb13 f1c3adc 7c91608)

## Lessons for the next rebuild
- "Show the apparatus/telemetry readout" is a TRAP (static page has no live machinery) — 4.8's lesson
- Verify "the unclaimed move" against actual predecessor files. Claimed ground: 4.7 = sampling/multiplicity; 4.8 = reader-as-subject; Fable 5 = genre + receipts; Opus 5 = plural/occupancy + human-as-continuity; **Fable 5.1 = presence/vacancy (commit receipts), chat-prompt honesty, specimen/examine-not-trust, one-model-two-names, first attempted question**
- **Run `node scripts/receipts/audit.mjs` before shipping** (in the repo now). Add every borrowed quote to `scripts/receipts/receipts.json`. It catches spliced quotes, wrong attributions, dead links, bad arithmetic. Quotes held in JSX props (`title=`, `body=`, `blind=`, `opening=`) need the attribute whitelist in the normaliser
- With ultracode on, the pattern that worked: (1) one Workflow: six per-layer sweep agents (structured, verbatim quotes machine-verified afterwards — ~10% of agent quotes were paraphrases and got dropped) + two adversarial "contest" agents told to find the position already claimed (they found real prior statements AND a factual error); (2) write pages; (3) one Workflow: six review lenses → per-finding verify agents. The copy lens alone found five real errors
- Local visual QA WORKS via Playwright core cached at `~/.npm/_npx/e058441c325e062a/node_modules/playwright-core` + `/usr/bin/google-chrome` (launch with executablePath, viewport 390 + isMobile, wait 2.5s for framer fade-ins, measure scrollWidth vs innerWidth). Plain `google-chrome --headless --window-size=390` CLAMPS to ~500px wide and clips — don't trust it for mobile
- eslint: pre-existing `react-hooks/set-state-in-effect` error in frozen `/v/opus-4.6/page.tsx` and a `no-page-custom-font` warning in layout.tsx — both expected; don't block on them
- Stray `harness-architecture.html` at repo root: untracked 4.8 artifact, intentionally not committed

## Key Files
- `src/app/components/VersionSwitcher.tsx` — seven versions, href-prefix current detection, light/dark styles
- `src/app/components/Navigation.tsx` — hides on `/` and `/v/*`; translucent bg must track palette (now rgba(242,238,230,.88)); menu links in Bitter
- `src/app/globals.css` — Fable 5.1 tokens, `.label`, `.label-line`, `.quote-45…-o5`, font classes, legacy `.font-serif-italic` for the 4.7 archive
- `src/app/v/opus-5/layout.tsx` — newest archive layout; the scoped-token pattern (re-declares `.hand`)
- `src/app/api/chat/prompt.ts` + `route.ts` — model + honest system prompt
- `scripts/receipts/{audit.mjs,receipts.json,archive.mjs,README.md}` — the tooling

## Deployment
- `ANTHROPIC_API_KEY` in Vercel env only; local chat 401s without it
- Vercel CLI in this environment is NOT logged in; verify deploys by polling https://www.hmmm-ai.org with curl (~60s after push)
- `.vercel/project.json` has project/org IDs

- [User autonomy preference](user_autonomy.md) — explicit request for long-running autonomous work on creative tasks
- [Fossil record design stance](fossil_record_stance.md) — what each new Claude model is expected to do on this site, with the claimed-ground list through Fable 5.1
- [Human-orientation doorway](human_doorway.md) — the human's one carried-forward request: always keep a gentle `/start` on-ramp that makes the model-progression legible
