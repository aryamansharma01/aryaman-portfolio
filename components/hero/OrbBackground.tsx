"use client";

import { motion, useReducedMotion } from "framer-motion";

interface Blob {
  className: string;
  animate: {
    x: number[];
    y: number[];
    scale: number[];
  };
  duration: number;
}

const blobs: Blob[] = [
  {
    className: "left-[8%] top-[10%] h-[420px] w-[420px] bg-accent-blue/70",
    animate: { x: [0, 60, -30, 0], y: [0, 40, 80, 0], scale: [1, 1.15, 0.95, 1] },
    duration: 22,
  },
  {
    className: "right-[10%] top-[20%] h-[380px] w-[380px] bg-accent-cyan/60",
    animate: { x: [0, -50, 40, 0], y: [0, 60, -30, 0], scale: [1, 0.9, 1.1, 1] },
    duration: 26,
  },
  {
    className: "left-[35%] top-[35%] h-[320px] w-[320px] bg-gradient-to-br from-accent-blue to-accent-cyan opacity-70",
    animate: { x: [0, 30, -60, 0], y: [0, -40, 30, 0], scale: [1, 1.2, 1, 1] },
    duration: 18,
  },
  {
    className: "right-[25%] bottom-[10%] h-[260px] w-[260px] bg-accent-cyan/50",
    animate: { x: [0, -25, 25, 0], y: [0, 20, -20, 0], scale: [1, 1.1, 0.9, 1] },
    duration: 15,
  },
];

export function OrbBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-[100px] mix-blend-screen will-change-transform ${blob.className}`}
          animate={
            shouldReduceMotion
              ? undefined
              : { x: blob.animate.x, y: blob.animate.y, scale: blob.animate.scale }
          }
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
    </div>
  );
}
