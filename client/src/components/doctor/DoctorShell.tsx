import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { AppBar, Avatar, Box, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export function DoctorShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Box className="app-page" minHeight="100vh" bgcolor="background.default">
      <AppBar className="motion-header" position="sticky" color="inherit" elevation={0}>
        <Toolbar
          sx={{
            maxWidth: "lg",
            width: "100%",
            mx: "auto",
            px: { xs: 2.5, lg: 5 },
          }}
        >
          <Box>
            <Typography color="primary" fontWeight={800}>
              Rawat Lawat
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Doctor workspace
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ ml: "auto" }}>
            <Avatar
              className="floating-avatar"
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.light",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {session?.name?.[0] ?? "D"}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                {session?.name ?? "Doctor"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Clinician
              </Typography>
            </Box>
            <IconButton
              aria-label="Sign out"
              onClick={handleSignOut}
              size="small"
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
}
