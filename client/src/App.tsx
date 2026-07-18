import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  CircularProgress,
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
import { PatientAdmissionTracker } from "./components/PatientAdmissionTracker";
import { PatientAdmissions } from "./components/PatientAdmissions";
import { PatientSupportOptions } from "./components/PatientSupportOptions";
import { HospitalAdminDashboard } from "./components/admin/HospitalAdminDashboard";
import { AdminPatientQueue } from "./components/admin/AdminPatientQueue";
import { PolicyVault } from "./components/admin/PolicyVault";
import { AdminAnalyticsDashboard } from "./components/admin/AdminAnalyticsDashboard";
import { HospitalPatientRegistry } from "./components/admin/HospitalPatientRegistry";
import { DoctorNoteReview } from "./components/doctor/DoctorNoteReview";
import { DoctorReviewQueue } from "./components/doctor/DoctorReviewQueue";
import { InsuranceClaimReview } from "./components/insurance/InsuranceClaimReview";
import { emptyIdentity, emptyPolicy } from "./types/onboarding";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { WorkflowProvider, useWorkflow } from "./workflow/AdmissionWorkflowContext";

function UploadLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signOut } = useAuth();
  const { saveProfile } = useWorkflow();
  const [identity, setIdentity] = useState(emptyIdentity);
  const [policy, setPolicy] = useState(emptyPolicy);
  const [identityImage, setIdentityImage] = useState("");
  const [policyImage, setPolicyImage] = useState("");
  const [consent, setConsent] = useState(false);
  const step = location.pathname.includes("/policy")
    ? 2
    : location.pathname.includes("/review")
      ? 3
      : 1;
  return (
    <Box className="app-page" minHeight="100vh" bgcolor="background.default" pb={{ xs: 4, sm: 8 }}>
      <AppBar
        className="motion-header"
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
              navigate(
                step === 1
                  ? "/patient/admissions"
                  : step === 2
                    ? "/upload/identity"
                    : "/upload/policy",
              )
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
              onClick={async () => {
                await signOut();
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
                onSubmit={() => {
                  if (!session) return;

                  saveProfile({
                    identity,
                    policy,
                    patientEmail: session.email,
                  });
                  navigate("/patient/admissions");
                }}
              />
            }
          />
          <Route path="*" element={<Navigate to="identity" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}

function AppRoutes() {
  const { loading } = useAuth();

  // Hold routing until the persisted session is restored, so protected routes
  // don't briefly bounce to the login screen on a hard refresh.
  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="grid"
        sx={{ placeItems: "center" }}
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<RoleLanding />} />
      <Route path="/login" element={<AuthScreen />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/upload/*" element={<UploadLayout />} />
      </Route>
      <Route element={<ProtectedRoute roles={["user"]} />}>
        <Route path="/patient/admissions" element={<PatientAdmissions />} />
        <Route
          path="/admission/:admissionId/status"
          element={<PatientAdmissionTracker />}
        />
        <Route
          path="/admission/:admissionId/support"
          element={<PatientSupportOptions />}
        />
      </Route>
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin/gl-process" element={<AdminPatientQueue />} />
        <Route path="/admin/policy-vault" element={<PolicyVault />} />
        <Route path="/admin/patients" element={<HospitalPatientRegistry />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsDashboard />} />
        <Route
          path="/admin/gl-process/:patientId"
          element={<PatientGlProcess />}
        />
      </Route>
      <Route element={<ProtectedRoute roles={["doctor"]} />}>
        <Route path="/doctor/admissions" element={<DoctorReviewQueue />} />
        <Route path="/doctor/admissions/:patientId" element={<DoctorNoteReview />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route
          path="/insurance/review/:patientId"
          element={<InsuranceClaimReview />}
        />
      </Route>
      <Route path="*" element={<RoleLanding />} />
    </Routes>
  );
}

function RoleLanding() {
  const { session } = useAuth();

  if (!session) return <Navigate to="/login" replace />;
  if (session.role === "admin") {
    return <Navigate to="/admin/gl-process" replace />;
  }
  if (session.role === "doctor") {
    return <Navigate to="/doctor/admissions" replace />;
  }
  return <Navigate to="/patient/admissions" replace />;
}

function PatientGlProcess() {
  const { patientId } = useParams();
  const { admissions } = useWorkflow();
  const patient = admissions.find(item => item.id === patientId);

  return patient ? (
    <HospitalAdminDashboard patient={patient} />
  ) : (
    <Navigate to="/admin/gl-process" replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkflowProvider>
        <AppRoutes />
      </WorkflowProvider>
    </AuthProvider>
  );
}
