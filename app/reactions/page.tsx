import { EquationBalancer } from "@/components/features/reactions/EquationBalancer";
import { StoichiometryTool } from "@/components/features/reactions/StoichiometryTool";
import { UpcomingTools } from "@/components/features/reactions/UpcomingTools";

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
          Build and balance chemical equations with a real linear-algebra
          solver, then explore the concepts behind them. More calculators are on
          the way.
        </p>
      </div>

      <div className="mt-8">
        <EquationBalancer />
      </div>

      <div className="mt-8">
        <StoichiometryTool />
      </div>

      <div className="mt-8">
        <UpcomingTools />
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Module 2 · §2.2 Equation Balancer · Balanced by null-space
        linear algebra, not lookup tables
      </footer>
    </>
  );
}
