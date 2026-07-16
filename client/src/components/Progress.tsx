import { Step, StepLabel, Stepper } from "@mui/material";

export function Progress({ step }: { step: number }) {
  return (
    <Stepper
      className="motion-progress motion-enter"
      activeStep={step - 1}
      alternativeLabel
      sx={{ mb: { xs: 5, sm: 7 } }}
    >
      {["Identity", "Policy details", "Confirmation"].map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
