"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Icosahedron } from "@react-three/drei";
import { useMotionValue, useReducedMotion } from "framer-motion";
import type { Group } from "three";

const RUST = "#D97757";
const RUST_DIM = "rgba(217, 119, 87, 0.5)";

function WireIcosahedron() {
  const groupRef = useRef<Group>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const reduced = useReducedMotion();
  const { size } = useThree();

  useFrame((_state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    if (!reduced) {
      g.rotation.y += delta * 0.1;
      g.rotation.x += delta * 0.03;
    }
    // Subtle pointer-driven tilt. Clamped to ±0.15 rad.
    const tx = Math.max(-0.15, Math.min(0.15, tiltX.get()));
    const ty = Math.max(-0.15, Math.min(0.15, tiltY.get()));
    g.rotation.x += (tx - g.rotation.x) * 0.1;
    g.rotation.y += (ty - g.rotation.y) * 0.1;
    // Reference viewport to keep useThree's reactive deps alive.
    void size;
  });

  return (
    <group
      ref={groupRef}
      onPointerMove={(e) => {
        tiltX.set(e.point.y * 0.05);
        tiltY.set(e.point.x * 0.05);
      }}
    >
      <Icosahedron args={[1, 0]}>
        <meshBasicMaterial color={RUST} wireframe transparent opacity={0.42} />
        <Edges color={RUST} threshold={1} />
      </Icosahedron>
      {/* A second, slightly larger wire shell for a softer silhouette. */}
      <Icosahedron args={[1.012, 0]}>
        <meshBasicMaterial color={RUST} wireframe transparent opacity={0.16} />
      </Icosahedron>
    </group>
  );
}

function StaticFallback() {
  // Static SVG silhouette: an icosahedron drawn with 12 vertices and 30
  // edges, projected via simple isometric (drop z, slight 2D squash).
  // Coordinates are normalized to a 100-unit half-width.
  const phi = (1 + Math.sqrt(5)) / 2;
  const scale = 80;
  const verts: ReadonlyArray<readonly [number, number, number]> = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];
  // Index pairs for the 30 edges of an icosahedron.
  const edges: ReadonlyArray<readonly [number, number]> = [
    [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
    [1, 5], [1, 7], [1, 8], [1, 9],
    [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
    [3, 4], [3, 6], [3, 8], [3, 9],
    [4, 5], [4, 9], [4, 11],
    [5, 9], [5, 11],
    [6, 7], [6, 8], [6, 10],
    [7, 8], [7, 10],
    [8, 9],
    [10, 11],
  ];
  const project = (v: readonly [number, number, number]): [number, number] => {
    // Isometric-ish: combine x and z into x, use y as y, but slightly
    // squash so the icosahedron looks 3D rather than head-on.
    return [(v[0] + v[2] * 0.45) * scale, v[1] * scale * 0.7];
  };
  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-full w-full"
      aria-hidden
    >
      {edges.map(([a, b], i) => {
        const av = verts[a];
        const bv = verts[b];
        if (!av || !bv) return null;
        const [ax, ay] = project(av);
        const [bx, by] = project(bv);
        return (
          <line
            key={i}
            x1={ax}
            y1={-ay}
            x2={bx}
            y2={-by}
            stroke={RUST_DIM}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function Hero3D() {
  const reduced = useReducedMotion();
  // Anchored to the bottom-right of the hero, behind/around the photo.
  // pointer-events disabled so it never blocks interactions.
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-0 bottom-0 z-0 hidden translate-x-[18%] translate-y-[20%] md:block"
      style={{ width: 220, height: 220 }}
    >
      {reduced ? (
        <StaticFallback />
      ) : (
        <Canvas
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 3.5], fov: 45 }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <WireIcosahedron />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
