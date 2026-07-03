"use client";

import { useState } from "react";
import { EquationBalancer } from "./EquationBalancer";
import { RedoxBalancer } from "./RedoxBalancer";
import { StoichiometryTool } from "./StoichiometryTool";
import { GasLawsTool } from "./GasLawsTool";
import { PHTool } from "./PHTool";
import { ThermoTool } from "./ThermoTool";
import { ElectrochemistryTool } from "./ElectrochemistryTool";
import { KineticsTool } from "./KineticsTool";
import { EnzymeKineticsTool } from "./EnzymeKineticsTool";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type Tool =
  | "balancer"
  | "redox"
  | "stoichiometry"
  | "gas"
  | "ph"
  | "thermo"
  | "echem"
  | "kinetics"
  | "enzyme";

const TOOLS = [
  { value: "balancer" as const, label: "Balancer" },
  { value: "redox" as const, label: "Redox" },
  { value: "stoichiometry" as const, label: "Stoichiometry" },
  { value: "gas" as const, label: "Gas Laws" },
  { value: "ph" as const, label: "pH & Titration" },
  { value: "thermo" as const, label: "Thermodynamics" },
  { value: "echem" as const, label: "Electrochemistry" },
  { value: "kinetics" as const, label: "Kinetics" },
  { value: "enzyme" as const, label: "Enzyme Kinetics" },
];

export function ReactionsTools() {
  const [tool, setTool] = useState<Tool>("balancer");

  return (
    <div>
      <div className="mb-6 -mx-1 overflow-x-auto px-1 pb-1">
        <SegmentedControl
          layoutId="reactions-tool"
          aria-label="Select a tool"
          options={TOOLS}
          value={tool}
          onChange={setTool}
        />
      </div>

      {tool === "balancer" && <EquationBalancer />}
      {tool === "redox" && <RedoxBalancer />}
      {tool === "stoichiometry" && <StoichiometryTool />}
      {tool === "gas" && <GasLawsTool />}
      {tool === "ph" && <PHTool />}
      {tool === "thermo" && <ThermoTool />}
      {tool === "echem" && <ElectrochemistryTool />}
      {tool === "kinetics" && <KineticsTool />}
      {tool === "enzyme" && <EnzymeKineticsTool />}
    </div>
  );
}
