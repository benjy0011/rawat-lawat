/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { pendingPatients, type PendingPatient } from "../data/pendingPatients";
import { getPatientGenderFromNric } from "../types/patient";
import type { Identity, Policy } from "../types/onboarding";

export type AdmissionStatus =
  | "AI_PREPARING"
  | "DOCTOR_REVIEW"
  | "ADMIN_REVIEW"
  | "SUBMITTING_TO_INSURANCE"
  | "INSURANCE_REJECTED"
  | "AI_RESUBMISSION"
  | "INSURANCE_APPROVED"
  | "INSURANCE_FINAL_REJECTED";

export type InsurerOutcome = "APPROVE" | "REJECT" | "FINAL_REJECT";

export type WorkflowEvent = {
  actor: "Patient" | "AI Assistant" | "Doctor" | "Administrator" | "Insurance";
  message: string;
  occurredAt: string;
};

export type RetrievedDocument = {
  id: string;
  name: string;
  source: string;
  detail: string;
  submissionStatus: "Ready to submit" | "Requires review";
};

export type AdmissionRecord = PendingPatient & {
  patientEmail?: string;
  status: AdmissionStatus;
  doctorNote: {
    summary: string;
    signed: boolean;
    signedBy?: string;
    signedAt?: string;
  };
  insurerFeedback?: string[];
  submissionAttempts: number;
  nextInsurerOutcome: InsurerOutcome;
  retrievedDocuments: RetrievedDocument[];
  timeline: WorkflowEvent[];
};

type CreateAdmissionInput = {
  identity: Identity;
  policy: Policy;
  patientEmail: string;
};

type WorkflowContextValue = {
  admissions: AdmissionRecord[];
  createAdmission: (input: CreateAdmissionInput) => AdmissionRecord;
  signDoctorNote: (id: string, signatureName: string) => void;
  submitToInsurer: (id: string) => void;
  setNextInsurerOutcome: (id: string, outcome: InsurerOutcome) => void;
};

const WorkflowContext = createContext<WorkflowContextValue | undefined>(
  undefined,
);

const rejectionRequirements = [
  "Attach the latest laboratory result",
  "Confirm the estimated admission cost",
];

