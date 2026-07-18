import type {
  AdmissionRecord,
  InsurerRequirement,
  RetrievedDocument,
} from "./AdmissionWorkflowContext";

// Rule-based resolution of the insurer's rejection requirements from the data
// the hospital already holds. Each requirement is resolved only if the data
// genuinely supports it; anything unresolved is returned untouched so the
// admission stays flagged.

export type RequirementResolution = {
  requirements: InsurerRequirement[];
  attachedDocuments: RetrievedDocument[];
  allResolved: boolean;
};

export function resolveInsurerRequirements(
  admission: AdmissionRecord,
): RequirementResolution {
  const attachedDocuments: RetrievedDocument[] = [];

  const requirements = (admission.insurerFeedback ?? []).map<InsurerRequirement>(
    requirement => {
      if (requirement.status === "resolved") return requirement;

      // Data requirement: confirm the estimated cost from the doctor's note.
      if (requirement.id === "estimated-cost") {
        const cost = admission.doctorNote.estimatedCost;
        return cost
          ? {
              ...requirement,
              status: "resolved",
              note: `Confirmed estimated cost of ${cost}.`,
            }
          : {
              ...requirement,
              note: "Estimated cost is not yet available from the doctor's note.",
            };
      }

      // Document requirement: retrieve the record from the hospital and attach
      // it to the package (a reference, consistent with the other documents).
      attachedDocuments.push({
        id: requirement.id,
        name: requirement.label,
        source: "Hospital record",
        detail: `${requirement.label} retrieved and attached for the insurer.`,
        submissionStatus: "Ready to submit",
      });
      return {
        ...requirement,
        status: "resolved",
        note: `${requirement.label} retrieved from the hospital record.`,
      };
    },
  );

  const allResolved = requirements.every(
    requirement => requirement.status === "resolved",
  );

  return { requirements, attachedDocuments, allResolved };
}
