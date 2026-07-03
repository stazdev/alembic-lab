"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FlaskConical,
  Hexagon,
  Share2,
  ShieldAlert,
  Sigma,
  X,
} from "lucide-react";

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

export function NotificationsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && [
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        />,
        <motion.aside
          key="panel"
          aria-label="Notifications"
          className="fixed inset-4 z-50 flex flex-col overflow-y-auto rounded-card border border-line bg-surface shadow-lift sm:left-auto sm:w-full sm:max-w-md"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line p-5">
            <div>
              <div className="text-base font-semibold text-ink">Notifications</div>
              <div className="text-xs text-ink-2">What&apos;s new across the lab</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-surface text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 p-4">
            {UPDATES.map((u) => (
              <div
                key={u.title}
                className="flex gap-3 rounded-ctrl border border-line bg-surface-2 p-3"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-ctrl bg-surface text-ink">
                  <u.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {u.title}
                    </span>
                    <span className="rounded-pill bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink">
                      New
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-2">
                    {u.body}
                  </p>
                </div>
              </div>
            ))}
            <p className="pt-2 text-center text-xs text-ink-3">
              You&apos;re all caught up.
            </p>
          </div>
        </motion.aside>,
      ]}
    </AnimatePresence>
  );
}
