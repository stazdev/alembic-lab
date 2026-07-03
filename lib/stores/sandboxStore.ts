/**
 * Sandbox experiment state (§1.2).
 *
 * The authoritative model of the live bench: vessels, their mixtures,
 * temperature, and a narrated observation log. The SVG render layer is a pure
 * projection of this store; chemistry is computed by resolveAppearance().
 */
import { create } from "zustand";
import { getApparatus } from "@/data/apparatus";
import { getReagent } from "@/lib/chemistry/reagents";
import {
  resolveAppearance,
  totalVolume,
  type MixtureComponent,
  type Observable,
} from "@/lib/chemistry/resolve";
import { useBench } from "./benchStore";

const ROOM_TEMP_C = 22;
const MAX_VESSELS = 6;
const DEFAULT_CAPACITY = 250;

export interface Vessel {
  id: string;
  apparatusId: string;
  label: string;
  components: MixtureComponent[];
  temperatureC: number;
  heating: boolean;
  /** Observable ids already written to the log (for de-duplication). */
  seen: string[];
}

export interface Observation {
  key: number;
  text: string;
  kind: Observable["kind"];
  equation?: string;
  vesselLabel: string;
}

interface SandboxState {
  vessels: Vessel[];
  selectedVesselId: string | null;
  pourSourceId: string | null;
  observations: Observation[];
  obsCounter: number;
  vesselCounter: number;
  hydrated: boolean;

  hydrateFromBench: () => void;
  addVessel: (apparatusId: string) => void;
  removeVessel: (vesselId: string) => void;
  selectVessel: (vesselId: string) => void;
  addReagent: (vesselId: string, reagentId: string) => void;
  toggleHeating: (vesselId: string) => void;
  beginPour: (sourceId: string) => void;
  cancelPour: () => void;
  pourInto: (targetId: string) => void;
  clearVessel: (vesselId: string) => void;
  tick: (dtSeconds: number) => void;
  resetAll: () => void;
}

// ── pure helpers ──────────────────────────────────────────────
function capacityOf(apparatusId: string): number {
  return getApparatus(apparatusId)?.capacityMl ?? DEFAULT_CAPACITY;
}

function upsert(
  components: MixtureComponent[],
  reagentId: string,
  amountMl: number,
): MixtureComponent[] {
  if (components.some((c) => c.reagentId === reagentId)) {
    return components.map((c) =>
      c.reagentId === reagentId ? { ...c, amountMl: c.amountMl + amountMl } : c,
    );
  }
  return [...components, { reagentId, amountMl }];
}

function mergeComponents(
  a: MixtureComponent[],
  b: MixtureComponent[],
): MixtureComponent[] {
  const out = a.map((c) => ({ ...c }));
  for (const c of b) {
    const existing = out.find((x) => x.reagentId === c.reagentId);
    if (existing) existing.amountMl += c.amountMl;
    else out.push({ ...c });
  }
  return out;
}

/** Compute appearance and return any observables not yet logged for this vessel. */
function collectObservations(
  vessel: Vessel,
  obsCounter: number,
): { vessel: Vessel; observations: Observation[]; obsCounter: number } {
  const appearance = resolveAppearance(vessel.components, vessel.temperatureC);
  const fresh = appearance.observables.filter((o) => !vessel.seen.includes(o.id));
  if (fresh.length === 0) return { vessel, observations: [], obsCounter };

  let counter = obsCounter;
  const observations: Observation[] = fresh.map((o) => ({
    key: counter++,
    text: o.text,
    kind: o.kind,
    equation: o.equation,
    vesselLabel: vessel.label,
  }));
  return {
    vessel: { ...vessel, seen: [...vessel.seen, ...fresh.map((o) => o.id)] },
    observations,
    obsCounter: counter,
  };
}

