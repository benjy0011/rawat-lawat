import {
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import type { AdmissionRecord } from "../../workflow/AdmissionWorkflowContext";
import { PatientName } from "../PatientName";
import { InsurerLabel } from "../InsurerChip";

export function AdmissionNoteDocument({
  admission,
  signatureContent,
}: {
  admission: AdmissionRecord;
  signatureContent: ReactNode;
}) {
  return (
    <Box
      border={1}
      borderColor="divider"
      borderRadius={1}
      overflow="hidden"
      bgcolor="common.white"
    >
      <Box bgcolor="primary.main" color="common.white" px={{ xs: 2, sm: 3 }} py={2.5}>
        <Typography variant="subtitle1" fontWeight={700}>
          Central Hospital HQ
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.82 }}>
          Clinical admission note
        </Typography>
      </Box>

      <Box p={{ xs: 2, sm: 3 }}>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)" }}
          gap={2}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              textTransform="uppercase"
            >
              Patient
            </Typography>
            <Box mt={0.5}>
              <PatientName
                name={admission.name}
                gender={admission.gender}
                variant="body2"
              />
            </Box>
          </Box>
          <NoteDetail
            label="Medical record number"
            value={admission.medicalRecordNumber}
          />
          <NoteDetail
            label="Insurer"
            value={<InsurerLabel insurer={admission.insurer} />}
          />
          <NoteDetail label="Policy plan" value={admission.policyPlan} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={2.5}>
          <NoteSection title="Reason for admission" content={admission.admissionReason} />
          <NoteSection title="Clinical assessment" content={admission.doctorNote.summary} />
          <NoteSection
            title="Recommendation"
            content="Admission and clinically appropriate treatment are recommended, subject to insurer approval."
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2">Electronic signature</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          The reviewing clinician&apos;s confirmation is recorded with this admission note.
        </Typography>
        {signatureContent}
      </Box>
    </Box>
  );
}

export function SignedAdmissionSignature({
  signatureName,
  signedAt,
}: {
  signatureName: string;
  signedAt?: string;
}) {
  return (
    <Box
      mt={2}
      p={2}
      border={1}
      borderColor="success.light"
      borderRadius={1}
      bgcolor="rgba(46, 125, 50, 0.08)"
    >
      <Typography variant="subtitle2" color="success.main">
        Electronically signed
      </Typography>
      <Typography fontFamily="cursive" fontSize="1.4rem" mt={1}>
        {signatureName}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {signedAt ? `Signature recorded at ${signedAt}.` : "Signature recorded for this mock admission workflow."}
      </Typography>
    </Box>
  );
}

function NoteDetail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        textTransform="uppercase"
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} mt={0.5}>
        {value}
      </Typography>
    </Box>
  );
}

function NoteSection({ title, content }: { title: string; content: string }) {
  return (
    <Box>
      <Typography variant="subtitle2" color="primary.main">
        {title}
      </Typography>
      <Typography variant="body2" mt={0.5} lineHeight={1.7}>
        {content}
      </Typography>
    </Box>
  );
}
