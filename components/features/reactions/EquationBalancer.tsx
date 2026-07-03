"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lightbulb, Plus, RotateCcw, Wand2, X } from "lucide-react";
import {
  balanceEquation,
  checkBalance,
  parseFormula,
  type BalanceCheck,
} from "@/lib/chemistry/balancer";
import { FormulaText } from "@/components/chem/FormulaText";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { cn } from "@/lib/utils";

interface SpeciesItem {
  id: number;
  formula: string;
  coeff: number;
}

interface Preset {
  name: string;
  reactants: string[];
  products: string[];
}

const PRESETS: Preset[] = [
  { name: "Water synthesis", reactants: ["H2", "O2"], products: ["H2O"] },
  {
    name: "Propane combustion",
    reactants: ["C3H8", "O2"],
    products: ["CO2", "H2O"],
  },
  { name: "Rusting of iron", reactants: ["Fe", "O2"], products: ["Fe2O3"] },
  {
    name: "Photosynthesis",
    reactants: ["CO2", "H2O"],
    products: ["C6H12O6", "O2"],
  },
  {
    name: "Carbonate + acid",
    reactants: ["Na2CO3", "HCl"],
    products: ["NaCl", "H2O", "CO2"],
  },
  {
    name: "Permanganate redox",
    reactants: ["KMnO4", "HCl"],
    products: ["KCl", "MnCl2", "H2O", "Cl2"],
  },
];

const OK_GREEN = "#3f8f5a";
const ERR_RED = "#c0492e";

