import * as THREE from 'three';
import { buildGeometry } from '../geometries/index';
import { applyDistortions } from '../geometries/lib/distort';
import type { SeedstoneConfig } from '../config';

/**
 * The gemstone itself: a physically-based transmission material plus a
 * barely-visible wireframe child that adds a hint of facet-edge definition.
 */
export class Gem {
  private cfg:       SeedstoneConfig['gem'];
  private mesh:      THREE.Mesh;
  private wireframe: THREE.Mesh;     // child of mesh, shares its geometry
  private material:  THREE.MeshPhysicalMaterial;

  constructor(scene: THREE.Scene, cfg: SeedstoneConfig) {
    this.cfg = cfg.gem;
    const gem = cfg.gem;

    const geometry = buildGeometry(gem.cut);
    applyDistortions(geometry, gem.distortion);

    // Every key in gem.material is a MeshPhysicalMaterial property.
    this.material = new THREE.MeshPhysicalMaterial({
      ...gem.material,
      metalness:   0.0,
      roughness:   0.0,
      transparent: true,
      side:        THREE.DoubleSide,
    });
    this.material.color.setHSL(gem.hue / 360, gem.saturation * gem.bodySaturationScale, gem.bodyLightness);
    this.material.attenuationColor.setHSL(gem.hue / 360, 1.0, gem.attenuationLightness);

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.z = gem.tilt;

    this.wireframe = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: 0xffffff, wireframe: true, transparent: true, opacity: gem.wireframeOpacity,
    }));
    this.mesh.add(this.wireframe);
    scene.add(this.mesh);
  }

  animate(t: number): void {
    this.mesh.rotation.y = t * this.cfg.speed * this.cfg.spinRate;
    this.mesh.rotation.x = Math.sin(t * this.cfg.wobbleRate) * this.cfg.wobbleAmount + this.cfg.tilt;
  }

  dispose(): void {
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.material.dispose();
    (this.wireframe.material as THREE.Material).dispose();
  }
}
