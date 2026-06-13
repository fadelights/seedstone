import * as THREE from 'three';
import type { SeedstoneConfig } from '../config';

/** mulberry32 — tiny deterministic PRNG, so the same seed gives the same sky. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A shell of tiny points floating around the gem, placed from scatterSeed. */
export class Sparkles {
  private cfg:      SeedstoneConfig['sparkles'];
  private points:   THREE.Points;
  private material: THREE.PointsMaterial;

  constructor(scene: THREE.Scene, cfg: SeedstoneConfig) {
    this.cfg = cfg.sparkles;
    const sparkles = cfg.sparkles;

    const positions = new THREE.BufferAttribute(new Float32Array(sparkles.count * 3), 3);
    const rand = mulberry32(Math.floor(sparkles.scatterSeed * 0xffffffff));
    for (let i = 0; i < sparkles.count; i++) {
      const r     = sparkles.radiusMin + rand() * sparkles.radiusRange;
      const theta = rand() * Math.PI * 2;
      const phi   = Math.acos(2 * rand() - 1);   // uniform on the sphere
      positions.setXYZ(
        i,
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', positions);

    this.material = new THREE.PointsMaterial({
      color: 0xffffff, size: sparkles.size, transparent: true,
      opacity: sparkles.baseOpacity, sizeAttenuation: true,
    });
    this.points = new THREE.Points(geometry, this.material);
    scene.add(this.points);
  }

  animate(t: number): void {
    this.points.rotation.y = t * this.cfg.driftRate;
    this.material.opacity  = this.cfg.baseOpacity + Math.sin(t * this.cfg.pulseRate) * this.cfg.pulseAmount;
  }

  dispose(): void {
    this.points.removeFromParent();
    this.points.geometry.dispose();
    this.material.dispose();
  }
}
