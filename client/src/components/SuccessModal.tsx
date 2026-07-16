import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { PatientName } from "./PatientName";
import { getPatientGenderFromNric } from "../types/patient";
import type { Identity } from "../types/onboarding";

export function SuccessModal({
  open,
  identity,
  reference,
  onClose,
}: {
  open: boolean;
  identity: Identity;
  reference: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">
        <CheckCircleOutlineRoundedIcon color="success" sx={{ fontSize: 54 }} />
        <Typography variant="h5" fontWeight={700} mt={1}>
          Admission submitted
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box textAlign="center" color="text.secondary">
            <Box display="inline-flex" alignItems="center" flexWrap="wrap" justifyContent="center" gap={0.75}>
              <PatientName
                name={identity.fullName}
                gender={identity.gender || getPatientGenderFromNric(identity.nric)}
                fontWeight={400}
              />
              <Typography component="span">
                , the AI is preparing your admission package.
              </Typography>
            </Box>
            <Typography>
              Your doctor will review and electronically sign the clinical note.
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="caption" fontWeight={700}>
              ADMISSION REFERENCE
            </Typography>
            <Typography fontFamily="monospace" fontWeight={700}>
              {reference}
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button fullWidth variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
