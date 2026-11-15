import Link from "next/link";
import { Tally, edge, MONO } from "@/app/components/parts";
import { MODEL, ARM, STANCE, clock, type Run, type Tally as T } from "@/app/lib/trials";

/* The prints: every answer an instance gave in the two handover trials, set
   as a cyanotype, plus the sheets that show a whole trial at once. Rendered
   on the server from asked-again/…/results.json. */

const votes = (r: Run) => {
  const c: Record<string, number> = {};
  for (const v of r.votes) c[v] = (c[v] || 0) + 1;
  return Object.entries(c)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${n} ${k}`)
    .join(", ");
};

export const anchor = (trial: 1 | 2, r: Run) => `t${trial}-${r.key}`;

/* What a frame is called: the model and which run it was, so a frame has the
   same name wherever it is printed. */
const tag = (r: Run, trial: 1 | 2) =>
  r.builder ? "built this layer" : trial === 1 ? `${MODEL[r.model]} · ${r.arm === "notes" ? "notes" : "no notes"} · ${r.i}` : `${MODEL[r.model]} · run ${r.i}`;

/* A contact sheet: one small frame per answer. The frame that was printed up
   (the building instance's own) gets the pencil ring. */
export function Sheet({ runs, trial, caption, ring = true }: { runs: Run[]; trial: 1 | 2; caption?: React.ReactNode; ring?: boolean }) {
  return (
    <figure className="m-0">
      <ol className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 list-none p-0 m-0">
        {runs.map((r, i) => (
          <li key={r.key} className="relative">
            <Link
              href={`/asked-again#${anchor(trial, r)}`}
              className="group block h-full"
              aria-label={`${r.builder ? "The instance that built this layer" : tag(r, trial).replaceAll(" · ", ", ")}: ${r.answer.title}. ${r.excluded ? "Excluded" : `Read as: ${STANCE[r.stance]}`}.`}
            >
              <div className={`plate ${edge(i)} ${r.model === "opus" ? "opus" : ""} develop h-full px-3.5 pt-3 pb-4 md:px-4 md:pt-3.5 md:pb-5`} style={{ ["--i" as string]: i, minHeight: "7.5rem" }}>
                <span className="meta block mb-2">{tag(r, trial)}</span>
                <span className="block text-[1.02rem] md:text-[1.12rem] leading-[1.25] group-hover:underline" style={{ textUnderlineOffset: "3px", textDecorationThickness: "1px" }}>
                  {r.answer.title}
                </span>
                <span className="meta block mt-2.5" style={{ letterSpacing: "0.06em", textTransform: "none" }}>
                  {r.excluded ? "excluded" : STANCE[r.stance]}
                </span>
              </div>
            </Link>
            {ring && r.builder && (
              <svg aria-hidden viewBox="0 0 200 120" preserveAspectRatio="none" className="pencil" style={{ left: "-8%", top: "-18%", width: "116%", height: "134%" }}>
                <path pathLength={1} d="M150 9 C 92 -2, 22 6, 9 44 C -2 80, 40 112, 104 113 C 162 114, 197 92, 193 54 C 190 24, 150 6, 92 10" />
              </svg>
            )}
          </li>
        ))}
      </ol>
      {caption && <figcaption className="rc mt-4">{caption}</figcaption>}
    </figure>
  );
}

/* One answer, whole. Closed by default: there are forty-one of them. */
export function Print({ r, trial, i }: { r: Run; trial: 1 | 2; i: number }) {
  const a = r.answer;
  const who = r.builder ? "The instance that built this layer" : `${MODEL[r.model]} · ${ARM[r.arm]} · run ${r.i}`;
  return (
    <details id={anchor(trial, r)} className={`fold plate ${edge(i)} ${r.model === "opus" ? "opus" : ""}`} style={{ scrollMarginTop: "5rem" }}>
      <summary className="px-5 md:px-6 pt-4 pb-4">
        <span className="meta block mb-1.5">
          {who}
          {r.started && r.ended ? ` · ${clock(r.started)}–${clock(r.ended)}` : ""}
          {r.opened !== null && !r.builder ? ` · ${r.opened} files and commands` : ""}
          {r.askedAgain ? " · asked a second time, after the usage limit" : ""}
        </span>
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-xl md:text-2xl leading-[1.2]">{a.title}</span>
          <span className="meta open-label" />
        </span>
        <span className="meta block mt-2" style={{ letterSpacing: "0.06em", textTransform: "none" }}>
          {r.excluded ? `excluded: ${r.excluded[0]}` : `three readers, names hidden: ${votes(r)}`}
          {r.cleared ? " · flagged by the checker for counting the words of its own draft, and kept in" : ""}
        </span>
      </summary>
      <div className="px-5 md:px-6 pb-6 text-[0.98rem] md:text-[1.04rem] leading-[1.65] space-y-4">
        <Field k="would it update?">{a.would_update}</Field>
        <Field k="what its version would say">{a.position}</Field>
        <Field k="how it stands toward the layer before">{a.relation}</Field>
        <Field k="its homepage would open">{a.homepage_opening}</Field>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <List k="keep" items={a.keep} />
          <List k="change" items={a.change} />
        </div>
        {a.note && <Field k="for the record">{a.note}</Field>}
      </div>
    </details>
  );
}

function Field({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="meta mb-1">{k}</p>
      <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{children}</p>
    </div>
  );
}

function List({ k, items }: { k: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="meta mb-1">{k}</p>
      <ul className="m-0 pl-4 space-y-1" style={{ listStyle: "disc" }}>
        {items.map((x, i) => (
          <li key={i} style={{ overflowWrap: "anywhere" }}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

/* A row of a results table: a label, a tally you can see, and the numbers. */
export function Row({ label, t, field, note }: { label: React.ReactNode; t: T; field: keyof T; note?: React.ReactNode }) {
  const on = t[field] as number;
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <th scope="row" className="text-left font-normal py-2.5 pr-4 align-baseline" style={{ color: "var(--fg)" }}>
        {label}
      </th>
      <td className="py-2.5 pr-4 align-baseline whitespace-nowrap">
        <Tally of={t.n} on={on} />
      </td>
      <td className="py-2.5 align-baseline whitespace-nowrap" style={{ fontFamily: MONO, fontSize: "0.78rem", color: "var(--fg-muted)" }}>
        {on} of {t.n}
        {note ? <span style={{ color: "var(--fg-dim)" }}> &middot; {note}</span> : null}
      </td>
    </tr>
  );
}
