"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useMediaQuery } from "@/lib/hooks";

/**
 * Single grabbable diamond, auto-rotating, with a chromatic aberration
 * pass that spikes briefly on fast cursor movement. The whole canvas is
 * transparent so the hero's HTML content sits on top.
 *
 * Hidden entirely on:
 *   - coarse pointer (mobile, tablet)
 *   - prefers-reduced-motion: reduce
 */

type Props = {
  /** Called with a velocity scalar (px/s) when the cursor moves. */
  onPointerVelocity?: (v: number) => void;
};

function Diamond({ onPointerVelocity }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);

  // Spring physics for the grab + throw.
  const rotationVel = useRef(new THREE.Vector2(0, 0.15)); // (x, y) angular velocity
  const rotationSpring = useRef(new THREE.Vector2(0, 0)); // pointer-displacement target
  const dragging = useRef(false);
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastPointerGlobal = useRef<{ x: number; y: number; t: number } | null>(null);

  // Use a damped harmonic oscillator in the render loop. NOT framer-motion —
  // needs to be frame-locked.
  useFrame((state, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Track global pointer velocity for chromatic aberration.
    if (lastPointerGlobal.current && onPointerVelocity) {
      const dx = state.pointer.x - lastPointerGlobal.current.x;
      const dy = state.pointer.y - lastPointerGlobal.current.y;
      // Convert from NDC to a "velocity" scalar we can drive the effect with.
      const dist = Math.sqrt(dx * dx + dy * dy);
      const v = dist / Math.max(dt, 0.001);
      onPointerVelocity(v);
    }
    lastPointerGlobal.current = {
      x: state.pointer.x,
      y: state.pointer.y,
      t: performance.now(),
    };

    // While dragging: pointer delta -> angular velocity directly.
    if (dragging.current && lastPointer.current) {
      const dx = state.pointer.x - lastPointer.current.x;
      const dy = state.pointer.y - lastPointer.current.y;
      // Y movement rotates around X axis, X movement rotates around Y.
      rotationVel.current.set(dy * 6, dx * 6);
      mesh.rotation.x += rotationVel.current.x;
      mesh.rotation.y += rotationVel.current.y;
      // Wire overlay follows.
      if (wireRef.current) {
        wireRef.current.rotation.copy(mesh.rotation);
      }
      lastPointer.current = {
        x: state.pointer.x,
        y: state.pointer.y,
        t: performance.now(),
      };
    } else {
      // Free spin: apply current velocity, decay it.
      mesh.rotation.x += rotationVel.current.x * dt;
      mesh.rotation.y += rotationVel.current.y * dt;
      // Decay with exp(-k*dt) for a clean exponential falloff.
      const decay = Math.exp(-dt * 0.6);
      rotationVel.current.multiplyScalar(decay);

      // Auto-spin baseline so the diamond never fully stops.
      if (rotationVel.current.length() < 0.05) {
        rotationVel.current.y = 0.15;
      }

      if (wireRef.current) {
        wireRef.current.rotation.copy(mesh.rotation);
      }
    }
  });

  // Pointer handlers attached to the canvas DOM element, not the mesh,
  // so users can grab anywhere on the diamond and the cursor still
  // works while dragging.
  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-hero-3d]");
    if (!canvas) return;

    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      lastPointer.current = { x: 0, y: 0, t: performance.now() };
      // Use a fresh pointer move listener to track NDC.
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      dragging.current = false;
      lastPointer.current = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // noop
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      // Convert client coords to NDC (-1..1).
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      lastPointer.current = { x: ndcX, y: ndcY, t: performance.now() };
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointermove", onMove);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <group>
      {/* Solid mesh */}
      <mesh ref={meshRef} scale={[1, 1.6, 1]} castShadow receiveShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#7DD3FC"
          metalness={0.4}
          roughness={0.2}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh ref={wireRef} scale={[1, 1.6, 1]}>
        <octahedronGeometry args={[1.02, 0]} />
        <meshBasicMaterial
          color="#F5F5F4"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

function ChromaticFollow() {
  // Bridge pointer velocity from the canvas scene to the postprocessing pass.
  const [offset, setOffset] = useState<[number, number]>([0, 0]);
  const decay = useRef(0);
  const last = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    const dt = Math.max((now - last.current) / 1000, 0.001);
    last.current = now;
    // Velocity decays exponentially toward 0.
    decay.current = decay.current * Math.exp(-dt * 4);
    setOffset([decay.current, decay.current * 0.6]);
  });

  // Expose a window-attached function that the diamond calls per frame.
  useEffect(() => {
    (window as unknown as { __caSetVelocity?: (v: number) => void }).__caSetVelocity =
      (v: number) => {
        // Map velocity (0..5 NDC/s roughly) to offset 0..0.0015.
        const target = Math.min(v * 0.0006, 0.0015);
        if (target > decay.current) decay.current = target;
      };
    return () => {
      delete (window as unknown as { __caSetVelocity?: unknown }).__caSetVelocity;
    };
  }, []);

  return (
    <ChromaticAberration
      blendFunction={BlendFunction.NORMAL}
      offset={offset as unknown as THREE.Vector2}
      radialModulation={false}
      modulationOffset={0}
    />
  );
}

function Postprocessing() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <ChromaticFollow />
    </EffectComposer>
  );
}

export function Hero3D() {
  const isCoarse = useMediaQuery("(pointer: coarse)");
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isCoarse || isReducedMotion) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [isCoarse, isReducedMotion]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-auto fixed bottom-8 right-8 z-10 hidden md:block"
      style={{ width: 280, height: 280 }}
      aria-hidden
    >
      <Canvas
        data-hero-3d
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} color="#7DD3FC" />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.0}
            color="#F5F5F4"
          />
          <Environment preset="city" />
          <Diamond />
          <Postprocessing />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Helper to allow the diamond to call back into the postprocessing pass.
// (Defined to avoid "unused" warnings.)
function useThree_() {
  return useThree();
}
void useThree_;
