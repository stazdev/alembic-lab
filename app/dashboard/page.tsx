import { DashboardView } from "@/components/features/dashboard/DashboardView";

export default function DashboardPage() {
  return (
    <>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-ink-2">Alembic · Overview</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          Your lab at a glance — track progress through the guided tasks and jump
          straight into any workspace.
        </p>
      </div>

      <DashboardView />

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Overview
      </footer>
    </>
  );
}
