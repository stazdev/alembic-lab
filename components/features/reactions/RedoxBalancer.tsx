"use client";

import { useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { balanceRedox, parseIon, type RedoxMedium, type RedoxTerm } from "@/lib/chemistry/balancer";
import { FormulaText } from "@/components/chem/FormulaText";
import { AddSpeciesInput } from "./AddSpeciesInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

const ERR = "#c0492e";

interface Item {
  id: number;
  text: string;
}

interface Preset {
  name: string;
  reactants: string[];
  products: string[];
  medium: RedoxMedium;
}

const PRESETS: Preset[] = [
  { name: "Permanganate + iron", reactants: ["MnO4-", "Fe^2+"], products: ["Mn^2+", "Fe^3+"], medium: "acidic" },
  { name: "Dichromate + iron", reactants: ["Cr2O7^2-", "Fe^2+"], products: ["Cr^3+", "Fe^3+"], medium: "acidic" },
  { name: "Permanganate + oxalate", reactants: ["MnO4-", "C2O4^2-"], products: ["Mn^2+", "CO2"], medium: "acidic" },
  { name: "Permanganate + sulfite (basic)", reactants: ["MnO4-", "SO3^2-"], products: ["MnO2", "SO4^2-"], medium: "basic" },
];

let counter = 1;
const makeItems = (list: string[]): Item[] => list.map((text) => ({ id: counter++, text }));

function IonChip({ item, onRemove }: { item: Item; onRemove: () => void }) {
  const parsed = parseIon(item.text);
  return (
    <div className="flex h-11 items-center gap-2 rounded-ctrl border border-line bg-surface px-3">
      <span className="text-lg font-medium text-ink">
        {parsed.error ? (
          <span style={{ color: ERR }}>{item.text}</span>
        ) : (
          <FormulaText formula={parsed.formula} charge={parsed.charge} />
        )}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.text}`}
        className="grid h-5 w-5 place-items-center rounded-full text-ink-3 transition hover:bg-line hover:text-ink"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Equation({ terms }: { terms: RedoxTerm[] }) {
  return (
    <>
      {terms.map((t, i) => (
        <span key={`${t.formula}-${t.charge}-${i}`} className="inline-flex items-baseline">
          {i > 0 && <span className="mx-1.5 text-on-dark-2">+</span>}
          {t.coeff !== 1 && <span className="mr-0.5 font-semibold">{t.coeff}</span>}
          <FormulaText formula={t.formula} charge={t.charge} />
        </span>
      ))}
    </>
  );
}

export function RedoxBalancer() {
  const [reactants, setReactants] = useState<Item[]>(() => makeItems(PRESETS[0].reactants));
  const [products, setProducts] = useState<Item[]>(() => makeItems(PRESETS[0].products));
  const [medium, setMedium] = useState<RedoxMedium>("acidic");

  const result = useMemo(
    () => balanceRedox(reactants.map((i) => i.text), products.map((i) => i.text), medium),
    [reactants, products, medium],
  );

  function addIon(side: "r" | "p", text: string): string | null {
    const t = text.trim();
    if (!t) return "Enter an ion";
    const parsed = parseIon(t);
    if (parsed.error) return parsed.error;
    const item: Item = { id: counter++, text: t };
    if (side === "r") setReactants((r) => [...r, item]);
    else setProducts((p) => [...p, item]);
    return null;
  }

  function loadPreset(p: Preset) {
    setReactants(makeItems(p.reactants));
    setProducts(makeItems(p.products));
    setMedium(p.medium);
  }

  return (
    <Card className="p-5 lg:p-6">
      <h2 className="text-base font-semibold text-ink">Redox Balancer</h2>
      <p className="mb-4 mt-1 text-xs text-ink-2">
        Balance a net-ionic redox equation — charge and every element are
        conserved, and H₂O / H⁺ (acidic) or OH⁻ (basic) are added automatically.
      </p>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 text-xs text-ink-3">Examples:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => loadPreset(p)}
            className="shrink-0 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="my-4">
        <SegmentedControl
          layoutId="redox-medium"
          aria-label="Medium"
          options={[
            { value: "acidic" as const, label: "Acidic (H⁺)" },
            { value: "basic" as const, label: "Basic (OH⁻)" },
          ]}
          value={medium}
          onChange={setMedium}
        />
      </div>

      <div className="rounded-card border border-line bg-surface-2/60 p-4">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-start">
          <div className="flex flex-wrap items-start gap-2">
            {reactants.map((item) => (
              <IonChip key={item.id} item={item} onRemove={() => setReactants((r) => r.filter((x) => x.id !== item.id))} />
            ))}
            <AddSpeciesInput placeholder="ion, e.g. MnO4-" onAdd={(t) => addIon("r", t)} />
          </div>
          <div className="flex shrink-0 items-center justify-center py-1 text-2xl text-ink-3 md:pt-1.5">→</div>
          <div className="flex flex-wrap items-start gap-2">
            {products.map((item) => (
              <IonChip key={item.id} item={item} onRemove={() => setProducts((p) => p.filter((x) => x.id !== item.id))} />
            ))}
            <AddSpeciesInput placeholder="ion, e.g. MnO4-" onAdd={(t) => addIon("p", t)} />
          </div>
        </div>
      </div>

      {reactants.length === 0 || products.length === 0 ? (
        <p className="mt-4 text-xs text-ink-3">Add ions to both sides to balance.</p>
      ) : result.ok ? (
        <div className="mt-4 overflow-x-auto rounded-ctrl bg-dark px-4 py-3 text-center text-xl text-on-dark">
          <span className="whitespace-nowrap">
            <Equation terms={result.left} />
            <span className="mx-3 text-accent">→</span>
            <Equation terms={result.right} />
          </span>
        </div>
      ) : (
        <p className="mt-4 text-sm" style={{ color: ERR }}>
          {result.error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setReactants([]);
            setProducts([]);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
        Charge notation: a trailing sign for ±1 (MnO4-, Na+), a caret for larger
        magnitudes (Cr2O7^2-, Fe^3+).
      </p>
    </Card>
  );
}
