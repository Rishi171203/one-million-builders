"use client";
import { createTheme, type Theme, type ThemeOptions } from "@mui/material/styles";

export type Mode = "light" | "dark";

// Shared across both modes: shape, typography, component shapes.
const shared: ThemeOptions = {
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    h1: { fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, letterSpacing: "-1.5px" },
    h2: { fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, letterSpacing: "-0.8px" },
    h3: { fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, letterSpacing: "-0.5px" },
    h4: { fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700 },
    h5: { fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700 },
    h6: { fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700 },
    button: { fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme: Theme) => ({
        body: {
          colorScheme: theme.palette.mode,
          backgroundAttachment: "fixed",
          background:
            theme.palette.mode === "light"
              ? "radial-gradient(1100px 520px at 100% -10%, #eef2ff 0%, rgba(238,242,255,0) 60%), radial-gradient(820px 460px at -10% 8%, #f5f3ff 0%, rgba(245,243,255,0) 55%), #f8fafc"
              : "radial-gradient(1100px 520px at 100% -10%, rgba(79,70,229,0.14) 0%, rgba(79,70,229,0) 60%), radial-gradient(820px 460px at -10% 8%, rgba(147,51,234,0.12) 0%, rgba(147,51,234,0) 55%), #0A0E1A",
        },
      }),
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 22px",
          fontSize: "0.95rem",
          transition: "transform 150ms ease, box-shadow 200ms ease, background-color 200ms ease",
          "&:active": { transform: "scale(0.97)" },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === "light" ? "0 1px 3px rgba(15,23,42,0.06)" : "none",
        }),
      },
    },
  },
};

// Indigo brand seed #4F46E5, kept for both modes (lightened on dark for contrast).
const light: ThemeOptions["palette"] = {
  mode: "light",
  primary: { main: "#4F46E5", dark: "#4338CA", light: "#E0E7FF", contrastText: "#FFFFFF" },
  success: { main: "#16A34A" },
  warning: { main: "#D97706" },
  error: { main: "#DC2626" },
  background: { default: "#F8FAFC", paper: "#FFFFFF" },
  text: { primary: "#0F172A", secondary: "#475569" },
  divider: "#E2E8F0",
};

const dark: ThemeOptions["palette"] = {
  mode: "dark",
  primary: { main: "#818CF8", dark: "#6366F1", light: "#312E81", contrastText: "#0B1020" },
  success: { main: "#22C55E" },
  warning: { main: "#F59E0B" },
  error: { main: "#F87171" },
  background: { default: "#0A0E1A", paper: "#131A2C" },
  text: { primary: "#F1F5F9", secondary: "#94A3B8" },
  divider: "rgba(148,163,184,0.18)",
};

export function getTheme(mode: Mode): Theme {
  return createTheme({ ...shared, palette: mode === "dark" ? dark : light });
}

export default getTheme("light");
