import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useWorkflow } from "../../workflow/AdmissionWorkflowContext";
import { InsurerChip } from "../InsurerChip";
import { PatientName } from "../PatientName";
import { AdminShell } from "./AdminShell";
import { ChevronRight } from "@mui/icons-material";

const reviewStatuses = new Set([
  "DOCTOR_REVIEW",
  "ADMIN_REVIEW",
  "AI_RESUBMISSION",
  "INSURANCE_REJECTED",
]);

export function AdminPatientQueue() {
  const navigate = useNavigate();
  const { admissions, approveAdmission } = useWorkflow();
  const hospitalAdmissions = admissions.filter(
    admission => admission.hospitalName === "Central Hospital HQ",
  );
  const pendingRequests = hospitalAdmissions.filter(
    admission => admission.status === "PENDING_ADMIN_APPROVAL",
  );
  const queue = hospitalAdmissions.filter(admission => reviewStatuses.has(admission.status));

  return (
    <AdminShell>
      <Box
        className="motion-enter"
        component="main"
        maxWidth="lg"
        mx="auto"
        px={{ xs: 2.5, lg: 5 }}
        py={4}
      >
        <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em">
          Admissions
        </Typography>
        <Typography variant="h4" mt={0.5}>
          Admission packages
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Only patients who consented to Central Hospital HQ appear here.
        </Typography>

        {pendingRequests.length > 0 && (
          <Card
            variant="outlined"
            sx={{
              mt: 3,
              borderColor: "primary.main",
              bgcolor: "rgba(0, 61, 155, 0.04)",
            }}
          >
            <CardContent>
              <Typography fontWeight={700}>
                Admission requests ({pendingRequests.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Approve a patient&apos;s request to admit to Central Hospital HQ.
              </Typography>
              <Stack spacing={1.5} mt={2}>
                {pendingRequests.map(admission => (
                  <Stack
                    key={admission.id}
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box>
                      <PatientName
                        name={admission.name}
                        gender={admission.gender}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Consent received {admission.consentedAt}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => approveAdmission(admission.id)}
                      endIcon={<ChevronRight />}
                    >
                      Approve admission
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Card className="motion-card motion-enter motion-enter-delay-2" variant="outlined" sx={{ mt: 4 }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {queue.length === 0 ? (
              <Typography color="text.secondary" p={3}>
                No packages currently need administrator review.
              </Typography>
            ) : (
              <Stack divider={<Box borderBottom={1} borderColor="divider" />}>
                {queue.map(admission => (
                  <Stack
                    className="queue-row"
                    key={admission.id}
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ md: "center" }}
                    spacing={2}
                    p={2.5}
                  >
                    <Box flex={1} minWidth={0}>
                      <PatientName
                        name={admission.name}
                        gender={admission.gender}
                      />
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {admission.medicalRecordNumber} · {admission.admissionReason}
                      </Typography>
                    </Box>
                    {!admission.doctorNote.signed && (
                      <Chip
                        label="Pending doctor signature"
                        color="warning"
                        size="small"
                      />
                    )}
                    <InsurerChip insurer={admission.insurer} />
                    <Button
                      className="motion-button"
                      variant="contained"
                      onClick={() => navigate(`/admin/gl-process/${admission.id}`)}
                    >
                      Review package
                    </Button>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </AdminShell>
  );
}
