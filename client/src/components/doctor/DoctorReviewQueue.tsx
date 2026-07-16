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
import { PatientName } from "../PatientName";
import { InsurerLabel } from "../InsurerChip";
import { DoctorShell } from "./DoctorShell";

export function DoctorReviewQueue() {
  const navigate = useNavigate();
  const { admissions } = useWorkflow();
  const queue = admissions.filter(admission => admission.status === "DOCTOR_REVIEW");

  return (
    <DoctorShell>
      <Box className="motion-enter" component="main" px={{ xs: 2.5, lg: 5 }} py={4}>
        <Box maxWidth="md" mx="auto">
        <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em">
          Doctor workspace
        </Typography>
        <Typography variant="h4" mt={0.5}>
          Admission notes awaiting signature
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Review the AI-prepared note before it proceeds to the hospital administrator.
        </Typography>

        <Card className="motion-card motion-enter motion-enter-delay-2" variant="outlined" sx={{ mt: 4 }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {queue.length === 0 ? (
              <Box p={3}>
                <Typography fontWeight={700}>No notes waiting for review</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  New patient submissions appear here after the AI prepares their admission note.
                </Typography>
              </Box>
            ) : (
              <Stack divider={<Box borderBottom={1} borderColor="divider" />}>
                {queue.map(admission => (
                  <Stack
                    className="queue-row"
                    key={admission.id}
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    spacing={2}
                    p={2.5}
                  >
                    <Box flex={1}>
                      <PatientName
                        name={admission.name}
                        gender={admission.gender}
                      />
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        mt={0.5}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {admission.medicalRecordNumber} ·
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <InsurerLabel insurer={admission.insurer} />
                        </Typography>
                      </Stack>
                    </Box>
                    <Chip label="Awaiting signature" color="warning" size="small" />
                    <Button
                      className="motion-button"
                      variant="contained"
                      onClick={() => navigate(`/doctor/admissions/${admission.id}`)}
                    >
                      Review note
                    </Button>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
        </Box>
      </Box>
    </DoctorShell>
  );
}
