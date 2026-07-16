import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { AdmissionStatus } from "../workflow/AdmissionWorkflowContext";
import { useWorkflow } from "../workflow/AdmissionWorkflowContext";
import { PatientName } from "./PatientName";

const progressSteps = [
  "Details received",
  "AI preparing package",
  "Doctor review",
  "Hospital review",
  "Insurance decision",
  "Admission confirmed",
];

type PatientStatus = {
  activeStep: number;
  heading: string;
  detail: string;
  chipColor: "info" | "warning" | "success" | "error";
};

const patientStatus: Record<AdmissionStatus, PatientStatus> = {
  AI_PREPARING: {
    activeStep: 1,
    heading: "We’re preparing your admission package",
    detail: "Our AI assistant is checking the information you provided and preparing the documents needed for review.",
    chipColor: "info",
  },
  DOCTOR_REVIEW: {
    activeStep: 2,
    heading: "Your doctor is reviewing the clinical note",
    detail: "The admission note is ready for the doctor’s review and electronic signature.",
    chipColor: "warning",
  },
  ADMIN_REVIEW: {
    activeStep: 3,
    heading: "Your hospital is completing the package",
    detail: "The hospital administrator is performing the final review before submitting your request to the insurer.",
    chipColor: "warning",
  },
  SUBMITTING_TO_INSURANCE: {
    activeStep: 4,
    heading: "Your request has been sent to the insurer",
    detail: "The insurer is reviewing the submitted admission package. We’ll update this page when a decision is received.",
    chipColor: "info",
  },
  INSURANCE_REJECTED: {
    activeStep: 3,
    heading: "We’re updating your admission package",
    detail: "The insurer requested additional information. Our AI assistant is preparing the update for the hospital to review.",
    chipColor: "warning",
  },
  AI_RESUBMISSION: {
    activeStep: 3,
    heading: "We’re preparing an update for the insurer",
    detail: "Our AI assistant is using available hospital information to fulfil the insurer’s new requirements.",
    chipColor: "info",
  },
  INSURANCE_APPROVED: {
    activeStep: 5,
    heading: "Your admission has been confirmed",
    detail: "Your insurer has approved the admission request. The hospital will contact you with the next steps.",
    chipColor: "success",
  },
  INSURANCE_FINAL_REJECTED: {
    activeStep: 4,
    heading: "Your admission request could not be approved",
    detail: "The insurer has issued a final decision. Please contact the hospital admissions team if you have questions about your next options.",
    chipColor: "error",
  },
};

export function PatientAdmissionTracker() {
  const { admissionId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { admissions } = useWorkflow();
  const admission = admissions.find(
    item =>
      item.id === admissionId && item.patientEmail === session?.email,
  );

  if (!admission) {
    return <Navigate to="/patient/admissions" replace />;
  }

  const current = patientStatus[admission.status];
  const isApproved = admission.status === "INSURANCE_APPROVED";
  const isFinalRejected = admission.status === "INSURANCE_FINAL_REJECTED";

  return (
    <Box className="app-page" component="main" minHeight="100vh" bgcolor="background.default" px={{ xs: 2.5, lg: 5 }} py={4}>
      <Box maxWidth="sm" mx="auto">
        <Stack
          className="motion-enter"
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
        >
          <Button
            className="motion-button"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/patient/admissions")}
          >
            Back to my admissions
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/upload/identity")}
          >
            Start new admission
          </Button>
        </Stack>

        <Card className="motion-card motion-enter motion-enter-delay-1" variant="outlined" sx={{ mt: 2 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em">
                  Admission tracker
                </Typography>
                <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={0.75} mt={0.5}>
                  <Typography variant="h5" fontWeight={700}>
                    Hi,
                  </Typography>
                  <PatientName
                    name={admission.name}
                    gender={admission.gender}
                    variant="h5"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Reference: {admission.medicalRecordNumber}
                </Typography>
              </Box>
              <Chip
                className={isApproved ? "verified-chip" : undefined}
                label={
                  isApproved
                    ? "Confirmed"
                    : isFinalRejected
                      ? "Final decision"
                      : "In progress"
                }
                color={current.chipColor}
                size="small"
                sx={
                  isApproved || isFinalRejected
                    ? undefined
                    : {
                        animation: "trackerPulse 1.8s ease-in-out infinite",
                        "@keyframes trackerPulse": {
                          "0%, 100%": {
                            boxShadow: "0 0 0 0 rgba(0, 61, 155, 0)",
                          },
                          "50%": {
                            boxShadow: "0 0 0 7px rgba(0, 61, 155, 0.13)",
                          },
                        },
                      }
                }
              />
            </Stack>

            <Alert
              severity={isApproved ? "success" : isFinalRejected ? "error" : "info"}
              icon={false}
              sx={{ mt: 3 }}
            >
              <Typography variant="subtitle2">{current.heading}</Typography>
              <Typography variant="body2" mt={0.5}>
                {current.detail}
              </Typography>
            </Alert>

            {isFinalRejected && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<VolunteerActivismRoundedIcon />}
                onClick={() => navigate(`/admission/${admission.id}/support`)}
                sx={{ mt: 2.5 }}
              >
                We can help you explore options
              </Button>
            )}

            <Stepper activeStep={current.activeStep} orientation="vertical" sx={{ mt: 4 }}>
              {progressSteps.map((label, index) => (
                <Step
                  key={label}
                  completed={index < current.activeStep || isApproved}
                >
                  <StepLabel>
                    <Typography variant="body2" fontWeight={index === current.activeStep ? 700 : 500}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Typography variant="caption" color="text.secondary" display="block" mt={3}>
              <Box
                component="span"
                display="inline-block"
                width={7}
                height={7}
                mr={0.75}
                borderRadius="50%"
                bgcolor={
                  isApproved
                    ? "success.main"
                    : isFinalRejected
                      ? "error.main"
                      : "primary.main"
                }
                sx={
                  isApproved || isFinalRejected
                    ? undefined
                    : {
                        animation: "trackerDotPulse 1.8s ease-in-out infinite",
                        "@keyframes trackerDotPulse": {
                          "50%": { opacity: 0.3, transform: "scale(0.72)" },
                        },
                      }
                }
              />
              This page updates as your admission moves through each review step.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
