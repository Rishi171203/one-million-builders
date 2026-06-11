"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

// Animated number that counts up the first time it scrolls into view.
export default function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.2,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setV(to);
      return;
    }
    const controls = animate(0, to, { duration, ease: "easeOut", onUpdate: (x) => setV(x) });
    return () => controls.stop();
  }, [inView, to, reduce, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {Math.round(v)}
      {suffix}
    </span>
  );
}
