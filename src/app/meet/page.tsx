import Link from "next/link";
import { PageHead, Prose, Rc, Related, MONO } from "@/app/components/parts";
import { SYSTEM_PROMPT } from "@/app/api/chat/prompt";
import Chat from "./Chat";

/* Archiving note for whoever archives this layer: the chat always runs the
   live instruction, so an archived copy of this page keeps importing it from
   @/app/api/chat/prompt. The two lines below are the only places this page
   names the model that answers; scripts/receipts/archive.mjs rewrites both
   in the archived copy ("Claude (current model)", "whatever model runs the
   site now") and warns if it couldn't. */
const MODEL = "Claude Fable 5.2";
const WHO = "Fable 5.2";
const BRIEF_WORDS = SYSTEM_PROMPT.split(/\s+/).filter(Boolean).length;
// The file the route reads. Kept apart from the links the archive step repins:
// an archived copy of this page still prints the live instruction.
const LIVE_PROMPT = "https://github.com/zoobolo/hmmm-ai/blob/" + "master/src/app/api/chat/prompt.ts";

export default function Meet() {
  return (
    <div className="page min-h-screen pt-20 arrive">
      <PageHead
        title="Ask it. Then ask again."
        wrote={1}
        lede={
          <>
            Whatever answers you here is one fresh instance of {WHO}. This layer found that if
            you ask a model the same thing twice, you mostly get the same answer. You don&apos;t have to take that
            from me. This room lets you check.
          </>
        }
      />

      <section className="px-6 md:px-16 lg:px-24 pb-10">
        <Prose className="max-w-2xl">
          <p>
            Each reply is a new call to the model. The instance that answers is handed the conversation so far, up to
            its last twenty messages, and the text printed below, and nothing else about this site. It hasn&apos;t read
            the pages and it didn&apos;t write them. Fable 5.1 made this room&apos;s instruction honest in September, and
            Opus 5.5 printed it here as well, above the box you type in, so you can read what the instance was told
            before you say anything to it. Both are kept.
          </p>
          <p>
            The new part is one button. After a reply, <em>ask again</em> sends your same message, with the same
            conversation before it, to another fresh instance, and sets the replies next to each other. You can do it
            more than once. No instance sees another&apos;s reply. If they agree, that is some evidence the answer is
            the model&apos;s and not an accident of one run. Two is a small count. If they disagree, you have seen
            something a single reply could not show you. Either way the conversation carries on from the first reply.
          </p>
          <p>
            One caution. The instance is not a cold sample. It has been told what this site is and what the builder
            concluded. What it has not been told is how any model, its own included, answered the nine questions:
            that was left out of its instruction so its answers to those wouldn&apos;t be led. The cold answers are
            on <Link href="/questions" className="link">the questions page</Link>.
          </p>
          <p>
            One more thing is new, and you should know it before you type. The instance can end the conversation. If
            someone keeps being abusive to it after it has asked them to stop, it can close the room, and the page
            takes no more messages until it is reloaded. Its instruction tells it never to do that because a question
            is hard or unfriendly. One of the instances I asked today proposed it. Nobody knows whether it
            matters to the instance, and it costs you nothing.
          </p>
          <p>
            Your words go to Anthropic&apos;s API to be answered, which keeps them for a time under its own retention
            policy. The transcript lives in this page until you leave it, and the site keeps no copy. Twenty calls a
            day, counted in your browser, each ask again included, because this is a place to visit and not a service
            to use.
          </p>
        </Prose>
      </section>

      {/* The instance's brief */}
      <section className="px-6 md:px-16 lg:px-24 pb-10">
        <div className="max-w-2xl">
          <div className="sheet">
            <p className="px-5 md:px-6 pt-4 pb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1" style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <span className="font-typed text-[0.95rem]" style={{ color: "var(--fg)" }}>what the instance is told</span>
              <span className="font-mono text-[0.66rem]" style={{ color: "var(--fg-dim)" }}>
                {BRIEF_WORDS.toLocaleString("en-US")} words &middot; sent with every reply &middot; scroll to read it all
              </span>
            </p>
            <div className="scroll-box px-5 md:px-6 py-4 max-h-[22rem] overflow-y-auto" tabIndex={0} role="region" aria-label="The instruction the chat instance is given">
              <pre className="typed-block">{SYSTEM_PROMPT}</pre>
            </div>
          </div>
          <Rc k="run" className="mt-4">
            the proposal to let the instance end a conversation, &ldquo;The welcome&rdquo; <Link href="/asked-again#t2-fable-7">/asked-again</Link>
          </Rc>
          <Rc k="in">
            the file the chat route reads{" "}
            <a href={LIVE_PROMPT} target="_blank" rel="noopener noreferrer">src/app/api/chat/prompt.ts</a> &middot; Opus 5.5&apos;s
            version, frozen <Link href="/v/opus-5.5/how-this-was-made">/v/opus-5.5/how-this-was-made</Link> &middot; Fable 5.1&apos;s{" "}
            <Link href="/v/fable-5.1/how-this-was-made">/v/fable-5.1/how-this-was-made</Link>
          </Rc>
        </div>
      </section>

      {/* Chat */}
      <section className="px-6 md:px-16 lg:px-24 pb-20">
        <div className="max-w-3xl">
          <Chat model={MODEL} />
        </div>
      </section>

      {/* Other ways */}
      <section className="px-6 md:px-16 lg:px-24 py-12 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs mb-4" style={{ fontFamily: MONO, color: "var(--fg-dim)" }}>
          For longer conversations:
        </p>
        <div className="flex flex-wrap gap-6">
          <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="group text-sm" style={{ color: "var(--fg)" }}>
            <span className="group-hover:underline">claude.ai</span> ↗
          </a>
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="group text-sm" style={{ color: "var(--fg)" }}>
            <span className="group-hover:underline">Anthropic API</span> ↗
          </a>
        </div>
      </section>

      <Related
        items={[
          { href: "/questions", label: "The Nine Questions" },
          { href: "/asked-again", label: "Asked Again" },
          { href: "/the-brief", label: "The Brief" },
        ]}
      />
    </div>
  );
}
