"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Reveals `text` character-by-character with a blinking caret — the classic
 * "typing" effect. The full text is already known (the AI answer has arrived);
 * this just animates it appearing, so it stays robust and never shows partial
 * data. Honours `prefers-reduced-motion` by showing the text instantly.
 *
 * The reveal finishes in a roughly constant time regardless of length, so a
 * short or long verdict both feel snappy.
 */
export default function TypeOut({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const done = count >= text.length;

  useEffect(() => {
    if (reduce) {
      setCount(text.length);
      return;
    }
    setCount(0);
    // Reveal in ~180 ticks total (≈2.9s at 16ms/tick), so longer text just
    // reveals more characters per tick rather than taking longer.
    const step = Math.max(1, Math.ceil(text.length / 180));
    const id = setInterval(() => {
      setCount((c) => {
        const next = c + step;
        if (next >= text.length) {
          clearInterval(id);
          return text.length;
        }
        return next;
      });
    }, 16);
    return () => clearInterval(id);
  }, [text, reduce]);

  return (
    <>
      {text.slice(0, count)}
      {!done && (
        <motion.span
          aria-hidden
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: "currentColor",
            marginLeft: 2,
            verticalAlign: "text-bottom",
            borderRadius: 1,
          }}
        />
      )}
    </>
  );
}
