"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/lib/hooks";

interface AuroraOrbProps {
  size?: number;
  opacity?: number;
}

export function AuroraOrb({ size = 600, opacity = 0.3 }: AuroraOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    // In reduced motion mode, fallback to a static gradient element
    if (isReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to ensure crisp rendering on retina displays.
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Animation loop for the aurora effect
    let animationId: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Create radial gradient for the aurora
      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );

      // Add colors for aurora effect (cyan/blue variants)
      gradient.addColorStop(0, `rgba(125, 211, 252, ${opacity * 0.8})`);
      gradient.addColorStop(0.3, `rgba(56, 189, 248, ${opacity * 0.4})`);
      gradient.addColorStop(0.7, `rgba(14, 165, 233, ${opacity * 0.1})`);
      gradient.addColorStop(1, "rgba(14, 165, 233, 0)");

      // Apply gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add subtle animated noise for organic feel
      const noiseScale = size / 200;
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % size;
        const y = Math.floor((i / 4) / size);

        // Simple Perlin-like noise with time
        const noise = Math.sin(x / noiseScale + time) * Math.cos(y / noiseScale + time) * 10;

        // Apply slight variation to alpha
        const alphaIdx = i + 3;
        const currentAlpha = data[alphaIdx] ?? 0;
        data[alphaIdx] = Math.max(0, Math.min(255, currentAlpha + noise));
      }

      ctx.putImageData(imageData, 0, 0);

      time += 0.005;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [size, opacity, isReducedMotion]);

  if (isReducedMotion) {
    // Static gradient for reduced motion
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center,
            rgba(125, 211, 252, 0.3) 0%,
            rgba(56, 189, 248, 0.1) 30%,
            rgba(14, 165, 233, 0) 100%)`,
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: size,
        height: size,
        mixBlendMode: "screen",
      }}
      animate={{
        opacity: [0.3, 0.4, 0.3],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
