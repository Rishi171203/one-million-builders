"use client";

import { useId } from "react";
import { Box } from "@mui/material";

// The haus brand mark: an indigo→purple gradient tile holding the white
// "h-roof" monogram (the letter h whose shoulder is a house roof).
// Pure SVG → crisp at any size, works on light and dark. `size` is in px.
export default function HausLogo({ size = 34, title = "haus" }: { size?: number; title?: string }) {
  const raw = useId();
  const gid = `hausg-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <Box
      component="svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      sx={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gid})`} />
      <path
        d="M21 16 V48 M21 32 L32 22 L43 32 V48"
        fill="none"
        stroke="#fff"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  );
}