export const useSandbox = create<SandboxState>((set, get) => ({
  vessels: [],
  selectedVesselId: null,
  pourSourceId: null,
  observations: [],
  obsCounter: 0,
  vesselCounter: 0,
  hydrated: false,

  hydrateFromBench: () =>
    set((state) => {
      if (state.hydrated) return state;

      const staged = useBench.getState().items;
      const apparatusIds: string[] = [];
      for (const item of staged) {
        const apparatus = getApparatus(item.apparatusId);
        if (apparatus?.category === "reactionVessel") {
          for (let i = 0; i < Math.min(item.quantity, 3); i++) {
            apparatusIds.push(item.apparatusId);
          }
        }
      }
      if (apparatusIds.length === 0) {
        apparatusIds.push("beaker-250", "erlenmeyer-250");
      }

      const typeCounts: Record<string, number> = {};
      let counter = 0;
      const vessels: Vessel[] = apparatusIds.slice(0, MAX_VESSELS).map((id) => {
        typeCounts[id] = (typeCounts[id] ?? 0) + 1;
        counter += 1;
        const apparatus = getApparatus(id);
        return {
          id: `v${counter}`,
          apparatusId: id,
          label: `${apparatus?.name ?? "Vessel"} ${typeCounts[id]}`,
          components: [],
          temperatureC: ROOM_TEMP_C,
          heating: false,
          seen: [],
        };
      });

      return {
        vessels,
        vesselCounter: counter,
        selectedVesselId: vessels[0]?.id ?? null,
        hydrated: true,
      };
    }),

  addVessel: (apparatusId) =>
    set((state) => {
      if (state.vessels.length >= MAX_VESSELS) return state;
      const sameType =
        state.vessels.filter((v) => v.apparatusId === apparatusId).length + 1;
      const counter = state.vesselCounter + 1;
      const apparatus = getApparatus(apparatusId);
      const vessel: Vessel = {
        id: `v${counter}`,
        apparatusId,
        label: `${apparatus?.name ?? "Vessel"} ${sameType}`,
        components: [],
        temperatureC: ROOM_TEMP_C,
        heating: false,
        seen: [],
      };
      return {
        vessels: [...state.vessels, vessel],
        vesselCounter: counter,
        selectedVesselId: vessel.id,
      };
    }),

  removeVessel: (vesselId) =>
    set((state) => {
      const vessels = state.vessels.filter((v) => v.id !== vesselId);
      return {
        vessels,
        selectedVesselId:
          state.selectedVesselId === vesselId
            ? (vessels[0]?.id ?? null)
            : state.selectedVesselId,
        pourSourceId: state.pourSourceId === vesselId ? null : state.pourSourceId,
      };
    }),

  selectVessel: (vesselId) => set({ selectedVesselId: vesselId }),

  addReagent: (vesselId, reagentId) =>
    set((state) => {
      const reagent = getReagent(reagentId);
      const index = state.vessels.findIndex((v) => v.id === vesselId);
      if (!reagent || index < 0) return state;

      const vessel = state.vessels[index];
      const room = capacityOf(vessel.apparatusId) - totalVolume(vessel.components);
      if (room <= 0.001) return state;

      const added = Math.min(reagent.aliquotMl, room);
      const components = upsert(vessel.components, reagentId, added);

      // Acid + base neutralisation is exothermic — nudge the temperature up.
      const ACIDS = ["hcl", "h2so4"];
      const BASES = ["naoh", "na2co3", "ammonia"];
      let temperatureC = vessel.temperatureC;
      const hasAcid = components.some(
        (c) => ACIDS.includes(c.reagentId) && c.amountMl > 0,
      );
      const hasBase = components.some(
        (c) => BASES.includes(c.reagentId) && c.amountMl > 0,
      );
      if (hasAcid && hasBase) temperatureC = Math.min(55, temperatureC + 6);

      const updated: Vessel = { ...vessel, components, temperatureC };
      const result = collectObservations(updated, state.obsCounter);

      const vessels = [...state.vessels];
      vessels[index] = result.vessel;
      return {
        vessels,
        selectedVesselId: vesselId,
        observations: [...state.observations, ...result.observations].slice(-40),
        obsCounter: result.obsCounter,
      };
    }),

  toggleHeating: (vesselId) =>
    set((state) => ({
      vessels: state.vessels.map((v) =>
        v.id === vesselId ? { ...v, heating: !v.heating } : v,
      ),
    })),

  beginPour: (sourceId) => set({ pourSourceId: sourceId }),
  cancelPour: () => set({ pourSourceId: null }),

  pourInto: (targetId) =>
    set((state) => {
      const sourceId = state.pourSourceId;
      if (!sourceId || sourceId === targetId) return { pourSourceId: null };

      const source = state.vessels.find((v) => v.id === sourceId);
      const target = state.vessels.find((v) => v.id === targetId);
      if (!source || !target) return { pourSourceId: null };

      const sourceVol = totalVolume(source.components);
      const targetVol = totalVolume(target.components);
      const targetRoom = capacityOf(target.apparatusId) - targetVol;
      const poured = Math.min(sourceVol, targetRoom);
      if (poured <= 0.001) return { pourSourceId: null };

      const fraction = poured / sourceVol;
      const moved = source.components.map((c) => ({
        reagentId: c.reagentId,
        amountMl: c.amountMl * fraction,
      }));

      const newTargetComponents = mergeComponents(target.components, moved);
      const newTargetTemp =
        (targetVol * target.temperatureC + poured * source.temperatureC) /
        (targetVol + poured);
      const newSourceComponents = source.components
        .map((c) => ({ ...c, amountMl: c.amountMl * (1 - fraction) }))
        .filter((c) => c.amountMl > 0.01);

      let obsCounter = state.obsCounter;
      let observations = state.observations;

      const vessels = state.vessels.map((v) => {
        if (v.id === sourceId) {
          return { ...v, components: newSourceComponents };
        }
        if (v.id === targetId) {
          const merged: Vessel = {
            ...v,
            components: newTargetComponents,
            temperatureC: newTargetTemp,
          };
          const result = collectObservations(merged, obsCounter);
          obsCounter = result.obsCounter;
          observations = [...observations, ...result.observations].slice(-40);
          return result.vessel;
        }
        return v;
      });

      return { vessels, pourSourceId: null, observations, obsCounter };
    }),

  clearVessel: (vesselId) =>
    set((state) => ({
      vessels: state.vessels.map((v) =>
        v.id === vesselId
          ? { ...v, components: [], temperatureC: ROOM_TEMP_C, heating: false, seen: [] }
          : v,
      ),
    })),

  tick: (dtSeconds) =>
    set((state) => {
      let changed = false;
      const warmed = state.vessels.map((v) => {
        const hasLiquid = totalVolume(v.components) > 0;
        let t = v.temperatureC;
        if (v.heating && hasLiquid) {
          t = t + (100 - t) * Math.min(1, dtSeconds * 0.3);
          if (t > 100) t = 100;
        } else {
          t = t + (ROOM_TEMP_C - t) * Math.min(1, dtSeconds * 0.08);
        }
        if (Math.abs(t - v.temperatureC) < 0.01) return v;
        changed = true;
        return { ...v, temperatureC: t };
      });
      if (!changed) return state;

      let obsCounter = state.obsCounter;
      let observations = state.observations;
      const vessels = warmed.map((v) => {
        const result = collectObservations(v, obsCounter);
        if (result.observations.length === 0) return v;
        obsCounter = result.obsCounter;
        observations = [...observations, ...result.observations].slice(-40);
        return result.vessel;
      });

      return { vessels, observations, obsCounter };
    }),

  resetAll: () => {
    set({
      vessels: [],
      observations: [],
      selectedVesselId: null,
      pourSourceId: null,
      hydrated: false,
    });
    get().hydrateFromBench();
  },
}));
