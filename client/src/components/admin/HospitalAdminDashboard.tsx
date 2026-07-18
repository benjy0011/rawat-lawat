import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useState, type ReactNode } from "react";
import aiaPolicyDocument from "../../assets/aia_policy.pdf";
import xRayImage from "../../assets/x-ray.jpeg";
import {
  AdmissionNoteDocument,
  SignedAdmissionSignature,
} from "../admission/AdmissionNoteDocument";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import type {
  AdmissionRecord,
  AdmissionStatus,
  RetrievedDocument,
  WorkflowEvent,
} from "../../workflow/AdmissionWorkflowContext";
import { useWorkflow } from "../../workflow/AdmissionWorkflowContext";
import { useNavigate } from "react-router-dom";
import { AdminShell } from "./AdminShell";
import { PolicyChecksCard } from "./PolicyChecksCard";
import { PatientName } from "../PatientName";
import { InsurerLabel } from "../InsurerChip";

type StatusDetails = {
  label: string;
  detail: string;
  color: "default" | "info" | "warning" | "error" | "success";
};

const statusDetails: Record<AdmissionStatus, StatusDetails> = {
  PENDING_ADMIN_APPROVAL: {
    label: "Awaiting hospital approval",
    detail: "The patient has consented to share data with this hospital. Approve the request to begin AI preparation.",
    color: "info",
  },
  AI_PREPARING: {
    label: "AI preparing",
    detail: "The AI is gathering admission data and drafting the doctor note.",
    color: "info",
  },
  DOCTOR_REVIEW: {
    label: "Pending doctor signature",
    detail:
      "AI has prepared the admission package. The doctor must electronically sign the note before it can be submitted.",
    color: "warning",
  },
  ADMIN_REVIEW: {
    label: "Admin review",
    detail: "The complete package is ready for final human review.",
    color: "info",
  },
  SUBMITTING_TO_INSURANCE: {
    label: "Submitting",
    detail: "The mock insurance service is reviewing the submitted package.",
    color: "info",
  },
  INSURANCE_REJECTED: {
    label: "Insurer feedback",
    detail: "The AI will turn the feedback into a resubmission task.",
    color: "error",
  },
  AI_RESUBMISSION: {
    label: "AI resubmission",
    detail:
      "The AI is fulfilling the insurer's new requirements from hospital data.",
    color: "warning",
  },
  INSURANCE_APPROVED: {
    label: "Admission success",
    detail: "The insurer approved the claim. Admission may proceed.",
    color: "success",
  },
  INSURANCE_FINAL_REJECTED: {
    label: "Final insurer decline",
    detail: "The insurer issued a final decision and no further resubmission will be sent.",
    color: "error",
  },
};

const timelineEventStyles: Record<
  WorkflowEvent["actor"],
  { color: string; backgroundColor: string; icon: ReactNode }
> = {
  Patient: {
    color: "#1565c0",
    backgroundColor: "#e3f2fd",
    icon: <PersonOutlineRoundedIcon fontSize="small" />,
  },
  "AI Assistant": {
    color: "#6a1b9a",
    backgroundColor: "#f3e5f5",
    icon: <SmartToyOutlinedIcon fontSize="small" />,
  },
  Doctor: {
    color: "#00796b",
    backgroundColor: "#e0f2f1",
    icon: <LocalHospitalOutlinedIcon fontSize="small" />,
  },
  Administrator: {
    color: "#003d9b",
    backgroundColor: "rgba(0, 61, 155, 0.1)",
    icon: <SupportAgentRoundedIcon fontSize="small" />,
  },
  Insurance: {
    color: "#b45309",
    backgroundColor: "#fff7ed",
    icon: <SendRoundedIcon fontSize="small" />,
  },
};

const nudgeDetails: Partial<
  Record<AdmissionStatus, { recipient: string; waitingTime: string }>
> = {
  DOCTOR_REVIEW: {
    recipient: "doctor",
    waitingTime: "5h 18m",
  },
  SUBMITTING_TO_INSURANCE: {
    recipient: "insurer reviewer",
    waitingTime: "5h 42m",
  },
};

export function HospitalAdminDashboard({
  patient,
}: {
  patient: AdmissionRecord;
}) {
  return <HospitalAdminDashboardContent key={patient.id} patient={patient} />;
}

