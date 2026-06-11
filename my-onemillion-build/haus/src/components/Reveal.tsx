"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// A small scroll-reveal wrapper: children fade + rise into view once.
// Honours prefers-reduced-motion (renders instantly, no movement).
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
