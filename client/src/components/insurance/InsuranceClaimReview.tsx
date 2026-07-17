import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { InsurerLabel } from "../InsurerChip";
import { PatientName } from "../PatientName";
import {
  type InsurerOutcome,
  useWorkflow,
} from "../../workflow/AdmissionWorkflowContext";

const decisionOptions: Array<{
  value: InsurerOutcome;
  title: string;
  detail: string;
  accent: string;
}> = [
  {
    value: "APPROVE",
    title: "Approve guarantee",
    detail: "Authorize the hospital to proceed with the requested admission.",
    accent: "#2dd4bf",
  },
  {
    value: "REJECT",
    title: "Request information",
    detail: "Return the package for a targeted hospital update.",
    accent: "#fbbf24",
  },
  {
    value: "FINAL_REJECT",
    title: "Decline request",
    detail: "Record a final coverage decision for this submission.",
    accent: "#fb7185",
  },
];

export function InsuranceClaimReview() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { admissions, reviewInsurerClaim } = useWorkflow();
  const [outcome, setOutcome] = useState<InsurerOutcome>("APPROVE");
  const [isResponding, setIsResponding] = useState(false);
  const admission = admissions.find(item => item.id === patientId);

  if (!admission) {
    return <Navigate to="/admin/gl-process" replace />;
  }

  const isAwaitingReview = admission.status === "SUBMITTING_TO_INSURANCE";
  const documents = admission.retrievedDocuments.filter(
    document => document.submissionStatus === "Ready to submit",
  );
  const selectedDecision = decisionOptions.find(
    option => option.value === outcome,
  )!;

  const sendResponse = () => {
    if (!isAwaitingReview) return;

    setIsResponding(true);
    window.setTimeout(() => {
      reviewInsurerClaim(admission.id, outcome);
      navigate(`/admin/gl-process/${admission.id}`);
    }, 1500);
  };

  return (
    <Box bgcolor="#0b1020" minHeight="100vh">
      <Box display="flex" minHeight="100vh">
        <Box
          component="aside"
          display={{ xs: "none", lg: "flex" }}
          flexDirection="column"
          width={264}
          flexShrink={0}
          px={3}
          py={3.5}
          color="#cbd5e1"
          borderRight="1px solid rgba(148, 163, 184, 0.14)"
          sx={{ background: "linear-gradient(180deg, #111a31 0%, #0b1020 100%)" }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              display="grid"
              width={38}
              height={38}
              borderRadius={1.5}
              sx={{
                placeItems: "center",
                background: "linear-gradient(135deg, #2dd4bf, #38bdf8)",
                color: "#06202a",
              }}
            >
              <ShieldOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography color="white" fontWeight={800} letterSpacing=".04em">
                PRISM CLAIMS
              </Typography>
              <Typography variant="caption" color="#94a3b8">
                Decision workspace
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="caption"
            fontWeight={800}
            color="#64748b"
            letterSpacing=".12em"
            mt={6}
            mb={1.5}
          >
            OPERATIONS
          </Typography>
          <Stack spacing={0.75}>
            <RailItem icon={<PendingActionsRoundedIcon />} label="Review queue" active />
            <RailItem icon={<PolicyOutlinedIcon />} label="Coverage rules" />
            <RailItem icon={<DescriptionOutlinedIcon />} label="Decision history" />
          </Stack>

          <Box
            mt="auto"
            p={2}
            borderRadius={2}
            border="1px solid rgba(45, 212, 191, 0.18)"
            bgcolor="rgba(45, 212, 191, 0.06)"
          >
            <Typography variant="caption" color="#5eead4" fontWeight={800}>
              SECURE REVIEW MODE
            </Typography>
            <Typography variant="body2" color="#94a3b8" mt={0.75} lineHeight={1.55}>
              Decisions are recorded against the submitted package and shared
              with the hospital workflow.
            </Typography>
          </Box>
        </Box>

        <Box flex={1} minWidth={0} bgcolor="#f4f7fb">
          <Box
            component="header"
            position="sticky"
            top={0}
            zIndex={10}
            height={72}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={{ xs: 2.5, sm: 4, lg: 5 }}
            borderBottom="1px solid #dbe3ef"
            bgcolor="rgba(244, 247, 251, 0.92)"
            sx={{ backdropFilter: "blur(16px)" }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                display={{ xs: "grid", lg: "none" }}
                width={32}
                height={32}
                borderRadius={1.25}
                sx={{ placeItems: "center", bgcolor: "#0f2742", color: "#5eead4" }}
              >
                <ShieldOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="#64748b" fontWeight={700}>
                  Claims / Inpatient guarantee / {admission.medicalRecordNumber}
                </Typography>
                <Typography variant="caption" color="#94a3b8">
                  Review case · Received today
                </Typography>
              </Box>
            </Stack>
            <Chip
              icon={<PendingActionsRoundedIcon />}
              label={isAwaitingReview ? "Decision required" : "Decision recorded"}
              sx={{
                fontWeight: 800,
                bgcolor: isAwaitingReview ? "#fff4d6" : "#dcfce7",
                color: isAwaitingReview ? "#92400e" : "#166534",
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
          </Box>

          <Box component="main" maxWidth={1440} mx="auto" px={{ xs: 2.5, sm: 4, lg: 5 }} py={{ xs: 3, lg: 4 }}>
            <Button
              size="small"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate(`/admin/gl-process/${admission.id}`)}
              sx={{ color: "#475569", mb: 3 }}
            >
              Return to hospital package
            </Button>

            <Box
              borderRadius={{ xs: 2.5, md: 3 }}
              overflow="hidden"
              sx={{ background: "linear-gradient(110deg, #102d4f 0%, #174466 58%, #0f766e 145%)" }}
            >
              <Box
                p={{ xs: 3, md: 4.5 }}
                minHeight={{ md: 220 }}
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                gap={3}
                position="relative"
                sx={{
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    width: 250,
                    height: 250,
                    borderRadius: "50%",
                    right: -75,
                    top: -130,
                    border: "48px solid rgba(94, 234, 212, 0.12)",
                  },
                }}
              >
                <Box position="relative" zIndex={1}>
                  <Typography variant="overline" fontWeight={800} color="#99f6e4" letterSpacing=".14em">
                    INPATIENT GUARANTEE REVIEW
                  </Typography>
                  <Typography variant="h3" color="white" fontWeight={800} mt={0.5} sx={{ letterSpacing: "-.045em" }}>
                    Claim assessment
                  </Typography>
                  <Typography color="#cbd5e1" mt={1.25} maxWidth={580}>
                    Validate the submitted evidence, coverage context, and
                    clinical rationale before committing an insurer decision.
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                  position="relative"
                  zIndex={1}
                  alignSelf={{ md: "flex-end" }}
                >
                  <Box
                    display="grid"
                    width={48}
                    height={48}
                    borderRadius="50%"
                    sx={{ placeItems: "center", bgcolor: "rgba(255,255,255,.13)", color: "#99f6e4" }}
                  >
                    <VerifiedUserOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#99f6e4" fontWeight={800} letterSpacing=".1em">
                      MEMBER
                    </Typography>
                    <PatientName name={admission.name} gender={admission.gender} variant="subtitle1" />
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", xl: "minmax(0, 1fr) 380px" }}
              gap={3}
              mt={3}
            >
              <Stack spacing={3} minWidth={0}>
                <Box bgcolor="white" border="1px solid #dbe3ef" borderRadius={2.5} p={{ xs: 2.5, md: 3.5 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="overline" color="#0f766e" fontWeight={800} letterSpacing=".12em">
                        CASE SNAPSHOT
                      </Typography>
                      <Typography variant="h5" fontWeight={800} color="#14213d" mt={0.25}>
                        Submitted admission package
                      </Typography>
                    </Box>
                    <Chip label="Standard review" size="small" variant="outlined" sx={{ alignSelf: "flex-start", borderColor: "#cbd5e1", color: "#475569", fontWeight: 700 }} />
                  </Stack>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)" }}
                    gap={1.5}
                    mt={3}
                  >
                    <DossierItem label="Insurer" value={<InsurerLabel insurer={admission.insurer} />} />
                    <DossierItem label="Member reference" value={admission.memberId} />
                    <DossierItem label="Coverage plan" value={admission.policyPlan} />
                    <DossierItem label="Admission reason" value={admission.admissionReason} />
                  </Box>
                </Box>

                <Box bgcolor="white" border="1px solid #dbe3ef" borderRadius={2.5} overflow="hidden">
                  <Box px={{ xs: 2.5, md: 3.5 }} py={2.5} borderBottom="1px solid #e8edf4">
                    <Typography variant="h6" color="#14213d" fontWeight={800}>
                      Evidence register
                    </Typography>
                    <Typography variant="body2" color="#64748b" mt={0.5}>
                      Documents that were included in the package sent by the hospital.
                    </Typography>
                  </Box>
                  <Stack divider={<Divider flexItem />}>
                    {documents.map(document => (
                      <Stack
                        key={document.id}
                        direction="row"
                        alignItems="center"
                        spacing={1.75}
                        px={{ xs: 2.5, md: 3.5 }}
                        py={2}
                      >
                        <Box
                          display="grid"
                          flexShrink={0}
                          width={38}
                          height={38}
                          borderRadius={1.5}
                          sx={{ placeItems: "center", bgcolor: "#ecfdf5", color: "#059669" }}
                        >
                          <DescriptionOutlinedIcon fontSize="small" />
                        </Box>
                        <Box minWidth={0} flex={1}>
                          <Typography variant="body2" fontWeight={800} color="#1e293b">
                            {document.name}
                          </Typography>
                          <Typography variant="caption" color="#64748b">
                            {document.source} · {document.detail}
                          </Typography>
                        </Box>
                        <CheckCircleRoundedIcon sx={{ color: "#10b981", fontSize: 19 }} />
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Box bgcolor="#e8f1ff" border="1px solid #c7dcfb" borderRadius={2.5} p={{ xs: 2.5, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box color="#2563eb" mt={0.25}>
                      <PolicyOutlinedIcon />
                    </Box>
                    <Box>
                      <Typography fontWeight={800} color="#1e3a66">
                        Clinical sign-off
                      </Typography>
                      <Typography variant="body2" color="#486487" mt={0.5} lineHeight={1.65}>
                        {admission.doctorNote.signed
                          ? `Admission note verified and signed by ${admission.doctorNote.signedBy ?? "the reviewing doctor"}.`
                          : "The package does not include a signed doctor admission note."}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>

              <Box
                alignSelf="start"
                position={{ xl: "sticky" }}
                top={{ xl: 96 }}
                bgcolor="#111a31"
                borderRadius={2.5}
                overflow="hidden"
                boxShadow="0 22px 45px rgba(15, 23, 42, 0.16)"
              >
                <Box p={{ xs: 2.5, md: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="overline" color="#5eead4" fontWeight={800} letterSpacing=".12em">
                        DECISION CHECKPOINT
                      </Typography>
                      <Typography variant="h6" color="white" fontWeight={800} mt={0.25}>
                        Record insurer response
                      </Typography>
                    </Box>
                    <GavelRoundedIcon sx={{ color: "#5eead4" }} />
                  </Stack>

                  {isAwaitingReview ? (
                    <>
                      <Typography variant="body2" color="#94a3b8" mt={1.5} lineHeight={1.6}>
                        Select one decision. The hospital team receives the response immediately after it is recorded.
                      </Typography>
                      <FormControl fullWidth sx={{ mt: 2.5 }}>
                        <RadioGroup
                          value={outcome}
                          onChange={event => setOutcome(event.target.value as InsurerOutcome)}
                        >
                          <Stack spacing={1}>
                            {decisionOptions.map(option => (
                              <Box
                                key={option.value}
                                borderRadius={1.5}
                                border="1px solid"
                                borderColor={outcome === option.value ? option.accent : "rgba(148, 163, 184, 0.2)"}
                                bgcolor={outcome === option.value ? "rgba(255,255,255,.07)" : "transparent"}
                                sx={{ transition: "background-color 160ms ease, border-color 160ms ease" }}
                              >
                                <FormControlLabel
                                  value={option.value}
                                  control={<Radio size="small" sx={{ color: "#64748b", "&.Mui-checked": { color: option.accent } }} />}
                                  label={
                                    <Box py={1.15} pr={1}>
                                      <Typography variant="body2" color="white" fontWeight={800}>
                                        {option.title}
                                      </Typography>
                                      <Typography variant="caption" color="#94a3b8" lineHeight={1.45}>
                                        {option.detail}
                                      </Typography>
                                    </Box>
                                  }
                                  sx={{ alignItems: "flex-start", m: 0, width: "100%" }}
                                />
                              </Box>
                            ))}
                          </Stack>
                        </RadioGroup>
                      </FormControl>

                      <Alert
                        icon={<DescriptionOutlinedIcon fontSize="inherit" />}
                        severity="info"
                        sx={{
                          mt: 2.5,
                          bgcolor: "rgba(56, 189, 248, 0.12)",
                          color: "#cbd5e1",
                          "& .MuiAlert-icon": { color: "#7dd3fc" },
                        }}
                      >
                        Demo response: <strong>{selectedDecision.title}</strong> will update the hospital workflow.
                      </Alert>

                      <Button
                        fullWidth
                        variant="contained"
                        loading={isResponding}
                        disabled={isResponding}
                        onClick={sendResponse}
                        endIcon={!isResponding ? <KeyboardArrowRightRoundedIcon /> : undefined}
                        sx={{
                          mt: 2.5,
                          bgcolor: selectedDecision.accent,
                          color: "#07121f",
                          boxShadow: "none",
                          "&:hover": { bgcolor: selectedDecision.accent, filter: "brightness(.94)", boxShadow: "none" },
                        }}
                      >
                        {isResponding ? "Recording response…" : "Confirm decision"}
                      </Button>
                    </>
                  ) : (
                    <Alert severity="success" sx={{ mt: 2.5 }}>
                      A decision has already been recorded for this submission.
                    </Alert>
                  )}
                </Box>
                <Box px={3} py={1.5} bgcolor="rgba(255,255,255,.05)" borderTop="1px solid rgba(148, 163, 184, .14)">
                  <Typography variant="caption" color="#94a3b8">
                    Case ID · {admission.id}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function RailItem({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1.5}
      px={1.5}
      py={1.25}
      borderRadius={1.5}
      color={active ? "#ccfbf1" : "#94a3b8"}
      bgcolor={active ? "rgba(45, 212, 191, 0.12)" : "transparent"}
    >
      <Box display="grid" sx={{ placeItems: "center" }}>{icon}</Box>
      <Typography variant="body2" fontWeight={active ? 800 : 600}>
        {label}
      </Typography>
    </Box>
  );
}

function DossierItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box p={1.75} borderRadius={1.5} bgcolor="#f8fafc" border="1px solid #e8edf4">
      <Typography variant="caption" color="#64748b" fontWeight={800} letterSpacing=".08em" textTransform="uppercase">
        {label}
      </Typography>
      <Typography variant="body2" color="#1e293b" fontWeight={800} mt={0.5}>
        {value}
      </Typography>
    </Box>
  );
}