function HospitalAdminDashboardContent({
  patient,
}: {
  patient: AdmissionRecord;
}) {
  const navigate = useNavigate();
  const { sendNudge, submitToInsurer } = useWorkflow();
  const [selectedDocument, setSelectedDocument] = useState<RetrievedDocument | null>(null);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [isAiCheckingSubmission, setIsAiCheckingSubmission] = useState(false);
  const [isAiCheckComplete, setIsAiCheckComplete] = useState(false);
  const [checkedSubmissionAttempt, setCheckedSubmissionAttempt] = useState<number | null>(null);
  const [documentsConfirmed, setDocumentsConfirmed] = useState(false);
  const [isSendingNudge, setIsSendingNudge] = useState(false);
  const submissionDocuments = patient.retrievedDocuments.filter(
    document => document.submissionStatus !== "Reference only",
  );
  const currentStatus = statusDetails[patient.status];
  const pendingDoctorSignature = !patient.doctorNote.signed;
  const isPolicyEligible = patient.policyEligibility === "ELIGIBLE";
  const readyToSubmit =
    patient.status === "ADMIN_REVIEW" &&
    !pendingDoctorSignature &&
    isPolicyEligible;
  const isSubmitting = patient.status === "SUBMITTING_TO_INSURANCE";
  const isApproved = patient.status === "INSURANCE_APPROVED";
  const isFinalRejected = patient.status === "INSURANCE_FINAL_REJECTED";
  const isAiResubmitting = patient.status === "AI_RESUBMISSION";
  const isPackageUpdating = isSubmitting || isAiResubmitting;
  const isAiCheckLoading = readyToSubmit && isAiCheckingSubmission;
  const submissionChecks = buildSubmissionChecks(patient);
  const allChecksPassed = submissionChecks.every(check => check.passed);
  const checkHasRun =
    isAiCheckComplete && checkedSubmissionAttempt === patient.submissionAttempts;
  const hasAiApprovedPackage = readyToSubmit && checkHasRun && allChecksPassed;
  const nudgeDetail = nudgeDetails[patient.status];

  const runAiSubmissionCheck = () => {
    if (!readyToSubmit) return;

    setIsAiCheckingSubmission(true);
    setIsAiCheckComplete(false);
    setDocumentsConfirmed(false);
    window.setTimeout(() => {
      setIsAiCheckingSubmission(false);
      setIsAiCheckComplete(true);
      setCheckedSubmissionAttempt(patient.submissionAttempts);
    }, 1500);
  };

  const sendResponseNudge = () => {
    if (!nudgeDetail) return;

    setIsSendingNudge(true);
    window.setTimeout(() => {
      sendNudge(patient.id);
      setIsSendingNudge(false);
    }, 1500);
  };
  const currentStepDetails = (
    <Box maxWidth={300} p={0.5}>
      <Typography
        variant="overline"
        color="primary"
        fontWeight={800}
        letterSpacing=".12em"
      >
        Current step
      </Typography>
      <Typography variant="subtitle2" fontWeight={800}>
        {currentStatus.label}
      </Typography>
      <Typography variant="body2" mt={0.5}>
        {currentStatus.detail}
      </Typography>
      {patient.insurerFeedback && (
        <Box mt={1.5}>
          <Typography variant="caption" fontWeight={800}>
            Insurer requirements
          </Typography>
          <Stack spacing={0.75} mt={0.5}>
            {patient.insurerFeedback.map(requirement => (
              <Box key={requirement.id}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  {requirement.status === "resolved" ? (
                    <TaskAltRoundedIcon color="success" sx={{ fontSize: 16 }} />
                  ) : (
                    <RadioButtonUncheckedRoundedIcon
                      sx={{ fontSize: 16, color: "text.disabled" }}
                    />
                  )}
                  <Typography variant="body2">{requirement.label}</Typography>
                </Stack>
                {requirement.note && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", pl: 2.75 }}
                  >
                    {requirement.note}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}
      {patient.insurerDecisionNote && (
        <Box mt={1.5}>
          <Typography variant="caption" fontWeight={800}>
            {patient.status === "INSURANCE_FINAL_REJECTED"
              ? "Decline reason"
              : "Insurer note"}
          </Typography>
          <Typography variant="body2">{patient.insurerDecisionNote}</Typography>
        </Box>
      )}
      {pendingDoctorSignature && (
        <Typography variant="body2" mt={1.5}>
          Submission remains locked until the doctor signs the admission note.
        </Typography>
      )}
      {!isPolicyEligible && (
        <Typography variant="body2" mt={1.5}>
          Submission is blocked because the policy is not eligible for this
          hospital.
        </Typography>
      )}
    </Box>
  );

  return (
    <AdminShell>
      <Box
        component="main"
        maxWidth="xl"
        mx="auto"
        px={{ xs: 2.5, lg: 5 }}
        py={4}
      >
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/admin/gl-process")}
          sx={{ mb: 2 }}
        >
          Pending completion
        </Button>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Admissions / Guarantee letter
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <PatientName
                name={patient.name}
                gender={patient.gender}
                variant="h4"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={700}
              >
                Reg. No.: {patient.medicalRecordNumber}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={0.75} mt={1}>
              {/* <Typography variant="body2" color="text.secondary">
                {patient.medicalRecordNumber} ·
              </Typography> */}
              <Typography variant="body2" color="text.secondary">
                <InsurerLabel insurer={patient.insurer} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                · Member {patient.memberId}
              </Typography>
            </Stack>
          </Box>
          <Chip
            label={currentStatus.label}
            color={currentStatus.color}
            sx={{ alignSelf: { sm: "flex-start" }, fontWeight: 700 }}
          />
        </Stack>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", lg: "minmax(0, 1fr) 340px" }}
          gap={3}
          mt={4}
        >
          <Stack spacing={3}>
        <AdmissionProgress
          status={patient.status}
          currentStepDetails={currentStepDetails}
        />


            <Card variant="outlined">
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Box>
                    <Typography variant="h6">Application Log</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      A complete record of this admission request.
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    flexWrap="wrap"
                    spacing={1}
                    alignSelf={{ xs: "flex-start", sm: "center" }}
                  >
                    {nudgeDetail && (
                      <>
                        <Chip
                          label={`No ${nudgeDetail.recipient} response for ${nudgeDetail.waitingTime}`}
                          color="warning"
                          size="small"
                        />
                        <Tooltip
                          title={`Send a reminder to the ${nudgeDetail.recipient}`}
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="warning"
                              disabled={isSendingNudge}
                              onClick={sendResponseNudge}
                              aria-label={`Nudge ${nudgeDetail.recipient}`}
                              sx={{
                                width: 30,
                                height: 30,
                                bgcolor: "warning.light",
                                color: "warning.dark",
                                "&:hover": {
                                  bgcolor: "warning.main",
                                  color: "common.white",
                                },
                              }}
                            >
                              {isSendingNudge ? (
                                <CircularProgress size={15} color="inherit" />
                              ) : (
                                <NotificationsActiveRoundedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    )}
                    <Chip
                      label={`${patient.timeline.length} updates`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
                <Timeline
                  position="right"
                  sx={{
                    m: 0,
                    mt: 3,
                    p: 0,
                    "& .MuiTimelineItem-root:before": { flex: 0, padding: 0 },
                    "& .MuiTimelineItem-root:last-of-type": { minHeight: 0 },
                  }}
                >
                  {[...patient.timeline]
                    .reverse()
                    .slice(0, timelineExpanded ? undefined : 1)
                    .map((item, index, events) => (
                      <TimelineItem key={`${item.occurredAt}-${index}`}>
                        <TimelineSeparator>
                          <TimelineDot
                            sx={{
                              m: 0,
                              p: 0.75,
                              color: timelineEventStyles[item.actor].color,
                              bgcolor:
                                timelineEventStyles[item.actor].backgroundColor,
                              boxShadow: "none",
                            }}
                          >
                            {timelineEventStyles[item.actor].icon}
                          </TimelineDot>
                          {index < events.length - 1 && (
                            <TimelineConnector
                              sx={{ bgcolor: "divider", width: 2, my: 0.5 }}
                            />
                          )}
                        </TimelineSeparator>
                        <TimelineContent
                          sx={{
                            pt: 0,
                            pb: index === events.length - 1 ? 0 : 2.5,
                            pl: 1.75,
                          }}
                        >
                          <Box
                            border={1}
                            borderColor="divider"
                            borderRadius={2}
                            p={1.5}
                            sx={{ bgcolor: "grey.50" }}
                          >
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              alignItems={{ sm: "center" }}
                              justifyContent="space-between"
                              spacing={0.75}
                            >
                              <Typography
                                variant="subtitle2"
                                color={timelineEventStyles[item.actor].color}
                              >
                                {item.actor}
                              </Typography>
                              <Chip
                                label={item.occurredAt}
                                size="small"
                                variant="outlined"
                              />
                            </Stack>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              mt={0.75}
                            >
                              {item.message}
                            </Typography>
                          </Box>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                </Timeline>
                {patient.timeline.length > 1 && (
                  <Button
                    size="small"
                    onClick={() => setTimelineExpanded(current => !current)}
                    sx={{ mt: 2 }}
                  >
                    {timelineExpanded
                      ? "Show current update only"
                      : `Show ${patient.timeline.length - 1} earlier updates`}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                {/* <Typography
                  variant="overline"
                  color="primary"
                  fontWeight={800}
                  letterSpacing=".12em"
                >
                  Complete admission package
                </Typography> */}
                <Typography variant="h6" mt={0.5}>
                  Clinical and policy summary
                </Typography>

                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)" }}
                  gap={2}
                  mt={3}
                >
                  <Summary
                    label="Admission reason"
                    value={patient.admissionReason}
                  />
                  <Summary label="Policy plan" value={patient.policyPlan} />
                  <Summary
                    label="Doctor note"
                    value={
                      patient.doctorNote.signed
                        ? "Reviewed and electronically signed"
                        : "Awaiting doctor signature"
                    }
                  />
                  <Summary
                    label="Submission attempts"
                    value={String(patient.submissionAttempts)}
                  />
                </Box>

                <Alert severity="info" icon={false} sx={{ mt: 3 }}>
                  <Typography variant="subtitle2">
                    AI clinical summary
                  </Typography>
                  <Typography variant="body2" mt={0.5}>
                    {patient.doctorNote.summary ||
                      "The AI is preparing the clinical summary."}
                  </Typography>
                </Alert>

                {patient.doctorNote.signed && (
                  <Card variant="outlined" sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="success.main">
                        Doctor-reviewed admission note
                      </Typography>
                      <Box
                        display="grid"
                        gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)" }}
                        gap={2}
                        mt={2}
                      >
                        <Summary
                          label="Diagnosis"
                          value={patient.doctorNote.diagnosis ?? "Not recorded"}
                        />
                        <Summary
                          label="Estimated treatment cost"
                          value={patient.doctorNote.estimatedCost ?? "Not recorded"}
                        />
                      </Box>
                      <Box bgcolor="grey.50" borderRadius={1} p={1.5} mt={2}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={700}
                          textTransform="uppercase"
                        >
                          AI recommendation, reviewed by doctor
                        </Typography>
                        <Typography variant="body2" mt={0.5} lineHeight={1.7}>
                          {patient.doctorNote.recommendation ??
                            "No recommendation recorded."}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    display="grid"
                    width={38}
                    height={38}
                    borderRadius={1.5}
                    color="primary.main"
                    sx={{
                      placeItems: "center",
                      bgcolor: "rgba(0, 61, 155, 0.08)",
                    }}
                  >
                    <DescriptionOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6">Documents</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Evidence prepared for the pending insurer submission.
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={0} mt={2.5} divider={<Divider flexItem />}>
                  {submissionDocuments.map(document => (
                    <Stack
                      key={document.id}
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                      spacing={1.5}
                      py={2}
                    >
                      <Box flex={1}>
                        <Typography variant="subtitle2">{document.name}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={0.25}
                        >
                          {document.detail}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={0.5}
                        >
                          Source: {document.source}
                        </Typography>
                      </Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        alignSelf={{ xs: "flex-start", sm: "center" }}
                      >
                        <Chip
                          label={document.submissionStatus}
                          color={
                            document.submissionStatus === "Ready to submit"
                              ? "success"
                              : "warning"
                          }
                          size="small"
                        />
                        <Tooltip title="View File">
                          <IconButton
                            aria-label={`View ${document.name}`}
                            color="primary"
                            onClick={() => setSelectedDocument(document)}
                          >
                            <VisibilityOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ bgcolor: !hasAiApprovedPackage ? "#EFEFEF" : "transparent" }}>
              <CardContent>
                <Typography color={!hasAiApprovedPackage ? "gray" : "textPrimary"} variant="h6">Submit to insurer</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Send the hospital-confirmed package to the insurer reviewer.
                </Typography>

                <FormControlLabel
                  sx={{ alignItems: "", mt: 2, mb: 1 }}
                  control={
                    <Checkbox
                      checked={documentsConfirmed}
                      onChange={event => setDocumentsConfirmed(event.target.checked)}
                      disabled={!hasAiApprovedPackage}
                    />
                  }
                  label={
                    <Typography variant="body2" color={!hasAiApprovedPackage ? "gray" : "textPrimary"}>
                      I confirm that I have reviewed the documents prepared for this submission.
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  * Please verify all clinical and policy documents before submitting. The insurer reviewer will record the final decision separately.
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={
                    !readyToSubmit ||
                    !hasAiApprovedPackage ||
                    !documentsConfirmed ||
                    isPackageUpdating
                  }
                  loading={isPackageUpdating}
                  onClick={() => {
                    submitToInsurer(patient.id);
                    window.setTimeout(() => {
                      navigate(`/insurance/review/${patient.id}`);
                    }, 0);
                  }}
                  sx={{ mt: 2.5 }}
                >
                  {isSubmitting ? "Sending package…" : "Submit to insurer reviewer"}
                </Button>
              </CardContent>
            </Card>

            {/* {policyEligibilitySummary && (
              <Card variant="outlined">
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="h6">
                        Policy eligibility summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {isPolicyEligible
                          ? policyEligibilitySummary.detail
                          : "This policy is not eligible for the selected hospital admission request."}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.75}
                      >
                        Source: {policyEligibilitySummary.source} · Used for
                        internal reference only; it is not included in the
                        insurer submission.
                      </Typography>
                    </Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      alignSelf={{ xs: "flex-start", sm: "center" }}
                    >
                      <Chip label="Reference only" size="small" variant="outlined" />
                      <Chip
                        label={isPolicyEligible ? "Eligible" : "Not eligible"}
                        color={isPolicyEligible ? "success" : "error"}
                        size="small"
                      />
                      <Tooltip title="View policy eligibility summary">
                        <IconButton
                          aria-label="View policy eligibility summary"
                          color="primary"
                          onClick={() =>
                            setSelectedDocument(policyEligibilitySummary)
                          }
                        >
                          <VisibilityOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    spacing={1}
                    borderTop={1}
                    borderColor="divider"
                    mt={2}
                    pt={2}
                  >
                    <Typography variant="caption" color="text.secondary" mr="auto">
                      Mock eligibility result
                    </Typography>
                    <Button
                      size="small"
                      variant={isPolicyEligible ? "contained" : "outlined"}
                      color="success"
                      onClick={() =>
                        setPolicyEligibility(patient.id, "ELIGIBLE")
                      }
                    >
                      Mark eligible
                    </Button>
                    <Button
                      size="small"
                      variant={!isPolicyEligible ? "contained" : "outlined"}
                      color="error"
                      onClick={() =>
                        setPolicyEligibility(patient.id, "NOT_ELIGIBLE")
                      }
                    >
                      Mark not eligible
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )} */}

            <PolicyChecksCard
              checks={patient.policyChecks}
              eligibility={patient.policyEligibility}
            />

          </Stack>

          <Stack spacing={3}>
            <Card
              sx={{
                position: "sticky",
                top: 80,
                zIndex: 1,
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <CardContent>
                <Typography
                  variant="overline"
                  sx={{ color: "white" }}
                  fontWeight={800}
                  letterSpacing=".12em"
                >
                  AI submission checker
                </Typography>

                <Typography variant="h6" mt={0.5}>
                  Pre-submit review
                </Typography>

                {isAiCheckLoading ? (
                  <Stack alignItems="center" spacing={1.5} py={3} aria-live="polite">
                    <CircularProgress color="inherit" size={28} />
                    <Typography variant="body2" textAlign="center">
                      Checking document completeness, policy eligibility, and the signed clinical note.
                    </Typography>
                  </Stack>
                ) : checkHasRun ? (
                  <>
                    <Typography
                      variant="body2"
                      mt={1}
                      sx={{ color: allChecksPassed ? "rgba(255,255,255,0.9)" : "#ffd7d0" }}
                    >
                      {allChecksPassed
                        ? "AI check complete. This package is ready for hospital confirmation."
                        : "AI check found issues to resolve before submitting."}
                    </Typography>
                    <Stack spacing={1} mt={2}>
                      {submissionChecks.map(check => (
                        <AiCheckItem
                          key={check.label}
                          label={check.label}
                          passed={check.passed}
                          detail={check.detail}
                        />
                      ))}
                    </Stack>
                  </>
                ) : (
                  <Typography variant="body2" mt={1.5} sx={{ color: "rgba(255,255,255,0.8)" }}>
                    {pendingDoctorSignature
                      ? "Waiting for the doctor to sign the admission note before checking the package."
                      : !isPolicyEligible
                        ? "The policy is not eligible for this hospital admission."
                        : isApproved
                          ? "The insurer has approved this admission."
                          : isFinalRejected
                            ? "The insurer issued a final decline for this admission."
                            : isSubmitting
                              ? "The package is now with the insurer reviewer."
                              : "The AI checker will start once the package is ready."}
                  </Typography>
                )}

                {readyToSubmit && !isAiCheckLoading && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={runAiSubmissionCheck}
                    sx={{
                      mt: 2.5,
                      bgcolor: "common.white",
                      color: "primary.main",
                      fontWeight: 700,
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                  >
                    {hasAiApprovedPackage ? "Run AI check again" : "Run AI check"}
                  </Button>
                )}

                {/*
                {readyToSubmit && (
                  <OutcomeSelector
                    outcome={patient.nextInsurerOutcome}
                    onChange={(outcome) =>
                      setNextInsurerOutcome(patient.id, outcome)
                    }
                  />
                )}

                {patient.submissionAttempts > 0 && !isApproved && !isFinalRejected && (
                  <Typography
                    variant="body2"
                    mt={2}
                    sx={{ color: "primary.light" }}
                  >
                    Select the insurer response for this resubmission. You can
                    request more information again, approve, or record a final decline.
                  </Typography>
                )}

                {isApproved ? (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Claim approved — admission can proceed.
                  </Alert>
                ) : isFinalRejected ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    The insurer issued a final decline. This admission package is closed.
                  </Alert>
                ) : (
                  <>
                    {pendingDoctorSignature && (
                      <Typography
                        variant="body2"
                        mt={2}
                        sx={{ color: "white" }}
                      >
                        The AI-prepared documents are ready to review. Submission will unlock after the doctor signs the note.
                      </Typography>
                    )}
                    {!isPolicyEligible && (
                      <Typography
                        variant="body2"
                        mt={2}
                        sx={{ color: "primary.light" }}
                      >
                        Submission is blocked because this policy is not
                        eligible for the selected hospital.
                      </Typography>
                    )}
                    <Button
                      fullWidth
                      variant="contained"
                      color="inherit"
                      disabled={!readyToSubmit || isPackageUpdating}
                      loading={isPackageUpdating}
                      loadingIndicator={
                        <Box
                          position="relative"
                          width={22}
                          height={22}
                          sx={{ display: "inline-grid", placeItems: "center" }}
                        >
                          <CircularProgress
                            size={22}
                            thickness={4}
                            sx={{
                              position: "absolute",
                              color: "primary.main",
                              animation: "submitLoaderSpin 900ms linear infinite",
                              "@keyframes submitLoaderSpin": {
                                to: { transform: "rotate(360deg)" },
                              },
                            }}
                          />
                          <AutoAwesomeRoundedIcon
                            sx={{
                              position: "relative",
                              zIndex: 1,
                              fontSize: 13,
                              color: "primary.main",
                              animation: "submitLoaderSparkle 1.1s ease-in-out infinite",
                              "@keyframes submitLoaderSparkle": {
                                "0%, 100%": { opacity: 0.45, transform: "scale(0.78)" },
                                "50%": { opacity: 1, transform: "scale(1.12)" },
                              },
                            }}
                          />
                        </Box>
                      }
                      onClick={() => submitToInsurer(patient.id)}
                      sx={{
                        mt: 3,
                        bgcolor: "common.white",
                        color: "primary.main",
                        "&:hover": { bgcolor: "grey.100" },
                        ...(isPackageUpdating && {
                          background:
                            "linear-gradient(110deg, #ffffff 0%, #e3f2fd 42%, #ffffff 78%)",
                          backgroundSize: "220% 100%",
                          animation: "submitButtonShimmer 1.8s linear infinite",
                          "@keyframes submitButtonShimmer": {
                            to: { backgroundPosition: "-220% 0" },
                          },
                        }),
                      }}
                    >
                      {pendingDoctorSignature
                        ? "Awaiting doctor signature"
                        : !isPolicyEligible
                          ? "Policy not eligible"
                        : isAiResubmitting
                          ? "Updating package…"
                          : isSubmitting
                          ? "Sending package…"
                          : "Submit to insurance"}
                    </Button>
                  </>
                )}
                */}
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <DocumentPreview
          document={selectedDocument}
          patient={patient}
          onClose={() => setSelectedDocument(null)}
        />
      </Box>
    </AdminShell>
  );
}

function DocumentPreview({
  document,
  patient,
  onClose,
}: {
  document: RetrievedDocument | null;
  patient: AdmissionRecord;
  onClose: () => void;
}) {
  if (!document) {
    return null;
  }

  const sections = getDocumentSections(document, patient);

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { minHeight: { md: 620 } } }}
    >
      <DialogTitle>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          spacing={1}
        >
          <Box>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em">
              AI-retrieved document
            </Typography>
            <Typography variant="h6">{document.name}</Typography>
          </Box>
          <Chip
            label={document.submissionStatus}
            color={
              document.submissionStatus === "Ready to submit"
                ? "success"
                : document.submissionStatus === "Requires review"
                  ? "warning"
                  : "default"
            }
            size="small"
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "grey.100", p: { xs: 2, sm: 4 } }}>
        {document.id === "full-policy-document" ? (
          <Box
            maxWidth={760}
            mx="auto"
            overflow="hidden"
            border={1}
            borderColor="grey.300"
            borderRadius={1}
            bgcolor="common.white"
            boxShadow={2}
          >
            <Box
              component="iframe"
              src={aiaPolicyDocument}
              title="Mock AIA policy document"
              width="100%"
              height={700}
              border={0}
              display="block"
            />
          </Box>
        ) : document.id === "doctor-note" ? (
          <Box maxWidth={760} mx="auto">
            <AdmissionNoteDocument
              admission={patient}
              showClinicalContext={false}
              signatureContent={
                patient.doctorNote.signed ? (
                  <SignedAdmissionSignature
                    signatureName={patient.doctorNote.signedBy ?? "Reviewing doctor"}
                    signedAt={patient.doctorNote.signedAt}
                    signatureImage={patient.doctorNote.signatureImage}
                  />
                ) : (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    This note is awaiting the doctor&apos;s electronic signature.
                  </Alert>
                )
              }
            />
          </Box>
        ) : (
          <Box
            maxWidth={680}
            minHeight={420}
            mx="auto"
            bgcolor="common.white"
            border={1}
            borderColor="grey.300"
            borderRadius={1}
            boxShadow={2}
            p={{ xs: 2.5, sm: 5 }}
          >
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6" color="primary.main">
                Central Hospital HQ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Guarantee Letter Submission Package
              </Typography>
            </Box>
            <DescriptionOutlinedIcon color="primary" />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
            Patient
          </Typography>
          <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={0.75}>
            <PatientName
              name={patient.name}
              gender={patient.gender}
              variant="body2"
            />
            <Typography variant="body2" fontWeight={700}>
              · {patient.medicalRecordNumber}
            </Typography>
          </Stack>

          {document.id === "supporting-data" && (
            <Box mt={3}>
              <Typography variant="subtitle2" color="primary.main" mb={1}>
                Chest X-ray image
              </Typography>
              <Box
                component="img"
                src={xRayImage}
                alt="Chest X-ray supporting clinical evidence"
                display="block"
                width="100%"
                maxWidth={420}
                mx="auto"
                borderRadius={1}
                border={1}
                borderColor="grey.300"
              />
            </Box>
          )}

          <Stack spacing={2.5} mt={3}>
            {sections.map(section => (
              <Box key={section.heading}>
                <Typography variant="subtitle2" color="primary.main">
                  {section.heading}
                </Typography>
                <Typography variant="body2" color="text.primary" mt={0.5} lineHeight={1.7}>
                  {section.heading === "Insurer" ? (
                    <InsurerLabel insurer={section.content} />
                  ) : (
                    section.content
                  )}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Box borderTop={1} borderColor="divider" mt={4} pt={2}>
            <Typography variant="caption" color="text.secondary">
              Retrieved from: {document.source} · Mock preview for the pending insurer submission
            </Typography>
          </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button startIcon={<CloseRoundedIcon />} onClick={onClose}>
          Close preview
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function getDocumentSections(
  document: RetrievedDocument,
  patient: AdmissionRecord,
) {
  switch (document.id) {
    case "identity":
      return [
        { heading: "Verified identity", content: `${patient.name}'s identity has been matched to medical record ${patient.medicalRecordNumber}.` },
        { heading: "Admission request", content: `Admission requested for: ${patient.admissionReason}.` },
      ];
    case "policy":
      return [
        { heading: "Insurer", content: patient.insurer },
        { heading: "Plan and member ID", content: `${patient.policyPlan} · ${patient.memberId}` },
        {
          heading: "Eligibility result",
          content:
            patient.policyEligibility === "ELIGIBLE"
              ? "Eligible: active coverage and panel-hospital eligibility have been confirmed."
              : "Not eligible: this policy cannot be used for the selected hospital admission request.",
        },
      ];
    case "full-policy-document":
      return [
        {
          heading: "Document type",
          content: "Mock policy schedule and member certificate",
        },
        { heading: "Insurer", content: patient.insurer },
        { heading: "Member ID", content: patient.memberId },
        { heading: "Policy plan", content: patient.policyPlan },
        {
          heading: "Coverage",
          content:
            "Inpatient admission and medically necessary treatment, subject to policy terms and insurer approval.",
        },
        {
          heading: "Eligibility status",
          content:
            "Active coverage and panel-hospital eligibility confirmed for this mock submission.",
        },
      ];
    case "doctor-note":
      return [
        { heading: "Clinical note", content: patient.doctorNote.summary },
        { heading: "Signature status", content: patient.doctorNote.signed ? "Electronically signed by the reviewing doctor." : "Awaiting the reviewing doctor's electronic signature." },
      ];
    default:
      return [
        { heading: "Clinical evidence", content: `Relevant diagnosis and estimated-cost information has been prepared to support the ${patient.admissionReason.toLowerCase()} admission request.` },
        { heading: "Submission readiness", content: document.detail },
      ];
  }
}

type ProgressState = "complete" | "current" | "pending" | "failed";

type ProgressStep = {
  label: string;
  state: ProgressState;
  tooltip: string;
};

function AdmissionProgress({
  status,
  currentStepDetails,
}: {
  status: AdmissionStatus;
  currentStepDetails: ReactNode;
}) {
  const steps = getProgressSteps(status);
  const currentStep = getCurrentProgressStep(status);

  return (
    <Box
      mt={2.5}
      pt={2}
      borderTop={1}
      borderColor="divider"
      sx={{ overflowX: "auto" }}
    >
      <Stack direction="row" alignItems="flex-start" minWidth={500}>
        {steps.map((step, index) => {
          const colors = progressColors[step.state];

          return (
            <Stack
              key={step.label}
              direction="row"
              alignItems="flex-start"
              flex={index < steps.length - 1 ? 1 : "none"}
            >
              <Stack alignItems="center" spacing={0.75} width={100}>
                <Tooltip
                  title={
                    index === currentStep ? (
                      currentStepDetails
                    ) : (
                      <TimelineStepTooltip
                        title={step.label}
                        detail={step.tooltip}
                      />
                    )
                  }
                  arrow
                  placement="top"
                  slotProps={{
                    tooltip: {
                      sx: {
                        maxWidth: 340,
                        p: 2,
                        bgcolor: "background.paper",
                        color: "text.primary",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2,
                        boxShadow: 4,
                      },
                    },
                    arrow: { sx: { color: "background.paper" } },
                  }}
                >
                  <Box
                    display="grid"
                    width={28}
                    height={28}
                    borderRadius="50%"
                    sx={{
                      placeItems: "center",
                      color: colors.color,
                      bgcolor: colors.backgroundColor,
                      border: "2px solid",
                      borderColor: colors.borderColor,
                      cursor: index === currentStep ? "help" : "default",
                    }}
                  >
                    <ProgressIcon state={step.state} index={index} />
                  </Box>
                </Tooltip>
                <Typography
                  variant="caption"
                  color={colors.color}
                  fontWeight={700}
                  whiteSpace="nowrap"
                >
                  {step.label}
                </Typography>
                {/* {index === 2 && showSubmitAction && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={onSubmit}
                    loading={isSubmitting}
                    sx={{ minWidth: 0, px: 0.5, py: 0, fontSize: "0.7rem" }}
                  >
                    Submit
                  </Button>
                )} */}
              </Stack>
              {index < steps.length - 1 && (
                <Box
                  flex={1}
                  height={2}
                  mt={1.625}
                  bgcolor={
                    step.state === "complete" ? "success.main" : "divider"
                  }
                />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

const progressColors: Record<
  ProgressState,
  { color: string; backgroundColor: string; borderColor: string }
> = {
  complete: {
    color: "#1b5e20",
    backgroundColor: "#e8f5e9",
    borderColor: "#66bb6a",
  },
  current: {
    color: "#8a5a00",
    backgroundColor: "#fff8e1",
    borderColor: "#fbc02d",
  },
  pending: {
    color: "#6b7280",
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
  },
  failed: {
    color: "#b71c1c",
    backgroundColor: "#ffebee",
    borderColor: "#ef5350",
  },
};

function ProgressIcon({ state, index }: { state: ProgressState; index: number }) {
  if (state === "failed") {
    return <CancelRoundedIcon fontSize="small" />;
  }

  if (index === 3 && state === "complete") {
    return <TaskAltRoundedIcon fontSize="small" />;
  }

  switch (index) {
    case 0:
      return <PersonOutlineRoundedIcon fontSize="small" />;
    case 1:
      return <DescriptionOutlinedIcon fontSize="small" />;
    case 2:
      return <SendRoundedIcon fontSize="small" />;
    default:
      return <FactCheckOutlinedIcon fontSize="small" />;
  }
}

function TimelineStepTooltip({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <Box maxWidth={300}>
      <Typography variant="subtitle2" fontWeight={800}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {detail}
      </Typography>
    </Box>
  );
}

function getProgressSteps(status: AdmissionStatus): ProgressStep[] {
  const currentStep = getCurrentProgressStep(status);
  const isFinalRejection = status === "INSURANCE_FINAL_REJECTED";
  const isFinalApproval = status === "INSURANCE_APPROVED";
  const baseSteps = [
    {
      label: "Onboard",
      tooltip: "Patient onboarded and consented to share admission details with the selected hospital.",
    },
    {
      label: "Documents",
      tooltip:
        "Identity, policy, and supporting admission records are being gathered and checked.",
    },
    {
      label: "Pending submit",
      tooltip:
        "The package is awaiting final hospital review before submission to the insurer.",
    },
    {
      label: isFinalApproval
        ? "Approved"
        : isFinalRejection
          ? "Rejected"
          : "Final decision",
      tooltip: isFinalApproval
        ? "The insurer approved the admission request."
        : isFinalRejection
          ? "The insurer issued a final decline for the admission request."
          : "The insurer's final decision is pending.",
    },
  ];

  return baseSteps.map((step, index) => ({
    ...step,
    state:
      isFinalRejection && index === 3
        ? "failed"
        : index < currentStep
          ? "complete"
          : index === currentStep
            ? isFinalApproval
              ? "complete"
              : "current"
            : "pending",
  }));
}

function getCurrentProgressStep(status: AdmissionStatus) {
  if (
    status === "INSURANCE_APPROVED" ||
    status === "INSURANCE_FINAL_REJECTED"
  ) {
    return 3;
  }

  if (
    status === "ADMIN_REVIEW" ||
    status === "SUBMITTING_TO_INSURANCE"
  ) {
    return 2;
  }

  return 1;
}

type SubmissionCheck = { label: string; passed: boolean; detail: string };

// Pre-submit review derived from the real admission data (identity, the
// rule-based policy eligibility result, the signed note, and prepared
// documents) instead of a fixed list of ticks.
function buildSubmissionChecks(patient: AdmissionRecord): SubmissionCheck[] {
  const failedPolicy = patient.policyChecks.filter(
    check => check.status === "failed",
  );
  const eligibilityOk =
    patient.policyEligibility === "ELIGIBLE" && failedPolicy.length === 0;
  const readyDocuments = patient.retrievedDocuments.filter(
    document => document.submissionStatus === "Ready to submit",
  );
  const documentsNeedReview = patient.retrievedDocuments.some(
    document => document.submissionStatus === "Requires review",
  );
  const documentsOk = readyDocuments.length > 0 && !documentsNeedReview;

  return [
    {
      label: "Patient identity matches the admission record",
      passed: Boolean(patient.name && patient.memberId),
      detail: `${patient.name} · ${patient.medicalRecordNumber}`,
    },
    {
      label: "Policy is active and eligible",
      passed: eligibilityOk,
      detail: eligibilityOk
        ? "All policy eligibility checks passed."
        : `Failed: ${
            failedPolicy.map(check => check.question).join("; ") ||
            "policy not eligible"
          }`,
    },
    {
      label: "Doctor note electronically signed",
      passed: patient.doctorNote.signed,
      detail: patient.doctorNote.signed
        ? `Signed by ${patient.doctorNote.signedBy ?? "the reviewing doctor"}`
        : "Awaiting the doctor's signature.",
    },
    {
      label: "Supporting documents ready",
      passed: documentsOk,
      detail: documentsOk
        ? `${readyDocuments.length} documents ready to submit.`
        : "Some documents still require review.",
    },
  ];
}

function AiCheckItem({
  label,
  passed,
  detail,
}: {
  label: string;
  passed: boolean;
  detail?: string;
}) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1}>
      {passed ? (
        <TaskAltRoundedIcon color="success" fontSize="small" />
      ) : (
        <CancelRoundedIcon color="error" fontSize="small" />
      )}
      <Box>
        <Typography variant="body2">{label}</Typography>
        {detail && (
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {detail}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Box bgcolor="grey.50" borderRadius={1} p={1.5}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        textTransform="uppercase"
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} mt={0.5}>
        {value}
      </Typography>
    </Box>
  );
}
