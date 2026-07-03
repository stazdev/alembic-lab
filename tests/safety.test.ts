import { describe, it, expect } from "vitest";
import { assessSafety, type SafetyInput } from "@/lib/chemistry/safety";

const base: SafetyInput = {
  temperatureC: 22,
  heatKJ: 0,
  gasRate: 0,
  pH: 7,
  volumeMl: 50,
  capacityMl: 250,
  heating: false,
};

describe("safety assessment", () => {
  it("flags nothing for a calm bench", () => {
    expect(assessSafety(base)).toBeNull();
  });

  it("advisory for a merely warm mixture", () => {
    const e = assessSafety({ ...base, temperatureC: 50 });
    expect(e?.tier).toBe("advisory");
    expect(e?.title).toBe("Warm mixture");
  });

  it("caution for a strongly exothermic combination", () => {
    const e = assessSafety({ ...base, heatKJ: 2, temperatureC: 30 });
    expect(e?.tier).toBe("caution");
    expect(e?.title).toBe("Strongly exothermic");
  });

  it("caution for a strongly corrosive solution", () => {
    const e = assessSafety({ ...base, pH: 0.5 });
    expect(e?.tier).toBe("caution");
    expect(e?.title).toBe("Highly corrosive");
  });

  it("caution (not incident) when boiling under an external heater", () => {
    const e = assessSafety({ ...base, temperatureC: 100, gasRate: 0.8, heating: true });
    expect(e?.tier).toBe("caution");
    expect(e?.title).toBe("Boiling");
  });

  it("critical overpressure when a nearly-full vessel boils and gasses", () => {
    const e = assessSafety({
      ...base,
      temperatureC: 100,
      gasRate: 0.8,
      volumeMl: 235,
      capacityMl: 250,
      heating: true,
    });
    expect(e?.tier).toBe("critical");
  });

  it("incident for a reaction-driven runaway exotherm", () => {
    const e = assessSafety({ ...base, temperatureC: 92, heatKJ: 2, heating: false });
    expect(e?.tier).toBe("incident");
    expect(e?.title).toBe("Runaway exotherm");
  });

  it("returns the single highest-severity event", () => {
    // hot + corrosive + gassy + full → the critical one wins
    const e = assessSafety({
      ...base,
      temperatureC: 100,
      gasRate: 0.9,
      pH: 0.5,
      volumeMl: 240,
      capacityMl: 250,
      heating: true,
    });
    expect(e?.tier).toBe("critical");
  });
});
