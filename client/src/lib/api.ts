import { supabase } from "./supabaseClient";

// Base URL of the FastAPI AI service (see backend/). The Supabase access token
// is attached so the server can verify the caller is a signed-in user.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type RecommendationInput = {
  diagnosis: string;
  estimatedCost: string;
  admissionReason?: string;
};

export async function draftRecommendation(
  input: RecommendationInput,
): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("You must be signed in to generate a recommendation.");
  }

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
