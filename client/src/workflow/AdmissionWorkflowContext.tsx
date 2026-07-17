/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { pendingPatients, type PendingPatient } from "../data/pendingPatients";
import { getPatientGenderFromNric } from "../types/patient";
import type { Identity, Policy } from "../types/onboarding";

export type AdmissionStatus =
  | "PENDING_ADMIN_APPROVAL"
  | "AI_PREPARING"
  | "DOCTOR_REVIEW"
  | "ADMIN_REVIEW"
  | "SUBMITTING_TO_INSURANCE"
  | "INSURANCE_REJECTED"
  | "AI_RESUBMISSION"
  | "INSURANCE_APPROVED"
  | "INSURANCE_FINAL_REJECTED";

export type InsurerOutcome = "APPROVE" | "REJECT" | "FINAL_REJECT";

export type PolicyEligibility = "ELIGIBLE" | "NOT_ELIGIBLE";

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
  submissionStatus: "Ready to submit" | "Requires review" | "Reference only";
};

export type PolicyCheck = {
  id: "active" | "covered" | "exclusions" | "sum-insured";
  question: string;
  status: "pending" | "checking" | "passed";
};

export type AdmissionRecord = PendingPatient & {
  patientEmail?: string;
  hospitalName: string;
  consentedAt: string;
  status: AdmissionStatus;
  doctorNote: {
    summary: string;
    diagnosis?: string;
    estimatedCost?: string;
    recommendation?: string;
    signed: boolean;
    signedBy?: string;
    signedAt?: string;
    signatureImage?: string;
  };
  insurerFeedback?: string[];
  submissionAttempts: number;
  nextInsurerOutcome: InsurerOutcome;
  policyEligibility: PolicyEligibility;
  retrievedDocuments: RetrievedDocument[];
  policyChecks: PolicyCheck[];
  timeline: WorkflowEvent[];
};

export type PatientProfile = {
  patientEmail: string;
  identity: Identity;
  policy: Policy;
};

type CreateAdmissionInput = {
  identity: Identity;
  policy: Policy;
  patientEmail: string;
};

type WorkflowContextValue = {
  admissions: AdmissionRecord[];
  profiles: PatientProfile[];
  saveProfile: (input: CreateAdmissionInput) => void;
  requestAdmission: (
    patientEmail: string,
    hospitalName: string,
  ) => AdmissionRecord | null;
  approveAdmission: (id: string) => void;
  signDoctorNote: (
    id: string,
    signatureName: string,
    diagnosis: string,
    estimatedCost: string,
    recommendation: string,
    signatureImage: string,
  ) => void;
  submitToInsurer: (id: string) => void;
  reviewInsurerClaim: (id: string, outcome: InsurerOutcome) => void;
  sendNudge: (id: string) => void;
  setPolicyEligibility: (id: string, eligibility: PolicyEligibility) => void;
};

const WorkflowContext = createContext<WorkflowContextValue | undefined>(
  undefined,
);

// Patient profiles are kept in localStorage so a patient who has completed the
// identity and policy scan once is not asked to submit those documents again on
// their next visit or login.
const profilesStorageKey = "rawat-lawat-patient-profiles";

function loadStoredProfiles(): PatientProfile[] {
  try {
    const saved = localStorage.getItem(profilesStorageKey);
    return saved ? (JSON.parse(saved) as PatientProfile[]) : [];
  } catch {
    return [];
  }
}

const rejectionRequirements = [
  "Attach the latest laboratory result",
  "Confirm the estimated admission cost",
];

const policyCheckQuestions: PolicyCheck[] = [
  { id: "active", question: "Is this policy active?", status: "pending" },
  { id: "covered", question: "Is this condition covered?", status: "pending" },
  { id: "exclusions", question: "Any exclusions or waiting period issues?", status: "pending" },
  { id: "sum-insured", question: "Is cost within sum insured?", status: "pending" },
];

