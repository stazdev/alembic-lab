import {
  CATEGORY_META,
  CATEGORY_ORDER,
  type ElementCategory,
} from "@/data/elements";
import { cn } from "@/lib/utils";

/**
 * Legend for the category coloring. When an element is hovered, its category
 * swatch stays lit and the rest dim — reinforcing the color→category mapping.
 */
export function CategoryLegend({
  activeCategory,
}: {
  activeCategory: ElementCategory | null;
}) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const active = activeCategory === cat;
        return (
          <li
            key={cat}
            className={cn(
              "flex items-center gap-2 transition-opacity duration-200",
              activeCategory && !active && "opacity-35",
            )}
          >
            <span
              className="h-3.5 w-3.5 rounded-[5px] ring-1 ring-black/5"
              style={{ backgroundColor: meta.fill }}
            />
            <span
              className={cn(
                "text-xs transition-colors",
                active ? "font-semibold text-ink" : "text-ink-2",
              )}
            >
              {meta.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
