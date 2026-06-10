"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Box, Container, Typography, IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { HOME_GALLERY, unsplashUrl, type HomePhoto } from "@/lib/photos";

const MotionBox = motion.create(Box);

// Bento spans (md and up, 4-column grid). Mirrors the Magic-MCP bento layout,
// rebuilt for MUI so the first home is the showpiece.
const SPANS = [
  { gridColumn: "span 2", gridRow: "span 2" },
  { gridColumn: "span 2", gridRow: "span 1" },
  { gridColumn: "span 1", gridRow: "span 1" },
  { gridColumn: "span 1", gridRow: "span 1" },
  { gridColumn: "span 2", gridRow: "span 1" },
  { gridColumn: "span 2", gridRow: "span 1" },
];

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const tileVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 90, damping: 16 } },
};

function GalleryTile({ photo, index, onOpen }: { photo: HomePhoto; index: number; onOpen: () => void }) {
  const reduce = useReducedMotion();
  return (
    <MotionBox
      variants={tileVariants}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      tabIndex={0}
      role="button"
      aria-label={`View ${photo.alt}, ${photo.city}`}
      sx={{
        gridColumn: { xs: index === 0 ? "span 2" : "span 1", md: SPANS[index % SPANS.length].gridColumn },
        gridRow: { xs: "span 1", md: SPANS[index % SPANS.length].gridRow },
        position: "relative",
        minHeight: { xs: 150, md: 0 },
        borderRadius: 4,
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 6px 20px rgba(15,23,42,0.10)",
        "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main", outlineOffset: 2 },
        "&:hover img": { transform: "scale(1.07)" },
        "&:hover .home-caption": { transform: "translateY(0)", opacity: 1 },
        "&:hover .home-scrim": { opacity: 1 },
      }}
    >
      <Image
        src={unsplashUrl(photo.id, 1200)}
        alt={photo.alt}
        fill
        sizes="(max-width: 600px) 50vw, (max-width: 900px) 50vw, 33vw"
        style={{ objectFit: "cover", transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)" }}
      />
      {/* gradient scrim — subtle always, stronger on hover */}
      <Box
        className="home-scrim"
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(2,6,23,0.78) 0%, rgba(2,6,23,0.28) 45%, transparent 75%)",
          opacity: 0.85,
          transition: "opacity 400ms ease",
          pointerEvents: "none",
        }}
      />
      <Box
        className="home-caption"
        sx={{
          position: "absolute",
          left: 16,
          bottom: 14,
          right: 16,
          color: "#fff",
          transform: "translateY(6px)",
          opacity: 0.95,
          transition: "transform 400ms ease, opacity 400ms ease",
          pointerEvents: "none",
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
          {photo.flag}&nbsp; {photo.city}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          Real homes, real numbers
        </Typography>
      </Box>
    </MotionBox>
  );
}

export default function RealHomesGallery() {
  const [active, setActive] = useState<HomePhoto | null>(null);

  return (
    <Box sx={{ py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 5 } }}>
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            Real homes, in{" "}
            <Box
              component="span"
              sx={{ background: "linear-gradient(120deg,#4F46E5,#9333EA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              five countries
            </Box>
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 560, mx: "auto" }}>
            From Bengaluru to Berlin, haus speaks your market — local prices, rates, and down-payment norms. Tap any home to take a closer look.
          </Typography>
        </Box>

        <MotionBox
          variants={gridContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gridAutoRows: { md: "150px" },
            gap: 2,
          }}
        >
          {HOME_GALLERY.map((photo, i) => (
            <GalleryTile key={photo.id} photo={photo} index={i} onOpen={() => setActive(photo)} />
          ))}
        </MotionBox>
      </Container>

      {/* Lightbox — Magic-MCP-inspired click-to-expand */}
      <AnimatePresence>
        {active && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 1400,
              display: "grid",
              placeItems: "center",
              p: 2,
              bgcolor: "rgba(2,6,23,0.82)",
              backdropFilter: "blur(6px)",
            }}
          >
            <IconButton
              onClick={() => setActive(null)}
              aria-label="Close image"
              sx={{ position: "absolute", top: 16, right: 16, color: "#fff", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.24)" } }}
            >
              <CloseRoundedIcon />
            </IconButton>
            <MotionBox
              initial={{ scale: 0.92, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 18 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              sx={{ position: "relative", width: "min(92vw, 1000px)", aspectRatio: "3 / 2", borderRadius: 4, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
            >
              <Image src={unsplashUrl(active.id, 1600)} alt={active.alt} fill sizes="92vw" style={{ objectFit: "cover" }} />
              <Box sx={{ position: "absolute", left: 20, bottom: 16, color: "#fff", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.3rem" }}>
                  {active.flag}&nbsp; {active.city}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>{active.alt}</Typography>
              </Box>
            </MotionBox>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
