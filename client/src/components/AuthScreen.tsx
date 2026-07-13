import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  // Chip,
  Container,
  FormControlLabel,
  InputAdornment,
  Link,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
// import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type Mode = "signIn" | "signUp";

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUp = mode === "signUp";
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/upload/identity";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isSignUp && !name.trim())
      return setError("Enter your full name to continue.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setError("Enter a valid email address.");
    if (password.length < 8)
      return setError("Use a password with at least 8 characters.");
    if (isSignUp && !termsAccepted)
      return setError("Accept the terms to continue.");
    signIn({
      name: isSignUp ? name.trim() : email.split("@")[0],
      email,
      role: email.toLowerCase().startsWith("admin") ? "admin" : "user",
    });
    navigate(redirectTo, { replace: true });
  };

  return (
    <Box className="auth-page">
      <Box className="auth-orb auth-orb-one" />
      <Box className="auth-orb auth-orb-two" />
      <Box className="auth-grid" />
      <Container maxWidth="lg" className="auth-shell">
        <Box className="auth-showcase">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            className="auth-brand"
          >
            <Box className="auth-brand-mark">
              <HealthAndSafetyOutlinedIcon />
            </Box>
            <Typography fontWeight={800} letterSpacing="-.04em">
              Admission Accelerator
            </Typography>
          </Stack>
          <Box className="auth-copy">
            {/* <Chip
              icon={<VerifiedUserOutlinedIcon />}
              label="Private by design"
              className="auth-chip"
            /> */}
            <Typography className="auth-headline">
              A calmer way to arrive prepared.
            </Typography>
            <Typography className="auth-subhead">
              Keep your identity and coverage information in one secure,
              patient-controlled flow.
            </Typography>
          </Box>
          <Box className="auth-orbit" aria-hidden="true">
            <Box className="auth-orbit-ring auth-orbit-ring-one" />
            <Box className="auth-orbit-ring auth-orbit-ring-two" />
            <Box className="auth-orbit-core">
              <HealthAndSafetyOutlinedIcon />
            </Box>
            <Box className="auth-orbit-dot auth-orbit-dot-one" />
            <Box className="auth-orbit-dot auth-orbit-dot-two" />
            <Box className="auth-orbit-dot auth-orbit-dot-three" />
          </Box>
          <Stack direction="row" spacing={3} className="auth-trust">
            <Typography variant="body2">
              <b>Encrypted</b>
              <br />
              in your browser
            </Typography>
            <Typography variant="body2">
              <b>In your control</b>
              <br />
              at every step
            </Typography>
          </Stack>
        </Box>

        <Box className="auth-form-wrap">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            className="auth-mobile-brand"
          >
            <Box className="auth-brand-mark">
              <HealthAndSafetyOutlinedIcon />
            </Box>
            <Typography fontWeight={800}>Admission Accelerator</Typography>
          </Stack>
          <Card className="auth-card" elevation={0}>
            <Box className="auth-card-accent" />
            <Box p={{ xs: 3, sm: 4 }}>
              <Typography
                variant="overline"
                color="primary.main"
                fontWeight={800}
                letterSpacing=".12em"
              >
                SECURE PATIENT PORTAL
              </Typography>
              <Typography variant="h4" mt={0.75}>
                {isSignUp ? "Set up your secure space" : "Welcome back"}
              </Typography>
              <Typography color="text.secondary" mt={1} mb={3.25}>
                {isSignUp
                  ? "A few details, then your documents are ready to review."
                  : "Sign in to continue your admission preparation."}
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                fullWidth
                size="small"
                onChange={(_, next) => next && (setMode(next), setError(""))}
                className="auth-toggle"
              >
                <ToggleButton value="signIn">Sign in</ToggleButton>
                <ToggleButton value="signUp">Create account</ToggleButton>
              </ToggleButtonGroup>
              <Stack
                component="form"
                spacing={2.25}
                onSubmit={submit}
                mt={3}
                key={mode}
                className="auth-fields"
              >
                {isSignUp && (
                  <TextField
                    label="Full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                <TextField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  helperText="Use at least 8 characters"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                {isSignUp && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAccepted}
                        onChange={(event) =>
                          setTermsAccepted(event.target.checked)
                        }
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the <Link href="#">Terms of Service</Link>{" "}
                        and <Link href="#">Privacy Policy</Link>.
                      </Typography>
                    }
                  />
                )}
                {error && <Alert severity="error">{error}</Alert>}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  className="auth-submit"
                >
                  {isSignUp ? "Create secure account" : "Continue securely"}
                </Button>
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                textAlign="center"
                mt={3}
              >
                Demo session: start your email with <b>admin</b> to test the
                future admin role.
              </Typography>
            </Box>
          </Card>
          <Typography variant="caption" className="auth-footer">
            <LockOutlinedIcon fontSize="inherit" /> Your information is
            encrypted and stays under your control.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
