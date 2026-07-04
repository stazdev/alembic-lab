import { describe, it, expect } from "vitest";
import { predictProperties } from "@/lib/chem/openchemlib";

describe("in-browser property estimation (OpenChemLib)", () => {
  it("estimates aspirin in a sensible range", async () => {
    const p = await predictProperties("CC(=O)Oc1ccccc1C(=O)O");
    expect(p).not.toBeNull();
    expect(p!.formula).toBe("C9H8O4");
    expect(p!.molWeight).toBeCloseTo(180.16, 1);
    expect(p!.logP).toBeGreaterThan(0); // aspirin logP ≈ 1.2
    expect(p!.logP).toBeLessThan(3);
    expect(p!.hbd).toBe(1);
    expect(p!.hba).toBe(4);
    expect(p!.lipinski.passes).toBe(true);
  });

  it("flags a Lipinski violation for a large lipophilic molecule", async () => {
    // A long alkane chain: high logP, well over the Ro5 logP limit.
    const p = await predictProperties("CCCCCCCCCCCCCCCCCCCCCCCC");
    expect(p).not.toBeNull();
    expect(p!.logP).toBeGreaterThan(5);
    expect(p!.lipinski.violations).toContain("logP > 5");
  });

  it("returns null for empty or invalid SMILES", async () => {
    expect(await predictProperties("")).toBeNull();
    expect(await predictProperties("   ")).toBeNull();
    expect(await predictProperties("Xy!z%%")).toBeNull();
  });
});
