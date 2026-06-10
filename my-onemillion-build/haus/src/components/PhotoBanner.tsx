"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Box, Typography } from "@mui/material";
import { unsplashUrl, type HomePhoto } from "@/lib/photos";

const MotionBox = motion.create(Box);

/**
 * A rounded, full-bleed cover photo banner with a brand gradient scrim and an
 * optional title/subtitle. Reused on the auth and dashboard layers so real
 * imagery shows up consistently without re-implementing the markup each time.
 */
export default function PhotoBanner({
  photo,
  height = 180,
  title,
  subtitle,
  rounded = 4,
  priority = false,
}: {
  photo: HomePhoto;
  height?: number | { xs: number; md: number };
  title?: string;
  subtitle?: string;
  rounded?: number;
  priority?: boolean;
}) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: rounded,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 10px 30px rgba(79,70,229,0.16)",
      }}
    >
      <Image
        src={unsplashUrl(photo.id, 1400)}
        alt={photo.alt}
        fill
        sizes="(max-width: 900px) 100vw, 800px"
        // Above the fold on auth/dashboard → load eagerly when asked.
        {...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
        style={{ objectFit: "cover" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, rgba(79,70,229,0.55) 0%, rgba(147,51,234,0.35) 50%, rgba(2,6,23,0.45) 100%)",
          pointerEvents: "none",
        }}
      />
      {(title || subtitle) && (
        <Box sx={{ position: "absolute", left: 20, bottom: 16, right: 20, color: "#fff", pointerEvents: "none" }}>
          {title && (
            <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.15rem", md: "1.35rem" }, textShadow: "0 1px 10px rgba(0,0,0,0.4)" }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" sx={{ opacity: 0.9, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
    </MotionBox>
  );
}
