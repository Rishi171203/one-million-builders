"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme, type Mode } from "./theme";

const ColorModeContext = createContext<{ mode: Mode; toggle: () => void }>({
  mode: "light",
  toggle: () => {},
});

// Any component can read the current mode and flip it.
export const useColorMode = () => useContext(ColorModeContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");

  // On first load, restore the saved choice (or follow the OS preference).
  useEffect(() => {
    const saved = localStorage.getItem("haus-theme") as Mode | null;
    if (saved === "light" || saved === "dark") setMode(saved);
    else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) setMode("dark");
  }, []);

  const value = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((m) => {
          const next: Mode = m === "light" ? "dark" : "light";
          localStorage.setItem("haus-theme", next);
          return next;
        }),
    }),
    [mode]
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
