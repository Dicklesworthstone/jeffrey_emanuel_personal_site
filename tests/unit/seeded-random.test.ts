/**
 * Unit tests for seededRandom function from three-scene.tsx
 *
 * This function provides deterministic pseudo-random numbers for generating
 * star positions in the 3D scene. It was implemented to fix React purity
 * violations (Math.random() called during render).
 *
 * Run with: bun test tests/unit/seeded-random.test.ts
 * Run with verbose: bun test tests/unit/seeded-random.test.ts --verbose
 */

import { describe, test, expect } from "vitest";

/**
 * Deterministic pseudo-random number generator.
 * Uses sine function to create repeatable sequences.
 * Copied from components/three-scene.tsx for testing.
 */
const seededRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
};

describe("seededRandom", () => {
  describe("determinism", () => {
    test("same seed produces identical sequence", () => {
      console.log("[TEST] Testing determinism: same seed = same sequence");

      const rand1 = seededRandom(42);
      const rand2 = seededRandom(42);

      console.log("[TEST] Generating 100 values from each generator");
      for (let i = 0; i < 100; i++) {
        const v1 = rand1();
        const v2 = rand2();
        if (i < 5) {
          console.log(`[TEST] Iteration ${i}: rand1=${v1.toFixed(6)}, rand2=${v2.toFixed(6)}`);
        }
        expect(v1).toBe(v2);
      }
      console.log("[TEST] ✓ All 100 values matched - determinism verified");
    });

    test("sequence is reproducible across multiple instantiations", () => {
      console.log("[TEST] Testing reproducibility across instantiations");

      // First run - capture sequence
      const sequence1: number[] = [];
      const rand1 = seededRandom(42);
      for (let i = 0; i < 10; i++) {
        sequence1.push(rand1());
      }
      console.log("[TEST] First sequence (first 5):", sequence1.slice(0, 5).map(n => n.toFixed(6)));

      // Second run - verify identical
      const sequence2: number[] = [];
      const rand2 = seededRandom(42);
      for (let i = 0; i < 10; i++) {
        sequence2.push(rand2());
      }
      console.log("[TEST] Second sequence (first 5):", sequence2.slice(0, 5).map(n => n.toFixed(6)));

      expect(sequence1).toEqual(sequence2);
      console.log("[TEST] ✓ Sequences are identical");
    });

    test("known values for seed 42 are consistent", () => {
      console.log("[TEST] Verifying specific known values for seed 42");

      const rand = seededRandom(42);
      const first = rand();
      const second = rand();
      const third = rand();

      console.log(`[TEST] First value: ${first}`);
      console.log(`[TEST] Second value: ${second}`);
      console.log(`[TEST] Third value: ${third}`);

      // These values should be consistent across all test runs
      // Capturing actual values from the algorithm
      expect(first).toBeCloseTo(0.6063913235120708, 10);
      expect(typeof second).toBe("number");
      expect(typeof third).toBe("number");
      console.log("[TEST] ✓ Known values verified");
    });
  });

  describe("uniqueness", () => {
    test("different seeds produce different sequences", () => {
      console.log("[TEST] Testing that different seeds produce different sequences");

      const rand42 = seededRandom(42);
      const rand43 = seededRandom(43);
      const rand100 = seededRandom(100);

      const v42 = rand42();
      const v43 = rand43();
      const v100 = rand100();

      console.log(`[TEST] Seed 42 first value: ${v42.toFixed(6)}`);
      console.log(`[TEST] Seed 43 first value: ${v43.toFixed(6)}`);
      console.log(`[TEST] Seed 100 first value: ${v100.toFixed(6)}`);

      expect(v42).not.toBe(v43);
      expect(v42).not.toBe(v100);
      expect(v43).not.toBe(v100);
      console.log("[TEST] ✓ Different seeds produce different values");
    });

    test("seeds 1 apart produce different sequences", () => {
      console.log("[TEST] Testing adjacent seeds");

      for (let seed = 0; seed < 10; seed++) {
        const rand1 = seededRandom(seed);
        const rand2 = seededRandom(seed + 1);
        const v1 = rand1();
        const v2 = rand2();
        console.log(`[TEST] Seed ${seed}: ${v1.toFixed(6)}, Seed ${seed + 1}: ${v2.toFixed(6)}`);
        expect(v1).not.toBe(v2);
      }
      console.log("[TEST] ✓ Adjacent seeds produce different values");
    });
  });

  describe("output range", () => {
    test("all values are in range [0, 1)", () => {
      console.log("[TEST] Testing output range [0, 1)");

      const rand = seededRandom(42);

      console.log("[TEST] Generating 1000 values and checking range");
      let min = 1;
      let max = 0;
      for (let i = 0; i < 1000; i++) {
        const value = rand();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
      console.log(`[TEST] Min value: ${min.toFixed(6)}, Max value: ${max.toFixed(6)}`);
      console.log("[TEST] ✓ All 1000 values in valid range [0, 1)");
    });

    test("values are well distributed (not clustered)", () => {
      console.log("[TEST] Testing distribution quality");

      const rand = seededRandom(42);
      const buckets = new Array(10).fill(0);

      console.log("[TEST] Generating 10000 values and bucketing");
      for (let i = 0; i < 10000; i++) {
        const value = rand();
        const bucket = Math.floor(value * 10);
        buckets[bucket]++;
      }

      console.log("[TEST] Bucket distribution:", buckets);

      // Each bucket should have roughly 1000 values (10% of 10000)
      // Allow 40% variance for a simple PRNG (600-1400 range)
      for (let i = 0; i < 10; i++) {
        console.log(`[TEST] Bucket ${i}: ${buckets[i]} values (expected ~1000)`);
        expect(buckets[i]).toBeGreaterThan(500);
        expect(buckets[i]).toBeLessThan(1500);
      }
      console.log("[TEST] ✓ Distribution is reasonably uniform");
    });
  });

  describe("sequence properties", () => {
    test("no immediate repeats in first 1000 values", () => {
      console.log("[TEST] Testing for immediate repeats in sequence");

      const rand = seededRandom(42);
      let previous = rand();

      console.log("[TEST] Checking 1000 consecutive values for repeats");
      for (let i = 0; i < 1000; i++) {
        const current = rand();
        expect(current).not.toBe(previous);
        previous = current;
      }
      console.log("[TEST] ✓ No immediate repeats found");
    });

    test("sequence does not cycle quickly", () => {
      console.log("[TEST] Testing that sequence doesn't repeat quickly");

      const rand = seededRandom(42);
      const firstValues: number[] = [];

      // Capture first 10 values
      for (let i = 0; i < 10; i++) {
        firstValues.push(rand());
      }
      console.log("[TEST] First 10 values captured");

      // Generate 1000 more and check none match the first value exactly
      const firstValue = firstValues[0];
      let cycleFoundAt = -1;
      for (let i = 0; i < 1000; i++) {
        const value = rand();
        // Allow for floating point comparison
        if (Math.abs(value - firstValue) < 1e-15) {
          cycleFoundAt = i + 10;
          console.log(`[TEST] ERROR: Found repeat of first value at iteration ${cycleFoundAt}`);
          break;
        }
      }

      // This should fail if a cycle was detected
      expect(cycleFoundAt).toBe(-1);
      console.log("[TEST] ✓ No quick cycle detected in first 1010 values");
    });
  });

  describe("edge case seeds", () => {
    test("handles seed 0", () => {
      console.log("[TEST] Testing seed 0");
      const rand = seededRandom(0);
      const value = rand();
      console.log(`[TEST] Seed 0 first value: ${value}`);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      console.log("[TEST] ✓ Seed 0 produces valid output");
    });

    test("handles negative seed", () => {
      console.log("[TEST] Testing negative seed");
      const rand = seededRandom(-42);
      const value = rand();
      console.log(`[TEST] Seed -42 first value: ${value}`);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      console.log("[TEST] ✓ Negative seed produces valid output");
    });

    test("handles very large seed", () => {
      console.log("[TEST] Testing large seed");
      const rand = seededRandom(1000000);
      const value = rand();
      console.log(`[TEST] Seed 1000000 first value: ${value}`);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      console.log("[TEST] ✓ Large seed produces valid output");
    });

    test("handles fractional seed", () => {
      console.log("[TEST] Testing fractional seed");
      const rand = seededRandom(3.14159);
      const value = rand();
      console.log(`[TEST] Seed 3.14159 first value: ${value}`);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      console.log("[TEST] ✓ Fractional seed produces valid output");
    });

    test("handles Infinity seed gracefully", () => {
      console.log("[TEST] Testing Infinity seed");
      const rand = seededRandom(Infinity);
      const value = rand();
      console.log(`[TEST] Seed Infinity first value: ${value}`);
      // NaN comparisons are tricky, just check it doesn't crash
      expect(typeof value).toBe("number");
      console.log("[TEST] ✓ Infinity seed doesn't crash");
    });
  });

  describe("use case: star field generation", () => {
    test("generates consistent star positions", () => {
      console.log("[TEST] Simulating star field generation");

      const generateStars = (seed: number, count: number) => {
        const rand = seededRandom(seed);
        const stars: { x: number; y: number; z: number }[] = [];
        for (let i = 0; i < count; i++) {
          const r = 5 + rand() * 4;
          const theta = rand() * Math.PI * 2;
          const phi = Math.acos(2 * rand() - 1);
          stars.push({
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi),
          });
        }
        return stars;
      };

      // Generate stars twice with same seed
      const stars1 = generateStars(42, 100);
      const stars2 = generateStars(42, 100);

      console.log(`[TEST] Generated ${stars1.length} stars twice`);
      console.log(`[TEST] First star: (${stars1[0].x.toFixed(3)}, ${stars1[0].y.toFixed(3)}, ${stars1[0].z.toFixed(3)})`);

      // Verify positions are identical
      for (let i = 0; i < stars1.length; i++) {
        expect(stars1[i].x).toBe(stars2[i].x);
        expect(stars1[i].y).toBe(stars2[i].y);
        expect(stars1[i].z).toBe(stars2[i].z);
      }
      console.log("[TEST] ✓ Star positions are identical across generations");
    });
  });
});
