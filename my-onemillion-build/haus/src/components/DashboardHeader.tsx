"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppBar, Toolbar, Box, Typography, Button, Stack, Chip } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { createClient } from "@/lib/supabase/client";

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
        bgcolor: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box component={Link} href="/" sx={{ width: 34, height: 34, borderRadius: 2, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#4F46E5,#7C73FF)", color: "#fff" }}>
            <HomeRoundedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
            haus<Box component="span" sx={{ color: "primary.main" }}>.</Box>
          </Typography>
          <Chip label={roleLabel} size="small" sx={{ ml: 1, bgcolor: "primary.light", color: "primary.dark", fontWeight: 600 }} />
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {email}
          </Typography>
          <Button variant="outlined" size="small" onClick={logout}>Log out</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
