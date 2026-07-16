import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { AdmissionStatus } from "../workflow/AdmissionWorkflowContext";
import { useWorkflow } from "../workflow/AdmissionWorkflowContext";

const statusDetails: Record<
  AdmissionStatus,
  {
    label: string;
    description: string;
    color: "info" | "warning" | "success" | "error";
  }
> = {
  AI_PREPARING: {
    label: "Preparing",
    description: "Your admission package is being prepared.",
    color: "info",
  },
  DOCTOR_REVIEW: {
    label: "Doctor review",
    description: "Your doctor is reviewing the clinical note.",
    color: "warning",
  },
  ADMIN_REVIEW: {
    label: "Hospital review",
    description: "The hospital is completing your submission package.",
    color: "warning",
  },
  SUBMITTING_TO_INSURANCE: {
    label: "With insurer",
    description: "Your request has been sent to the insurer.",
    color: "info",
  },
  INSURANCE_REJECTED: {
    label: "Update required",
    description: "The hospital is preparing additional information.",
    color: "warning",
  },
  AI_RESUBMISSION: {
    label: "Updating",
    description: "Your submission is being updated for the insurer.",
    color: "info",
  },
  INSURANCE_APPROVED: {
    label: "Confirmed",
    description: "Your insurer has approved the admission request.",
    color: "success",
  },
  INSURANCE_FINAL_REJECTED: {
    label: "Final decision",
    description: "Contact the hospital to discuss your available options.",
    color: "error",
  },
};

export function PatientAdmissions() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { admissions } = useWorkflow();

  if (!session) return <Navigate to="/login" replace />;

  const patientAdmissions = admissions.filter(
    admission => admission.patientEmail === session.email,
  );

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <Box className="app-page" minHeight="100vh" bgcolor="background.default">
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ maxWidth: 1120, width: "100%", mx: "auto", px: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            Rawat Lawat
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "auto" }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 13, fontWeight: 800 }}>
              {session.name[0]}
            </Avatar>
            <Typography variant="body2" fontWeight={700} sx={{ display: { xs: "none", sm: "block" } }}>
              {session.name}
            </Typography>
            <IconButton aria-label="Sign out" onClick={handleSignOut}>
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
        <Stack
          className="motion-enter"
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em">
              Patient portal
            </Typography>
            <Typography variant="h4" mt={0.5}>
              My admissions
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Follow active requests and return whenever you need an update.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/upload/identity")}
          >
            Start new admission
          </Button>
        </Stack>

        {patientAdmissions.length === 0 ? (
          <Card className="motion-card motion-enter motion-enter-delay-1" variant="outlined" sx={{ mt: 4 }}>
            <CardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: "center" }}>
              <Avatar variant="rounded" sx={{ width: 54, height: 54, mx: "auto", bgcolor: "primary.50", color: "primary.main" }}>
                <AssignmentOutlinedIcon />
              </Avatar>
              <Typography variant="h6" mt={2}>
                No admissions yet
              </Typography>
              <Typography color="text.secondary" mt={1}>
                Prepare your identity and coverage details to begin a request.
              </Typography>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/upload/identity")} sx={{ mt: 3 }}>
                Start your first admission
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2} mt={4}>
            {patientAdmissions.map((admission, index) => {
              const status = statusDetails[admission.status];

              return (
                <Card
                  key={admission.id}
                  className={`motion-card motion-enter motion-enter-delay-${Math.min(index + 1, 4)}`}
                  variant="outlined"
                >
                  <CardContent sx={{ p: { xs: 3, sm: 3.5 } }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                      <Box>
                        <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1}>
                          <Typography variant="h6" fontWeight={700}>
                            {admission.name}
                          </Typography>
                          <Chip label={status.label} color={status.color} size="small" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          Reference: {admission.medicalRecordNumber}
                        </Typography>
                        <Typography variant="body2" mt={2}>
                          {status.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          {admission.insurer || "Insurer not specified"} · {admission.requestedAt}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        endIcon={<ArrowForwardRoundedIcon />}
                        onClick={() => navigate(`/admission/${admission.id}/status`)}
                        sx={{ alignSelf: { xs: "stretch", sm: "center" }, flexShrink: 0 }}
                      >
                        View status
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
