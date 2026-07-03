import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactionsTools } from "@/components/features/reactions/ReactionsTools";

export default function ReactionsPage() {
  return (
    <>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-ink-2">
          Module 2 · The Reaction &amp; Concept Engine
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Reactions
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
          Balance equations (molecular and redox), then work through
          stoichiometry, pH &amp; titration, thermodynamics, and kinetics — each
          backed by a real, verified engine. Pick a tool below.
        </p>
      </div>

      <div className="mt-8">
        <ReactionsTools />
      </div>

      <div className="mt-8">
        <Link
          href="/tasks"
          className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-5 transition hover:border-line-strong"
        >
          <div>
            <h2 className="text-base font-semibold text-ink">Ready to practice?</h2>
            <p className="mt-1 text-xs text-ink-2">
              Work through guided tasks built on these engines — auto-graded,
              with staged hints.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-ink px-4 py-2 text-sm font-medium text-on-dark">
            Guided tasks
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Module 2 · The Reaction &amp; Concept Engine · Every result is
        computed, not looked up
      </footer>
    </>
  );
}
