import type { PaddleOCR } from "@paddleocr/paddleocr-js";
import { inferPatientGenderFromNric } from "../types/patient";
import type { DocumentKind, Identity, Policy } from "../types/onboarding";

type OcrEngine = Awaited<ReturnType<typeof PaddleOCR.create>>;

let ocrEnginePromise: Promise<OcrEngine> | null = null;

const ocrDigitSubstitutions: Record<string, string> = {
  B: "8",
  D: "0",
  G: "6",
  I: "1",
  L: "1",
  O: "0",
  Q: "0",
  S: "5",
  Z: "2",
};

function getOcrEngine() {
  if (!ocrEnginePromise) {
    ocrEnginePromise = import("@paddleocr/paddleocr-js")
      .then(({ PaddleOCR }) =>
        PaddleOCR.create({
          textDetectionModelName: "PP-OCRv5_mobile_det",
          textDetectionModelAsset: {
            url: `${import.meta.env.BASE_URL}models/PP-OCRv5_mobile_det_onnx_infer.tar`,
          },
          textRecognitionModelName: "PP-OCRv5_mobile_rec",
          textRecognitionModelAsset: {
            url: `${import.meta.env.BASE_URL}models/PP-OCRv5_mobile_rec_onnx_infer.tar`,
          },
          worker: true,
          ortOptions: {
            backend: "wasm",
            simd: true,
          },
        }),
      )
      .catch((error: unknown) => {
        ocrEnginePromise = null;
        throw error;
      });
  }

  return ocrEnginePromise;
}

function extractNric(raw: string) {
  const candidates = [...raw.split("\n"), raw];

  for (const candidate of candidates) {
    const normalized = candidate
      .toUpperCase()
      .replace(/[BDGILOQSZ]/g, (character) => ocrDigitSubstitutions[character])
      .replace(/[–—]/g, "-");
    const match = normalized.match(
      /(?:^|\D)(\d{6})\s*[-/]?\s*(\d{2})\s*[-/]?\s*(\d{4})(?!\d)/,
    );

    if (!match) continue;

    const nric = `${match[1]}${match[2]}${match[3]}`;
    if (formatBirthDateFromNric(nric)) return nric;
  }

  return "";
}

function formatBirthDateFromNric(nric: string) {
  if (nric.length !== 12) return "";

  const yearPart = Number(nric.slice(0, 2));
  const month = Number(nric.slice(2, 4));
  const day = Number(nric.slice(4, 6));
  const currentYear = new Date().getFullYear();
  const currentYearPart = currentYear % 100;
  const year = yearPart <= currentYearPart ? 2000 + yearPart : 1900 + yearPart;
  const date = new Date(Date.UTC(year, month - 1, day));

  const isValidDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isValidDate) return "";

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function parseIdentity(raw: string): Identity {
  const nric = extractNric(raw);
  const fullName =
    raw
      .split("\n")
      .find(
        (line) =>
          /[A-Za-z]{3,}\s+[A-Za-z]{2,}/.test(line) &&
          !/MALAYSIA|KAD|IDENTITY|WARGANEGARA/i.test(line),
      )
      ?.trim()
      .replace(/[^A-Za-z .'-]/g, "") ?? "";
  const dateOfBirth = formatBirthDateFromNric(nric);
  return {
    fullName,
    nric,
    dateOfBirth,
    gender: inferPatientGenderFromNric(nric),
  };
}

function extractPolicyNumber(raw: string) {
  for (const line of raw.split("\n")) {
    const digits = line.replace(/\D/g, "");
    if (digits.length === 16) return digits;
  }

  return (
    raw.match(
      /(?:policy|member|certificate|card)\s*(?:no|number|id)?\s*[:#]?\s*([A-Z]{1,5}[-\s]?\d{4,}[A-Z\d-]*)/i,
    )?.[1] ??
    raw.match(/\b[A-Z]{2,5}[- ]?\d{5,}[A-Z\d-]*\b/)?.[0] ??
    ""
  );
}

export function parsePolicy(raw: string): Policy {
  const provider = /AIA/i.test(raw)
    ? "AIA Malaysia"
    : /GREAT\s*EASTERN/i.test(raw)
      ? "Great Eastern Malaysia"
      : /PRUDENTIAL/i.test(raw)
        ? "Prudential Malaysia"
        : /ALLIANZ/i.test(raw)
          ? "Allianz Malaysia"
          : "";
  const policyNumber = extractPolicyNumber(raw);
  const expiryDate =
    raw.match(
      /(?:expir(?:y|es)|valid\s*(?:until|to))\s*[:#]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i,
    )?.[1] ?? "";
  const coverageTier = /platinum/i.test(raw)
    ? "Platinum Inpatient"
    : /gold/i.test(raw)
      ? "Gold Inpatient"
      : /medical/i.test(raw)
        ? "Medical Card"
        : "";
  return { provider, policyNumber, coverageTier, expiryDate };
}

export async function readDocument(
  file: File,
  kind: DocumentKind,
  onProgress: (message: string) => void,
) {
  onProgress("Preparing document recognition…");
  const ocr = await getOcrEngine();

  onProgress("Detecting and reading document text…");
  const [ocrResult] = await ocr.predict(file);
  const text =
    ocrResult?.items
      .map((item) => item.text.trim())
      .filter(Boolean)
      .join("\n") ?? "";

  return {
    text,
    result: kind === "identity" ? parseIdentity(text) : parsePolicy(text),
  };
}
