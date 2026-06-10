import Link from "next/link";
import { redirect } from "next/navigation";
import { Container, Box, Typography, Paper, Stack, Chip, Avatar, Button, Divider } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "buyer";

  const email = user.email ?? "";
  const initials = (email[0] ?? "h").toUpperCase();
  const roleLabel = role === "owner" ? "Homeowner" : role === "admin" ? "Builder" : "Homebuyer";
  const homePath = role === "owner" ? "/owner" : role === "admin" ? "/admin" : "/dashboard";
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const provider = user.app_metadata?.provider ?? "email";

  return (
    <>
      <DashboardHeader email={email} role={role} />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Your profile</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Your account details with haus.</Typography>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
            <Avatar sx={{ width: 64, height: 64, fontSize: "1.6rem", fontWeight: 800, background: "linear-gradient(135deg,#4F46E5,#9333EA)" }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>{email}</Typography>
              <Chip label={roleLabel} size="small" sx={{ mt: 0.5, fontWeight: 700, bgcolor: "primary.light", color: "primary.dark" }} />
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            {[
              { k: "Email", v: email },
              { k: "Account type", v: roleLabel },
              { k: "Signed in with", v: provider === "google" ? "Google" : "Email & password" },
              { k: "Member since", v: memberSince },
            ].map((row) => (
              <Stack key={row.k} direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">{row.k}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis" }}>{row.v}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        <Button component={Link} href={homePath} variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 3 }}>
          Go to my dashboard
        </Button>
      </Container>
    </>
  );
}
