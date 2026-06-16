<script setup lang="ts">
const HOW_STEPS = [
  {
    n: "01",
    title: "Type any string",
    desc: "A name, address, ID, filename — anything you already use as an identifier.",
  },
  {
    n: "02",
    title: "One input, one seed",
    desc: "Your string is hashed into a stable seed. The same input always produces the exact same result.",
  },
  {
    n: "03",
    title: "Forge the gem",
    desc: "Statistically independent visual properties are derived from the seed and rendered as a unique 3D gem.",
  },
];
</script>

<template>
  <section id="how" class="section reveal">
    <div class="section-hd">
      <div class="section-ey">Under the hood</div>
      <h2 class="section-h2">How it works</h2>
    </div>
    <div class="how-grid">
      <div v-for="s in HOW_STEPS" :key="s.n" class="how-card">
        <div class="how-num">{{ s.n }}</div>
        <h3 class="how-title">{{ s.title }}</h3>
        <p class="how-desc">{{ s.desc }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  width: 100%;
}
@media (min-width: 640px) {
  .how-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.how-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 26px 22px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.025);
}
.how-num {
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  font-family: "Geist Mono", ui-monospace, monospace;
  color: oklch(0.72 0.15 295 / 0.5);
}
.how-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.01em;
}
.how-desc {
  font-size: 0.81rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.36);
  margin: 0;
}
</style>
