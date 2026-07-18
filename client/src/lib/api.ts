import { supabase } from "./supabaseClient";
import type { AdmissionRecord } from "../workflow/AdmissionWorkflowContext";

// Vite replaces import.meta.env.PROD at build time. Keep the local override
// separate so a developer's .env.local cannot accidentally point a production
// build back to localhost.
const PRODUCTION_API_URL = "https://rawat-lawat-be.vercel.app";
const API_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_PROD_API_URL ?? PRODUCTION_API_URL)
  : (import.meta.env.VITE_API_URL ?? "http://localhost:8000");

async function accessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("You must be signed in.");
  return token;
}

type RecommendationInput = {
  diagnosis: string;
  estimatedCost: string;
  admissionReason?: string;
};

export async function draftRecommendation(
  input: RecommendationInput,
): Promise<string> {
  const token = await accessToken();

  const response = await fetch(`${API_URL}/ai/recommendation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(body?.detail || `Request failed (${response.status}).`);
  }

  const result = (await response.json()) as { recommendation: string };
  return result.recommendation;
}

// Request the Initial Guarantee Letter PDF for an approved admission and open
// it in a new tab.
export async function downloadGuaranteeLetter(
  admission: AdmissionRecord,
): Promise<void> {
  const token = await accessToken();

  const payload = {
    patientName: admission.name,
    memberId: admission.memberId,
    insurer: admission.insurer,
    hospitalName: admission.hospitalName,
    guaranteedAmount: admission.doctorNote.estimatedCost ?? "",
    nric: admission.profile.identity.nric || undefined,
    policyPlan: admission.policyPlan || undefined,
    diagnosis: admission.doctorNote.diagnosis || undefined,
    admissionReason: admission.admissionReason || undefined,
    admissionId: admission.id,
  };

  const response = await fetch(`${API_URL}/gl/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(body?.detail || `Request failed (${response.status}).`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

// Ask the claims assistant a question, grounded in the patient's own context.
export async function askAssistant(
  messages: ChatMessage[],
  context: unknown,
): Promise<string> {
  const token = await accessToken();

  const response = await fetch(`${API_URL}/ai/assistant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(body?.detail || `Request failed (${response.status}).`);
  }

  const result = (await response.json()) as { reply: string };
  return result.reply;
}
