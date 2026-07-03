/**
 * Apparatus data model + dataset (§1.1).
 *
 * Pure data — no React, no rendering concerns. The inventory UI and the
 * (future) 3D bench both derive their behavior from these records rather than
 * bespoke per-item code.
 */

export type ApparatusCategory =
  | "volumetric"
  | "reactionVessel"
  | "heating"
  | "instrument"
  | "safety";

export type Affordance =
  | "measureVolume"
  | "contain"
  | "pour"
  | "heat"
  | "stir"
  | "measurePh"
  | "measureMass"
  | "observe";

export type Material =
  | "borosilicate"
  | "sodaLime"
  | "plastic"
  | "porcelain"
  | "metal"
  | "mixed";

export type Precision = "low" | "medium" | "high";

/** Which hand-drawn SVG the card and bench render for this item. */
export type ApparatusIconKind =
  | "beaker"
  | "erlenmeyer"
  | "volumetricFlask"
  | "roundBottom"
  | "testTube"
  | "graduatedCylinder"
  | "burette"
  | "pipette"
  | "funnel"
  | "watchGlass"
  | "hotplate"
  | "bunsen"
  | "waterBath"
  | "spectrophotometer"
  | "phMeter"
  | "balance"
  | "thermometer"
  | "fumeHood"
  | "goggles"
  | "gloves";

export interface Apparatus {
  id: string;
  name: string;
  category: ApparatusCategory;
  icon: ApparatusIconKind;
  /** One-line summary shown on the card. */
  summary: string;
  /** Longer description shown in the detail popover. */
  description: string;
  material: Material;
  affordances: Affordance[];
  precision?: Precision;
  capacityMl?: number;
  toleranceClass?: "A" | "B";
  toleranceMl?: number;
  graduations?: string;
  maxTempC?: number;
  tags?: string[];
}

export interface CategoryMeta {
  id: ApparatusCategory | "all";
  label: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "all", label: "All", description: "Everything in the prep room" },
  { id: "volumetric", label: "Volumetric", description: "Precise volume measurement" },
  { id: "reactionVessel", label: "Vessels", description: "Hold, mix, and heat reactions" },
  { id: "heating", label: "Heating", description: "Heat sources and baths" },
  { id: "instrument", label: "Instruments", description: "Measure and analyze" },
  { id: "safety", label: "Safety", description: "PPE and containment" },
];

export const AFFORDANCE_LABELS: Record<Affordance, string> = {
  measureVolume: "Measure volume",
  contain: "Contain",
  pour: "Pour",
  heat: "Heat",
  stir: "Stir",
  measurePh: "Measure pH",
  measureMass: "Measure mass",
  observe: "Observe",
};

export const MATERIAL_LABELS: Record<Material, string> = {
  borosilicate: "Borosilicate glass",
  sodaLime: "Soda-lime glass",
  plastic: "Plastic (PP/PMP)",
  porcelain: "Porcelain",
  metal: "Metal",
  mixed: "Mixed materials",
};

export const PRECISION_LABELS: Record<Precision, string> = {
  low: "Low precision",
  medium: "Medium precision",
  high: "High precision",
};

