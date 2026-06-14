<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SeedstoneConfig, SeedstoneSchema } from 'seedstone'

const props = defineProps<{
  config: SeedstoneConfig | null
  seed: string
}>()

// ── Hash utilities (same algorithm as the renderer) ───────────────────────────
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch: number; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

function mkrng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GEM_NAME_RANGES: Array<{ a: number; b: number; names: string[] }> = [
  { a: 345, b:  20, names: ['ruby', 'garnet', 'rhodolite', 'rubellite', 'pyrope'] },
  { a:  20, b:  46, names: ['spessartite', 'padparadscha', 'fire opal', 'hessonite', 'sunstone'] },
  { a:  46, b:  66, names: ['citrine', 'imperial topaz', 'heliodor', 'amber', 'zircon'] },
  { a:  66, b: 150, names: ['peridot', 'chrysoberyl', 'sphene', 'prehnite', 'olivine'] },
  { a: 150, b: 176, names: ['emerald', 'tsavorite', 'jadeite', 'dioptase', 'uvarovite'] },
  { a: 176, b: 205, names: ['paraiba', 'apatite', 'larimar', 'aquamarine', 'grandidierite'] },
  { a: 205, b: 255, names: ['sapphire', 'kyanite', 'benitoite', 'azurite', 'lazulite'] },
  { a: 255, b: 292, names: ['tanzanite', 'iolite', 'sodalite', 'sugilite', 'lapis'] },
  { a: 292, b: 345, names: ['amethyst', 'charoite', 'kunzite', 'morganite', 'spinel'] },
]

function deriveGemName(seed: string, hue: number): string {
  const r = mkrng(cyrb53(seed) >>> 0)
  const h = ((hue % 360) + 360) % 360
  for (const { a, b, names } of GEM_NAME_RANGES) {
    if (a < b ? (h >= a && h < b) : (h >= a || h < b))
      return names[Math.floor(r() * names.length)] ?? 'crystal'
  }
  return 'crystal'
}

// ── Schema for stat ranges ─────────────────────────────────────────────────────
const schema = ref<SeedstoneSchema | null>(null)
onMounted(async () => { schema.value = (await import('seedstone')).configSchema })

// ── Computed gem values ────────────────────────────────────────────────────────
const gnHue  = computed(() => props.config?.gem.hue                   ?? 270)
const gnSat  = computed(() => props.config?.gem.saturation            ?? 0.8)
const gnIOR  = computed(() => props.config?.gem.material.ior          ?? 2.0)
const gnFire = computed(() => props.config?.gem.material.iridescence  ?? 0.5)
const gnSpd  = computed(() => props.config?.gem.speed                 ?? 1.0)
const gnPerf = computed(() => props.config?.gem.distortion.perfection ?? 0.5)
const gnTilt = computed(() => props.config?.gem.tilt                  ?? 0)

const gemName  = computed(() => deriveGemName(props.seed, gnHue.value))
const gemColor = computed(() =>
  `oklch(0.62 ${(0.16 + gnSat.value * 0.10).toFixed(3)} ${gnHue.value.toFixed(1)})`
)

const GRADES = [
  { min: 0.88, label: 'Imperial' },
  { min: 0.75, label: 'Flawless' },
  { min: 0.58, label: 'Radiant' },
  { min: 0.38, label: 'Brilliant' },
  { min: 0.00, label: 'Refined' },
]
const gemGrade = computed(() => GRADES.find(g => gnPerf.value >= g.min)?.label ?? 'Refined')

function statPct(v: number, lo: number, hi: number) {
  return Math.max(4, Math.min(100, Math.round((v - lo) / (hi - lo) * 100)))
}

const gemStats = computed(() => {
  const g = schema.value?.gem
  return [
    {
      label: 'Saturation',
      pct:   g ? statPct(gnSat.value,  g.saturation.min,           g.saturation.max)           : Math.round(gnSat.value * 100),
      value: `${Math.round(gnSat.value * 100)}%`,
    },
    {
      label: 'IOR',
      pct:   g ? statPct(gnIOR.value,  g.material.ior.min,         g.material.ior.max)         : statPct(gnIOR.value, 1.5, 2.8),
      value: gnIOR.value.toFixed(2),
    },
    {
      label: 'Fire',
      pct:   g ? statPct(gnFire.value, g.material.iridescence.min, g.material.iridescence.max) : Math.round(gnFire.value * 100),
      value: `${Math.round(gnFire.value * 100)}%`,
    },
    {
      label: 'Speed',
      pct:   g ? statPct(gnSpd.value,  g.speed.min,                g.speed.max)                : statPct(gnSpd.value, 0.3, 2.0),
      value: `×${gnSpd.value.toFixed(2)}`,
    },
    {
      label: 'Perfection',
      pct:   Math.round(gnPerf.value * 100),
      value: `${Math.round(gnPerf.value * 100)}%`,
    },
  ]
})

