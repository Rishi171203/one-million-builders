"use client";

import { motion } from "framer-motion";

// Gentle infinite float helper.
const float = (dur: number, dist = 12) => ({
  animate: { y: [0, -dist, 0] },
  transition: { duration: dur, repeat: Infinity, ease: "easeInOut" as const },
});

/* ──────────────────────────────────────────────────────────────
   HeroHouse — the showpiece: a 3D house with floating currency coins.
   ────────────────────────────────────────────────────────────── */
export function HeroHouse() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}
    >
      <motion.svg
        viewBox="0 0 480 440"
        width="100%"
        role="img"
        aria-label="A 3D illustration of a house surrounded by floating currency coins"
        {...float(6, 12)}
      >
        <defs>
          <linearGradient id="hh-roof" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#818CF8" />
            <stop offset="1" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="hh-roofside" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#312E81" />
          </linearGradient>
          <linearGradient id="hh-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E0E7FF" />
          </linearGradient>
          <linearGradient id="hh-wallside" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C7D2FE" />
            <stop offset="1" stopColor="#A5B4FC" />
          </linearGradient>
          <linearGradient id="hh-door" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FBBF24" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="hh-win" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A5F3FC" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
          <radialGradient id="hh-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#818CF8" stopOpacity="0.45" />
            <stop offset="1" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hh-coin" cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#FDE68A" />
            <stop offset="1" stopColor="#D97706" />
          </radialGradient>
        </defs>

        {/* soft glow behind the house */}
        <ellipse cx="240" cy="220" rx="210" ry="190" fill="url(#hh-glow)" />
        {/* ground shadow */}
        <ellipse cx="240" cy="372" rx="140" ry="22" fill="#1E1B4B" opacity="0.18" />

        {/* roof side + right wall give the 3D depth */}
        <path d="M300 176 L228 104 L262 84 L334 152 Z" fill="url(#hh-roofside)" />
        <path d="M288 176 L322 154 L322 300 L288 322 Z" fill="url(#hh-wallside)" />
        {/* front wall */}
        <path d="M152 176 L288 176 L288 322 L152 322 Z" fill="url(#hh-wall)" stroke="#C7D2FE" strokeWidth="1.5" />
        {/* roof front */}
        <path d="M138 182 L220 108 L302 182 Z" fill="url(#hh-roof)" />
        {/* chimney */}
        <rect x="268" y="118" width="18" height="40" rx="3" fill="url(#hh-roofside)" />

        {/* door */}
        <rect x="196" y="250" width="48" height="72" rx="8" fill="url(#hh-door)" />
        <circle cx="236" cy="288" r="3.4" fill="#7C2D12" />

        {/* windows with mullions */}
        <rect x="166" y="204" width="34" height="34" rx="5" fill="url(#hh-win)" />
        <rect x="240" y="204" width="34" height="34" rx="5" fill="url(#hh-win)" />
        <line x1="183" y1="204" x2="183" y2="238" stroke="#fff" strokeWidth="2" opacity="0.7" />
        <line x1="166" y1="221" x2="200" y2="221" stroke="#fff" strokeWidth="2" opacity="0.7" />
        <line x1="257" y1="204" x2="257" y2="238" stroke="#fff" strokeWidth="2" opacity="0.7" />
        <line x1="240" y1="221" x2="274" y2="221" stroke="#fff" strokeWidth="2" opacity="0.7" />

        {/* floating currency coins */}
        <motion.g {...float(4, 14)}>
          <circle cx="98" cy="150" r="27" fill="url(#hh-coin)" stroke="#B45309" strokeWidth="2" />
          <text x="98" y="159" textAnchor="middle" fontSize="24" fontWeight="700" fill="#7C2D12">₹</text>
        </motion.g>
        <motion.g {...float(5.5, 18)}>
          <circle cx="384" cy="118" r="23" fill="url(#hh-coin)" stroke="#B45309" strokeWidth="2" />
          <text x="384" y="126" textAnchor="middle" fontSize="20" fontWeight="700" fill="#7C2D12">$</text>
        </motion.g>
        <motion.g {...float(5, 12)}>
          <circle cx="378" cy="280" r="19" fill="url(#hh-coin)" stroke="#B45309" strokeWidth="2" />
          <text x="378" y="287" textAnchor="middle" fontSize="16" fontWeight="700" fill="#7C2D12">€</text>
        </motion.g>

        {/* twinkling sparkles */}
        <motion.path
          d="M120 268 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5 Z"
          fill="#818CF8"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <motion.path
          d="M338 188 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4 Z"
          fill="#FBBF24"
          animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      </motion.svg>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   FeatureArt — small gradient illustration tiles for the value cards.
   ────────────────────────────────────────────────────────────── */
export function FeatureArt({ kind }: { kind: "verdict" | "language" | "country" }) {
  const id = `fa-${kind}`;
  const grads: Record<string, [string, string]> = {
    verdict: ["#34D399", "#059669"],
    language: ["#818CF8", "#4F46E5"],
    country: ["#FBBF24", "#D97706"],
  };
  const [c1, c2] = grads[kind];
  return (
    <motion.svg
      viewBox="0 0 64 64"
      width={56}
      height={56}
      whileHover={{ rotate: -6, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${id})`} />
      {kind === "verdict" && (
        <path d="M20 33 l8 8 l16 -18" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {kind === "language" && (
        <>
          <path d="M16 20 h32 a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-18 l-8 7 v-7 h-6 a4 4 0 0 1 -4 -4 v-14 a4 4 0 0 1 4 -4 Z" fill="#fff" opacity="0.95" />
          <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="800" fill={c2}>Aa</text>
        </>
      )}
      {kind === "country" && (
        <>
          <circle cx="32" cy="32" r="15" fill="none" stroke="#fff" strokeWidth="3.5" />
          <path d="M17 32 h30 M32 17 c8 7 8 23 0 30 M32 17 c-8 7 -8 23 0 30" fill="none" stroke="#fff" strokeWidth="3" />
        </>
      )}
    </motion.svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   EmptyStateArt — friendly illustration for empty lists.
   ────────────────────────────────────────────────────────────── */
export function EmptyStateArt() {
  return (
    <motion.svg
      viewBox="0 0 160 120"
      width={160}
      height={120}
      role="img"
      aria-hidden
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <defs>
        <linearGradient id="es-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EEF2FF" />
          <stop offset="1" stopColor="#C7D2FE" />
        </linearGradient>
        <linearGradient id="es-mark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#818CF8" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="108" rx="54" ry="8" fill="#1E1B4B" opacity="0.08" />
      <rect x="44" y="26" width="72" height="64" rx="12" fill="url(#es-card)" stroke="#A5B4FC" strokeWidth="2" />
      <rect x="56" y="42" width="48" height="6" rx="3" fill="#A5B4FC" />
      <rect x="56" y="56" width="36" height="6" rx="3" fill="#C7D2FE" />
      <motion.path
        d="M96 20 l0 26 l-9 -7 l-9 7 l0 -26 Z"
        fill="url(#es-mark)"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
    </motion.svg>
  );
}
