import { PageHeader } from "@/components/features/shell/PageHeader";
import { InventoryRoom } from "@/components/features/inventory/InventoryRoom";
import { BenchTray } from "@/components/features/bench/BenchTray";

export default function Home() {
  return (
    <>
      <PageHeader />
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <InventoryRoom />
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <BenchTray />
        </aside>
      </div>
      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic · Module 1 · The Lab &amp; Apparatus
      </footer>
    </>
  );
}
