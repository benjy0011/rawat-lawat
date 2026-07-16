import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdmissionStatus } from "../../workflow/AdmissionWorkflowContext";
import { useWorkflow } from "../../workflow/AdmissionWorkflowContext";
import { PatientName } from "../PatientName";
import { InsurerLabel } from "../InsurerChip";
import { DoctorShell } from "./DoctorShell";

type QueueView = "awaiting" | "reviewed";

const workflowStatusLabels: Record<AdmissionStatus, string> = {
  AI_PREPARING: "Preparing",
  DOCTOR_REVIEW: "Doctor review",
  ADMIN_REVIEW: "Hospital review",
  SUBMITTING_TO_INSURANCE: "With insurer",
  INSURANCE_REJECTED: "Update required",
  AI_RESUBMISSION: "Updating package",
  INSURANCE_APPROVED: "Admission confirmed",
  INSURANCE_FINAL_REJECTED: "Final decision",
};

export function DoctorReviewQueue() {
  const navigate = useNavigate();
  const { admissions } = useWorkflow();
  const [view, setView] = useState<QueueView>("awaiting");
  const awaitingAdmissions = admissions.filter(
    admission =>
      admission.status === "DOCTOR_REVIEW" && !admission.doctorNote.signed,
  );
  const reviewedAdmissions = admissions.filter(
    admission => admission.doctorNote.signed,
  );
  const visibleAdmissions =
    view === "awaiting" ? awaitingAdmissions : reviewedAdmissions;
  const isAwaitingView = view === "awaiting";

  return (
    <DoctorShell>
      <Box className="motion-enter" component="main" px={{ xs: 2.5, lg: 5 }} py={4}>
        <Box maxWidth="md" mx="auto">
        <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em">
          Doctor workspace
        </Typography>
        <Typography variant="h4" mt={0.5}>
          Admission note reviews
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Review pending notes and revisit signed records as they move through the admission workflow.
        </Typography>

        <Card className="motion-card motion-enter motion-enter-delay-2" variant="outlined" sx={{ mt: 4 }}>
          <Tabs
            value={view}
            onChange={(_, nextView: QueueView) => setView(nextView)}
            aria-label="Admission note review status"
            sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              value="awaiting"
              label={`Awaiting review (${awaitingAdmissions.length})`}
            />
            <Tab
              value="reviewed"
              label={`Reviewed (${reviewedAdmissions.length})`}
            />
          </Tabs>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {visibleAdmissions.length === 0 ? (
              <Box p={3}>
                <Typography fontWeight={700}>
                  {isAwaitingView
                    ? "No notes waiting for review"
                    : "No signed notes yet"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {isAwaitingView
                    ? "New patient submissions appear here after the AI prepares their admission note."
                    : "Notes appear here after you review and electronically sign them."}
                </Typography>
              </Box>
            ) : (
              <Stack divider={<Box borderBottom={1} borderColor="divider" />}>
                {visibleAdmissions.map(admission => (
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
                      {!isAwaitingView && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={0.75}
                        >
                          Signed by {admission.doctorNote.signedBy ?? "Reviewing doctor"}
                          {admission.doctorNote.signedAt
                            ? ` · ${admission.doctorNote.signedAt}`
                            : ""}
                          {` · ${workflowStatusLabels[admission.status]}`}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={isAwaitingView ? "Awaiting signature" : "Signed"}
                      color={isAwaitingView ? "warning" : "success"}
                      size="small"
                    />
                    <Button
                      className="motion-button"
                      variant={isAwaitingView ? "contained" : "outlined"}
                      onClick={() => navigate(`/doctor/admissions/${admission.id}`)}
                    >
                      {isAwaitingView ? "Review note" : "View signed note"}
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
