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

const reviewStatuses = new Set([
  "DOCTOR_REVIEW",
  "ADMIN_REVIEW",
  "AI_RESUBMISSION",
  "INSURANCE_REJECTED",
]);

export function AdminPatientQueue() {
  const navigate = useNavigate();
  const { admissions } = useWorkflow();
  const queue = admissions.filter(admission => reviewStatuses.has(admission.status));

  return (
    <AdminShell>
      <Box className="motion-enter" component="main" maxWidth="lg" mx="auto" px={{ xs: 2.5, lg: 5 }} py={4}>
        <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em">
          Admissions
        </Typography>
        <Typography variant="h4" mt={0.5}>
          Admission packages
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          AI-prepared packages are available for review. Submission remains locked until the doctor signs the clinical note.
        </Typography>

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
