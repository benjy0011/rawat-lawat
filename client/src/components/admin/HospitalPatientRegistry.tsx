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
import {
  useWorkflow,
  type AdmissionStatus,
} from "../../workflow/AdmissionWorkflowContext";
import { InsurerChip } from "../InsurerChip";
import { PatientName } from "../PatientName";
import { AdminShell } from "./AdminShell";

type StatusDisplay = {
  label: string;
  color: "default" | "info" | "warning" | "success" | "error";
};

const statusDisplay: Record<AdmissionStatus, StatusDisplay> = {
  PENDING_ADMIN_APPROVAL: { label: "Pending approval", color: "warning" },
  AI_PREPARING: { label: "AI preparing", color: "info" },
  DOCTOR_REVIEW: { label: "Doctor review", color: "warning" },
  ADMIN_REVIEW: { label: "Admin review", color: "info" },
  SUBMITTING_TO_INSURANCE: { label: "Submitted to insurer", color: "info" },
  INSURANCE_REJECTED: { label: "Insurer needs more info", color: "warning" },
  AI_RESUBMISSION: { label: "AI resubmitting", color: "info" },
  INSURANCE_APPROVED: { label: "Approved", color: "success" },
  INSURANCE_FINAL_REJECTED: { label: "Declined", color: "error" },
};

export function HospitalPatientRegistry() {
  const navigate = useNavigate();
  const { admissions } = useWorkflow();
  const hospitalAdmissions = admissions.filter(
    admission => admission.hospitalName === "Central Hospital HQ",
  );

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
        <Typography
          variant="overline"
          color="primary"
          fontWeight={800}
          letterSpacing=".12em"
        >
          Cases
        </Typography>
        <Typography variant="h4" mt={0.5}>
          Patient cases
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Every patient who consented to Central Hospital HQ, with their current
          admission status.
        </Typography>

        <Card
          className="motion-card motion-enter motion-enter-delay-2"
          variant="outlined"
          sx={{ mt: 4 }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {hospitalAdmissions.length === 0 ? (
              <Typography color="text.secondary" p={3}>
                No patients have been admitted to Central Hospital HQ yet.
              </Typography>
            ) : (
              <Stack divider={<Box borderBottom={1} borderColor="divider" />}>
                {hospitalAdmissions.map(admission => {
                  const status = statusDisplay[admission.status];

                  return (
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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={0.5}
                        >
                          {admission.medicalRecordNumber} ·{" "}
                          {admission.policyPlan} · {admission.memberId}
                        </Typography>
                      </Box>
                      <Chip label={status.label} color={status.color} size="small" />
                      <InsurerChip insurer={admission.insurer} />
                      <Button
                        className="motion-button"
                        variant="outlined"
                        onClick={() =>
                          navigate(`/admin/gl-process/${admission.id}`)
                        }
                      >
                        View package
                      </Button>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </AdminShell>
  );
}