function SpeciesChip({
  item,
  onCoeff,
  onRemove,
}: {
  item: SpeciesItem;
  onCoeff: (coeff: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex h-12 items-center gap-2 rounded-ctrl border border-line bg-surface pl-1.5 pr-2">
      <NumberStepper
        value={item.coeff}
        min={1}
        max={30}
        onChange={onCoeff}
        aria-label={`Coefficient for ${item.formula}`}
      />
      <span className="text-lg font-medium text-ink">
        <FormulaText formula={item.formula} />
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.formula}`}
        className="grid h-5 w-5 place-items-center rounded-full text-ink-3 transition hover:bg-line hover:text-ink"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AddSpecies({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (formula: string) => string | null;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const err = onAdd(value);
    if (err) setError(err);
    else {
      setValue("");
      setError(null);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-1">
      <div className="flex h-12 items-center gap-1 rounded-ctrl border border-dashed border-line-strong bg-surface px-2 transition focus-within:border-ink-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-24 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Add species"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-on-dark transition hover:bg-dark-2"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {error && (
        <span className="text-[11px]" style={{ color: ERR_RED }}>
          {error}
        </span>
      )}
    </form>
  );
}

function ElementLedger({ check }: { check: BalanceCheck }) {
  if (check.elements.length === 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {check.elements.map((e) => (
        <div
          key={e.element}
          className={cn(
            "rounded-ctrl border px-2.5 py-2 text-center transition-colors",
            e.balanced ? "border-line bg-surface-2" : "border-transparent",
          )}
          style={
            e.balanced ? undefined : { backgroundColor: "#fbeae4" }
          }
        >
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm font-semibold text-ink">{e.element}</span>
            {e.balanced ? (
              <Check className="h-3.5 w-3.5" style={{ color: OK_GREEN }} />
            ) : (
              <span className="text-xs font-bold" style={{ color: ERR_RED }}>
                ≠
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs tabular-nums text-ink-2">
            {e.left} : {e.right}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EquationBalancer() {
  const idRef = useRef(1);
  const makeItems = (formulas: string[]): SpeciesItem[] =>
    formulas.map((formula) => ({ id: idRef.current++, formula, coeff: 1 }));

  const [reactants, setReactants] = useState<SpeciesItem[]>(() =>
    makeItems(PRESETS[1].reactants),
  );
  const [products, setProducts] = useState<SpeciesItem[]>(() =>
    makeItems(PRESETS[1].products),
  );
  const [hint, setHint] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const check = useMemo(
    () => checkBalance(reactants, products),
    [reactants, products],
  );

  function loadPreset(preset: Preset) {
    setReactants(makeItems(preset.reactants));
    setProducts(makeItems(preset.products));
    setHint(null);
    setBalanceError(null);
  }

  function addSpecies(
    side: "reactant" | "product",
    formula: string,
  ): string | null {
    const trimmed = formula.trim();
    if (!trimmed) return "Enter a formula";
    const { error } = parseFormula(trimmed);
    if (error) return error;
    const item: SpeciesItem = { id: idRef.current++, formula: trimmed, coeff: 1 };
    if (side === "reactant") setReactants((r) => [...r, item]);
    else setProducts((p) => [...p, item]);
    setHint(null);
    setBalanceError(null);
    return null;
  }

  const setCoeff = (
    side: "reactant" | "product",
    id: number,
    coeff: number,
  ) => {
    const update = (list: SpeciesItem[]) =>
      list.map((s) => (s.id === id ? { ...s, coeff } : s));
    if (side === "reactant") setReactants(update);
    else setProducts(update);
    setHint(null);
  };

  const removeSpecies = (side: "reactant" | "product", id: number) => {
    if (side === "reactant") setReactants((r) => r.filter((s) => s.id !== id));
    else setProducts((p) => p.filter((s) => s.id !== id));
  };

  function balanceForMe() {
    const res = balanceEquation(
      reactants.map((s) => s.formula),
      products.map((s) => s.formula),
    );
    if (!res.ok) {
      setBalanceError(res.error);
      setHint(null);
      return;
    }
    const c = res.coefficients;
    setReactants((r) => r.map((s, i) => ({ ...s, coeff: c[i] })));
    setProducts((p) => p.map((s, i) => ({ ...s, coeff: c[reactants.length + i] })));
    setBalanceError(null);
    setHint(null);
  }

  function resetCoeffs() {
    setReactants((r) => r.map((s) => ({ ...s, coeff: 1 })));
    setProducts((p) => p.map((s) => ({ ...s, coeff: 1 })));
    setHint(null);
    setBalanceError(null);
  }

  function showHint() {
    if (check.balanced) {
      setHint("It's balanced — every element matches on both sides. 🎉");
      return;
    }
    const worst = [...check.elements]
      .filter((e) => !e.balanced)
      .sort((a, b) => Math.abs(b.left - b.right) - Math.abs(a.left - a.right))[0];
    if (worst) {
      setHint(
        `Look at ${worst.element}: ${worst.left} on the left, ${worst.right} on the right.`,
      );
    }
    setBalanceError(null);
  }

  const renderSide = (list: SpeciesItem[]) =>
    list.map((s, i) => (
      <span key={s.id} className="inline-flex items-baseline">
        {i > 0 && <span className="mx-1.5 text-ink-3">+</span>}
        {s.coeff !== 1 && (
          <span className="mr-0.5 font-semibold text-ink">{s.coeff}</span>
        )}
        <FormulaText formula={s.formula} />
      </span>
    ));

  return (
    <Card className="p-5 lg:p-6">
      <h2 className="text-base font-semibold text-ink">Equation Balancer</h2>
      <p className="mb-4 mt-1 text-xs text-ink-2">
        Adjust each coefficient until every element matches on both sides — or
        let the solver do it.
      </p>

      {/* Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 text-xs text-ink-3">Examples:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => loadPreset(preset)}
            className="shrink-0 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Workspace */}
      <div className="my-5 rounded-card border border-line bg-surface-2/60 p-4">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-start">
          <div className="flex flex-wrap items-start gap-2">
            {reactants.map((item) => (
              <SpeciesChip
                key={item.id}
                item={item}
                onCoeff={(c) => setCoeff("reactant", item.id, c)}
                onRemove={() => removeSpecies("reactant", item.id)}
              />
            ))}
            <AddSpecies
              placeholder="reactant"
              onAdd={(f) => addSpecies("reactant", f)}
            />
          </div>

          <div className="flex shrink-0 items-center justify-center py-1 text-ink-3 md:pt-2.5">
            <span className="text-2xl">→</span>
          </div>

          <div className="flex flex-wrap items-start gap-2">
            {products.map((item) => (
              <SpeciesChip
                key={item.id}
                item={item}
                onCoeff={(c) => setCoeff("product", item.id, c)}
                onRemove={() => removeSpecies("product", item.id)}
              />
            ))}
            <AddSpecies
              placeholder="product"
              onAdd={(f) => addSpecies("product", f)}
            />
          </div>
        </div>
      </div>

      {/* Rendered equation */}
      <div className="mb-4 overflow-x-auto rounded-ctrl bg-dark px-4 py-3 text-center text-xl text-on-dark">
        <span className="whitespace-nowrap">
          {renderSide(reactants)}
          <span className="mx-3 text-accent">→</span>
          {renderSide(products)}
        </span>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait" initial={false}>
        {check.balanced ? (
          <motion.div
            key="balanced"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex items-center gap-2 rounded-ctrl bg-accent px-4 py-3 text-sm font-medium text-accent-ink"
          >
            <Check className="h-4 w-4" />
            Balanced! Every element matches on both sides.
          </motion.div>
        ) : (
          <motion.div
            key="unbalanced"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 rounded-ctrl bg-surface-2 px-4 py-3 text-sm text-ink-2"
          >
            Not balanced yet — match every element in the ledger below.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Element ledger */}
      <ElementLedger check={check} />

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button variant="accent" size="sm" onClick={balanceForMe}>
          <Wand2 className="h-4 w-4" />
          Balance for me
        </Button>
        <Button variant="soft" size="sm" onClick={showHint}>
          <Lightbulb className="h-4 w-4" />
          Hint
        </Button>
        <Button variant="ghost" size="sm" onClick={resetCoeffs}>
          <RotateCcw className="h-4 w-4" />
          Reset coefficients
        </Button>
      </div>

      {(hint || balanceError) && (
        <p
          className="mt-3 text-sm"
          style={balanceError ? { color: ERR_RED } : undefined}
        >
          <span className={balanceError ? undefined : "text-ink-2"}>
            {balanceError ?? hint}
          </span>
        </p>
      )}
    </Card>
  );
}
