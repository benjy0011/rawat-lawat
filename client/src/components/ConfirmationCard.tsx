import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { PatientName } from "./PatientName";
import { getPatientGenderFromNric } from "../types/patient";
import type { Identity, Policy } from "../types/onboarding";
import { InsurerLabel } from "./InsurerChip";

export function ConfirmationCard({
  identity,
  policy,
  identityImage,
  policyImage,
  consent,
  setConsent,
  onBack,
  onSubmit,
}: {
  identity: Identity;
  policy: Policy;
  identityImage: string;
  policyImage: string;
  consent: boolean;
  setConsent: (value: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const entries = [
    ["Policy provider", policy.provider],
    ["Policy number", policy.policyNumber],
    ["Coverage tier", policy.coverageTier || "Not specified"],
    ["Expiry date", policy.expiryDate || "Not specified"],
  ];
  return (
    <Box className="motion-enter motion-enter-delay-1">
      <Typography color="primary" fontWeight={700}>
        Final step
      </Typography>
      <Typography variant="h4" mt={0.5}>
        Confirm coverage details
      </Typography>
      <Typography color="text.secondary" mt={1.5} mb={3}>
        Review the extracted information before creating your secure admission
        profile.
      </Typography>
      <Card className="motion-card" variant="outlined">
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                variant="rounded"
                sx={{ bgcolor: "primary.50", color: "primary.main" }}
              >
                <BadgeOutlinedIcon />
              </Avatar>
              <Box>
                <PatientName
                  name={identity.fullName}
                  gender={identity.gender || getPatientGenderFromNric(identity.nric)}
                />
                <Typography variant="body2" color="text.secondary">
                  NRIC ·{" "}
                  {identity.nric.replace(/(\d{6})(\d{2})(\d{4})/, "$1-$2-$3")}
                </Typography>
              </Box>
            </Stack>
            <Chip
              className="verified-chip"
              icon={<VerifiedRoundedIcon />}
              label="Verified"
              size="small"
              color="success"
            />
          </Stack>
          <Divider />
          {entries.map(([label, value]) => (
            <Stack
              key={label}
              direction="row"
              justifyContent="space-between"
              py={1.5}
              borderBottom={1}
              borderColor="divider"
            >
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="body2" fontWeight={700} textAlign="right">
                {label === "Policy provider" ? (
                  <InsurerLabel insurer={value} />
                ) : (
                  value
                )}
              </Typography>
            </Stack>
          ))}
          <Grid container spacing={1.5} mt={1}>
            {[
              [identityImage, "Identity document"],
              [policyImage, "Policy document"],
            ].map(([image, label]) => (
              <Grid key={label} size={6}>
                <Box
                  border={1}
                  borderColor="divider"
                  borderRadius={1.5}
                  overflow="hidden"
                >
                  <Box
                    component="img"
                    src={image}
                    alt={label}
                    sx={{
                      display: "block",
                      width: "100%",
                      height: 110,
                      objectFit: "cover",
                      bgcolor: "grey.100",
                    }}
                  />
                  <Typography
                    variant="caption"
                    display="block"
                    px={1}
                    py={0.75}
                  >
                    {label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
        <Divider />
        <Box px={2} py={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                I consent to secure storage of my details and their sharing only
                when I initiate an admission request.
              </Typography>
            }
          />
        </Box>
      </Card>
      <Stack direction="row" spacing={2} mt={3}>
        <Button className="motion-button" variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          className="motion-button"
          variant="contained"
          sx={{ flex: 1 }}
          disabled={!consent}
          startIcon={<LockOutlinedIcon />}
          onClick={onSubmit}
        >
          Create secure profile
        </Button>
      </Stack>
    </Box>
  );
}