function policyChecks(checkingIndex = -1): PolicyCheck[] {
  return policyCheckQuestions.map((check, index) => ({
    ...check,
    status: index < checkingIndex ? "passed" : index === checkingIndex ? "checking" : "pending",
  }));
}

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
    hospitalName: "Central Hospital HQ",
    consentedAt: "Today, 10:30 AM",
    status: awaitingDoctorReview ? "DOCTOR_REVIEW" : "ADMIN_REVIEW",
    doctorNote: {
      summary: `${patient.admissionReason} assessed; admission and treatment are clinically indicated.`,
      signed: !awaitingDoctorReview,
      signedBy: awaitingDoctorReview ? undefined : "Dr. Farah Ismail",
      signedAt: awaitingDoctorReview ? undefined : "Today, 10:42 AM",
    },
    submissionAttempts: 0,
    nextInsurerOutcome: index === 0 ? "REJECT" : "APPROVE",
    policyEligibility: "ELIGIBLE",
    retrievedDocuments: createRetrievedDocuments(!awaitingDoctorReview),
    policyChecks: policyChecks(policyCheckQuestions.length),
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
      submissionStatus: "Reference only",
    },
    {
      id: "full-policy-document",
      name: "Full policy document",
      source: "Policy Vault",
      detail:
        "Mock policy schedule and inpatient coverage terms retrieved for submission.",
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
  const [profiles, setProfiles] = useState<PatientProfile[]>(loadStoredProfiles);

  useEffect(() => {
    localStorage.setItem(profilesStorageKey, JSON.stringify(profiles));
  }, [profiles]);

  const updateAdmission = (
    id: string,
    update: (record: AdmissionRecord) => AdmissionRecord,
  ) => {
    setAdmissions(current =>
      current.map(record => (record.id === id ? update(record) : record)),
    );
  };

  const saveProfile = ({
    identity,
    policy,
    patientEmail,
  }: CreateAdmissionInput) => {
    setProfiles(current => {
      const profile = { patientEmail, identity, policy };
      return current.some(item => item.patientEmail === patientEmail)
        ? current.map(item =>
            item.patientEmail === patientEmail ? profile : item,
          )
        : [...current, profile];
    });
  };

  const requestAdmission = (patientEmail: string, hospitalName: string) => {
    const profile = profiles.find(item => item.patientEmail === patientEmail);

    if (!profile) return null;

    const { identity, policy } = profile;
    const id = `admission-${Date.now()}`;
    const admission: AdmissionRecord = {
      id,
      patientEmail,
      hospitalName,
      consentedAt: "Just now",
      name: identity.fullName,
      gender: identity.gender || getPatientGenderFromNric(identity.nric),
      medicalRecordNumber: `CH-${Math.floor(100000 + Math.random() * 899999)}`,
      insurer: policy.provider,
      policyPlan: policy.coverageTier || "Medical coverage",
      memberId: policy.policyNumber,
      requestedAt: "Just now",
      admissionReason: "Admission assessment",
      priority: "Standard",
      status: "PENDING_ADMIN_APPROVAL",
      doctorNote: { summary: "", signed: false },
      submissionAttempts: 0,
      nextInsurerOutcome: "APPROVE",
      policyEligibility: "ELIGIBLE",
      retrievedDocuments: createRetrievedDocuments(false),
      policyChecks: policyChecks(),
      timeline: [
        event(
          "Patient",
          `Selected ${hospitalName} and consented to share admission data`,
        ),
      ],
    };

    setAdmissions(current => [admission, ...current]);
    return admission;
  };

  const approveAdmission = (id: string) => {
    updateAdmission(id, record =>
      addEvent(
        { ...record, status: "AI_PREPARING", policyChecks: policyChecks(0) },
        {
          actor: "Administrator",
          message: "Hospital approved the admission request",
        },
      ),
    );

    [1, 2, 3].forEach(index => {
      window.setTimeout(() => {
        updateAdmission(id, record => ({
          ...record,
          policyChecks: policyChecks(index),
        }));
      }, index * 1500);
    });

    window.setTimeout(() => {
      updateAdmission(id, record =>
        addEvent(
          {
            ...record,
            status: "DOCTOR_REVIEW",
            policyChecks: policyChecks(policyCheckQuestions.length),
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
    }, 6000);
  };

  const signDoctorNote = (
    id: string,
    signatureName: string,
    diagnosis: string,
    estimatedCost: string,
    recommendation: string,
    signatureImage: string,
  ) => {
    updateAdmission(id, record =>
      addEvent(
        {
          ...record,
          status: "ADMIN_REVIEW",
          doctorNote: {
            ...record.doctorNote,
            diagnosis,
            estimatedCost,
            recommendation,
            signed: true,
            signedBy: signatureName,
            signedAt: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            signatureImage,
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
      !currentAdmission.doctorNote.signed ||
      currentAdmission.policyEligibility !== "ELIGIBLE"
    ) {
      return;
    }

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
  };

  const reviewInsurerClaim = (id: string, outcome: InsurerOutcome) => {
    const currentAdmission = admissions.find(record => record.id === id);

    if (!currentAdmission || currentAdmission.status !== "SUBMITTING_TO_INSURANCE") {
      return;
    }

    updateAdmission(id, record => {
      if (outcome === "REJECT") {
        return addEvent(
          {
            ...record,
            status: "INSURANCE_REJECTED",
            insurerFeedback: rejectionRequirements,
          },
          {
            actor: "Insurance",
            message: "Additional document required",
          },
        );
      }

      if (outcome === "FINAL_REJECT") {
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

    if (outcome === "REJECT") {
      beginResubmission(id);
    }
  };

  const sendNudge = (id: string) => {
    updateAdmission(id, record => {
      const recipient =
        record.status === "DOCTOR_REVIEW" ? "doctor" : "insurer reviewer";

      return addEvent(record, {
        actor: "Administrator",
        message: `Reminder sent to the ${recipient} after more than five hours without a response`,
      });
    });
  };

  const setPolicyEligibility = (
    id: string,
    eligibility: PolicyEligibility,
  ) => {
    updateAdmission(id, record => ({ ...record, policyEligibility: eligibility }));
  };

  const value = {
    admissions,
    profiles,
    saveProfile,
    requestAdmission,
    approveAdmission,
    signDoctorNote,
    submitToInsurer,
    reviewInsurerClaim,
    sendNudge,
    setPolicyEligibility,
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