export const APPARATUS: Apparatus[] = [
  // ── Volumetric ────────────────────────────────────────────────
  {
    id: "volumetric-flask-250",
    name: "Volumetric Flask",
    category: "volumetric",
    icon: "volumetricFlask",
    summary: "250 mL · Class A · ±0.12 mL",
    description:
      "A pear-shaped flask calibrated to contain one exact volume at its single graduation ring. The tool of choice for preparing standard solutions of known concentration.",
    material: "borosilicate",
    affordances: ["measureVolume", "contain", "pour"],
    precision: "high",
    capacityMl: 250,
    toleranceClass: "A",
    toleranceMl: 0.12,
    graduations: "Single ring",
    tags: ["standard solution", "titration prep"],
  },
  {
    id: "burette-50",
    name: "Burette",
    category: "volumetric",
    icon: "burette",
    summary: "50 mL · Class A · 0.1 mL divisions",
    description:
      "A long graduated tube with a stopcock that delivers precise, variable volumes drop by drop. The delivery instrument at the heart of every titration.",
    material: "borosilicate",
    affordances: ["measureVolume", "pour"],
    precision: "high",
    capacityMl: 50,
    toleranceClass: "A",
    toleranceMl: 0.05,
    graduations: "0.1 mL",
    tags: ["titration", "equivalence point"],
  },
  {
    id: "volumetric-pipette-25",
    name: "Volumetric Pipette",
    category: "volumetric",
    icon: "pipette",
    summary: "25 mL · Class A · ±0.03 mL",
    description:
      "A single-mark bulb pipette that transfers one exact aliquot. The most accurate way to move a fixed volume of solution onto the bench.",
    material: "borosilicate",
    affordances: ["measureVolume", "pour"],
    precision: "high",
    capacityMl: 25,
    toleranceClass: "A",
    toleranceMl: 0.03,
    graduations: "Single mark",
    tags: ["aliquot", "transfer"],
  },
  {
    id: "graduated-cylinder-100",
    name: "Graduated Cylinder",
    category: "volumetric",
    icon: "graduatedCylinder",
    summary: "100 mL · ±0.5 mL · 1 mL divisions",
    description:
      "A tall narrow cylinder for measuring approximate volumes quickly. More accurate than a beaker, less so than a volumetric flask or pipette.",
    material: "borosilicate",
    affordances: ["measureVolume", "pour", "contain"],
    precision: "medium",
    capacityMl: 100,
    toleranceMl: 0.5,
    graduations: "1 mL",
    tags: ["quick measure"],
  },
  {
    id: "graduated-pipette-10",
    name: "Graduated Pipette",
    category: "volumetric",
    icon: "pipette",
    summary: "10 mL · ±0.05 mL · 0.1 mL divisions",
    description:
      "A graduated transfer pipette for delivering variable small volumes. Useful when the exact aliquot isn't a round single-mark value.",
    material: "borosilicate",
    affordances: ["measureVolume", "pour"],
    precision: "high",
    capacityMl: 10,
    toleranceMl: 0.05,
    graduations: "0.1 mL",
    tags: ["transfer", "serial dilution"],
  },

  // ── Reaction vessels ──────────────────────────────────────────
  {
    id: "beaker-250",
    name: "Beaker",
    category: "reactionVessel",
    icon: "beaker",
    summary: "250 mL · ±5% · heat-safe",
    description:
      "The workhorse open vessel for holding, mixing, and heating. Its printed graduations are approximate (±5%) — never use a beaker when a measurement must be exact.",
    material: "borosilicate",
    affordances: ["contain", "heat", "stir", "pour"],
    precision: "low",
    capacityMl: 250,
    graduations: "Approx. 25 mL",
    maxTempC: 500,
    tags: ["mixing", "general purpose"],
  },
  {
    id: "erlenmeyer-250",
    name: "Erlenmeyer Flask",
    category: "reactionVessel",
    icon: "erlenmeyer",
    summary: "250 mL · conical · swirl-friendly",
    description:
      "A conical flask whose narrow neck lets you swirl vigorously without splashing — ideal for the analyte in a titration and for reactions that need mixing.",
    material: "borosilicate",
    affordances: ["contain", "heat", "stir", "pour"],
    precision: "low",
    capacityMl: 250,
    graduations: "Approx. 25 mL",
    maxTempC: 500,
    tags: ["titration", "swirling"],
  },
  {
    id: "round-bottom-500",
    name: "Round-Bottom Flask",
    category: "reactionVessel",
    icon: "roundBottom",
    summary: "500 mL · even heating",
    description:
      "A spherical flask that heats evenly and withstands vacuum — the standard vessel for reflux, distillation, and prolonged heating on a mantle.",
    material: "borosilicate",
    affordances: ["contain", "heat"],
    precision: "low",
    capacityMl: 500,
    maxTempC: 500,
    tags: ["reflux", "distillation"],
  },
  {
    id: "test-tube-20",
    name: "Test Tube",
    category: "reactionVessel",
    icon: "testTube",
    summary: "20 mL · small-scale reactions",
    description:
      "A small tube for qualitative tests and micro-scale reactions. Cheap, disposable, and easy to heat directly in a flame or water bath.",
    material: "borosilicate",
    affordances: ["contain", "heat", "observe"],
    precision: "low",
    capacityMl: 20,
    maxTempC: 500,
    tags: ["qualitative test", "spot test"],
  },
  {
    id: "filter-funnel",
    name: "Filter Funnel",
    category: "reactionVessel",
    icon: "funnel",
    summary: "Transfer & gravity filtration",
    description:
      "A cone-and-stem funnel for transferring liquids without spills and, with filter paper, for separating a precipitate from its solution.",
    material: "borosilicate",
    affordances: ["pour", "contain"],
    precision: "low",
    tags: ["filtration", "transfer"],
  },
  {
    id: "watch-glass",
    name: "Watch Glass",
    category: "reactionVessel",
    icon: "watchGlass",
    summary: "Evaporation & covering",
    description:
      "A shallow concave disc used to evaporate small volumes, hold solids for weighing, or cover a beaker to slow evaporation.",
    material: "borosilicate",
    affordances: ["contain", "observe"],
    precision: "low",
    tags: ["evaporation"],
  },

  // ── Heating ───────────────────────────────────────────────────
  {
    id: "hotplate-stirrer",
    name: "Hotplate Stirrer",
    category: "heating",
    icon: "hotplate",
    summary: "Up to 350 °C · magnetic stirring",
    description:
      "A combined heating plate and magnetic stirrer. Controls temperature and mixing together, keeping a reaction uniform while it heats.",
    material: "metal",
    affordances: ["heat", "stir"],
    maxTempC: 350,
    tags: ["controlled heating", "stirring"],
  },
  {
    id: "bunsen-burner",
    name: "Bunsen Burner",
    category: "heating",
    icon: "bunsen",
    summary: "Open flame · ~1500 °C",
    description:
      "A gas burner producing a hot, adjustable flame. Fast and intense, but its open flame makes it unsuitable for flammable solvents.",
    material: "metal",
    affordances: ["heat"],
    maxTempC: 1500,
    tags: ["direct flame", "flame test"],
  },
  {
    id: "water-bath",
    name: "Water Bath",
    category: "heating",
    icon: "waterBath",
    summary: "Gentle heat · up to 100 °C",
    description:
      "A temperature-controlled bath of water that delivers gentle, even heat below its boiling point — ideal for warming sensitive or flammable mixtures.",
    material: "metal",
    affordances: ["heat"],
    maxTempC: 100,
    tags: ["gentle heating", "incubation"],
  },

  // ── Instruments ───────────────────────────────────────────────
  {
    id: "spectrophotometer",
    name: "UV-Vis Spectrophotometer",
    category: "instrument",
    icon: "spectrophotometer",
    summary: "Absorbance 190–1100 nm",
    description:
      "Measures how much light a solution absorbs at each wavelength. Used to determine concentration via the Beer–Lambert law and to follow reaction kinetics.",
    material: "mixed",
    affordances: ["observe", "measureVolume"],
    precision: "high",
    tags: ["absorbance", "Beer–Lambert", "kinetics"],
  },
  {
    id: "ph-meter",
    name: "pH Meter",
    category: "instrument",
    icon: "phMeter",
    summary: "pH 0–14 · ±0.01",
    description:
      "A probe-and-readout instrument that measures hydrogen-ion activity directly. Far more precise than indicator paper and essential for plotting titration curves.",
    material: "mixed",
    affordances: ["measurePh", "observe"],
    precision: "high",
    tags: ["titration curve", "acid–base"],
  },
  {
    id: "analytical-balance",
    name: "Analytical Balance",
    category: "instrument",
    icon: "balance",
    summary: "0.1 mg readability",
    description:
      "A high-precision balance that reads to a tenth of a milligram behind a draft shield. The starting point for any accurately known mass of reagent.",
    material: "mixed",
    affordances: ["measureMass"],
    precision: "high",
    tags: ["weighing", "standard prep"],
  },
  {
    id: "thermometer",
    name: "Thermometer",
    category: "instrument",
    icon: "thermometer",
    summary: "−10 to 110 °C · ±0.5 °C",
    description:
      "Reads the temperature of a mixture — needed for calorimetry, for kinetics (rate versus temperature), and to watch for runaway exotherms.",
    material: "mixed",
    affordances: ["observe"],
    precision: "medium",
    tags: ["calorimetry", "kinetics"],
  },

  // ── Safety ────────────────────────────────────────────────────
  {
    id: "fume-hood",
    name: "Fume Hood",
    category: "safety",
    icon: "fumeHood",
    summary: "Ventilated containment",
    description:
      "A ventilated enclosure that draws hazardous vapors away from you. Reactions that evolve toxic or flammable gas belong behind its sash.",
    material: "mixed",
    affordances: ["contain", "observe"],
    tags: ["ventilation", "toxic gas"],
  },
  {
    id: "safety-goggles",
    name: "Safety Goggles",
    category: "safety",
    icon: "goggles",
    summary: "Splash-rated eye protection",
    description:
      "Sealed eye protection against splashes and flying glass. The single most important piece of PPE — the lab won't let you begin without them.",
    material: "plastic",
    affordances: ["observe"],
    tags: ["PPE", "required"],
  },
  {
    id: "nitrile-gloves",
    name: "Nitrile Gloves",
    category: "safety",
    icon: "gloves",
    summary: "Chemical-resistant hand protection",
    description:
      "Disposable gloves that resist most laboratory chemicals, protecting skin from corrosives and irritants during handling.",
    material: "plastic",
    affordances: ["contain"],
    tags: ["PPE"],
  },
];

/** Fast lookup by id — used by the bench store and 3D scene. */
export const APPARATUS_BY_ID: Record<string, Apparatus> = Object.fromEntries(
  APPARATUS.map((a) => [a.id, a]),
);

export function getApparatus(id: string): Apparatus | undefined {
  return APPARATUS_BY_ID[id];
}
