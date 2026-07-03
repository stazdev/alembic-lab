"use client";

import { useMemo, useState } from "react";
import { PackageOpen } from "lucide-react";
import {
  APPARATUS,
  CATEGORIES,
  type ApparatusCategory,
} from "@/data/apparatus";
import {
  SegmentedControl,
  type SegmentOption,
} from "@/components/ui/SegmentedControl";
import { SearchField } from "@/components/ui/SearchField";
import { Button } from "@/components/ui/Button";
import { ApparatusGrid } from "./ApparatusGrid";

type Filter = ApparatusCategory | "all";

const CATEGORY_OPTIONS: SegmentOption<Filter>[] = CATEGORIES.map((c) => ({
  value: c.id,
  label: c.label,
}));

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-surface/50 px-6 py-16 text-center">
      <PackageOpen className="mb-3 h-8 w-8 text-ink-3" />
      <p className="text-sm font-medium text-ink">No apparatus match your filters</p>
      <p className="mt-1 text-xs text-ink-2">
        Try a different category or clear your search.
      </p>
      <Button variant="soft" size="sm" className="mt-4" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  );
}

export function InventoryRoom() {
  const [category, setCategory] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APPARATUS.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        (a.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [category, query]);

  return (
    <section aria-label="Apparatus inventory">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div data-tour="inventory-filters" className="-mx-1 overflow-x-auto px-1 pb-1">
          <SegmentedControl
            layoutId="inventory-category"
            aria-label="Filter apparatus by category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
          />
        </div>
        <div data-tour="inventory-search">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search apparatus…"
            className="lg:w-72"
          />
        </div>
      </div>

      <p className="mb-4 text-xs text-ink-2">
        Showing <span className="font-semibold text-ink">{items.length}</span> of{" "}
        {APPARATUS.length} apparatus
      </p>

      <div data-tour="inventory-grid">
        {items.length > 0 ? (
          <ApparatusGrid items={items} />
        ) : (
          <EmptyState
            onReset={() => {
              setQuery("");
              setCategory("all");
            }}
          />
        )}
      </div>
    </section>
  );
}
