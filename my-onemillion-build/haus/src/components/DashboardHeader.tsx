"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppBar, Toolbar, Box, Typography, Button, Stack, Chip } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "./ThemeToggle";
import HausLogo from "./HausLogo";

export default function DashboardHeader({ email, role }: { email: string; role: string }) {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const roleLabel = role === "owner" ? "Homeowner" : role === "admin" ? "Builder" : "Homebuyer";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: (t) => (t.palette.mode === "light" ? "rgba(255,255,255,0.72)" : "rgba(11,16,32,0.72)"),
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box component={Link} href="/" sx={{ display: "inline-flex", lineHeight: 0 }}>
            <HausLogo size={34} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
            haus<Box component="span" sx={{ color: "primary.main" }}>.</Box>
          </Typography>
          <Chip label={roleLabel} size="small" sx={{ ml: 1, bgcolor: "primary.light", color: "primary.dark", fontWeight: 600 }} />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {role === "admin" && (
            <Stack direction="row" spacing={0.5} sx={{ mr: 0.5 }}>
              <Button component={Link} href="/admin" variant="text" size="small" sx={{ textTransform: "none" }}>Builder</Button>
              <Button component={Link} href="/owner" variant="text" size="small" sx={{ textTransform: "none" }}>Homeowner tools</Button>
            </Stack>
          )}
          {role === "owner" && (
            <Button component={Link} href="/owner" variant="text" size="small" sx={{ textTransform: "none", mr: 0.5 }}>My tools</Button>
          )}
          <Typography
            component={Link}
            href="/profile"
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", md: "block" }, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", "&:hover": { color: "primary.main", textDecoration: "underline" } }}
          >
            {email}
          </Typography>
          <ThemeToggle />
          <Button variant="outlined" size="small" onClick={logout}>Log out</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
