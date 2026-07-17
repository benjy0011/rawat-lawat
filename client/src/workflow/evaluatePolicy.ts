import { vaultPolicies } from "../data/policyVault";
import type {
  AdmissionRecord,
  PolicyCheck,
  PolicyEligibility,
} from "./AdmissionWorkflowContext";

// Rule-based (non-AI) policy eligibility, in the spirit of InsureScan's
// rule-based fraud detector: deterministic checks over the real admission and
// the policy record looked up in the Policy Vault. No LLM, no API key.

const questions: Record<PolicyCheck["id"], string> = {
  active: "Is this policy active?",
  covered: "Is this condition covered?",
  exclusions: "Any exclusions or waiting period issues?",
  "sum-insured": "Is cost within sum insured?",
};

// Conditions a medical card typically will not cover.
const excludedConditions = [
  "cosmetic",
  "dental",
  "self-inflicted",
  "pre-existing",
  "infertility",
];

// Planned / elective procedures are subject to a waiting period.
const electiveConditions = ["planned", "elective", "screening", "routine"];

export type PolicyEvaluation = {
  checks: PolicyCheck[];
  eligibility: PolicyEligibility;
};

function check(
  id: PolicyCheck["id"],
  status: PolicyCheck["status"],
  detail?: string,
): PolicyCheck {
  return { id, question: questions[id], status, detail };
}

// Build the four checks all in one status (used while "checking" animates).
export function checksWithStatus(status: PolicyCheck["status"]): PolicyCheck[] {
  return (Object.keys(questions) as PolicyCheck["id"][]).map(id =>
    check(id, status),
  );
}

function parseCost(value?: string): number | null {
  if (!value) return null;
  const amount = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function isExpired(expiresOn: string): boolean {
  const time = Date.parse(expiresOn);
  return Number.isFinite(time) && time < Date.now();
}

const ringgit = (amount: number) => `RM ${amount.toLocaleString("en-MY")}`;

export function evaluatePolicy(admission: AdmissionRecord): PolicyEvaluation {
  const policy = vaultPolicies.find(
    item =>
      item.policyNumber === admission.memberId ||
      item.memberId === admission.memberId,
  );
  const condition = `${admission.admissionReason} ${
    admission.doctorNote.diagnosis ?? ""
  }`.toLowerCase();
  const estimatedCost = parseCost(admission.doctorNote.estimatedCost);

  const checks: PolicyCheck[] = [];

  // 1. Active — from the Policy Vault record, not the scanned tier.
  if (!policy) {
    checks.push(
      check("active", "failed", "No matching policy found in the Policy Vault."),
    );
  } else if (policy.status === "Inactive" || isExpired(policy.expiresOn)) {
    checks.push(
      check(
        "active",
        "failed",
        `Policy is ${policy.status.toLowerCase()} (expires ${policy.expiresOn}).`,
      ),
    );
  } else {
    checks.push(
      check(
        "active",
        "passed",
        `Active ${policy.plan} with ${policy.insurer}, valid to ${policy.expiresOn}.`,
      ),
    );
  }

  // 2. Covered — condition is not on the exclusion list.
  const excluded = excludedConditions.find(word => condition.includes(word));
  checks.push(
    excluded
      ? check(
          "covered",
          "failed",
          `Condition may fall under an excluded category (${excluded}).`,
        )
      : check("covered", "passed", "Condition is within general inpatient coverage."),
  );

  // 3. Exclusions / waiting period — planned/elective procedures wait.
  const elective = electiveConditions.find(word => condition.includes(word));
  checks.push(
    elective
      ? check(
          "exclusions",
          "failed",
          `Elective procedure ("${elective}") is subject to a waiting period.`,
        )
      : check("exclusions", "passed", "No exclusions or waiting-period issues found."),
  );

  // 4. Sum insured — estimated cost against the vault's annual limit.
  if (!policy) {
    checks.push(
      check("sum-insured", "failed", "Cannot verify the limit without a matching policy."),
    );
  } else if (estimatedCost === null) {
    checks.push(
      check("sum-insured", "pending", "Awaiting the estimated cost from the doctor's note."),
    );
  } else if (estimatedCost > policy.sumInsured) {
    checks.push(
      check(
        "sum-insured",
        "failed",
        `Estimated ${ringgit(estimatedCost)} exceeds the ${ringgit(policy.sumInsured)} annual limit.`,
      ),
    );
  } else {
    checks.push(
      check(
        "sum-insured",
        "passed",
        `Estimated ${ringgit(estimatedCost)} is within the ${ringgit(policy.sumInsured)} limit.`,
      ),
    );
  }

  const eligibility: PolicyEligibility = checks.some(
    item => item.status === "failed",
  )
    ? "NOT_ELIGIBLE"
    : "ELIGIBLE";

  return { checks, eligibility };
}
