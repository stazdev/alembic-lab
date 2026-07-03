"use client";

/**
 * First-time-user walkthrough: a spotlight overlay that steps through the
 * `data-tour` anchors of the current page. Auto-starts once per page (tracked
 * in the tour store), replayable from the TopBar help button or Settings.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Pill } from "@/components/ui/Pill";
import { usePrefs } from "@/lib/stores/prefsStore";
import { useTour } from "@/lib/stores/tourStore";
import { TOURS, tourForPath } from "@/lib/tour/tours";

const SPOT_PAD = 8; // breathing room around the spotlit element
const CARD_W = 340;
const CARD_EST_H = 230; // estimate for above/below placement
const MARGIN = 16;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function cardPosition(rect: Rect | null): CSSProperties {
  if (!rect || typeof window === "undefined") {
    return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(CARD_W, vw - MARGIN * 2);
  const left = Math.min(Math.max(rect.left, MARGIN), vw - MARGIN - width);
  let top = rect.top + rect.height + SPOT_PAD + 12;
  if (top + CARD_EST_H > vh - MARGIN) {
    top = Math.max(MARGIN, rect.top - SPOT_PAD - 12 - CARD_EST_H);
  }
  return { left, top, width };
}

export function TourOverlay() {
  const pathname = usePathname();
  // Persisted state only after mount — avoids an SSR hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const activeTourId = useTour((s) => s.activeTourId);
  const step = useTour((s) => s.step);
  const seen = useTour((s) => s.seen);
  const stop = useTour((s) => s.stop);
  const next = useTour((s) => s.next);
  const prev = useTour((s) => s.prev);

  const prefersReduced = useReducedMotion();
  const reduceMotionPref = usePrefs((s) => s.reduceMotion);
  const noMotion = Boolean(prefersReduced) || reduceMotionPref;

  const pageTour = tourForPath(pathname);
  const activeTour = TOURS.find((t) => t.id === activeTourId) ?? null;
  // Only render when the active tour belongs to the page we're on.
  const running =
    activeTour && pageTour && activeTour.id === pageTour.id ? activeTour : null;

  // Auto-start on the first visit to a page that has a tour.
  useEffect(() => {
    if (!mounted || !pageTour || activeTourId) return;
    if (seen.includes(pageTour.id)) return;
    const timer = window.setTimeout(() => {
      const s = useTour.getState();
      if (!s.activeTourId && !s.seen.includes(pageTour.id))
        s.start(pageTour.id);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [mounted, pageTour, activeTourId, seen]);

  // Navigating away ends (and marks) the active tour.
  useEffect(() => {
    const s = useTour.getState();
    if (s.activeTourId && tourForPath(pathname)?.id !== s.activeTourId)
      s.stop();
  }, [pathname]);

  const stepDef = running
    ? running.steps[Math.min(step, running.steps.length - 1)]
    : null;
  const lastStep = running ? step >= running.steps.length - 1 : false;

  // Measure the spotlit element; follow it through scroll, resize, and late
  // layout shifts (3D canvases and images loading in).
  const [rect, setRect] = useState<Rect | null>(null);
  const target = stepDef?.target;
  const measure = useCallback(() => {
    if (!target) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
  }, [target]);

  useEffect(() => {
    if (!running) return;
    if (target) {
      const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top < MARGIN || r.bottom > window.innerHeight - MARGIN) {
          el.scrollIntoView({
            block: "center",
            behavior: noMotion ? "auto" : "smooth",
          });
        }
      }
    }
    measure();
    const onMove = () => measure();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    const interval = window.setInterval(measure, 400);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      window.clearInterval(interval);
    };
  }, [running, target, measure, noMotion]);

  // Keyboard: Escape dismisses, arrows step.
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
      else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (lastStep) stop();
        else next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, lastStep, next, prev, stop]);

  // Keep focus on the primary action as steps change.
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (running) nextRef.current?.focus({ preventScroll: true });
  }, [running, step]);

  if (!mounted) return null;

  const cardStyle = running ? cardPosition(rect) : undefined;

  return (
    <AnimatePresence>
      {running && stepDef && (
        <motion.div
          key={running.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: noMotion ? 0 : 0.18 }}
          className="fixed inset-0 z-60"
        >
          {/* Click shield — the page pauses while the tour runs. */}
          <div className="absolute inset-0" aria-hidden />

          {rect ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute rounded-card ring-2 ring-accent-strong"
              style={{ boxShadow: "0 0 0 9999px rgba(26, 26, 26, 0.45)" }}
              initial={false}
              animate={{
                left: rect.left - SPOT_PAD,
                top: rect.top - SPOT_PAD,
                width: rect.width + SPOT_PAD * 2,
                height: rect.height + SPOT_PAD * 2,
              }}
              transition={
                noMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 34 }
              }
            />
          ) : (
            <div aria-hidden className="absolute inset-0 bg-ink/45" />
          )}

          <div
            key={step}
            role="dialog"
            aria-modal="true"
            aria-label={`Walkthrough: ${stepDef.title}`}
            className="absolute animate-pop-in rounded-card border border-line bg-surface p-5 shadow-lift"
            style={cardStyle}
          >
            <div className="flex items-center justify-between gap-3">
              <Pill tone="soft">
                Step {step + 1} of {running.steps.length}
              </Pill>
              <IconButton
                aria-label="Close walkthrough"
                variant="ghost"
                size="sm"
                onClick={stop}
              >
                <X className="h-4 w-4" />
              </IconButton>
            </div>
            <h2 className="mt-3 text-base font-semibold text-ink">
              {stepDef.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
              {stepDef.body}
            </p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={stop}>
                Skip
              </Button>
              <div className="flex items-center gap-1.5">
                {step > 0 && (
                  <Button variant="soft" size="sm" onClick={prev}>
                    Back
                  </Button>
                )}
                <Button
                  ref={nextRef}
                  variant="primary"
                  size="sm"
                  onClick={() => (lastStep ? stop() : next())}
                >
                  {lastStep ? "Done" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
