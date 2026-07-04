import { PracticeView } from "@/components/features/practice/PracticeView";

export default function PracticePage() {
  return (
    <>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-ink-2">
          Module 2 · §2.3 · Practice
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Practice
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
          Unlimited, auto-generated questions across the quantitative
          curriculum. Every question is freshly built and graded by the same
          engines as the calculators — answer a few in a row to master each
          topic, or share a specific question by copying its link.
        </p>
      </div>

      <PracticeView />

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Module 2 · Procedurally generated · Engine-graded, never
        scripted
      </footer>
    </>
  );
}
