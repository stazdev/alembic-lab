import { MoleculesExplorer } from "@/components/features/molecules/MoleculesExplorer";

export default function MoleculesPage() {
  return (
    <>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-ink-2">
          Module 3 · 3D Visualization &amp; Periodic Table
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Molecules
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          Interactive 3D structures. Pick a compound to explore it in
          ball-and-stick, space-filling, or wireframe — drag to rotate, scroll to
          zoom. The bundled set renders instantly and offline; search fetches any
          other compound from PubChem on demand.
        </p>
      </div>

      <div className="mt-8">
        <MoleculesExplorer />
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Module 3 · 3D molecular structures · bundled + PubChem
      </footer>
    </>
  );
}
