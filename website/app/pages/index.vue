<script setup lang="ts">
import { ref } from 'vue'
import type { SeedstoneConfig } from 'seedstone'

const activeSeed = ref('seedstone')

useSeoMeta({
  title:         'Seedstone — Every string is a unique gemstone',
  description:   'Render a 3D rotating gemstone from any string. Deterministic, WebGL-powered, Three.js.',
  ogTitle:       'Seedstone',
  ogDescription: 'Every string is a unique gemstone',
})

const QUICK_PICKS = ['hello world', '0x1a2b3c', 'stardust', 'ultraviolet', 'midnight', 'aurora']

const inputValue = ref('')
const gemConfig  = ref<SeedstoneConfig | null>(null)

function onInput() {
  activeSeed.value = inputValue.value.trim() || 'seedstone'
}

function onQuickPick(val: string) {
  inputValue.value = val
  activeSeed.value = val
}
</script>

<template>
  <ClientOnly><StarfieldCanvas /></ClientOnly>

  <div class="page">

    <header class="header">

      <h1>✦ Seedstone</h1>
      <p class="header-sub">Every string is a unique gemstone</p>
    </header>

    <div class="content">

      <!-- ── Hero ───────────────────────────────────────────────────────────── -->
      <div class="hero">

        <!-- Left: seed input -->
        <div class="hero-left">
          <div class="input-card">
            <div class="card-header">
              <span class="card-icon">◈</span>
              <span class="card-title">Seed Crystal</span>
            </div>
            <p class="card-tagline">Type any string to forge a unique crystalline gem, deterministically generated from your input.</p>
            <input
              id="gem-input"
              v-model="inputValue"
              type="text"
              class="seed-input"
              placeholder="seedstone"
              autocomplete="off"
              spellcheck="false"
              @input="onInput"
            />
            <div class="picks-divider"><span>try these</span></div>
            <div class="quick-picks">
              <button
                v-for="val in QUICK_PICKS"
                :key="val"
                class="chip"
                @click="onQuickPick(val)"
              >{{ val }}</button>
            </div>
          </div>
        </div>

        <!-- Centre: gem -->
        <div class="hero-center">
          <ClientOnly>
            <GemViewer :seed="activeSeed" @config="(c) => gemConfig = c" />
          </ClientOnly>
        </div>

        <!-- Right: genome panel -->
        <div class="hero-right">
          <GemDNA :config="gemConfig" />
        </div>

      </div>

      <!-- ── Install + usage ───────────────────────────────────────────── -->
      <CodeSection />

      <!-- ── Footer ──────────────────────────────────────────────────────── -->
      <footer class="footer">
        <span>Built with <a href="https://threejs.org" target="_blank" rel="noopener">Three.js</a></span>
        <a href="https://github.com/titangmz/seedstone" target="_blank" rel="noopener" class="gh-link" aria-label="seedstone on GitHub">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </footer>

    </div>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px 80px;
}

/* ── Header ─────────────────────────────────────────────────────────────────── */
.header {
  width: 100%;
  text-align: center;
  margin-bottom: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.header-eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.eyebrow-text {
  font-size: 0.67rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(167,139,250,0.45);
  white-space: nowrap;
}
.eyebrow-rule {
  display: block;
  width: 48px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(167,139,250,0.35));
}
.eyebrow-rule.reverse {
  background: linear-gradient(90deg, rgba(167,139,250,0.35), transparent);
}

.header h1 {
  font-size: clamp(2.6rem, 5.5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  background: linear-gradient(135deg, #f3e8ff 0%, #c084fc 28%, #818cf8 58%, #e879f9 82%, #f5d0fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 48px rgba(192,132,252,0.5));
  margin: 0;
}
.header-sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.38);
  letter-spacing: 0.015em;
  margin: 0;
}

.tech-stack {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tech-badge {
  padding: 4px 14px;
  border-radius: 100px;
  background: rgba(167,139,250,0.08);
  border: 1px solid rgba(167,139,250,0.18);
  font-size: 0.69rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(167,139,250,0.65);
}

/* ── Shared-width wrapper ────────────────────────────────────────────────────── */
.content {
  width: 100%;
  max-width: 1300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 56px;
}

/* ── Hero grid ───────────────────────────────────────────────────────────────── */
.hero {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

@media (min-width: 960px) {
  .hero {
    display: grid;
    grid-template-columns: 1fr 420px 1fr;
    align-items: start;
    gap: 24px;
  }
}

/* ── Left column ─────────────────────────────────────────────────────────────── */
.hero-left {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
}
@media (min-width: 960px) {
  .hero-left { max-width: none; }
}

/* ── Input card ──────────────────────────────────────────────────────────────── */
.input-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  backdrop-filter: blur(12px);
  box-shadow: var(--glow), 0 8px 40px rgba(0,0,0,0.45);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-icon  { color: var(--accent); font-size: 1rem; }
.card-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.card-tagline {
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.32);
  margin: 0;
}

.seed-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 15px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.06);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.seed-input:focus {
  border-color: rgba(167,139,250,0.6);
  box-shadow: 0 0 0 3px rgba(167,139,250,0.15);
}
.seed-input::placeholder { color: rgba(255,255,255,0.22); }

.picks-divider {
  display: flex;
  align-items: center;
  gap: 10px;
}
.picks-divider span {
  font-size: 0.67rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.18);
  white-space: nowrap;
}
.picks-divider::before,
.picks-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.07);
}

.quick-picks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.chip:hover {
  background: rgba(167,139,250,0.14);
  color: var(--accent);
  border-color: rgba(167,139,250,0.35);
}

/* ── Centre column ───────────────────────────────────────────────────────────── */
.hero-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.gem-caption {
  font-size: 0.72rem;
  font-family: 'Consolas', 'SF Mono', monospace;
  color: rgba(255,255,255,0.22);
  letter-spacing: 0.06em;
  text-align: center;
  max-width: 420px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Right column ────────────────────────────────────────────────────────────── */
.hero-right {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
}
@media (min-width: 960px) {
  .hero-right { max-width: none; }
}


/* ── Footer ──────────────────────────────────────────────────────────────────── */
.footer {
  margin-top: 48px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255,255,255,0.8);
  font-size: 0.8rem;
}
.footer a { color: rgba(255,255,255,0.8); text-decoration: none; }
.footer a:hover { color: #fff; }
.gh-link {
  display: flex;
  align-items: center;
  color: rgba(255,255,255,0.8);
  transition: color 0.15s;
}
.gh-link:hover { color: #fff; }
</style>