const tiltLabel = computed(() => {
  const deg = Math.round(gnTilt.value * (180 / Math.PI))
  return `Tilt ${deg >= 0 ? '+' : ''}${deg}°`
})
const lightHue1 = computed(() => props.config?.lights.accent1Hue ?? gnHue.value)
const lightHue2 = computed(() => {
  const c = props.config
  return c ? (c.lights.accent1Hue + c.lights.accent2HueOffset) % 360 : (gnHue.value + 120) % 360
})
</script>

<template>
  <aside class="genome">
    <div class="gn-h">
      <span class="gn-diamond"></span>
      Gem Genome
    </div>

    <div class="gn-name">
      <span class="gn-nm">{{ gemName }}</span>
      <span
        class="gn-sw"
        :style="{ background: gemColor, boxShadow: `0 0 16px -2px ${gemColor}` }"
      ></span>
    </div>

    <div class="gn-grade">
      <span class="gn-k">Grade</span>
      <span class="gn-gv">{{ gemGrade }}</span>
    </div>

    <div v-for="s in gemStats" :key="s.label" class="gn-stat">
      <span class="gn-k">{{ s.label }}</span>
      <span class="gn-track"><i :style="{ width: s.pct + '%' }"></i></span>
      <span class="gn-val">{{ s.value }}</span>
    </div>

    <div class="gn-foot">
      <div class="gn-tilt">{{ tiltLabel }}</div>
      <div class="gn-lights">
        <span class="gn-dot" :style="{ background: `hsl(${Math.round(lightHue1)}, 85%, 65%)` }"></span>
        <span class="gn-dot" :style="{ background: `hsl(${Math.round(lightHue2)}, 85%, 65%)` }"></span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.genome {
  flex: 0 0 240px;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: oklch(0.085 0.012 285 / .74);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  padding: 22px 18px;
  box-shadow: 0 28px 70px -34px #000, 0 0 70px -30px oklch(0.6 0.16 298 / .45);
  position: relative;
  z-index: 1;
}
@media (max-width: 640px) {
  .genome { flex: 0 0 auto; width: 100%; max-width: 320px; align-self: center; }
}

.gn-h {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--violet);
  margin-bottom: 16px;
}
.gn-diamond {
  width: 10px; height: 10px;
  transform: rotate(45deg);
  border-radius: 2px;
  background: var(--grad);
  box-shadow: 0 0 8px 0 oklch(0.7 0.16 300 / .65);
  flex-shrink: 0;
}

.gn-name {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.gn-nm {
  flex: 1;
  text-align: center;
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 12.5px;
  color: var(--text);
  background: oklch(0.12 0.02 285 / .6);
  border: 1px solid var(--line-2);
  border-radius: 9px;
  padding: 8px 6px;
  text-transform: lowercase;
  letter-spacing: .02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.gn-sw {
  width: 34px; height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(255,255,255,.16);
  flex-shrink: 0;
  transition: background .5s, box-shadow .5s;
}

.gn-grade {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 2px 0 10px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 6px;
}
.gn-k {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: #9491A3;
}
.gn-gv {
  font-size: 12.5px;
  font-weight: 600;
  background: var(--grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.gn-stat {
  display: grid;
  grid-template-columns: 54px 1fr 34px;
  column-gap: 22px;
  row-gap: 0;
  align-items: center;
  padding: 5px 0;
}
.gn-track {
  height: 4px;
  border-radius: 3px;
  background: var(--panel-3);
  overflow: hidden;
}
.gn-track i {
  display: block;
  height: 100%;
  border-radius: 3px;
  width: 0;
  background: var(--grad);
  transition: width .8s cubic-bezier(.2,.7,.2,1);
}
.gn-val {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 10px;
  color: var(--text);
  text-align: right;
}

.gn-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
}
.gn-tilt {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 10px;
  color: #9491A3;
  letter-spacing: .04em;
}
.gn-lights { display: flex; gap: 7px; align-items: center; }
.gn-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.15);
  box-shadow: 0 0 6px currentColor;
  display: block;
}
</style>
