"use client";
import { createTheme } from "@mui/material/styles";

// haus design system → MUI theme. Seed: Indigo #4F46E5. Premium & polished.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4F46E5", dark: "#4338CA", light: "#E0E7FF", contrastText: "#FFFFFF" },
    success: { main: "#16A34A" },
    warning: { main: "#D97706" },
    error: { main: "#DC2626" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#475569" },
    divider: "#E2E8F0",
  },
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
    MuiButton: {
      styleOverrides: { root: { borderRadius: 12, padding: "12px 22px", fontSize: "0.95rem" } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: {
      styleOverrides: {
        root: { border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" },
      },
    },
  },
});

export default theme;
