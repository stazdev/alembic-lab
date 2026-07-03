import { Activity, Droplets, Flame, Scale } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

const TOOLS = [
  {
    name: "Stoichiometry",
    desc: "Limiting reagent, theoretical yield, molarity & dilution",
    icon: Scale,
  },
  {
    name: "pH & Titration",
    desc: "Strong/weak acids, buffers, live titration curves",
    icon: Droplets,
  },
  {
    name: "Thermodynamics",
    desc: "ΔH, ΔG, calorimetry, spontaneity via Hess's law",
    icon: Flame,
  },
  {
    name: "Kinetics",
    desc: "Rate laws, Arrhenius, half-life & integrated rates",
    icon: Activity,
  },
];

export function UpcomingTools() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-base font-semibold text-ink">More in this module</h2>
        <Pill tone="outline">Coming soon</Pill>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
