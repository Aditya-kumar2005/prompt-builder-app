/**
 * ThreeLogoViewer Component
 * Interactive 3D procedural logo showcase using Three.js.
 * Implements the Three.js skill:
 * - 3–12 part procedural composite models (THREE.Group)
 * - Studio PBR materials with varied metalness/roughness
 * - RoomEnvironment reflections with PMREMGenerator
 * - Studio warm key / cool hemisphere lighting & grounded contact shadow
 * - Damped interactive drag rotation and software WebGL guard
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface Procedural3DLogoData {
  archetype: 'polyhedral_core' | 'orbital_rings' | 'geometric_torus_prism' | 'faceted_gem' | 'cyber_monolith' | 'helix_lattice' | string;
  partCount?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  metalness?: number;
  roughness?: number;
  wireframe?: boolean;
  rotationSpeed?: number;
  description?: string;
}

interface ThreeLogoViewerProps {
  data: Procedural3DLogoData;
  width?: number | string;
  height?: number | string;
  interactive?: boolean;
  autoRotate?: boolean;
  showControls?: boolean;
  onExplodeChange?: (val: number) => void;
}

export const ThreeLogoViewer: React.FC<ThreeLogoViewerProps> = ({
  data,
  width = '100%',
  height = 240,
  interactive = true,
  autoRotate = true,
  showControls = false,
  onExplodeChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [exploded, setExploded] = useState(0);

  // Keep mutable references for the render loop
  const stateRef = useRef({
    isRotating,
    exploded,
    isHovered: false,
    pointerDown: false,
    prevPointer: { x: 0, y: 0 },
    targetRot: { x: 0.2, y: 0 },
    currentRot: { x: 0.2, y: 0 },
  });

  stateRef.current.isRotating = isRotating;
  stateRef.current.exploded = exploded;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL per Three.js skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Setup Scene, Camera, Renderer
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
    camera.position.set(0, 0.6, 4.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Environment Reflection via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.4);
    keyLight.position.set(3.5, 4.5, 3.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x88bbff, 0x111827, 1.1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa5b4fc, 1.2);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    // 4. Ground Contact Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.22)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;

    const contactPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      })
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = -1.35;
    scene.add(contactPlane);

    // 5. Build Procedural 3-12 Part Composite Model (THREE.Group)
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    const pColor = new THREE.Color(data.primaryColor || '#6366f1');
    const sColor = new THREE.Color(data.secondaryColor || '#06b6d4');
    const aColor = new THREE.Color(data.accentColor || '#ffffff');
    const metalness = data.metalness ?? 0.85;
    const roughness = data.roughness ?? 0.18;

    // Materials with varied roughness/metalness across adjacent parts
    const matPrimary = new THREE.MeshStandardMaterial({
      color: pColor,
      metalness,
      roughness,
      wireframe: !!data.wireframe,
    });

    const matSecondary = new THREE.MeshStandardMaterial({
      color: sColor,
      metalness: Math.max(0.2, metalness - 0.2),
      roughness: Math.min(0.8, roughness + 0.3),
      wireframe: !!data.wireframe,
    });

    const matAccent = new THREE.MeshPhysicalMaterial({
      color: aColor,
      metalness: 0.95,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const matEmissiveCore = new THREE.MeshStandardMaterial({
      color: pColor,
      emissive: pColor,
      emissiveIntensity: 0.45,
      roughness: 0.3,
    });

    // Dynamic child parts array for exploded-view animations
    const dynamicParts: { mesh: THREE.Object3D; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[] = [];

    const addPart = (mesh: THREE.Object3D, explodeDir: THREE.Vector3) => {
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      logoGroup.add(mesh);
      dynamicParts.push({
        mesh,
        basePos: mesh.position.clone(),
        explodeDir: explodeDir.clone(),
      });
    };

    const arch = data.archetype || 'polyhedral_core';

    if (arch === 'orbital_rings') {
      // 1. Central radiant nucleus
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 32), matEmissiveCore);
      addPart(core, new THREE.Vector3(0, 0, 0));

      // 2. Inner gimbal ring
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.045, 16, 64), matPrimary);
      addPart(r1, new THREE.Vector3(0, 0.2, 0));

      // 3. Middle gimbal ring (inclined)
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.045, 16, 64), matSecondary);
      r2.rotation.x = Math.PI / 3;
      addPart(r2, new THREE.Vector3(0.2, 0, 0));

      // 4. Outer gimbal ring
      const r3 = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.04, 16, 64), matAccent);
      r3.rotation.y = Math.PI / 4;
      addPart(r3, new THREE.Vector3(-0.2, 0.1, 0));

      // 5-8. Four orbital satellite nodes
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), matAccent);
        node.position.set(Math.cos(ang) * 1.28, Math.sin(ang) * 1.28, 0);
        addPart(node, new THREE.Vector3(Math.cos(ang) * 0.8, Math.sin(ang) * 0.8, 0));
      }
    } else if (arch === 'cyber_monolith') {
      // 1. Hexagonal beveled central pillar
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.82, 1.8, 6), matPrimary);
      addPart(pillar, new THREE.Vector3(0, 0, 0));

      // 2. Floating levitating crystal crown
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.65, 6), matAccent);
      crown.position.y = 1.35;
      addPart(crown, new THREE.Vector3(0, 0.7, 0));

      // 3. Central luminescent power nexus band
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.16, 6), matEmissiveCore);
      addPart(band, new THREE.Vector3(0, 0.2, 0));

      // 4-5. Dual floating protective shield wings
      for (let sgn = -1; sgn <= 1; sgn += 2) {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.35), matSecondary);
        wing.position.set(sgn * 0.9, 0, 0);
        addPart(wing, new THREE.Vector3(sgn * 0.8, 0, 0));
      }

      // 6. Plinth base
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.18, 6), matSecondary);
      plinth.position.y = -1.0;
      addPart(plinth, new THREE.Vector3(0, -0.4, 0));
    } else if (arch === 'geometric_torus_prism') {
      // 1. Interlocking Torus Knot
      const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.78, 0.2, 80, 16, 2, 3), matPrimary);
      addPart(knot, new THREE.Vector3(0, 0, 0));

      // 2. Embedded octahedron core
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.48), matAccent);
      addPart(core, new THREE.Vector3(0, 0, 0));

      // 3. Floating outer halo ring
      const halo = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.035, 16, 48), matSecondary);
      halo.rotation.x = Math.PI / 2;
      addPart(halo, new THREE.Vector3(0, 0.4, 0));

      // 4-6. Tri-satellite nodes
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const sat = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12), matEmissiveCore);
        sat.position.set(Math.cos(a) * 1.48, 0, Math.sin(a) * 1.48);
        addPart(sat, new THREE.Vector3(Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6));
      }
    } else if (arch === 'faceted_gem') {
      // 1. Top crown facet
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.7, 8), matPrimary);
      crown.position.y = 0.35;
      addPart(crown, new THREE.Vector3(0, 0.5, 0));

      // 2. Bottom pavilion inverted cone
      const pav = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.1, 8), matSecondary);
      pav.rotation.x = Math.PI;
      pav.position.y = -0.55;
      addPart(pav, new THREE.Vector3(0, -0.6, 0));

      // 3. Middle girdle bevel ring
      const girdle = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.1, 8), matAccent);
      addPart(girdle, new THREE.Vector3(0, 0, 0));

      // 4-5. Dual orbital shimmer halos
      const halo1 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.03, 16, 32), matAccent);
      halo1.rotation.x = Math.PI / 3;
      addPart(halo1, new THREE.Vector3(0.2, 0.3, 0));
    } else {
      // Default: polyhedral_core
      // 1. Faceted central core (dodecahedron)
      const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), matPrimary);
      addPart(core, new THREE.Vector3(0, 0, 0));

      // 2. Inner glowing nucleus
      const nuc = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), matEmissiveCore);
      addPart(nuc, new THREE.Vector3(0, 0, 0));

      // 3. Outer wireframe cage
      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.22, 0),
        new THREE.MeshBasicMaterial({
          color: sColor,
          wireframe: true,
          transparent: true,
          opacity: 0.65,
        })
      );
      addPart(wire, new THREE.Vector3(0, 0.3, 0));

      // 4-5. Dual gimbal bevel rings
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.035, 16, 48), matSecondary);
      ring1.rotation.x = Math.PI / 4;
      addPart(ring1, new THREE.Vector3(0.3, 0, 0));

      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.035, 16, 48), matAccent);
      ring2.rotation.y = Math.PI / 3;
      addPart(ring2, new THREE.Vector3(-0.3, 0.1, 0));

      // 6-8. Tri satellite diamond crystals
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const sat = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), matAccent);
        sat.position.set(Math.cos(a) * 1.5, Math.sin(a) * 0.4, Math.sin(a) * 1.5);
        addPart(sat, new THREE.Vector3(Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7));
      }
    }

    // 6. Interactive Drag & Pointer Interaction
    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      stateRef.current.pointerDown = true;
      stateRef.current.prevPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      if (stateRef.current.pointerDown) {
        const dx = e.clientX - stateRef.current.prevPointer.x;
        const dy = e.clientY - stateRef.current.prevPointer.y;
        stateRef.current.targetRot.y += dx * 0.008;
        stateRef.current.targetRot.x += dy * 0.008;
        stateRef.current.targetRot.x = Math.max(-1.0, Math.min(1.0, stateRef.current.targetRot.x));
        stateRef.current.prevPointer = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = () => {
      stateRef.current.pointerDown = false;
    };

    const domEl = renderer.domElement;
    domEl.style.cursor = interactive ? 'grab' : 'default';
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 7. Lossless 60fps Loop with Damping & Software WebGL guard
    let animId = 0;
    let lastTime = performance.now();
    const rotSpeed = (data.rotationSpeed || 0.8) * 0.015;

    const renderLoop = (time: number) => {
      animId = requestAnimationFrame(renderLoop);
      const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
      lastTime = time;

      // Auto rotation
      if (stateRef.current.isRotating && !stateRef.current.pointerDown) {
        stateRef.current.targetRot.y += rotSpeed;
      }

      // Smooth exponential damping (1 - Math.exp(-k * dt))
      const dampFactor = 1 - Math.exp(-12 * dt);
      stateRef.current.currentRot.x += (stateRef.current.targetRot.x - stateRef.current.currentRot.x) * dampFactor;
      stateRef.current.currentRot.y += (stateRef.current.targetRot.y - stateRef.current.currentRot.y) * dampFactor;

      logoGroup.rotation.x = stateRef.current.currentRot.x;
      logoGroup.rotation.y = stateRef.current.currentRot.y;

      // Handle exploded view displacement smoothly
      const expTarget = stateRef.current.exploded;
      for (const p of dynamicParts) {
        p.mesh.position.x = p.basePos.x + p.explodeDir.x * expTarget * 0.8;
        p.mesh.position.y = p.basePos.y + p.explodeDir.y * expTarget * 0.8;
        p.mesh.position.z = p.basePos.z + p.explodeDir.z * expTarget * 0.8;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(renderLoop);

    // Resize Observer
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    ro.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Dispose Three.js resources
      logoGroup.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      contactPlane.geometry.dispose();
      (contactPlane.material as THREE.Material).dispose();
      shadowTexture.dispose();
      renderer.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [data, interactive]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none group">
      <div
        ref={mountRef}
        className="w-full h-full flex items-center justify-center relative touch-none"
        style={{ width, height }}
      />

      {/* Interactive Controls Overlay */}
      {showControls && (
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] text-slate-300 backdrop-blur-md">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-200 transition-colors"
          >
            <span>{isRotating ? '⏸ Pause' : '▶ Orbit'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Deconstruct</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={exploded}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setExploded(val);
                if (onExplodeChange) onExplodeChange(val);
              }}
              className="w-16 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
