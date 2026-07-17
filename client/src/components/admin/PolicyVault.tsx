import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useState } from "react";
import {
  vaultPolicies,
  type VaultPolicy,
  type VaultPolicyStatus,
} from "../../data/policyVault";
import { AdminShell } from "./AdminShell";

const statusColors: Record<
  VaultPolicyStatus,
  "success" | "warning" | "default"
> = {
  Active: "success",
  "Expiring soon": "warning",
  Inactive: "default",
};

export function PolicyVault() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const policies = vaultPolicies.filter(policy =>
    [
      policy.policyNumber,
      policy.memberId,
      policy.policyholder,
      policy.insurer,
      policy.plan,
    ].some(value => value.toLowerCase().includes(normalizedQuery)),
  );
  const activePolicies = vaultPolicies.filter(
    policy => policy.status === "Active",
  ).length;
  const expiringPolicies = vaultPolicies.filter(
    policy => policy.status === "Expiring soon",
  ).length;

  return (
    <AdminShell>
      <Box component="main" maxWidth="xl" mx="auto" px={{ xs: 2.5, lg: 5 }} py={4}>
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
              Policy Vault
            </Typography>
            <Typography variant="h4" mt={0.5}>
              Coverage records at a glance
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Search the mock policy database to check a member&apos;s stored
              policy and policy document.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<DescriptionOutlinedIcon />}
            disabled
          >
            {vaultPolicies.length} stored policies
          </Button>
        </Stack>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }}
          gap={2}
          mt={4}
        >
          <PolicyStat label="Total policies" value={vaultPolicies.length} />
          <PolicyStat label="Active coverage" value={activePolicies} color="success.main" />
          <PolicyStat label="Expiring soon" value={expiringPolicies} color="warning.main" />
        </Box>

        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              label="Search policy vault"
              placeholder="Search by policy number, member ID, patient, insurer, or plan"
              value={query}
              onChange={event => setQuery(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <Stack spacing={1.5} mt={3}>
              {policies.length === 0 ? (
                <Box py={5} textAlign="center">
                  <SearchRoundedIcon color="disabled" fontSize="large" />
                  <Typography fontWeight={700} mt={1}>
                    No policy records found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Try a member ID, policy number, patient name, or insurer.
                  </Typography>
                </Box>
              ) : (
                policies.map(policy => <PolicyRecord key={policy.id} policy={policy} />)
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </AdminShell>
  );
}

function PolicyStat({
  label,
  value,
  color = "primary.main",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {label.toUpperCase()}
        </Typography>
        <Typography variant="h4" color={color} mt={0.75}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function PolicyRecord({ policy }: { policy: VaultPolicy }) {
  return (
    <Card
      variant="outlined"
      sx={{
        transition: "border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: 2,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems={{ lg: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={{ lg: 240 }}>
            <Avatar
              src={policy.logo}
              alt=""
              variant="rounded"
              sx={{
                width: 46,
                height: 46,
                bgcolor: "common.white",
                border: 1,
                borderColor: "divider",
                "& img": { objectFit: "contain", p: 0.4 },
              }}
            />
            <Box minWidth={0}>
              <Typography variant="subtitle1" fontWeight={800} noWrap>
                {policy.policyholder}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {policy.insurer}
              </Typography>
            </Box>
          </Stack>

          <PolicyDetail label="Policy number" value={policy.policyNumber} />
          <PolicyDetail label="Member ID" value={policy.memberId} />
          <PolicyDetail label="Plan" value={policy.plan} />
          <PolicyDetail label="Expires" value={policy.expiresOn} />

          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={policy.status}
              color={statusColors[policy.status]}
              size="small"
            />
            <Button
              component="a"
              href={policy.documentUrl}
              target="_blank"
              rel="noreferrer"
              size="small"
              variant="outlined"
              startIcon={<VisibilityOutlinedIcon />}
            >
              View
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PolicyDetail({ label, value }: { label: string; value: string }) {
  return (
    <Box minWidth={{ lg: 125 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        textTransform="uppercase"
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} mt={0.25}>
        {value}
      </Typography>
    </Box>
  );
}
