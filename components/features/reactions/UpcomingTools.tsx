import { GraduationCap, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

const TOOLS = [
  {
    name: "Redox half-reactions",
    desc: "Ionic equations with charge & electron balancing (§2.2)",
    icon: Zap,
  },
  {
    name: "Guided tasks",
    desc: "Objective-driven labs with scaffolds & auto-grading (§2.3)",
    icon: GraduationCap,
  },
];

export function UpcomingTools() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-base font-semibold text-ink">More in this module</h2>
        <Pill tone="outline">Coming soon</Pill>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Card key={tool.name} tone="cream" flat className="border border-line p-4">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-ctrl bg-surface text-ink-2">
              <tool.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink">{tool.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-2">{tool.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
