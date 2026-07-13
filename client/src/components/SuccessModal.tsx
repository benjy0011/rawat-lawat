import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import type { Identity } from "../types/onboarding";

export function SuccessModal({
  open,
  identity,
  onClose,
}: {
  open: boolean;
  identity: Identity;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">
        <CheckCircleOutlineRoundedIcon color="success" sx={{ fontSize: 54 }} />
        <Typography variant="h5" fontWeight={700} mt={1}>
          Your secure profile is ready
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography textAlign="center" color="text.secondary">
            {identity.fullName}, your encrypted admission handshake has been
            created. You control when it’s shared.
          </Typography>
          <Alert severity="info">
            <Typography variant="caption" fontWeight={700}>
              HANDSHAKE TOKEN
            </Typography>
            <Typography fontFamily="monospace" fontWeight={700}>
              AA-MY-{identity.nric.slice(-6) || "SECURE"}-7F3K
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
