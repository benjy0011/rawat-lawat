import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import type {
  DocumentKind,
  Identity,
  Policy,
  ScanState,
} from "../types/onboarding";
import { readDocument } from "../utils/ocr";

export function DocumentCapture({
  kind,
  image,
  setImage,
  onRead,
}: {
  kind: DocumentKind;
  image: string;
  setImage: (value: string) => void;
  onRead: (result: Identity | Policy) => void;
}) {
  const [status, setStatus] = useState<ScanState>(image ? "ready" : "idle");
  const [message, setMessage] = useState(
    image ? "Document ready for review" : "Ready to scan",
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const title =
    kind === "identity"
      ? "NRIC or passport"
      : "Medical card or policy document";
  const PlaceholderIcon =
    kind === "identity" ? BadgeOutlinedIcon : HealthAndSafetyOutlinedIcon;

  useEffect(
    () => () => streamRef.current?.getTracks().forEach((track) => track.stop()),
    [],
  );
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus(image ? "ready" : "idle");
  };
  const processFile = async (file: File) => {
    setImage(URL.createObjectURL(file));
    setStatus("reading");
    setMessage("Reading document securely on this device…");
    try {
      const { result } = await readDocument(file, kind, setMessage);
      onRead(result);
      setStatus("ready");
      setMessage("Details extracted — please review them below");
    } catch {
      setStatus("error");
      setMessage(
        "We couldn’t read that image. You can enter the details manually below.",
      );
    }
  };
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("camera");
      setMessage("Position the full document inside the frame");
    } catch {
      setStatus("error");
      setMessage("Camera access was unavailable. Upload a photo instead.");
    }
  };
  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          stopCamera();
          void processFile(
            new File([blob], `${kind}-capture.jpg`, { type: "image/jpeg" }),
          );
        }
      },
      "image/jpeg",
      0.92,
    );
  };
  const reset = () => {
    stopCamera();
    setImage("");
    setStatus("idle");
    setMessage("Ready to scan");
  };
  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          overflow: "hidden",
          bgcolor: "grey.900",
          position: "relative",
          aspectRatio: "4 / 3",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            display: status === "camera" ? "block" : "none",
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
        />
        {image && status !== "camera" ? (
          <Box
            component="img"
            src={image}
            alt={`Captured ${title}`}
            sx={{ height: "100%", width: "100%", objectFit: "cover" }}
          />
        ) : (
          status !== "camera" && (
            <Stack
              height="100%"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              color="common.white"
              sx={{ background: "linear-gradient(135deg, #344055, #121826)" }}
            >
              <PlaceholderIcon sx={{ fontSize: 54, opacity: 0.75 }} />
              <Typography>{title}</Typography>
            </Stack>
          )
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 16,
            border: 2,
            borderColor: "primary.light",
            borderRadius: 2,
            pointerEvents: "none",
          }}
        >
          {status !== "error" && (
            <Box
              className="scan-line"
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, #63c8ff 18%, #d7f4ff 50%, #63c8ff 82%, transparent)",
              }}
            />
          )}
        </Box>
        <Box position="absolute" top={8} right={8}>
          {status === "camera" ? (
            <IconButton
              color="inherit"
              sx={{ bgcolor: "rgba(0,0,0,.55)" }}
              onClick={stopCamera}
              aria-label="Close camera"
            >
              <CloseRoundedIcon />
            </IconButton>
          ) : image && status !== "reading" ? (
            <IconButton
              color="inherit"
              sx={{ bgcolor: "rgba(0,0,0,.55)" }}
              onClick={reset}
              aria-label="Try another image"
            >
              <RefreshRoundedIcon />
            </IconButton>
          ) : null}
        </Box>
        <Box position="absolute" bottom={12} left={12} right={12}>
          <Alert
            icon={
              status === "reading" ? <CircularProgress size={18} /> : undefined
            }
            severity={status === "error" ? "error" : "info"}
            sx={{ "& .MuiAlert-message": { width: "100%" } }}
          >
            {message}
          </Alert>
        </Box>
      </Paper>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={onFile}
        hidden
      />
      {status === "camera" ? (
        <Button
          fullWidth
          sx={{ mt: 2 }}
          size="large"
          variant="contained"
          startIcon={<CameraAltOutlinedIcon />}
          onClick={capture}
        >
          Capture {title}
        </Button>
      ) : (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={2}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CameraAltOutlinedIcon />}
            onClick={() => void startCamera()}
          >
            Use camera
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={() => fileRef.current?.click()}
          >
            Upload image
          </Button>
        </Stack>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        textAlign="center"
        mt={1.5}
      >
        Use a clear, well-lit JPG, PNG, or WEBP image up to 10MB. OCR runs in
        your browser.
      </Typography>
    </Box>
  );
}
