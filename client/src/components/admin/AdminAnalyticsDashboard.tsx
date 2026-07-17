import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import type { ReactNode } from "react";
import { AdminShell } from "./AdminShell";
import { useWorkflow } from "../../workflow/AdmissionWorkflowContext";

const weeklyVolume = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 46 },
  { day: "Thu", value: 71 },
  { day: "Fri", value: 64 },
  { day: "Sat", value: 32 },
  { day: "Sun", value: 27 },
];

const insurerPerformance = [
  { name: "AIA Malaysia", rate: 94, time: "18 min", color: "#2e7d32" },
  { name: "Great Eastern", rate: 89, time: "24 min", color: "#1565c0" },
  { name: "Prudential", rate: 86, time: "31 min", color: "#8e24aa" },
  { name: "Allianz", rate: 82, time: "36 min", color: "#ed6c02" },
];

export function AdminAnalyticsDashboard() {
  const { admissions } = useWorkflow();
  const waitingForDoctor = admissions.filter(
    (admission) => admission.status === "DOCTOR_REVIEW",
  ).length;
  const waitingForInsurer = admissions.filter(
    (admission) => admission.status === "SUBMITTING_TO_INSURANCE",
  ).length;
  const readyForReview = admissions.filter(
    (admission) => admission.status === "ADMIN_REVIEW",
  ).length;
  const activeAdmissions = admissions.filter(
    (admission) =>
      !["INSURANCE_APPROVED", "INSURANCE_FINAL_REJECTED"].includes(
        admission.status,
      ),
  ).length;

  return (
    <AdminShell>
      <Box
        component="main"
        maxWidth="xl"
        mx="auto"
        px={{ xs: 2.5, lg: 5 }}
        py={4}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "flex-end" }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="overline"
              color="primary"
              fontWeight={800}
              letterSpacing=".12em"
            >
              Analytics
            </Typography>
            <Typography variant="h4" fontWeight={800} mt={0.5}>
              Admissions intelligence
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              A mock operational view for Central Hospital HQ.
            </Typography>
          </Box>
          <Chip label="Live mock data" color="success" variant="outlined" />
        </Stack>

        <Card
          sx={{
            mt: 4,
            overflow: "hidden",
            color: "common.white",
            background:
              "radial-gradient(circle at 82% 12%, rgba(54, 169, 225, .72), transparent 26%), linear-gradient(115deg, #00275f, #003d9b 62%, #0056c7)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", md: "1.2fr .8fr" }}
              gap={4}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BoltRoundedIcon color="warning" />
                  <Typography variant="subtitle2" fontWeight={800}>
                    Workflow pulse
                  </Typography>
                </Stack>
                <Typography variant="h3" fontWeight={800} mt={2}>
                  92%
                </Typography>
                <Typography variant="body1" mt={0.5}>
                  packages clear the AI readiness check on their first pass.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={3}>
                  <Chip
                    label="↑ 6.4% vs last week"
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,.16)", color: "white" }}
                  />
                  <Chip
                    label="Target: 90%"
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,.12)", color: "white" }}
                  />
                </Stack>
              </Box>
              <Box alignSelf="end" minHeight={130}>
                <svg
                  viewBox="0 0 360 130"
                  width="100%"
                  height="130"
                  aria-label="Mock admissions pulse chart"
                >
                  <defs>
                    <linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#81d4fa" stopOpacity=".55" />
                      <stop offset="100%" stopColor="#81d4fa" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 98 C28 92 38 70 64 76 S104 108 132 70 S164 20 198 56 S244 92 274 50 S318 28 360 12 L360 130 L0 130 Z"
                    fill="url(#pulseFill)"
                  />
                  <path
                    d="M0 98 C28 92 38 70 64 76 S104 108 132 70 S164 20 198 56 S244 92 274 50 S318 28 360 12"
                    fill="none"
                    stroke="#b3e5fc"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="360" cy="12" r="6" fill="#ffca28" />
                </svg>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={2}
          mt={3}
        >
          <MetricCard
            icon={<GroupsRoundedIcon />}
            label="Active admissions"
            value={String(activeAdmissions)}
            detail="In the current workflow"
            color="#1565c0"
          />
          <MetricCard
            icon={<CheckCircleRoundedIcon />}
            label="Ready to submit"
            value={String(readyForReview)}
            detail="Awaiting admin confirmation"
            color="#2e7d32"
          />
          <MetricCard
            icon={<TimerOutlinedIcon />}
            label="Waiting for doctor"
            value={String(waitingForDoctor)}
            detail="One response needs attention"
            color="#ed6c02"
          />
          <MetricCard
            icon={<QueryStatsRoundedIcon />}
            label="Waiting for insurer"
            value={String(waitingForInsurer)}
            detail="Within mock SLA window"
            color="#7b1fa2"
          />
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", lg: "1.35fr .65fr" }}
          gap={3}
          mt={3}
        >
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6">Weekly submission volume</Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Mock guarantee-letter packages submitted this week.
                  </Typography>
                </Box>
                <TrendingUpRoundedIcon color="success" />
              </Stack>
              <Stack
                direction="row"
                alignItems="flex-end"
                spacing={{ xs: 1, sm: 2 }}
                height={210}
                mt={4}
              >
                {weeklyVolume.map((item) => (
                  <Stack
                    key={item.day}
                    flex={1}
                    alignItems="center"
                    spacing={1}
                    height="100%"
                    justifyContent="flex-end"
                  >
                    <Typography variant="caption" fontWeight={700}>
                      {item.value}
                    </Typography>
                    <Box
                      width="100%"
                      maxWidth={48}
                      height={`${item.value * 2}px`}
                      borderRadius="8px 8px 3px 3px"
                      sx={{
                        background: "linear-gradient(180deg, #36a9e1, #003d9b)",
                        transition: "height 300ms ease",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {item.day}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Approval outlook</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Rolling mock insurer outcomes.
              </Typography>
              <Box
                display="grid"
                placeItems="center"
                width={150}
                height={150}
                borderRadius="50%"
                mx="auto"
                my={3}
                sx={{
                  background:
                    "conic-gradient(#2e7d32 0 88%, #ed6c02 88% 96%, #e0e0e0 96% 100%)",
                }}
              >
                <Box
                  display="grid"
                  placeItems="center"
                  width={112}
                  height={112}
                  borderRadius="50%"
                  bgcolor="background.paper"
                >
                  <Typography variant="h4" fontWeight={800}>
                    88%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    approved
                  </Typography>
                </Box>
              </Box>
              <Stack spacing={1}>
                <Legend color="#2e7d32" label="Approved" value="88%" />
                <Legend color="#ed6c02" label="Needs revision" value="8%" />
                <Legend color="#cbd5e1" label="Final decline" value="4%" />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }}
          gap={3}
          mt={3}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Insurer performance</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                First-pass clearance and average response time.
              </Typography>
              <Stack spacing={2.25} mt={3}>
                {insurerPerformance.map((insurer) => (
                  <Box key={insurer.name}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {insurer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {insurer.time}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      mt={0.75}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={insurer.rate}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 8,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: insurer.color,
                            borderRadius: 8,
                          },
                        }}
                      />
                      <Typography variant="caption" fontWeight={800}>
                        {insurer.rate}%
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningAmberRoundedIcon color="warning" />
                <Typography variant="h6">Attention queue</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Smart prompts based on the current mock workflow.
              </Typography>
              <Stack spacing={1.5} mt={3}>
                <Insight
                  title="Doctor response overdue"
                  detail={`${waitingForDoctor || 1} admission has been waiting for more than five hours.`}
                  tone="warning"
                />
                <Insight
                  title="Fastest approval path"
                  detail="AIA packages are clearing 18 minutes faster than the weekly average."
                  tone="success"
                />
                <Insight
                  title="AI readiness opportunity"
                  detail="Three packages could reach first-pass readiness by attaching the latest clinical evidence."
                  tone="info"
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </AdminShell>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} mt={1}>
              {value}
            </Typography>
          </Box>
          <Box
            display="grid"
            width={38}
            height={38}
            borderRadius={2}
            sx={{ placeItems: "center", color, bgcolor: `${color}14` }}
          >
            {icon}
          </Box>
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1.5}
        >
          {detail}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box width={9} height={9} borderRadius="50%" bgcolor={color} />
        <Typography variant="body2">{label}</Typography>
      </Stack>
      <Typography variant="body2" fontWeight={800}>
        {value}
      </Typography>
    </Stack>
  );
}

function Insight({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: "warning" | "success" | "info";
}) {
  return (
    <Box
      borderLeft={3}
      borderColor={`${tone}.main`}
      bgcolor={`${tone}.50`}
      borderRadius={1}
      p={1.5}
    >
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="body2" color="text.secondary" mt={0.25}>
        {detail}
      </Typography>
    </Box>
  );
}
