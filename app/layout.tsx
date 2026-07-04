import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { TopBar } from "@/components/shell/TopBar";
import { PrefsEffect } from "@/components/shell/PrefsEffect";
import { TourOverlay } from "@/components/shell/TourOverlay";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alembic — Virtual Chemistry Lab",
  description:
    "An interactive virtual laboratory for chemistry and biochemistry students.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <PrefsEffect />
        <TooltipProvider>
          {/* TopBar lives in the layout so it persists across navigations —
              that's what lets the active nav pill glide instead of snapping. */}
          <div className="mx-auto min-h-screen w-full max-w-[1360px] px-5 py-6 lg:px-8">
            <TopBar />
            {children}
          </div>
          <TourOverlay />
        </TooltipProvider>
      </body>
    </html>
  );
}
