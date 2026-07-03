import { PeriodicTable } from "@/components/features/periodic-table/PeriodicTable";

export default function PeriodicTablePage() {
  return (
    <>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-ink-2">
          Module 3 · 3D Visualization &amp; Periodic Table
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Periodic Table
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          The full IUPAC table, faithfully laid out — 118 elements placed by real
          group and period, with the lanthanides and actinides in their strip
          below. Hover an element for quick stats; cells are colored by category.
          Click one to select it (the full profile and 3D atomic model land next).
        </p>
      </div>

      <div className="mt-8">
        <PeriodicTable />
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Module 3 · 118 elements · faithful IUPAC layout
      </footer>
    </>
  );
}
