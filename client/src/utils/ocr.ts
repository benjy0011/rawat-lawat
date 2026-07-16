import { recognize } from "tesseract.js";
import { inferPatientGenderFromNric } from "../types/patient";
import type { DocumentKind, Identity, Policy } from "../types/onboarding";

export function parseIdentity(raw: string): Identity {
  const nric =
    raw.match(/\b\d{6}[- ]?\d{2}[- ]?\d{4}\b/)?.[0]?.replace(/[^\d]/g, "") ??
    "";
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
  const dateOfBirth =
    nric.length === 12
      ? `${nric.slice(4, 6)}/${nric.slice(2, 4)}/${Number(nric.slice(0, 2)) > 30 ? "19" : "20"}${nric.slice(0, 2)}`
      : "";
  return {
    fullName,
    nric,
    dateOfBirth,
    gender: inferPatientGenderFromNric(nric),
  };
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
  const policyNumber =
    raw.match(
      /(?:policy|member|certificate|card)\s*(?:no|number|id)?\s*[:#]?\s*([A-Z]{1,5}[-\s]?\d{4,}[A-Z\d-]*)/i,
    )?.[1] ??
    raw.match(/\b[A-Z]{2,5}[- ]?\d{5,}[A-Z\d-]*\b/)?.[0] ??
    "";
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
  const { data } = await recognize(file, "eng", {
    logger: (message) => {
      if (message.status === "recognizing text")
        onProgress(
          `Reading document… ${Math.round((message.progress ?? 0) * 100)}%`,
        );
    },
  });
  const text = data.text.trim();
  return {
    text,
    result: kind === "identity" ? parseIdentity(text) : parsePolicy(text),
  };
}
