import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";
import { AuthScreen } from "./components/AuthScreen";
import {
  ConfirmationStep,
  IdentityStep,
  PolicyStep,
} from "./components/OnboardingSteps";
import { Progress } from "./components/Progress";
import { SuccessModal } from "./components/SuccessModal";
import { HospitalAdminDashboard } from "./components/admin/HospitalAdminDashboard";
import { AdminPatientQueue } from "./components/admin/AdminPatientQueue";
import { pendingPatients } from "./data/pendingPatients";
import { emptyIdentity, emptyPolicy } from "./types/onboarding";
import { ProtectedRoute } from "./routes/ProtectedRoute";

function UploadLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signOut } = useAuth();
  const [identity, setIdentity] = useState(emptyIdentity);
  const [policy, setPolicy] = useState(emptyPolicy);
  const [identityImage, setIdentityImage] = useState("");
  const [policyImage, setPolicyImage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const step = location.pathname.includes("/policy")
    ? 2
    : location.pathname.includes("/review")
      ? 3
      : 1;
  const reset = () => {
    setSubmitted(false);
    setIdentity(emptyIdentity);
    setPolicy(emptyPolicy);
    setIdentityImage("");
    setPolicyImage("");
    setConsent(false);
    navigate("/upload/identity");
  };

  return (
    <Box minHeight="100vh" bgcolor="background.default" pb={{ xs: 4, sm: 8 }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "rgba(246,248,252,.94)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1440,
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3 },
          }}
        >
          <IconButton
            aria-label="Go back"
            color="primary"
            onClick={() =>
              step > 1 &&
              navigate(step === 2 ? "/upload/identity" : "/upload/policy")
            }
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography
            variant="h6"
            fontWeight={800}
            color="primary.main"
            sx={{ ml: 1 }}
          >
            Rawat Lawat
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ ml: "auto" }}
          >
            <LockOutlinedIcon fontSize="small" color="primary" />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Private & secure
            </Typography>
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: "primary.light",
                color: "white",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {session?.name?.[0] ?? "U"}
            </Avatar>
            <IconButton
              aria-label="Sign out"
              size="small"
              onClick={() => {
                signOut();
                navigate("/login");
              }}
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ pt: { xs: 4, sm: 7 } }}>
        <Progress step={step} />
        <Routes>
          <Route
            path="identity"
            element={
              <IdentityStep
                identity={identity}
                setIdentity={setIdentity}
                image={identityImage}
                setImage={setIdentityImage}
                onNext={() => navigate("/upload/policy")}
              />
            }
          />
          <Route
            path="policy"
            element={
              <PolicyStep
                policy={policy}
                setPolicy={setPolicy}
                image={policyImage}
                setImage={setPolicyImage}
                onBack={() => navigate("/upload/identity")}
                onNext={() => navigate("/upload/review")}
              />
            }
          />
          <Route
            path="review"
            element={
              <ConfirmationStep
                identity={identity}
                policy={policy}
                identityImage={identityImage}
                policyImage={policyImage}
                consent={consent}
                setConsent={setConsent}
                onBack={() => navigate("/upload/policy")}
                onSubmit={() => setSubmitted(true)}
              />
            }
          />
          <Route path="*" element={<Navigate to="identity" replace />} />
        </Routes>
      </Container>
      <SuccessModal open={submitted} identity={identity} onClose={reset} />
    </Box>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthScreen />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/upload/*" element={<UploadLayout />} />
      </Route>
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin/gl-process" element={<AdminPatientQueue />} />
        <Route
          path="/admin/gl-process/:patientId"
          element={<PatientGlProcess />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/upload/identity" replace />} />
    </Routes>
  );
}

function PatientGlProcess() {
  const { patientId } = useParams();
  const patient = pendingPatients.find(item => item.id === patientId);

  return patient ? (
    <HospitalAdminDashboard patient={patient} />
  ) : (
    <Navigate to="/admin/gl-process" replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
