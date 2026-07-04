/**
 * Walkthrough definitions — one short guided tour per major page.
 * A step with no `target` renders as a centered card; a step with a `target`
 * spotlights the element carrying the matching `data-tour` attribute.
 */

export interface TourStep {
  /** Value of the `data-tour` attribute to spotlight. Omit for a centered card. */
  target?: string;
  title: string;
  body: string;
}

export interface Tour {
  id: string;
  /** Exact pathname the tour belongs to. */
  path: string;
  steps: TourStep[];
}

export const TOURS: Tour[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    steps: [
      {
        title: "Welcome to Alembic",
        body: "Your virtual chemistry lab. Every result here — pH, heat, precipitates — is computed from real chemistry engines, never scripted. This 30-second tour shows you around.",
      },
      {
        target: "dashboard-stats",
        title: "The lab at a glance",
        body: "Your task progress plus what's inside the lab: 118 elements, the reagent shelf, and the bundled molecule library.",
      },
      {
        target: "dashboard-progress",
        title: "Progress by topic",
        body: "Guided-task completion, broken down by chemistry topic. It fills in as you complete tasks — everything is saved in this browser.",
      },
      {
        target: "dashboard-modules",
        title: "Explore the modules",
        body: "Jump into any part of the lab from here. A good first stop: the Sandbox, where you mix real reagents and watch the chemistry unfold.",
      },
      {
        target: "tutor-button",
        title: "Optional: the AI tutor",
        body: "Connect your own Google Gemini key in Settings to unlock this AI tutor — chat about your work, explain any result, get practice hints, and read molecule & element insights. It's entirely optional and your key stays in this browser.",
      },
    ],
  },
  {
    id: "inventory",
    path: "/",
    steps: [
      {
        title: "The Inventory Room",
        body: "A prep room of real lab apparatus. Each item carries its true capacity, tolerance class, and typical use — learning the right tool for the job starts here.",
      },
      {
        target: "inventory-filters",
        title: "Browse by category",
        body: "Filter the shelves: volumetric glassware, reaction vessels, heating & safety, and instruments.",
      },
      {
        target: "inventory-search",
        title: "Search the shelves",
        body: "Find apparatus by name, purpose, or tag — try “burette” or “precise”.",
      },
      {
        target: "inventory-grid",
        title: "Spec cards",
        body: "Every card shows real specifications. Click an item to read its details and stage it for your bench.",
      },
      {
        target: "inventory-bench",
        title: "Your bench tray",
        body: "Apparatus you stage collects here — it carries over into the Sandbox, where the actual experiments happen.",
      },
    ],
  },
  {
    id: "sandbox",
    path: "/sandbox",
    steps: [
      {
        title: "The Interactive Sandbox",
        body: "This is the live bench. Add vessels, mix reagents, heat and pour — colour changes, precipitates, gas, and temperature are all computed from the mixture in real time.",
      },
      {
        target: "sandbox-vessels",
        title: "Add a vessel",
        body: "Start by placing a beaker, flask, test tube, or cylinder on the bench.",
      },
      {
        target: "sandbox-shelf",
        title: "The reagent shelf",
        body: "Acids, bases, salts, indicators, and reactive metals. Pick a vessel, then add reagents to it — incompatible mixes trigger real safety events.",
      },
      {
        target: "sandbox-bench",
        title: "Work the bench",
        body: "Each vessel can be heated, stirred, and poured into another. Watch the liquid: colour, bubbles, precipitate, and boiling all follow the chemistry.",
      },
      {
        target: "sandbox-log",
        title: "Observations",
        body: "Every event is narrated here with its balanced equation, pH, and temperature — the lab notebook writes itself.",
      },
      {
        target: "sandbox-actions",
        title: "Save & reset",
        body: "Export your bench as a share code to save or send a reproducible setup, or reset to start clean.",
      },
    ],
  },
  {
    id: "reactions",
    path: "/reactions",
    steps: [
      {
        title: "Reaction tools",
        body: "Fourteen calculators and workspaces — balancing, stoichiometry, pH & titration curves, thermodynamics, kinetics, electrochemistry, and organic chemistry.",
      },
      {
        target: "reactions-categories",
        title: "Pick a category",
        body: "Tools are grouped by topic. Each category holds one or more related tools.",
      },
      {
        target: "reactions-tools",
        title: "Switch tools",
        body: "Related tools within the category sit here — for example Molecular vs. Redox balancing.",
      },
      {
        target: "reactions-workspace",
        title: "The workspace",
        body: "Every tool computes live as you type, and shows the worked steps — the same engines that grade the guided tasks.",
      },
    ],
  },
  {
    id: "tasks",
    path: "/tasks",
    steps: [
      {
        title: "Guided tasks",
        body: "Auto-graded problems from intro to challenge level. Answers are checked by the chemistry engines themselves, so the grading is always consistent with the tools.",
      },
      {
        target: "tasks-filter",
        title: "Filter by topic",
        body: "Narrow the list to the topic you're studying.",
      },
      {
        target: "tasks-list",
        title: "Pick a task",
        body: "Tasks show their topic and difficulty; completed ones stay marked. Progress is saved in this browser.",
      },
      {
        target: "tasks-detail",
        title: "Solve it here",
        body: "Read the problem, use staged hints if you get stuck, and check your answer. Many tasks link to the matching calculator tool.",
      },
    ],
  },
  {
    id: "periodic-table",
    path: "/periodic-table",
    steps: [
      {
        title: "The Periodic Table",
        body: "All 118 elements in the faithful IUPAC layout, with property trends and interactive 3D atomic models.",
      },
      {
        target: "ptable-colorby",
        title: "Colour by property",
        body: "Switch from category colouring to heatmaps — electronegativity, radius, ionization energy, melting point, density — and watch the periodic trends appear.",
      },
      {
        target: "ptable-search",
        title: "Find an element",
        body: "Search by name, symbol, or atomic number; non-matching elements dim.",
      },
      {
        target: "ptable-grid",
        title: "Explore the grid",
        body: "Click any element for its full properties and a 3D shell model. The grid is keyboard-navigable too — focus a cell and use the arrow keys.",
      },
      {
        target: "ptable-legend",
        title: "The legend",
        body: "Category swatches, or the numeric scale when a heatmap is active.",
      },
    ],
  },
  {
    id: "molecules",
    path: "/molecules",
    steps: [
      {
        title: "Molecules explorer",
        body: "Interactive 2D and 3D structures — from the bundled library or fetched live from PubChem.",
      },
      {
        target: "molecules-library",
        title: "The library",
        body: "Curated common compounds. Click one to load its structure.",
      },
      {
        target: "molecules-search",
        title: "Search any compound",
        body: "Type a name — “caffeine”, “toluene” — and it's resolved through PubChem.",
      },
      {
        target: "molecules-viewer",
        title: "2D & 3D viewer",
        body: "Skeletal diagrams rendered by RDKit and rotatable 3D models — drag to orbit, scroll to zoom, and switch representations.",
      },
    ],
  },
  {
    id: "practice",
    path: "/practice",
    steps: [
      {
        title: "Practice mode",
        body: "Unlimited, auto-generated questions. Unlike the fixed guided tasks, every question here is freshly built from a template and graded by the same engines as the calculators — so the answers are always correct.",
      },
      {
        target: "practice-topic",
        title: "Choose a topic",
        body: "Switch between the quantitative topics — stoichiometry, gases, pH, energetics, kinetics, equilibrium, and electrochemistry.",
      },
      {
        target: "practice-generator",
        title: "Pick a question type & difficulty",
        body: "Each topic has several generators. A ✨ marks ones you've mastered. Set the difficulty on the right.",
      },
      {
        target: "practice-question",
        title: "Answer it",
        body: "Solve the question, use staged hints if stuck, and check your answer. The seed number identifies this exact question.",
      },
      {
        target: "practice-controls",
        title: "New question & sharing",
        body: "“New question” generates a fresh one instantly. “Share” copies a link that reproduces this exact question — how an instructor can assign one.",
      },
      {
        target: "practice-mastery",
        title: "Build mastery",
        body: "Answer a few in a row to master each generator. Your streak and accuracy are tracked here, saved in this browser.",
      },
    ],
  },
];

const BY_PATH = new Map(TOURS.map((t) => [t.path, t]));

export function tourForPath(pathname: string): Tour | undefined {
  return BY_PATH.get(pathname);
}
