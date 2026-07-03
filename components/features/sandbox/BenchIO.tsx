"use client";

import { useState } from "react";
import { Check, Copy, Download, Share2, Upload } from "lucide-react";
import { useSandbox } from "@/lib/stores/sandboxStore";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// UTF-8-safe base64 for a compact, copy-pasteable share code.
function toB64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function fromB64(b64: string): string {
  const bin = atob(b64.trim());
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Save, share, and restore a bench setup (§4.4 Persistence & sharing). */
export function BenchIO() {
  const vessels = useSandbox((s) => s.vessels);
  const serialize = useSandbox((s) => s.serialize);
  const loadBench = useSandbox((s) => s.loadBench);
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const shareCode = toB64(JSON.stringify(serialize()));

  function copyCode() {
    navigator.clipboard?.writeText(shareCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function download() {
    const blob = new Blob([JSON.stringify(serialize(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alembic-bench.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function load() {
    const raw = importText.trim();
    if (!raw) return;
    try {
      const json = raw.startsWith("{") ? raw : fromB64(raw);
      const bench = JSON.parse(json);
      if (!bench || !Array.isArray(bench.vessels)) throw new Error("bad");
      loadBench(bench);
      setImportText("");
      setStatus({ ok: true, msg: `Loaded ${bench.vessels.length} vessel(s).` });
    } catch {
      setStatus({ ok: false, msg: "That doesn't look like a saved bench." });
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="soft" size="sm">
          <Share2 className="h-4 w-4" />
          Save / Load
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80 p-4">
        <div className="text-sm font-semibold text-ink">Save &amp; share bench</div>
        <p className="mt-1 text-xs text-ink-2">
          {vessels.length === 0
            ? "The bench is empty — add vessels and reagents first."
            : "Copy the code or download a file; reload it here or share it."}
        </p>

        <div className="mt-3">
          <label className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
            Share code
          </label>
          <textarea
            readOnly
            value={shareCode}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-1 h-16 w-full resize-none rounded-ctrl border border-line bg-surface-2 p-2 font-mono text-[10px] leading-snug text-ink-2 focus:outline-none"
          />
          <div className="mt-1.5 flex gap-1.5">
            <Button variant="soft" size="sm" onClick={copyCode}>
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="soft" size="sm" onClick={download}>
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>

        <div className="mt-4 border-t border-line pt-3">
          <label className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
            Load a bench
          </label>
          <textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setStatus(null);
            }}
            placeholder="Paste a share code or JSON…"
            className="mt-1 h-16 w-full resize-none rounded-ctrl border border-line bg-surface p-2 text-xs text-ink placeholder:text-ink-3 focus:border-ink-2 focus:outline-none"
          />
          <div className="mt-1.5 flex items-center gap-1.5">
            <Button
              variant="accent"
              size="sm"
              onClick={load}
              disabled={!importText.trim()}
            >
              <Upload className="h-3.5 w-3.5" />
              Load
            </Button>
            <label className="inline-flex h-8 cursor-pointer items-center rounded-pill border border-line bg-surface px-3 text-xs font-medium text-ink-2 transition hover:text-ink">
              Upload file
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    file.text().then((t) => {
                      setImportText(t);
                      setStatus(null);
                    });
                }}
              />
            </label>
          </div>
          {status && (
            <p
              className={cn(
                "mt-1.5 text-[11px]",
                status.ok ? "text-[#3f8f5a]" : "text-[#c0492e]",
              )}
            >
              {status.msg}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
