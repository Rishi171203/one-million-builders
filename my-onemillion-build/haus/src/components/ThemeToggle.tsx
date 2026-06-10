"use client";
import { IconButton, Tooltip } from "@mui/material";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import { useColorMode } from "@/app/providers";

export default function ThemeToggle() {
  const { mode, toggle } = useColorMode();
  return (
    <Tooltip title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
      <IconButton
        onClick={toggle}
        color="inherit"
        aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
        sx={{ transition: "transform 200ms ease", "&:hover": { transform: "rotate(20deg)" } }}
      >
        {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}