function event(
  actor: WorkflowEvent["actor"],
  message: string,
): WorkflowEvent {
  return {
    actor,
    message,
    occurredAt: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function makeSeedAdmission(
  patient: PendingPatient,
  index: number,
): AdmissionRecord {
  const awaitingDoctorReview = index === 1;

  return {
    ...patient,
    status: awaitingDoctorReview ? "DOCTOR_REVIEW" : "ADMIN_REVIEW",
    doctorNote: {
      summary: `${patient.admissionReason} assessed; admission and treatment are clinically indicated.`,
      signed: !awaitingDoctorReview,
      signedBy: awaitingDoctorReview ? undefined : "Dr. Farah Ismail",
      signedAt: awaitingDoctorReview ? undefined : "Today, 10:42 AM",
    },
    submissionAttempts: 0,
    nextInsurerOutcome: index === 0 ? "REJECT" : "APPROVE",
    retrievedDocuments: createRetrievedDocuments(!awaitingDoctorReview),
    timeline: [
      event("Patient", "Admission details submitted"),
      event("AI Assistant", "Admission package and doctor note prepared"),
      ...(!awaitingDoctorReview
        ? [
            event("Doctor", "Doctor note electronically signed"),
            event("Administrator", "Package ready for final review"),
          ]
        : []),
    ],
  };
}

function createRetrievedDocuments(doctorNoteSigned: boolean): RetrievedDocument[] {
  return [
    {
      id: "identity",
      name: "Verified patient identity",
      source: "Patient admission details",
      detail: "Identity and medical record number matched.",
      submissionStatus: "Ready to submit",
    },
    {
      id: "policy",
      name: "Policy eligibility summary",
      source: "Policy Vault",
      detail: "Active member, plan, and panel-hospital eligibility confirmed.",
      submissionStatus: "Ready to submit",
    },
    {
      id: "doctor-note",
      name: "Doctor admission note",
      source: "Clinical record",
      detail: doctorNoteSigned
        ? "Electronically signed clinical note ready for insurer review."
        : "Waiting for the doctor's electronic signature.",
      submissionStatus: doctorNoteSigned ? "Ready to submit" : "Requires review",
    },
    {
      id: "supporting-data",
      name: "Supporting clinical evidence",
      source: "Hospital record",
      detail: "Relevant diagnosis and estimated-cost data prepared for GL submission.",
      submissionStatus: "Ready to submit",
    },
  ];
}

function addEvent(
  record: AdmissionRecord,
  next: Omit<WorkflowEvent, "occurredAt">,
) {
  return {
    ...record,
    timeline: [...record.timeline, event(next.actor, next.message)],
  };
}

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>(() =>
    pendingPatients.map(makeSeedAdmission),
  );

  const updateAdmission = (
    id: string,
    update: (record: AdmissionRecord) => AdmissionRecord,
  ) => {
    setAdmissions(current =>
      current.map(record => (record.id === id ? update(record) : record)),
    );
  };

  const createAdmission = ({
    identity,
    policy,
    patientEmail,
  }: CreateAdmissionInput) => {
    const id = `admission-${Date.now()}`;
    const admission: AdmissionRecord = {
      id,
      patientEmail,
      name: identity.fullName,
      gender: identity.gender || getPatientGenderFromNric(identity.nric),
      medicalRecordNumber: `CH-${Math.floor(100000 + Math.random() * 899999)}`,
      insurer: policy.provider,
      policyPlan: policy.coverageTier || "Medical coverage",
      memberId: policy.policyNumber,
      requestedAt: "Just now",
      admissionReason: "Admission assessment",
      priority: "Standard",
      status: "AI_PREPARING",
      doctorNote: { summary: "", signed: false },
      submissionAttempts: 0,
      nextInsurerOutcome: "APPROVE",
      retrievedDocuments: createRetrievedDocuments(false),
      timeline: [event("Patient", "Admission details submitted")],
    };

    setAdmissions(current => [admission, ...current]);
    window.setTimeout(() => {
      updateAdmission(id, record =>
        addEvent(
          {
            ...record,
            status: "DOCTOR_REVIEW",
            doctorNote: {
              signed: false,
              summary:
                "AI-prepared admission note: clinical assessment and coverage details are ready for doctor verification.",
            },
          },
          {
            actor: "AI Assistant",
            message:
              "Prepared admission data, supporting documents, and doctor note; awaiting doctor signature",
          },
        ),
      );
    }, 2400);
    return admission;
  };

  const signDoctorNote = (id: string, signatureName: string) => {
    updateAdmission(id, record =>
      addEvent(
        {
          ...record,
          status: "ADMIN_REVIEW",
          doctorNote: {
            ...record.doctorNote,
            signed: true,
            signedBy: signatureName,
            signedAt: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          retrievedDocuments: createRetrievedDocuments(true),
        },
        {
          actor: "Doctor",
          message: "Doctor note reviewed and electronically signed",
        },
      ),
    );
  };

  const beginResubmission = (id: string) => {
    window.setTimeout(() => {
      updateAdmission(id, record =>
        addEvent(
          { ...record, status: "AI_RESUBMISSION" },
          {
            actor: "AI Assistant",
            message: "Parsed insurer feedback and created a resubmission task",
          },
        ),
      );
      window.setTimeout(() => {
        updateAdmission(id, record =>
          addEvent(
            {
              ...record,
              status: "ADMIN_REVIEW",
              insurerFeedback: undefined,
            },
            {
              actor: "AI Assistant",
              message: "Updated the package using available hospital data",
            },
          ),
        );
      }, 3500);
    }, 2200);
  };

  const submitToInsurer = (id: string) => {
    const currentAdmission = admissions.find(record => record.id === id);

    if (
      !currentAdmission ||
      currentAdmission.status !== "ADMIN_REVIEW" ||
      !currentAdmission.doctorNote.signed
    ) {
      return;
    }

    const insurerOutcome = currentAdmission?.nextInsurerOutcome ?? "APPROVE";

    updateAdmission(id, record =>
      addEvent(
        {
          ...record,
          status: "SUBMITTING_TO_INSURANCE",
          submissionAttempts: record.submissionAttempts + 1,
        },
        {
          actor: "Administrator",
          message: "Final package submitted to insurer",
        },
      ),
    );

    window.setTimeout(() => {
      updateAdmission(id, record => {
        if (insurerOutcome === "REJECT") {
          return addEvent(
              {
                ...record,
                status: "INSURANCE_REJECTED",
                insurerFeedback: rejectionRequirements,
              },
              {
                actor: "Insurance",
                message: "Claim rejected with additional requirements",
              },
            );
        }

        if (insurerOutcome === "FINAL_REJECT") {
          return addEvent(
            { ...record, status: "INSURANCE_FINAL_REJECTED" },
            { actor: "Insurance", message: "Claim declined by insurer" },
          );
        }

        return addEvent(
          { ...record, status: "INSURANCE_APPROVED" },
          { actor: "Insurance", message: "Claim approved" },
        );
      });
      if (insurerOutcome === "REJECT") beginResubmission(id);
    }, 2200);
  };

  const setNextInsurerOutcome = (id: string, outcome: InsurerOutcome) => {
    updateAdmission(id, record => ({ ...record, nextInsurerOutcome: outcome }));
  };

  const value = {
    admissions,
    createAdmission,
    signDoctorNote,
    submitToInsurer,
    setNextInsurerOutcome,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within WorkflowProvider");
  }
  return context;
}
