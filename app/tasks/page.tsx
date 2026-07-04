import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TasksView } from "@/components/features/tasks/TasksView";

export default function TasksPage() {
  return (
    <>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-ink-2">
          Module 2 · §2.3 Curriculum Integration
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Guided Tasks
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
          Work through objective-driven problems with staged hints. Every answer
          is auto-graded by the same engines that power the calculators, so the
          check always matches the tool.
        </p>
        <Link
          href="/practice"
          className="mt-4 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-2"
        >
          Want unlimited practice? Try Practice mode
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8">
        <TasksView />
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Module 2 · §2.3 Guided Tasks · Auto-graded by the verified
        engines
      </footer>
    </>
  );
}
