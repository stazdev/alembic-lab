import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Pill } from "@/components/ui/Pill";

interface ComingSoonProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function ComingSoon({ eyebrow, title, description }: ComingSoonProps) {
  return (
    <div className="mt-8">
      <p className="mb-2 text-sm font-medium text-ink-2">{eyebrow}</p>
      <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
        {title}
      </h1>

      <div className="mt-8 flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-surface/60 px-6 py-20 text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-ctrl bg-surface-2 text-ink-2">
          <Sparkles className="h-5 w-5" />
        </div>
        <Pill tone="soft">Coming soon</Pill>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-2">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-ink px-5 text-sm font-medium text-on-dark transition hover:bg-dark-2 active:scale-[0.98]"
          >
            Back to Inventory
          </Link>
          <Link
            href="/sandbox"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line-strong px-5 text-sm font-medium text-ink transition hover:bg-surface-2 active:scale-[0.98]"
          >
            Open Sandbox
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
