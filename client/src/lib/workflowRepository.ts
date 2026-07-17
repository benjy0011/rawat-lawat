import { supabase } from "./supabaseClient";
import type {
  AdmissionRecord,
  PatientProfile,
} from "../workflow/AdmissionWorkflowContext";

// Each table keeps the full record in a `data` jsonb column; a few flat columns
// are duplicated out of it for filtering and row-level security.
type AdmissionRow = {
  id: string;
  patient_email: string | null;
  hospital_name: string | null;
  status: string | null;
  data: AdmissionRecord;
};

type ProfileRow = {
  patient_email: string;
  data: { identity: PatientProfile["identity"]; policy: PatientProfile["policy"] };
};

function toAdmissionRow(record: AdmissionRecord): AdmissionRow {
  return {
    id: record.id,
    patient_email: record.patientEmail ?? null,
    hospital_name: record.hospitalName,
    status: record.status,
    data: record,
  };
}

export async function fetchAdmissions(): Promise<AdmissionRecord[]> {
  const { data, error } = await supabase
    .from("admissions")
    .select("data")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(row => (row as { data: AdmissionRecord }).data);
}

export async function upsertAdmission(record: AdmissionRecord): Promise<void> {
  const { error } = await supabase
    .from("admissions")
    .upsert(toAdmissionRow(record));

  if (error) throw error;
}

export async function seedAdmissions(records: AdmissionRecord[]): Promise<void> {
  const { error } = await supabase
    .from("admissions")
    .upsert(records.map(toAdmissionRow));

  if (error) throw error;
}

export async function fetchProfiles(): Promise<PatientProfile[]> {
  const { data, error } = await supabase
    .from("patient_profiles")
    .select("patient_email, data");

  if (error) throw error;
  return (data ?? []).map(row => {
    const profile = row as ProfileRow;
    return {
      patientEmail: profile.patient_email,
      identity: profile.data.identity,
      policy: profile.data.policy,
    };
  });
}

export async function upsertProfile(profile: PatientProfile): Promise<void> {
  const { error } = await supabase.from("patient_profiles").upsert({
    patient_email: profile.patientEmail,
    data: { identity: profile.identity, policy: profile.policy },
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

// Subscribe to admission changes from any client (e.g. an admin approval shows
// up live on the patient's tracker). Returns an unsubscribe function.
export function subscribeToAdmissions(
  onUpsert: (record: AdmissionRecord) => void,
  onDelete: (id: string) => void,
): () => void {
  const channel = supabase
    .channel("admissions-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "admissions" },
      payload => {
        if (payload.eventType === "DELETE") {
          onDelete((payload.old as { id: string }).id);
        } else {
          onUpsert((payload.new as AdmissionRow).data);
        }
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
