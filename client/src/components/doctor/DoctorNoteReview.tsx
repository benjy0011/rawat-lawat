import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DrawRoundedIcon from "@mui/icons-material/DrawRounded";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import {
  AdmissionNoteDocument,
  SignedAdmissionSignature,
} from "../admission/AdmissionNoteDocument";
import { useWorkflow } from "../../workflow/AdmissionWorkflowContext";

export function DoctorNoteReview() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { admissions, signDoctorNote } = useWorkflow();
  const [signatureName, setSignatureName] = useState(session?.name ?? "");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const admission = admissions.find(item => item.id === patientId);

  if (!admission) {
    return <Navigate to="/doctor/admissions" replace />;
  }

  const canSign =
    admission.status === "DOCTOR_REVIEW" &&
    isConfirmed &&
    Boolean(signatureName.trim());

  return (
    <Box
      component="main"
      minHeight="100vh"
      bgcolor="background.default"
      px={{ xs: 2.5, lg: 5 }}
      py={4}
    >
      <Box maxWidth="md" mx="auto">
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/doctor/admissions")}
        >
          Back to queue
        </Button>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
              spacing={1.5}
              mb={3}
            >
              <Box>
                <Typography
                  variant="overline"
                  color="primary"
                  fontWeight={800}
                  letterSpacing=".12em"
                >
                  Doctor workspace
                </Typography>
                <Typography variant="h5" fontWeight={700} mt={0.5}>
                  Review and sign admission note
                </Typography>
              </Box>
              <Chip
                label={admission.doctorNote.signed ? "Signed" : "Awaiting signature"}
                color={admission.doctorNote.signed ? "success" : "warning"}
                size="small"
              />
            </Stack>

            <AdmissionNoteDocument
              admission={admission}
              signatureContent={
                admission.doctorNote.signed ? (
                  <SignedAdmissionSignature
                    signatureName={admission.doctorNote.signedBy ?? "Reviewing doctor"}
                    signedAt={admission.doctorNote.signedAt}
                  />
                ) : (
                  <Stack spacing={1.5} mt={2}>
                    <TextField
                      label="Sign as clinician"
                      value={signatureName}
                      onChange={event => setSignatureName(event.target.value)}
                      helperText="This mock signature records the clinician who approved the note."
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isConfirmed}
                          onChange={event => setIsConfirmed(event.target.checked)}
                        />
                      }
                      label="I have reviewed this admission note and confirm it is clinically accurate."
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DrawRoundedIcon />}
                      disabled={!canSign || isSigning}
                      loading={isSigning}
                      onClick={() => {
                        setIsSigning(true);
                        window.setTimeout(() => {
                          signDoctorNote(admission.id, signatureName.trim());
                        }, 1500);
                      }}
                    >
                      {isSigning
                        ? "Signing admission note…"
                        : "Electronically sign admission note"}
                    </Button>
                  </Stack>
                )
              }
            />

            {admission.doctorNote.signed && (
              <Alert severity="success" sx={{ mt: 3 }}>
                The signed note is now available to the hospital administrator for final package review.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
