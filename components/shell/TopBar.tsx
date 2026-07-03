"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Settings, User } from "lucide-react";
import { ApparatusIcon } from "@/components/chem/ApparatusIcon";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Inventory", href: "/" },
  { label: "Reactions", href: "/reactions" },
  { label: "Periodic Table", href: "/periodic-table" },
  { label: "Molecules", href: "/molecules" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-4">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-ctrl bg-ink text-on-dark">
          <div className="h-6 w-6">
            <ApparatusIcon kind="erlenmeyer" />
          </div>
        </div>
        <span className="text-lg font-semibold tracking-tight text-ink">
          Alembic
        </span>
      </Link>

      {/* Section nav */}
      <nav
        aria-label="Sections"
        className="hidden items-center gap-1 rounded-pill border border-line bg-surface p-1.5 lg:flex"
      >
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-pill px-4 py-2 text-sm font-medium transition-colors",
                active ? "text-on-dark" : "text-ink-2 hover:text-ink",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-pill bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className="hidden items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink sm:inline-flex"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="relative">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-line bg-surface text-ink transition hover:bg-surface-2 active:scale-95"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Link>
          <span className="pointer-events-none absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-bg" />
        </div>
        <Link
          href="/profile"
          aria-label="Profile"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-ink text-on-dark transition hover:bg-dark-2 active:scale-95"
        >
          <User className="h-[18px] w-[18px]" />
        </Link>
      </div>
    </header>
  );
}
