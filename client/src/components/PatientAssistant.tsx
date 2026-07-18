import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useAuth } from "../auth/useAuth";
import {
  type AdmissionStatus,
  useWorkflow,
} from "../workflow/AdmissionWorkflowContext";
import { askAssistant, type ChatMessage } from "../lib/api";

const STATUS_LABEL: Record<AdmissionStatus, string> = {
  PENDING_ADMIN_APPROVAL: "Awaiting hospital approval",
  AI_PREPARING: "Preparing your admission package",
  DOCTOR_REVIEW: "Awaiting the doctor's signature",
  ADMIN_REVIEW: "Hospital completing the final review",
  SUBMITTING_TO_INSURANCE: "Submitted to the insurer",
  INSURANCE_REJECTED: "Insurer requested more information",
  AI_RESUBMISSION: "Updating the package for the insurer",
  INSURANCE_APPROVED: "Approved — guarantee letter issued",
  INSURANCE_FINAL_REJECTED: "Declined by the insurer",
};

const SUGGESTIONS = [
  "What's the status of my admission?",
  "Why is it not eligible?",
  "What should I do next?",
];

export function PatientAssistant() {
  const { session } = useAuth();
  const { admissions, profiles } = useWorkflow();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const buildContext = () => {
    const mine = admissions.filter(
      item => item.patientEmail === session?.email,
    );
    const profile = profiles.find(
      item => item.patientEmail === session?.email,
    );

    return {
      patientName: session?.name,
      admissions: mine.map(item => ({
        hospital: item.hospitalName,
        status: STATUS_LABEL[item.status],
        admissionReason: item.admissionReason,
        diagnosis: item.doctorNote.diagnosis ?? null,
        estimatedCost: item.doctorNote.estimatedCost ?? null,
        doctorNoteSigned: item.doctorNote.signed,
        policyEligibility: item.policyEligibility,
        failedChecks: item.policyChecks
          .filter(check => check.status === "failed")
          .map(check => check.detail ?? check.question),
        insurerRequirements:
          item.insurerFeedback?.map(req => `${req.label} — ${req.status}`) ?? [],
        insurerDecisionNote: item.insurerDecisionNote ?? null,
        insurer: item.insurer,
        plan: item.policyPlan,
        memberId: item.memberId,
        recentActivity: item.timeline
          .slice(-6)
          .map(event => `${event.actor}: ${event.message}`),
      })),
      policy: profile
        ? {
            provider: profile.policy.provider,
            plan: profile.policy.coverageTier,
            policyNumber: profile.policy.policyNumber,
            expiry: profile.policy.expiryDate,
          }
        : null,
    };
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const reply = await askAssistant(next, buildContext());
      setMessages(current => [...current, { role: "assistant", content: reply }]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Sorry, something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  };

  if (!open) {
    return (
      <Fab
        color="primary"
        aria-label="Open claims assistant"
        onClick={() => setOpen(true)}
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}
      >
        <SmartToyRoundedIcon />
      </Fab>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1300,
        width: { xs: "calc(100vw - 32px)", sm: 372 },
        height: 520,
        maxHeight: "75vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ bgcolor: "primary.main", color: "white", px: 2, py: 1.5 }}
      >
        <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 34, height: 34 }}>
          <SmartToyRoundedIcon fontSize="small" />
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography fontWeight={700} lineHeight={1.2}>
            Claims Assistant
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            Answers about your admission
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-label="Close assistant"
          onClick={() => setOpen(false)}
          sx={{ color: "white" }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box
        ref={scrollRef}
        sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "grey.50" }}
      >
        {messages.length === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Hi{session?.name ? ` ${session.name.split(" ")[0]}` : ""}! Ask me
              anything about your admission and coverage.
            </Typography>
            <Stack spacing={1} mt={1.5}>
              {SUGGESTIONS.map(text => (
                <Chip
                  key={text}
                  label={text}
                  variant="outlined"
                  onClick={() => void send(text)}
                  sx={{ justifyContent: "flex-start", height: "auto", py: 0.75 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Stack spacing={1.25}>
          {messages.map((message, index) => (
            <Box
              key={index}
              alignSelf={message.role === "user" ? "flex-end" : "flex-start"}
              sx={{
                maxWidth: "85%",
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: message.role === "user" ? "primary.main" : "white",
                color: message.role === "user" ? "white" : "text.primary",
                border: message.role === "user" ? "none" : 1,
                borderColor: "divider",
                whiteSpace: "pre-wrap",
              }}
            >
              <Typography variant="body2">{message.content}</Typography>
            </Box>
          ))}

          {loading && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              alignSelf="flex-start"
              sx={{ px: 1.5, py: 1 }}
            >
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary">
                Thinking…
              </Typography>
            </Stack>
          )}

          {error && (
            <Typography variant="caption" color="error" alignSelf="flex-start">
              {error}
            </Typography>
          )}
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-end"
        sx={{ p: 1.25, borderTop: 1, borderColor: "divider" }}
      >
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={3}
          placeholder="Ask a question…"
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton
          color="primary"
          aria-label="Send"
          disabled={!input.trim() || loading}
          onClick={() => void send(input)}
        >
          <SendRoundedIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}
