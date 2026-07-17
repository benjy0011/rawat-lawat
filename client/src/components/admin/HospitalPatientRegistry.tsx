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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdmissionStatus } from "../../workflow/AdmissionWorkflowContext";
import { useWorkflow } from "../../workflow/AdmissionWorkflowContext";
import { InsurerChip } from "../InsurerChip";
import { PatientName } from "../PatientName";
import { AdminShell } from "./AdminShell";

const hospitalName = "Central Hospital HQ";

const statusLabels: Record<AdmissionStatus, string> = {
  PENDING_ADMIN_APPROVAL: "New request",
  AI_PREPARING: "Preparing package",
  DOCTOR_REVIEW: "Doctor review",
  ADMIN_REVIEW: "Ready for review",
  SUBMITTING_TO_INSURANCE: "With insurer",
  INSURANCE_REJECTED: "Update needed",
  AI_RESUBMISSION: "Updating package",
  INSURANCE_APPROVED: "Approved",
  INSURANCE_FINAL_REJECTED: "Closed",
};

function statusColor(status: AdmissionStatus) {
  if (status === "INSURANCE_APPROVED") return "success";
  if (status === "INSURANCE_FINAL_REJECTED") return "error";
  if (status === "INSURANCE_REJECTED" || status === "DOCTOR_REVIEW") {
    return "warning";
  }
  return "info";
}

export function HospitalPatientRegistry() {
  const navigate = useNavigate();
  const { admissions } = useWorkflow();
  const [query, setQuery] = useState("");
  const registeredPatients = admissions.filter(
    admission => admission.hospitalName === hospitalName,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const patients = normalizedQuery
    ? registeredPatients.filter(admission =>
        [
          admission.name,
          admission.medicalRecordNumber,
          admission.memberId,
          admission.insurer,
        ].some(value => value.toLowerCase().includes(normalizedQuery)),
      )
    : registeredPatients;

  const activePatients = registeredPatients.filter(
    admission =>
      !["INSURANCE_APPROVED", "INSURANCE_FINAL_REJECTED"].includes(
        admission.status,
      ),
  ).length;
  const approvedPatients = registeredPatients.filter(
    admission => admission.status === "INSURANCE_APPROVED",
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
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".12em">
              Central Hospital HQ
            </Typography>
            <Typography variant="h4" mt={0.5}>
              Patient cases
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1} maxWidth={620}>
              A mocked directory of patients registered for admission and guarantee-letter processing at this hospital.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/admin/gl-process")}
          >
            View new admissions
          </Button>
        </Stack>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }}
          gap={2}
          mt={4}
        >
          <RegistryMetric label="Registered patients" value={registeredPatients.length} detail="Across current mock records" />
          <RegistryMetric label="Active admissions" value={activePatients} detail="Still moving through review" tone="primary" />
          <RegistryMetric label="Confirmed admissions" value={approvedPatients} detail="Insurance decision approved" tone="success" />
        </Box>

        <Card className="motion-card" variant="outlined" sx={{ mt: 3.5 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Registered patients
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Search by patient name, record number, insurer, or member ID.
                </Typography>
              </Box>
              <TextField
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search the registry"
                inputProps={{ "aria-label": "Search the patient registry" }}
                sx={{ width: { xs: "100%", md: 340 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            {patients.length > 0 ? (
              <Stack spacing={1.25} mt={3}>
                {patients.map(patient => (
                  <Box
                    key={patient.id}
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", lg: "minmax(220px, 1.1fr) minmax(160px, .8fr) minmax(160px, .75fr) minmax(150px, .7fr) auto" }}
                    gap={2}
                    alignItems="center"
                    border="1px solid"
                    borderColor="divider"
                    borderRadius={2}
                    p={2}
                    sx={{
                      transition: "border-color 180ms ease, box-shadow 180ms ease",
                      "&:hover": {
                        borderColor: "primary.light",
                        boxShadow: "0 8px 22px rgba(0, 61, 155, .08)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                      <Avatar sx={{ bgcolor: "primary.light", fontWeight: 800 }}>
                        {patient.name.slice(0, 1)}
                      </Avatar>
                      <Box minWidth={0}>
                        <PatientName name={patient.name} gender={patient.gender} />
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                          {patient.medicalRecordNumber} · Member {patient.memberId}
                        </Typography>
                      </Box>
                    </Stack>
                    <RegistryField label="Admission" value={patient.admissionReason} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={800} textTransform="uppercase">
                        Coverage
                      </Typography>
                      <Box mt={0.45}>
                        <InsurerChip insurer={patient.insurer} />
                      </Box>
                    </Box>
                    <Chip
                      label={statusLabels[patient.status]}
                      color={statusColor(patient.status)}
                      size="small"
                      sx={{ justifySelf: { lg: "start" }, fontWeight: 700 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={() => navigate(`/admin/gl-process/${patient.id}`)}
                      sx={{ justifySelf: { xs: "start", lg: "end" }, whiteSpace: "nowrap" }}
                    >
                      View record
                    </Button>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box textAlign="center" py={7}>
                <SearchRoundedIcon color="primary" fontSize="large" />
                <Typography variant="h6" mt={1.5}>
                  No matching patients
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Try a name, hospital record number, insurer, or member ID.
                </Typography>
                <Button size="small" sx={{ mt: 1.5 }} onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </AdminShell>
  );
}

function RegistryMetric({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: number;
  detail: string;
  tone?: "default" | "primary" | "success";
}) {
  const colors = {
    default: { background: "#ffffff", border: "divider", value: "text.primary" },
    primary: { background: "rgba(0, 61, 155, .05)", border: "primary.light", value: "primary.main" },
    success: { background: "rgba(22, 163, 74, .06)", border: "success.light", value: "success.dark" },
  }[tone];

  return (
    <Card variant="outlined" sx={{ bgcolor: colors.background, borderColor: colors.border }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
          {label}
        </Typography>
        <Typography variant="h4" color={colors.value} mt={0.5}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {detail}
        </Typography>
      </CardContent>
    </Card>
  );
}

function RegistryField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={800} textTransform="uppercase">
        {label}
      </Typography>
      <Typography variant="body2" mt={0.3} fontWeight={700}>
        {value}
      </Typography>
    </Box>
  );
}
