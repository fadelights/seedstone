import * as THREE from 'three';
import { hslToHex } from './color';
import type { SeedstoneConfig } from '../config';

type OrbitConfig = SeedstoneConfig['lights']['orbits'][number];

interface OrbitingLight {
  light: THREE.PointLight;
  cfg:   OrbitConfig;
  phase: number;   // radians, from cfg.phaseDeg
  speed: number;   // cfg.speed * gem.speed
}

/**
 * The light rig: point lights orbiting the gem (two tinted with the accent
 * hues), a rim light from below offset from the gem's hue, and a faint ambient.
 */
export class Lights {
  private cfg:     SeedstoneConfig['lights'];
  private ambient: THREE.AmbientLight;
  private orbits:  OrbitingLight[];
  private rim:     THREE.DirectionalLight;

  constructor(scene: THREE.Scene, cfg: SeedstoneConfig) {
    this.cfg = cfg.lights;
    const lights = cfg.lights;

    this.ambient = new THREE.AmbientLight(0xffffff, lights.ambientIntensity);
    scene.add(this.ambient);

    const accent1Hue = lights.accent1Hue;
    const accent2Hue = (accent1Hue + lights.accent2HueOffset) % 360;

    this.orbits = lights.orbits.map(orbitCfg => {
      const hue = orbitCfg.tint === 'accent1' ? accent1Hue
                : orbitCfg.tint === 'accent2' ? accent2Hue
                : null;
      const color = hue !== null
        ? hslToHex(hue, lights.tintSaturation, lights.tintLightness)
        : orbitCfg.color;
      const light = new THREE.PointLight(color, orbitCfg.intensity, lights.pointLightRange);
      light.position.set(orbitCfg.radius, orbitCfg.y, 0);
      scene.add(light);
      return {
        light,
        cfg:   orbitCfg,
        phase: (orbitCfg.phaseDeg / 180) * Math.PI,
        speed: orbitCfg.speed * cfg.gem.speed,
      };
    });

    this.rim = new THREE.DirectionalLight(
      hslToHex((cfg.gem.hue + lights.rim.hueOffset) % 360, lights.rim.saturation, lights.rim.lightness),
      lights.rim.intensity,
    );
    this.rim.position.set(...lights.rim.position);
    scene.add(this.rim);
  }

  animate(t: number): void {
    for (const { light, cfg, phase, speed } of this.orbits) {
      light.position.set(
        cfg.radius * Math.cos(t * speed + phase),
        cfg.y + Math.sin(t * this.cfg.bobRate + phase) * this.cfg.bobAmount,
        cfg.radius * Math.sin(t * speed + phase),
      );
    }
  }

  dispose(): void {
    for (const { light } of this.orbits) {
      light.removeFromParent();
      light.dispose();
    }
    this.ambient.removeFromParent();
    this.ambient.dispose();
    this.rim.removeFromParent();
    this.rim.dispose();
    this.orbits.length = 0;
  }
}
