import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useState } from "react";
import { insuranceProviders } from "../data/insuranceProviders";
import type { Identity, Policy, StateSetter } from "../types/onboarding";
import { ConfirmationCard } from "./ConfirmationCard";
import { DataForm } from "./DataForm";
import { DocumentCapture } from "./DocumentCapture";
import { Intro } from "./Intro";

export function IdentityStep({
  identity,
  setIdentity,
  image,
  setImage,
  onNext,
}: {
  identity: Identity;
  setIdentity: StateSetter<Identity>;
  image: string;
  setImage: (value: string) => void;
  onNext: () => void;
}) {
  const [isReading, setIsReading] = useState(false);
  const canContinue = Boolean(
    identity.fullName &&
      identity.nric.length === 12 &&
      identity.gender,
  );
  return (
    <Box className="motion-enter motion-enter-delay-1">
      <Intro
        badge="Step 1: Secure identification"
        title="Scan identity document"
        body="Align your NRIC or passport in the frame. You can review and correct every detail before continuing."
        icon="id"
      />
      <DocumentCapture
        kind="identity"
        image={image}
        setImage={setImage}
        onRead={(result) => setIdentity(result as Identity)}
        onReadingChange={setIsReading}
      />
      <DataForm
        title="Review identity details"
        description="Check the details read from your document."
        fields={[
          ["Full legal name", "fullName"],
          ["NRIC number", "nric"],
          ["Date of birth", "dateOfBirth"],
          ["Gender", "gender"],
        ]}
        values={identity}
        setValues={(value) => setIdentity(value as Identity)}
        show={Boolean(image)}
        isLoading={isReading}
      />
      <Stack mt={3} spacing={1}>
        <Button
          className="motion-button"
          variant="contained"
          size="large"
          endIcon={<ArrowForwardRoundedIcon />}
          disabled={!canContinue || isReading}
          onClick={onNext}
        >
          Continue to policy details
        </Button>
        {!canContinue && (
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            Capture or upload your document, then complete the required fields.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export function PolicyStep({
  policy,
  setPolicy,
  image,
  setImage,
  onBack,
  onNext,
}: {
  policy: Policy;
  setPolicy: StateSetter<Policy>;
  image: string;
  setImage: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [isReading, setIsReading] = useState(false);
  const canContinue = Boolean(policy.provider && policy.policyNumber);
  return (
    <Box className="motion-enter motion-enter-delay-1">
      <Intro
        badge="Step 2: Coverage information"
        title="Scan your medical card"
        body="We’ll read policy information to prepare your admission profile. Verify each detail before submission."
        icon="shield"
      />
      <DocumentCapture
        kind="policy"
        image={image}
        setImage={setImage}
        onRead={(result) => setPolicy(result as Policy)}
        onReadingChange={setIsReading}
      />
      <DataForm
        title="Review policy details"
        description="Your information stays in your browser until you choose to submit."
        fields={[
          ["Policy provider", "provider"],
          ["Policy / member number", "policyNumber"],
          ["Coverage tier", "coverageTier"],
          ["Expiry date", "expiryDate"],
        ]}
        values={policy}
        setValues={(value) => setPolicy(value as Policy)}
        show={Boolean(image)}
        isLoading={isReading}
        selectOptions={{ provider: insuranceProviders }}
      />
      <Stack direction="row" spacing={2} mt={3}>
        <Button className="motion-button" variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          className="motion-button"
          sx={{ flex: 1 }}
          variant="contained"
          size="large"
          endIcon={<ArrowForwardRoundedIcon />}
          disabled={!canContinue || isReading}
          onClick={onNext}
        >
          Review coverage
        </Button>
      </Stack>
    </Box>
  );
}

export function ConfirmationStep(props: {
  identity: Identity;
  policy: Policy;
  identityImage: string;
  policyImage: string;
  consent: boolean;
  setConsent: (value: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return <ConfirmationCard {...props} />;
}
