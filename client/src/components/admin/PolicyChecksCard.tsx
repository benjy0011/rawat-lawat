import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import type {
  PolicyCheck,
  PolicyEligibility,
} from "../../workflow/AdmissionWorkflowContext";

function statusIcon(status: PolicyCheck["status"]) {
  switch (status) {
    case "passed":
      return <TaskAltRoundedIcon color="success" fontSize="small" />;
    case "failed":
      return <CancelRoundedIcon color="error" fontSize="small" />;
    case "checking":
      return <HourglassEmptyRoundedIcon color="warning" fontSize="small" />;
    default:
      return <RadioButtonUncheckedRoundedIcon color="disabled" fontSize="small" />;
  }
}

type Props = {
  checks: PolicyCheck[];
  eligibility: PolicyEligibility;
};

export function PolicyChecksCard({ checks, eligibility }: Props) {
  const eligible = eligibility === "ELIGIBLE";

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Box>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em">
              Policy eligibility check
            </Typography>
            <Typography variant="h6">Rule-based review</Typography>
          </Box>
          <Chip
            label={eligible ? "Eligible" : "Not eligible"}
            color={eligible ? "success" : "error"}
            size="small"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Checked against the policy record in the Policy Vault.
        </Typography>

        <Stack spacing={1.5} mt={2}>
          {checks.map(item => (
            <Stack key={item.id} direction="row" alignItems="flex-start" spacing={1.25}>
              <Box mt={0.25}>{statusIcon(item.status)}</Box>
              <Box>
                <Typography variant="subtitle2">{item.question}</Typography>
                {item.detail && (
                  <Typography variant="body2" color="text.secondary">
                    {item.detail}
                  </Typography>
                )}
              </Box>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
