/**
 * Deterministic hashing — the foundation of seed → gem mapping.
 */

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0; // keep unsigned 32-bit
  }
  return h;
}

/** One mulberry32 scramble — decorrelates similar hash inputs. */
function scramble(seed: number): number {
  let z = (seed + 0x6d2b79f5) >>> 0;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
}

/**
 * Deterministic uniform float in [0, 1) for a seed + label pair.
 *
 * Each label hashes independently, so traits never influence each other:
 * adding, removing, or re-ordering sampled values leaves all others unchanged.
 * An empty seed falls back to 'seedstone'.
 */
export function sampleUnit(seed: string, label: string): number {
  return scramble(djb2(`${label}:${seed.length === 0 ? 'seedstone' : seed}`));
}
