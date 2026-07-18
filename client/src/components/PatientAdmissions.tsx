import {
  AppBar,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { AdmissionStatus } from "../workflow/AdmissionWorkflowContext";
import { useWorkflow } from "../workflow/AdmissionWorkflowContext";

const hospitals = [
  "Central Hospital HQ",
  "Lakeside Medical Centre",
  "City Specialist Hospital",
];

const labels: Record<AdmissionStatus, string> = {
  PENDING_ADMIN_APPROVAL: "Awaiting hospital approval",
  AI_PREPARING: "Preparing package",
  DOCTOR_REVIEW: "Doctor review",
  ADMIN_REVIEW: "Hospital review",
  SUBMITTING_TO_INSURANCE: "With insurer",
  INSURANCE_REJECTED: "Update required",
  AI_RESUBMISSION: "Updating",
  INSURANCE_APPROVED: "Confirmed",
  INSURANCE_FINAL_REJECTED: "Final decision",
};

export function PatientAdmissions() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { admissions, profiles, requestAdmission } = useWorkflow();
  const [open, setOpen] = useState(false);
  const [hospital, setHospital] = useState(hospitals[0]);
  const [consent, setConsent] = useState(false);

  if (!session) return <Navigate to="/login" replace />;

  const profile = profiles.find(item => item.patientEmail === session.email);
  const mine = admissions.filter(item => item.patientEmail === session.email);

  const submit = () => {
    const admission = requestAdmission(session.email, hospital);

    if (admission) {
      navigate(`/admission/${admission.id}/status`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar sx={{ maxWidth: 1120, width: "100%", mx: "auto" }}>
          <Typography variant="h6" fontWeight={800} color="primary">
            Rawat Lawat
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} ml="auto">
            <Avatar>{session.name[0]}</Avatar>
            <IconButton onClick={handleSignOut} aria-label="Sign out">
              <LogoutRoundedIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="overline" color="primary" fontWeight={800}>
              Patient portal
            </Typography>
            <Typography variant="h4">My admissions</Typography>
            <Typography color="text.secondary" mt={1}>
              {profile
                ? "Select a hospital when you are ready to request admission."
                : "Complete your profile once to request admission at any hospital."}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            style={{
              height: 'fit-content'
            }}
            onClick={() =>
              profile ? setOpen(true) : navigate("/upload/identity")
            }
          >
            {profile ? "Request admission" : "Complete profile"}
          </Button>
        </Stack>

        {mine.length === 0 ? (
          <Card variant="outlined" sx={{ mt: 4 }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <AssignmentOutlinedIcon color="primary" fontSize="large" />
              <Typography variant="h6" mt={2}>
                No admissions yet
              </Typography>
              <Typography color="text.secondary" mt={1}>
                Your profile stays ready; choose a hospital only when you need
                admission.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2} mt={4}>
            {mine.map(item => (
              <Card key={item.id} variant="outlined">
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Chip
                        size="small"
                        label={labels[item.status]}
                        color={
                          item.status === "INSURANCE_APPROVED"
                            ? "success"
                            : "info"
                        }
                      />
                      <Typography variant="h6" mt={1}>
                        {item.hospitalName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Consent given {item.consentedAt} ·{" "}
                        {item.medicalRecordNumber}
                      </Typography>
                    </Box>
                    <Button
                      style={{
                        height: "fit-content",
                        alignSelf: "center"
                      }}
                      variant="outlined"
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={() =>
                        navigate(`/admission/${item.id}/status`)
                      }
                    >
                      View status
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Request admission</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              Choose the hospital that may access your profile for this
              admission request.
            </Typography>
            <Autocomplete
              options={hospitals}
              value={hospital}
              onChange={(_, value) => value && setHospital(value)}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Search hospitals"
                  placeholder="Type a hospital name"
                />
              )}
              sx={{ mt: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={consent}
                  onChange={event => setConsent(event.target.checked)}
                />
              }
              label="I consent to share my profile and insurance information with this hospital for this admission request."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" disabled={!consent} onClick={submit}>
              Send admission request
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
