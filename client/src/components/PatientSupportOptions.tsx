import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import { useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useWorkflow } from "../workflow/AdmissionWorkflowContext";
import { PatientName } from "./PatientName";

type SupportOption = {
  title: string;
  detail: string;
  action: string;
  icon: ReactNode;
  featured?: boolean;
};

const supportOptions: SupportOption[] = [
  {
    title: "Speak with a care support navigator",
    detail: "Ask a hospital team member to explain available payment and care-support options in confidence.",
    action: "Request a support call",
    icon: <SupportAgentRoundedIcon />,
  },
  {
    title: "Explore medical financing guidance",
    detail: "Review how medical financing may work and ask to be connected with an approved financing partner.",
    action: "Explore financing guidance",
    icon: <AccountBalanceRoundedIcon />,
    featured: true,
  },
  {
    title: "Check charitable and community support",
    detail: "Ask the hospital team whether relevant charity, employer, or community-assistance programmes may be available.",
    action: "Ask about support programmes",
    icon: <FavoriteRoundedIcon />,
  },
];

export function PatientSupportOptions() {
  const { admissionId } = useParams();
  const navigate = useNavigate();
  const { admissions } = useWorkflow();
  const [requestedOption, setRequestedOption] = useState<string | null>(null);
  const admission = admissions.find(item => item.id === admissionId);

  if (!admission) {
    return <Navigate to="/upload/identity" replace />;
  }

  return (
    <Box component="main" minHeight="100vh" bgcolor="background.default" px={{ xs: 2.5, lg: 5 }} py={4}>
      <Box maxWidth="md" mx="auto">
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(`/admission/${admission.id}/status`)}
        >
          Back to admission tracker
        </Button>

        <Card sx={{ mt: 2, overflow: "hidden" }}>
          <Box
            px={{ xs: 3, sm: 4 }}
            py={{ xs: 3, sm: 4 }}
            color="common.white"
            sx={{
              background: "linear-gradient(135deg, #003d9b 0%, #006b9f 58%, #008a70 100%)",
            }}
          >
            <Chip
              label="Optional support"
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "common.white", fontWeight: 700 }}
            />
            <Typography variant="h4" mt={2}>
              You still have options
            </Typography>
            <Typography variant="body1" mt={1.5} sx={{ maxWidth: 620, opacity: 0.9 }}>
              We can help you understand practical ways to move forward with your care after an insurer&apos;s final decision.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={0.75}>
              <Typography variant="h6">Support for</Typography>
              <PatientName
                name={admission.name}
                gender={admission.gender}
                variant="h6"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Choose an option to ask the hospital team for guidance. There is no obligation.
            </Typography>

            <Stack spacing={2} mt={3}>
              {supportOptions.map(option => (
                <Card
                  key={option.title}
                  variant="outlined"
                  sx={{
                    borderColor: option.featured ? "primary.main" : "divider",
                    bgcolor: option.featured ? "rgba(0, 61, 155, 0.03)" : "common.white",
                  }}
                >
                  <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                      <Box
                        display="grid"
                        width={44}
                        height={44}
                        borderRadius={2}
                        color={option.featured ? "primary.main" : "secondary.main"}
                        sx={{
                          placeItems: "center",
                          bgcolor: option.featured ? "rgba(0, 61, 155, 0.1)" : "rgba(0, 121, 107, 0.1)",
                        }}
                      >
                        {option.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {option.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {option.detail}
                        </Typography>
                      </Box>
                      <Button
                        variant={option.featured ? "contained" : "outlined"}
                        onClick={() => setRequestedOption(option.title)}
                      >
                        {option.action}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {requestedOption && (
              <Alert severity="success" sx={{ mt: 3 }}>
                Your request for “{requestedOption}” has been recorded for this mock experience. A hospital support navigator would follow up with you.
              </Alert>
            )}

            <Alert severity="info" icon={false} sx={{ mt: 3 }}>
              <Typography variant="subtitle2">Important information</Typography>
              <Typography variant="body2" mt={0.5}>
                This is a demonstration of support navigation, not financial advice or a financing offer. Any financing is subject to separate eligibility, affordability checks, and provider terms.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
