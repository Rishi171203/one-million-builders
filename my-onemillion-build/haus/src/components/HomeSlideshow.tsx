"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Stack, IconButton } from "@mui/material";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { HOME_GALLERY, unsplashUrl } from "@/lib/photos";

// A cinematic, auto-advancing slideshow of real homes with a slow "Ken Burns"
// zoom and crossfade. Pauses on hover, supports manual controls + dots, and
// fully respects prefers-reduced-motion (no auto-play, no zoom).
export default function HomeSlideshow() {
  const reduce = useReducedMotion();
  const n = HOME_GALLERY.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = (d: number) => setI((p) => (p + d + n) % n);

  useEffect(() => {
    if (paused || reduce) return;
    const t = window.setInterval(() => setI((p) => (p + 1) % n), 4200);
    return () => window.clearInterval(t);
  }, [paused, reduce, n]);

  const photo = HOME_GALLERY[i];

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: { xs: "4 / 3", sm: "16 / 9", md: "21 / 9" },
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 30px 70px rgba(2,6,23,0.30)",
      }}
    >
      <AnimatePresence>
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: reduce ? 1 : 1.0 }}
          animate={{ opacity: 1, scale: reduce ? 1 : 1.12 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.0, ease: "easeInOut" }, scale: { duration: 6, ease: "easeOut" } }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Image src={unsplashUrl(photo.id, 1800)} alt={photo.alt} fill sizes="100vw" style={{ objectFit: "cover" }} />
        </motion.div>
      </AnimatePresence>

      {/* legibility scrim */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(2,6,23,0.66), rgba(2,6,23,0.05) 55%, transparent)",
          pointerEvents: "none",
        }}
      />

      {/* caption */}
      <Box sx={{ position: "absolute", left: { xs: 16, md: 28 }, bottom: { xs: 16, md: 26 }, color: "#fff", zIndex: 2 }}>
        <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>
          Real homes · real answers
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, textShadow: "0 2px 18px rgba(0,0,0,0.5)" }}>
          {photo.flag}&nbsp;{photo.city}
        </Typography>
      </Box>

      {/* prev / next */}
      <Stack
        direction="row"
        sx={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "space-between", px: { xs: 0.5, md: 1.5 }, zIndex: 2 }}
      >
        {[
          { d: -1, icon: <ChevronLeftRoundedIcon />, label: "Previous home" },
          { d: 1, icon: <ChevronRightRoundedIcon />, label: "Next home" },
        ].map((b) => (
          <IconButton
            key={b.label}
            aria-label={b.label}
            onClick={() => go(b.d)}
            sx={{
              color: "#fff",
              bgcolor: "rgba(15,23,42,0.4)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              "&:hover": { bgcolor: "rgba(15,23,42,0.6)" },
            }}
          >
            {b.icon}
          </IconButton>
        ))}
      </Stack>

      {/* dots */}
      <Stack direction="row" spacing={1} sx={{ position: "absolute", bottom: 14, right: { xs: 16, md: 28 }, zIndex: 2 }}>
        {HOME_GALLERY.map((p, idx) => (
          <Box
            key={p.id}
            component="button"
            aria-label={`Go to ${p.city}`}
            onClick={() => setI(idx)}
            sx={{
              width: idx === i ? 26 : 9,
              height: 9,
              p: 0,
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              transition: "width 300ms ease, background-color 300ms ease",
              bgcolor: idx === i ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
