"use client";

import { useState, type ReactNode } from "react";
import { EquationBalancer } from "./EquationBalancer";
import { RedoxBalancer } from "./RedoxBalancer";
import { RedoxTitrationTool } from "./RedoxTitrationTool";
import { StoichiometryTool } from "./StoichiometryTool";
import { GasLawsTool } from "./GasLawsTool";
import { PHTool } from "./PHTool";
import { EquilibriumTool } from "./EquilibriumTool";
import { ThermoTool } from "./ThermoTool";
import { ElectrochemistryTool } from "./ElectrochemistryTool";
import { KineticsTool } from "./KineticsTool";
import { EnzymeKineticsTool } from "./EnzymeKineticsTool";
import { FunctionalGroupsTool } from "./FunctionalGroupsTool";
import { MechanismViewer } from "./MechanismViewer";
import { StructureEditor } from "./StructureEditor";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/utils";

type ToolId =
  | "balancer"
  | "redox"
  | "redoxTitration"
  | "stoichiometry"
  | "gas"
  | "ph"
  | "equilibrium"
  | "thermo"
  | "echem"
  | "kinetics"
  | "enzyme"
  | "functionalGroups"
  | "mechanisms"
  | "sketchpad";

const TOOL_COMPONENTS: Record<ToolId, ReactNode> = {
  balancer: <EquationBalancer />,
  redox: <RedoxBalancer />,
  redoxTitration: <RedoxTitrationTool />,
  stoichiometry: <StoichiometryTool />,
  gas: <GasLawsTool />,
  ph: <PHTool />,
  equilibrium: <EquilibriumTool />,
  thermo: <ThermoTool />,
  echem: <ElectrochemistryTool />,
  kinetics: <KineticsTool />,
  enzyme: <EnzymeKineticsTool />,
  functionalGroups: <FunctionalGroupsTool />,
  mechanisms: <MechanismViewer />,
  sketchpad: <StructureEditor />,
};

interface Category {
  id: string;
  label: string;
  tools: { value: ToolId; label: string }[];
}

// Two-level navigation: broad category up top, related tools beneath — keeps the
// tab bar readable now that there are eleven tools.
const CATEGORIES: Category[] = [
  {
    id: "balancing",
    label: "Balancing",
    tools: [
      { value: "balancer", label: "Molecular" },
      { value: "redox", label: "Redox" },
    ],
  },
  {
    id: "stoichiometry",
    label: "Stoichiometry",
    tools: [
      { value: "stoichiometry", label: "Stoichiometry" },
      { value: "gas", label: "Gas Laws" },
    ],
  },
  {
    id: "solutions",
    label: "Solutions & Equilibria",
    tools: [
      { value: "ph", label: "pH & Titration" },
      { value: "equilibrium", label: "Equilibrium" },
      { value: "redoxTitration", label: "Redox Titration" },
    ],
  },
  {
    id: "energetics",
    label: "Energetics",
    tools: [
      { value: "thermo", label: "Thermodynamics" },
      { value: "echem", label: "Electrochemistry" },
    ],
  },
  {
    id: "kinetics",
    label: "Kinetics",
    tools: [
      { value: "kinetics", label: "Rate laws" },
      { value: "enzyme", label: "Enzymes" },
    ],
  },
  {
    id: "organic",
    label: "Organic",
    tools: [
      { value: "functionalGroups", label: "Functional-group tests" },
      { value: "mechanisms", label: "Mechanisms" },
      { value: "sketchpad", label: "Sketchpad" },
    ],
  },
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.id, label: c.label }));

export function ReactionsTools() {
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [toolId, setToolId] = useState<ToolId>(CATEGORIES[0].tools[0].value);

  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];
  const activeTool = category.tools.some((t) => t.value === toolId)
    ? toolId
    : category.tools[0].value;

  function selectCategory(id: string) {
    setCategoryId(id);
    const cat = CATEGORIES.find((c) => c.id === id);
    if (cat) setToolId(cat.tools[0].value);
  }

  return (
    <div>
      <div data-tour="reactions-categories" className="-mx-1 overflow-x-auto px-1 pb-1">
        <SegmentedControl
          layoutId="reactions-category"
          aria-label="Tool category"
          options={CATEGORY_OPTIONS}
          value={categoryId}
          onChange={selectCategory}
        />
      </div>

      {category.tools.length > 1 && (
        <div data-tour="reactions-tools" className="mt-3 flex flex-wrap gap-1.5">
          {category.tools.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setToolId(t.value)}
              aria-pressed={activeTool === t.value}
              className={cn(
                "rounded-pill px-3.5 py-1.5 text-sm font-medium transition",
                activeTool === t.value
                  ? "bg-ink text-on-dark"
                  : "border border-line bg-surface text-ink-2 hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div data-tour="reactions-workspace" className="mt-6">{TOOL_COMPONENTS[activeTool]}</div>
    </div>
  );
}
