"use client";

import { Box, Typography } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { unsplashUrl, type HomePhoto } from "@/lib/photos";

// A cinematic dashboard hero: a slow Ken-Burns home photo behind a brand-gradient
// scrim, with an eyebrow, title, subtitle and an optional actions/children slot.
export default function DashboardHero({
  photo,
  eyebrow,
  title,
  subtitle,
  children,
  height = { xs: 230, md: 300 },
}: {
  photo: HomePhoto;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  height?: number | { xs: number; md: number };
}) {
  const reduce = useReducedMotion();
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 6,
        border: "1px solid",
        borderColor: "divider",
        height,
        boxShadow: "0 26px 60px rgba(2,6,23,0.22)",
      }}
    >
      <motion.div
        aria-hidden
        animate={reduce ? {} : { scale: [1, 1.09] }}
        transition={{ duration: 22, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Image
          src={unsplashUrl(photo.id, 1600)}
          alt={photo.alt}
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          style={{ objectFit: "cover" }}
        />
      </motion.div>
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, rgba(49,46,129,0.92), rgba(76,29,149,0.78) 55%, rgba(76,29,149,0.4))",
        }}
      />
      <Box sx={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", p: { xs: 3, md: 5 }, color: "#fff" }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {eyebrow && (
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.85)", letterSpacing: 1.5 }}>
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h3" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ color: "rgba(255,255,255,0.9)", mt: 1, maxWidth: 560 }}>{subtitle}</Typography>
          )}
          {children && <Box sx={{ mt: 2.5 }}>{children}</Box>}
        </motion.div>
      </Box>
    </Box>
  );
}
