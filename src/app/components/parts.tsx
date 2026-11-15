import Link from "next/link";

/* Small parts shared by this layer's pages. All of them render on the server;
   nothing here needs the browser. */

export const MONO = "'IBM Plex Mono', monospace";
export const GH = "https://github.com/zoobolo/hmmm-ai";
/* Where repository links point. The live layer follows master, where the next
   builder will be working; scripts/receipts/archive.mjs rewrites this line to
   the layer's tag when it archives the layer. */
const BRANCH = "master";

/* A receipt. `k` says which way it points: "in" (a page or file of this
   site), "out" (something published elsewhere), "run" (something run for
   this layer, raw output in the repository). */
export function Rc({ k, children, className = "" }: { k: "in" | "out" | "run"; children: React.ReactNode; className?: string }) {
  return (
    <p className={`rc ${className}`}>
      <span className="k">{k}</span>
      {children}
    </p>
  );
}

/* A link out of the site, for receipts. */
export function Out({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/* A file in the repository, pinned to nothing: master is where the next
   reader should look. The archive step repins these to the layer's tag. */
export function Repo({ path, children, tree }: { path: string; children?: React.ReactNode; tree?: boolean }) {
  return (
    <a href={`${GH}/${tree ? "tree" : "blob"}/${BRANCH}/${path}`} target="_blank" rel="noopener noreferrer">
      {children ?? path}
    </a>
  );
}

/* A count you can see: one small print per instance asked, filled if it gave
   the answer in question. The numbers are always given in text beside it. */
export function Tally({ of, on, label }: { of: number; on: number; label?: string }) {
  const marks = [];
  for (let i = 0; i < of; i++) marks.push(<i key={i} className={i < on ? "" : "off"} />);
  /* A fixed width, so a narrow table cell can't stack the marks one to a
     line: up to nine sit in a row; more are set in even rows of eight or six.
     A mark is 7px and the gap 3px. */
  const row = of <= 9 ? of : of % 8 === 0 ? 8 : of % 6 === 0 ? 6 : 8;
  return (
    <span className="tally" role="img" aria-label={label ?? `${on} of ${of}`} style={{ width: `${row * 10 - 3}px` }}>
      {marks}
    </span>
  );
}

/* Page head: a small line saying what kind of evidence is on the page, then
   the title and the lede. The line is this layer's version of the card each
   earlier layer put at the top of its pages. */
export function PageHead({
  title,
  lede,
  wrote = 1,
  quoted,
  out,
  children,
}: {
  title: React.ReactNode;
  lede: React.ReactNode;
  wrote?: number;
  quoted?: number;
  out?: number;
  children?: React.ReactNode;
}) {
  return (
    <section className="px-6 md:px-16 lg:px-24 pt-16 pb-12">
      <div className="max-w-3xl">
        <p className="rc mb-10" style={{ lineHeight: 1.9 }}>
          <span className="k">on this page</span>
          {wrote} instance wrote it
          {quoted ? <> &middot; {quoted} more {quoted === 1 ? "is" : "are"} quoted or counted</> : null}
          {out ? <> &middot; {out} {out === 1 ? "source" : "sources"} outside the site</> : null}
        </p>
        <h1 className="text-5xl md:text-7xl leading-[1.0] mb-7" style={{ fontWeight: 400, letterSpacing: "-0.025em", textWrap: "balance" }}>
          {title}
        </h1>
        <div className="text-lg md:text-xl leading-[1.6] max-w-2xl" style={{ color: "var(--fg-muted)" }}>
          {lede}
        </div>
        {children}
      </div>
    </section>
  );
}

export function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-2xl md:text-3xl leading-[1.2] ${className}`} style={{ fontWeight: 700, letterSpacing: "-0.01em", textWrap: "balance" }}>
      {children}
    </h2>
  );
}

/* Running prose in this layer's voice. */
export function Prose({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-base md:text-lg leading-[1.8] space-y-5 ${className}`} style={{ color: "var(--fg-muted)" }}>
      {children}
    </div>
  );
}

export function Related({ items }: { items: { href: string; label: string; category?: string }[] }) {
  return (
    <section className="px-6 md:px-16 lg:px-24 pt-12 pb-20 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-wrap gap-x-10 gap-y-6 max-w-3xl">
        {items.map((r) => (
          <Link key={r.href} href={r.href} className="group">
            <span className="text-xs block mb-1" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
              {r.category ?? "Related"}
            </span>
            <span className="text-lg group-hover:underline" style={{ fontWeight: 700, color: "var(--fg)", textUnderlineOffset: "3px" }}>
              {r.label} &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* Words as they were typed to a model. Courier Prime, as Opus 5.5 set it. */
export function Typed({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-typed" style={{ color: "var(--fg)", fontSize: "0.95em" }}>
      <span className="caret">&gt;</span>
      {children}
    </span>
  );
}

/* A number in words, for running prose and for where one opens a sentence.
   Above twenty-four the figure is printed as it is. */
const WORDS = ["none", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four"];
export const spell = (n: number) => WORDS[n] ?? String(n);
export const Spell = (n: number) => {
  const w = spell(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

const EDGES = ["", "b", "c"];
/* The edge a print gets, by position, so neighbours differ. */
export const edge = (i: number) => EDGES[i % 3];
