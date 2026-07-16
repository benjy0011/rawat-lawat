import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useEffect, useState, type ReactNode } from "react";
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
  InsurerOutcome,
  RetrievedDocument,
  WorkflowEvent,
} from "../../workflow/AdmissionWorkflowContext";
import { useWorkflow } from "../../workflow/AdmissionWorkflowContext";
import { useNavigate } from "react-router-dom";
import { AdminShell } from "./AdminShell";
import { PatientName } from "../PatientName";
import { InsurerLabel } from "../InsurerChip";

type StatusDetails = {
  label: string;
  detail: string;
  color: "default" | "info" | "warning" | "error" | "success";
};

const statusDetails: Record<AdmissionStatus, StatusDetails> = {
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

const preparationSteps: Array<{
  title: string;
  detail: string;
  icon: ReactNode;
}> = [
  {
    title: "Retrieving verified patient details",
    detail: "Matching identity, member ID, and admission information.",
    icon: <FactCheckOutlinedIcon />,
  },
  {
    title: "Checking policy and panel eligibility",
    detail: "Confirming coverage and hospital eligibility for this admission.",
    icon: <PolicyOutlinedIcon />,
  },
  {
    title: "Preparing the GL submission package",
    detail: "Organising clinical notes, supporting data, and insurer requirements.",
    icon: <DescriptionOutlinedIcon />,
  },
];

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
  const { submitToInsurer, setNextInsurerOutcome } = useWorkflow();
  const [isPreparing, setIsPreparing] = useState(true);
  const [activePreparationStep, setActivePreparationStep] = useState(0);
  const [resubmissionStep, setResubmissionStep] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<RetrievedDocument | null>(null);
  const currentStatus = statusDetails[patient.status];
  const pendingDoctorSignature = !patient.doctorNote.signed;
  const readyToSubmit =
    patient.status === "ADMIN_REVIEW" && !pendingDoctorSignature;
  const isSubmitting = patient.status === "SUBMITTING_TO_INSURANCE";
  const isApproved = patient.status === "INSURANCE_APPROVED";
  const isFinalRejected = patient.status === "INSURANCE_FINAL_REJECTED";
  const isAiResubmitting = patient.status === "AI_RESUBMISSION";

  useEffect(() => {
    const firstStep = window.setTimeout(() => setActivePreparationStep(1), 2150);
    const secondStep = window.setTimeout(() => setActivePreparationStep(2), 2800);
    const complete = window.setTimeout(() => setIsPreparing(false), 3550);

    return () => {
      window.clearTimeout(firstStep);
      window.clearTimeout(secondStep);
      window.clearTimeout(complete);
    };
  }, [patient.id]);

  useEffect(() => {
    if (!isAiResubmitting) {
      return;
    }

    const resetPreparation = window.setTimeout(() => setResubmissionStep(0), 0);
    const firstStep = window.setTimeout(() => setResubmissionStep(1), 2000);
    const secondStep = window.setTimeout(() => setResubmissionStep(2), 2800);

    return () => {
      window.clearTimeout(resetPreparation);
      window.clearTimeout(firstStep);
      window.clearTimeout(secondStep);
    };
  }, [isAiResubmitting]);

  if (isPreparing || isAiResubmitting) {
    return (
      <AdminShell>
        <PackagePreparation
          patient={patient}
          activeStep={isAiResubmitting ? resubmissionStep : activePreparationStep}
          isResubmission={isAiResubmitting}
        />
      </AdminShell>
    );
  }

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
            <Box mt={0.5}>
              <PatientName
                name={patient.name}
                gender={patient.gender}
                variant="h4"
              />
            </Box>
            <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={0.75} mt={1}>
              <Typography variant="body2" color="text.secondary">
                {patient.medicalRecordNumber} ·
              </Typography>
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
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="overline"
                  color="primary"
                  fontWeight={800}
                  letterSpacing=".12em"
                >
                  Complete admission package
                </Typography>
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
                    <Typography variant="h6">AI-retrieved documents</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Evidence prepared for the pending insurer submission.
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={0} mt={2.5} divider={<Divider flexItem />}>
                  {patient.retrievedDocuments.map(document => (
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

            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">Workflow timeline</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      A complete record of this admission request.
                    </Typography>
                  </Box>
                  <Chip
                    label={`${patient.timeline.length} updates`}
                    size="small"
                    variant="outlined"
                  />
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
                  {patient.timeline.map((item, index) => (
                    <TimelineItem key={`${item.occurredAt}-${index}`}>
                      <TimelineSeparator>
                        <TimelineDot
                          sx={{
                            m: 0,
                            p: 0.75,
                            color: timelineEventStyles[item.actor].color,
                            bgcolor: timelineEventStyles[item.actor].backgroundColor,
                            boxShadow: "none",
                          }}
                        >
                          {timelineEventStyles[item.actor].icon}
                        </TimelineDot>
                        {index < patient.timeline.length - 1 && (
                          <TimelineConnector
                            sx={{ bgcolor: "divider", width: 2, my: 0.5 }}
                          />
                        )}
                      </TimelineSeparator>
                      <TimelineContent
                        sx={{
                          pt: 0,
                          pb: index === patient.timeline.length - 1 ? 0 : 2.5,
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
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="overline"
                  color="primary"
                  fontWeight={800}
                  letterSpacing=".12em"
                >
                  Current step
                </Typography>
                <Typography variant="h6" mt={0.5}>
                  {currentStatus.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {currentStatus.detail}
                </Typography>

                {patient.insurerFeedback && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Insurer requirements
                    </Typography>
                    <Box component="ul" my={1} pl={2.5}>
                      {patient.insurerFeedback.map((requirement) => (
                        <li key={requirement}>{requirement}</li>
                      ))}
                    </Box>
                  </Alert>
                )}

                {pendingDoctorSignature && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Submission locked pending doctor signature
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                      AI has gathered the package documents, but the clinical note must be electronically signed before this request can be sent to the insurer.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card
              sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
            >
              <CardContent>
                <Typography
                  variant="overline"
                  sx={{ color: "white" }}
                  fontWeight={800}
                  letterSpacing=".12em"
                >
                  Mock insurer response
                </Typography>

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
                        sx={{ color: "primary.light" }}
                      >
                        The AI-prepared documents are ready to review. Submission will unlock after the doctor signs the note.
                      </Typography>
                    )}
                    <Button
                      fullWidth
                      variant="contained"
                      color="inherit"
                      disabled={!readyToSubmit || isSubmitting}
                      onClick={() => submitToInsurer(patient.id)}
                      sx={{
                        mt: 3,
                        bgcolor: "common.white",
                        color: "primary.main",
                        "&:hover": { bgcolor: "grey.100" },
                      }}
                    >
                      {pendingDoctorSignature
                        ? "Awaiting doctor signature"
                        : isSubmitting
                          ? "Sending package…"
                          : "Submit to insurance"}
                    </Button>
                  </>
                )}
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

function PackagePreparation({
  patient,
  activeStep,
  isResubmission,
}: {
  patient: AdmissionRecord;
  activeStep: number;
  isResubmission: boolean;
}) {
  const progress = ((activeStep + 1) / preparationSteps.length) * 100;
  const taskDescription = isResubmission
    ? "Reconciling insurer feedback with verified hospital records."
    : "Retrieving relevant information for insurance approval.";

  return (
    <Box
      component="main"
      display="grid"
      minHeight="calc(100vh - 64px)"
      px={{ xs: 2.5, lg: 5 }}
      py={4}
      sx={{ placeItems: "center" }}
    >
      <Card
        className="ai-preparation-card"
        sx={{
          width: "100%",
          maxWidth: 680,
          overflow: "hidden",
          boxShadow: 8,
        }}
      >
        <Box
          sx={{
            height: 6,
            background: "linear-gradient(90deg, #003d9b, #36a9e1, #00a887)",
            backgroundSize: "200% 100%",
            animation: "preparationGlow 1.8s ease-in-out infinite",
            "@keyframes preparationGlow": {
              "0%": { backgroundPosition: "0% 50%" },
              "100%": { backgroundPosition: "200% 50%" },
            },
          }}
        />
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack alignItems="center" textAlign="center" aria-live="polite" role="status">
            <Box
              className="ai-loader"
              display="grid"
              width={96}
              height={96}
              color="common.white"
              sx={{ placeItems: "center" }}
            >
              <Box className="ai-loader-ring ai-loader-ring-one" />
              <Box className="ai-loader-ring ai-loader-ring-two" />
              <Box className="ai-loader-particle ai-loader-particle-one" />
              <Box className="ai-loader-particle ai-loader-particle-two" />
              <Box className="ai-loader-core">
                <AutoAwesomeRoundedIcon fontSize="large" />
              </Box>
            </Box>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em" mt={2}>
              AI admission assistant
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              flexWrap="wrap"
              spacing={0.75}
              mt={0.5}
            >
              {isResubmission ? (
                <Typography variant="h5" fontWeight={700}>
                  Rebuilding the insurer submission
                </Typography>
              ) : (
                <>
                  <Typography variant="h5" fontWeight={700}>
                    Preparing
                  </Typography>
                  <PatientName
                    name={patient.name}
                    gender={patient.gender}
                    variant="h5"
                  />
                  <Typography variant="h5" fontWeight={700}>
                    &apos;s GL package
                  </Typography>
                </>
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {taskDescription}
            </Typography>
          </Stack>

          <Box className="ai-progress-track" mt={4} height={8} borderRadius={4} overflow="hidden" bgcolor="grey.100">
            <Box
              className="ai-progress-value"
              height="100%"
              width={`${progress}%`}
              bgcolor="primary.main"
              borderRadius={4}
              sx={{ transition: "width 500ms ease" }}
            />
          </Box>

          <Stack spacing={1.5} mt={3}>
            {preparationSteps.map((step, index) => {
              const isComplete = index < activeStep;
              const isActive = index === activeStep;

              return (
                <Stack
                  key={step.title}
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  p={1.5}
                  borderRadius={2}
                  bgcolor={isActive ? "rgba(0, 61, 155, 0.08)" : "transparent"}
                  className={isActive ? "ai-preparation-step-active" : undefined}
                  sx={{
                    opacity: index <= activeStep ? 1 : 0.45,
                    transition: "opacity 300ms ease, background-color 300ms ease",
                  }}
                >
                  <Box
                    color={
                      isComplete
                        ? "success.main"
                        : isActive
                          ? "primary.main"
                          : "text.disabled"
                    }
                  >
                    {isComplete ? <CheckCircleRoundedIcon /> : step.icon}
                  </Box>
                  <Box textAlign="left">
                    <Typography variant="subtitle2">{step.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.detail}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </Box>
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
            color={document.submissionStatus === "Ready to submit" ? "success" : "warning"}
            size="small"
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "grey.100", p: { xs: 2, sm: 4 } }}>
        {document.id === "doctor-note" ? (
          <Box maxWidth={760} mx="auto">
            <AdmissionNoteDocument
              admission={patient}
              signatureContent={
                patient.doctorNote.signed ? (
                  <SignedAdmissionSignature
                    signatureName={patient.doctorNote.signedBy ?? "Reviewing doctor"}
                    signedAt={patient.doctorNote.signedAt}
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
        { heading: "Eligibility result", content: "Active coverage and panel-hospital eligibility have been confirmed." },
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

function OutcomeSelector({
  outcome,
  onChange,
}: {
  outcome: InsurerOutcome;
  onChange: (outcome: InsurerOutcome) => void;
}) {
  return (
    <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
      <Typography variant="body2" sx={{ color: "white" }}>
        Choose the insurer response for this submission:
      </Typography>
      <RadioGroup
        value={outcome}
        onChange={(event) => onChange(event.target.value as InsurerOutcome)}
      >
        <FormControlLabel
          value="APPROVE"
          control={
            <Radio
              sx={{
                color: "primary.light",
                "&.Mui-checked": { color: "common.white" },
              }}
            />
          }
          label="Approve claim"
        />
        <FormControlLabel
          value="REJECT"
          control={
            <Radio
              sx={{
                color: "primary.light",
                "&.Mui-checked": { color: "common.white" },
              }}
            />
          }
          label="Reject, then resubmit"
        />
        <FormControlLabel
          value="FINAL_REJECT"
          control={
            <Radio
              sx={{
                color: "primary.light",
                "&.Mui-checked": { color: "common.white" },
              }}
            />
          }
          label="Final decline"
        />
      </RadioGroup>
    </FormControl>
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
