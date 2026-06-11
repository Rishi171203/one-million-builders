"use client";

import { Paper, Box, Typography } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import CountUp from "./CountUp";

// A premium stat card: gradient icon badge, count-up value, label + optional sub.
export default function StatCard({
  icon,
  value,
  suffix = "",
  label,
  sub,
  delay = 0,
}: {
  icon: ReactNode;
  value: number;
  suffix?: string;
  label: string;
  sub?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: "100%" }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: "100%",
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(148,163,184,0.06)",
          backdropFilter: "blur(8px)",
          transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
          "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(79,70,229,0.16)", borderColor: "primary.main" },
        }}
      >
        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: "grid", placeItems: "center", color: "#fff", background: "linear-gradient(135deg,#4F46E5,#9333EA)", mb: 1.5 }}>
          {icon}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, background: "linear-gradient(120deg,#4F46E5,#9333EA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
          <CountUp to={value} suffix={suffix} />
        </Typography>
        <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{label}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Paper>
    </motion.div>
  );
}
