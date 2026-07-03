import { FlaskConical, Hexagon, Share2, ShieldAlert, Sigma } from "lucide-react";

const UPDATES = [
  {
    icon: ShieldAlert,
    title: "Safety alerts in the sandbox",
    body: "Vessels now flag exotherms, corrosives, vigorous gas, and overpressure — each with a reset-and-learn incident report.",
  },
  {
    icon: FlaskConical,
    title: "Reactive metals shelf",
    body: "Drop sodium, magnesium, zinc, iron, or copper into a vessel to explore the reactivity series.",
  },
  {
    icon: Sigma,
    title: "New reaction tools",
    body: "Gas laws, electrochemistry, equilibrium, enzyme kinetics, and organic mechanisms joined the Reactions workspace.",
  },
  {
    icon: Hexagon,
    title: "2D & 3D molecules",
    body: "Explore skeletal (RDKit) and 3D (3Dmol) structures for the compound library, or search PubChem.",
  },
  {
    icon: Share2,
    title: "Save & share your bench",
    body: "Export a sandbox setup to a share code or JSON file and reload it on any device.",
  },
];

export default function NotificationsPage() {
  return (
    <>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-ink-2">Alembic</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Notifications
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          What&apos;s new across the lab. Personal alerts — safety incidents and
          task reminders — will surface here as you work.
        </p>
      </div>

      <div className="mt-8 max-w-2xl">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">
          What&apos;s new
        </div>
        <div className="space-y-2">
          {UPDATES.map((u) => (
            <div
              key={u.title}
              className="flex gap-3 rounded-card border border-line bg-surface p-4"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-ctrl bg-surface-2 text-ink">
                <u.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{u.title}</span>
                  <span className="rounded-pill bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink">
                    New
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{u.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-ink-3">
          You&apos;re all caught up.
        </p>
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-3">
        Alembic
      </footer>
    </>
  );
}
