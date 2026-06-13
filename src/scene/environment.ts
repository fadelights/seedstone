import * as THREE from 'three';
import { hslToHex } from './color';
import type { SeedstoneConfig } from '../config';

/**
 * The environment map the gem reflects and refracts — a dark dome studded
 * with bright HDR spots (the "studio lights" you see glinting off facets)
 * and dim fill spheres that tint the lower hemisphere.
 *
 * The dome and tinted spots take the accent light hues; the fills step
 * through hues starting from the gem's body hue.
 */
export class Environment {
  private cfg:      SeedstoneConfig['environment'];
  private pmrem:    THREE.PMREMGenerator;
  private envScene: THREE.Scene;
  private target:   THREE.WebGLRenderTarget | null = null;

  constructor(renderer: THREE.WebGLRenderer, cfg: SeedstoneConfig) {
    this.cfg      = cfg.environment;
    const env     = cfg.environment;
    this.pmrem    = new THREE.PMREMGenerator(renderer);
    this.envScene = new THREE.Scene();

    const accent1Hue = cfg.lights.accent1Hue;
    const accent2Hue = (accent1Hue + cfg.lights.accent2HueOffset) % 360;

    const domeMat = new THREE.MeshBasicMaterial({
      side:  THREE.BackSide,
      color: hslToHex(accent1Hue, env.domeSaturation, env.domeLightness),
    });
    this.envScene.add(new THREE.Mesh(new THREE.SphereGeometry(env.domeRadius, 32, 16), domeMat));

    // RGB > 1 reads as an HDR highlight after the PMREM bake.
    const w = env.whiteSpotIntensity;
    const whiteMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(w, w, w) });
    const tintMat  = (hue: number) => new THREE.MeshBasicMaterial({
      color: new THREE.Color()
        .setHSL(hue / 360, 1.0, env.tintSpotLightness)
        .multiplyScalar(env.tintSpotIntensity),
    });
    const spot1Mat = tintMat(accent1Hue);
    const spot2Mat = tintMat(accent2Hue);

    const spotGeo = new THREE.SphereGeometry(env.spotSize, 6, 6);
    for (let i = 0; i < env.spotCount; i++) {
      const theta = (i / env.spotCount) * Math.PI * 2;
      const phi   = Math.PI * 0.25 + (i % 4) * (Math.PI * 0.12);
      const mat   = i % 3 === 0 ? whiteMat : i % 3 === 1 ? spot1Mat : spot2Mat;
      const spot  = new THREE.Mesh(spotGeo, mat);
      spot.position.set(
        env.spotOrbitRadius * Math.sin(phi) * Math.cos(theta),
        env.spotOrbitRadius * Math.cos(phi),
        env.spotOrbitRadius * Math.sin(phi) * Math.sin(theta),
      );
      this.envScene.add(spot);
    }

    const fillGeo = new THREE.SphereGeometry(env.fillSize, 8, 8);
    for (let i = 0; i < env.fillCount; i++) {
      const theta = (i / env.fillCount) * Math.PI * 2;
      const mat   = new THREE.MeshBasicMaterial({
        color: hslToHex((cfg.gem.hue + i * env.fillHueStep) % 360, env.fillSaturation, env.fillLightness),
      });
      const fill = new THREE.Mesh(fillGeo, mat);
      fill.position.set(env.fillRadius * Math.cos(theta), env.fillY, env.fillRadius * Math.sin(theta));
      this.envScene.add(fill);
    }
  }

  /**
   * Bake the env scene into a PMREM texture and return it.
   * The previous bake is disposed two frames later, after any in-flight
   * renders that still reference it have completed.
   */
  render(): THREE.Texture {
    const old = this.target;
    this.target = this.pmrem.fromScene(this.envScene, this.cfg.blurRadius);
    if (old) requestAnimationFrame(() => requestAnimationFrame(() => old.dispose()));
    return this.target.texture;
  }

  dispose(): void {
    this.target?.dispose();
    this.pmrem.dispose();
    this.envScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      (mesh.material as THREE.Material | undefined)?.dispose();
    });
  }
}
