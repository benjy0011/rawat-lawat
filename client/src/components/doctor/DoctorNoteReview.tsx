import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DrawRoundedIcon from "@mui/icons-material/DrawRounded";
import { useRef, useState, type PointerEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { draftRecommendation } from "../../lib/api";
import {
  AdmissionNoteDocument,
  SignedAdmissionSignature,
} from "../admission/AdmissionNoteDocument";
import { useWorkflow } from "../../workflow/AdmissionWorkflowContext";

export function DoctorNoteReview() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { admissions, signDoctorNote } = useWorkflow();
  const [signatureName, setSignatureName] = useState(session?.name ?? "");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] =
    useState(false);
  const [generationError, setGenerationError] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const admission = admissions.find(item => item.id === patientId);

  if (!admission) {
    return <Navigate to="/doctor/admissions" replace />;
  }

  const canSign =
    admission.status === "DOCTOR_REVIEW" &&
    isConfirmed &&
    Boolean(signatureImage) &&
    Boolean(
      signatureName.trim() &&
        diagnosis.trim() &&
        estimatedCost.trim() &&
        recommendation,
    ) &&
    !isGeneratingRecommendation;
  const canGenerateRecommendation = Boolean(
    diagnosis.trim() && estimatedCost.trim(),
  );

  const generateRecommendation = async () => {
    if (!canGenerateRecommendation) return;

    setGenerationError("");
    setIsGeneratingRecommendation(true);
    try {
      const text = await draftRecommendation({
        diagnosis: diagnosis.trim(),
        estimatedCost: estimatedCost.trim(),
        admissionReason: admission.admissionReason,
      });
      setRecommendation(text);
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Could not generate a recommendation. Please write one manually.",
      );
    } finally {
      setIsGeneratingRecommendation(false);
    }
  };

  return (
    <Box
      component="main"
      minHeight="100vh"
      bgcolor="background.default"
      px={{ xs: 2.5, lg: 5 }}
      py={4}
    >
      <Box maxWidth="md" mx="auto">
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/doctor/admissions")}
        >
          Back to doctor workspace
        </Button>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
              spacing={1.5}
              mb={3}
            >
              <Box>
                <Typography
                  variant="overline"
                  color="primary"
                  fontWeight={800}
                  letterSpacing=".12em"
                >
                  Doctor workspace
                </Typography>
                <Typography variant="h5" fontWeight={700} mt={0.5}>
                  {admission.doctorNote.signed
                    ? "View signed admission note"
                    : "Review and sign admission note"}
                </Typography>
              </Box>
              <Chip
                label={admission.doctorNote.signed ? "Signed" : "Awaiting signature"}
                color={admission.doctorNote.signed ? "success" : "warning"}
                size="small"
              />
            </Stack>

            <AdmissionNoteDocument
              admission={admission}
              showClinicalContext={false}
              showAdmissionDetails={admission.doctorNote.signed}
              showRecommendation={admission.doctorNote.signed}
              signatureContent={
                admission.doctorNote.signed ? (
                  <SignedAdmissionSignature
                    signatureName={admission.doctorNote.signedBy ?? "Reviewing doctor"}
                    signedAt={admission.doctorNote.signedAt}
                    signatureImage={admission.doctorNote.signatureImage}
                  />
                ) : (
                  <Stack spacing={1.5} mt={2}>
                    <TextField
                      label="Diagnosis"
                      value={diagnosis}
                      onChange={event => {
                        setDiagnosis(event.target.value);
                      }}
                      required
                    />
                    <TextField
                      label="Estimated treatment cost"
                      value={estimatedCost}
                      onChange={event => {
                        setEstimatedCost(event.target.value);
                      }}
                      required
                    />
                    <TextField
                      label="Doctor Recommendation"
                      value={recommendation}
                      onChange={event => setRecommendation(event.target.value)}
                      disabled={isGeneratingRecommendation}
                      error={Boolean(generationError)}
                      helperText={
                        generationError
                          ? generationError
                          : isGeneratingRecommendation
                            ? "AI is drafting a recommendation from the diagnosis and estimated cost."
                            : "Write your own recommendation or generate an AI draft."
                      }
                      placeholder="Write your recommendation"
                      multiline
                      minRows={3}
                      required
                    />
                    <Stack direction="row" justifyContent="flex-end" mt={-0.5}>
                      <Tooltip title="Generated based on patient data">
                        <span>
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<AutoAwesomeRoundedIcon />}
                            disabled={
                              !canGenerateRecommendation ||
                              isGeneratingRecommendation
                            }
                            loading={isGeneratingRecommendation}
                            loadingPosition="start"
                            onClick={generateRecommendation}
                          >
                            AI Generate
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                    <Box borderTop={1} borderColor="divider" mt={1} pt={2}>
                      <Typography variant="subtitle2">
                        Draw your signature
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Sign in the box to confirm this admission note.
                      </Typography>
                      <SignaturePad onChange={setSignatureImage} />

                    <TextField
                      label="Sign as clinician"
                      value={signatureName}
                      onChange={event => setSignatureName(event.target.value)}
                      helperText="This mock signature records the clinician who approved the note."
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isConfirmed}
                          onChange={event => setIsConfirmed(event.target.checked)}
                        />
                      }
                      label="I have reviewed this admission note and confirm it is clinically accurate."
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DrawRoundedIcon />}
                      disabled={!canSign || isSigning}
                      loading={isSigning}
                      onClick={() => {
                        setIsSigning(true);
                        window.setTimeout(() => {
                          signDoctorNote(
                            admission.id,
                            signatureName.trim(),
                            diagnosis.trim(),
                              estimatedCost.trim(),
                              recommendation,
                              signatureImage,
                          );
                        }, 1500);
                      }}
                    >
                      {isSigning
                        ? "Signing admission note…"
                        : "Electronically sign admission note"}
                    </Button>
                    </Box>
                  </Stack>
                )
              }
            />

            {admission.doctorNote.signed && (
              <Alert severity="success" sx={{ mt: 3 }}>
                The signed note is now available to the hospital administrator
                for final package review.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

function SignaturePad({ onChange }: { onChange: (signatureImage: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
  };

  const beginDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = getPoint(event);
    context.fillStyle = "#003d9b";
    context.beginPath();
    context.arc(lastPointRef.current.x, lastPointRef.current.y, 2, 0, Math.PI * 2);
    context.fill();
  };

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const previousPoint = lastPointRef.current;

    if (!isDrawingRef.current || !canvas || !context || !previousPoint) return;

    const currentPoint = getPoint(event);
    context.strokeStyle = "#003d9b";
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(currentPoint.x, currentPoint.y);
    context.stroke();
    lastPointRef.current = currentPoint;
  };

  const finishDrawing = () => {
    if (!isDrawingRef.current) return;

    isDrawingRef.current = false;
    lastPointRef.current = null;
    onChange(canvasRef.current?.toDataURL("image/png") ?? "");
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    isDrawingRef.current = false;
    lastPointRef.current = null;
    onChange("");
  };

  return (
    <Box mt={1.5}>
      <Box
        border={1}
        borderColor="primary.light"
        borderRadius={1.5}
        overflow="hidden"
        bgcolor="primary.50"
        sx={{ borderStyle: "dashed" }}
      >
        <Box
          component="canvas"
          ref={canvasRef}
          width={720}
          height={180}
          aria-label="Draw your signature"
          onPointerDown={beginDrawing}
          onPointerMove={draw}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
          sx={{
            display: "block",
            width: "100%",
            height: 150,
            cursor: "crosshair",
            touchAction: "none",
          }}
        />
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={0.75}>
        <Typography variant="caption" color="text.secondary">
          Use your mouse, trackpad, or touch screen.
        </Typography>
        <Button variant="text" sx={{ height: 'fit-content' }} size="small" onClick={clearSignature}>
          Clear
        </Button>
      </Stack>
    </Box>
  );
}
