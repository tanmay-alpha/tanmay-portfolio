"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AuroraOrb — a low-cost WebGL gradient orb that sits behind the hero.
 * Single quad, one fragment shader. Two soft, drifting radial gradients in
 * the brand amber + sky-cyan, composited with `screen` blend.
 * Renders a static gradient if the user prefers reduced motion.
 */
export function AuroraOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true }) as
        | WebGL2RenderingContext
        | null) ??
      (canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true }) as
        | WebGLRenderingContext
        | null);

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    const isWebGL2 = "createVertexArray" in gl;
    const VERT_SRC = isWebGL2 ? VERT_WGL2 : VERT_WGL1;
    const FRAG_SRC = isWebGL2 ? FRAG_WGL2 : FRAG_WGL1;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        // eslint-disable-next-line no-console
        console.warn("AuroraOrb shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) {
      setHasWebGL(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setHasWebGL(false);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // eslint-disable-next-line no-console
      console.warn("AuroraOrb link error:", gl.getProgramInfoLog(program));
      setHasWebGL(false);
      return;
    }
    gl.useProgram(program);

    // Fullscreen triangle (avoids needing a UV attribute).
    const positions = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uReduced = gl.getUniformLocation(program, "u_reduced");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const sizeCanvas = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const W = Math.max(1, Math.floor(w * dpr));
      const H = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      gl.viewport(0, 0, W, H);
    };
    sizeCanvas();

    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(canvas);

    const reduced = prefersReducedMotion;
    gl.uniform1i(uReduced, reduced ? 1 : 0);

    const start = performance.now();
    const render = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduced) {
      render(); // single static frame
    } else {
      const loop = () => {
        render();
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    }

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [prefersReducedMotion]);

  if (!hasWebGL) {
    // CSS-only fallback: a soft radial gradient. Not as pretty but renders
    // everywhere and respects reduced motion automatically (no animation).
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(closest-side at 70% 35%, rgba(232,184,75,0.18), transparent 60%), radial-gradient(closest-side at 30% 65%, rgba(125,211,252,0.10), transparent 65%)",
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}

const VERT_WGL1 = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG_WGL1 = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform int u_reduced;

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(1.0, u_resolution.y);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  float t = u_reduced == 1 ? 0.0 : u_time * 0.12;

  // Two soft radial blobs drifting in slow circles.
  vec2 c1 = vec2(0.30 * aspect * cos(t), 0.18 * sin(t * 0.9));
  vec2 c2 = vec2(0.25 * aspect * cos(-t * 0.7 + 1.5), -0.20 * sin(t * 0.8));

  float d1 = exp(-12.0 * dot(p - c1, p - c1));
  float d2 = exp(-16.0 * dot(p - c2, p - c2));

  vec3 amber = vec3(0.91, 0.72, 0.29);
  vec3 cyan  = vec3(0.49, 0.83, 0.99);

  vec3 col = amber * d1 * 0.55 + cyan * d2 * 0.30;

  // Soft vignette to keep edges dark.
  float vign = 1.0 - smoothstep(0.55, 1.0, length(p));
  col *= vign;

  gl_FragColor = vec4(col, 1.0);
}
`;

// WebGL2-compatible versions. Slightly tighter precision hints; same logic.
const VERT_WGL2 = /* glsl */ `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG_WGL2 = /* glsl */ `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform int u_reduced;

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(1.0, u_resolution.y);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  float t = u_reduced == 1 ? 0.0 : u_time * 0.12;

  vec2 c1 = vec2(0.30 * aspect * cos(t), 0.18 * sin(t * 0.9));
  vec2 c2 = vec2(0.25 * aspect * cos(-t * 0.7 + 1.5), -0.20 * sin(t * 0.8));

  float d1 = exp(-12.0 * dot(p - c1, p - c1));
  float d2 = exp(-16.0 * dot(p - c2, p - c2));

  vec3 amber = vec3(0.91, 0.72, 0.29);
  vec3 cyan  = vec3(0.49, 0.83, 0.99);

  vec3 col = amber * d1 * 0.55 + cyan * d2 * 0.30;

  float vign = 1.0 - smoothstep(0.55, 1.0, length(p));
  col *= vign;

  outColor = vec4(col, 1.0);
}
`;
