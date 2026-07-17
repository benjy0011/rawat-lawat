import aiaLogo from "../assets/aia.png";
import aiaPolicyDocument from "../assets/aia_policy.pdf";
import allianzLogo from "../assets/alianz.png";
import allianzPolicyDocument from "../assets/alianz-policy.pdf";
import greatEasternLogo from "../assets/great-eastern.jpeg";
import greatEasternPolicyDocument from "../assets/great-eastern-policy.pdf";
import prudentialLogo from "../assets/prudential.jpeg";
import prudentialPolicyDocument from "../assets/prudential-policy.pdf";

export type VaultPolicyStatus = "Active" | "Expiring soon" | "Inactive";

export type VaultPolicy = {
  id: string;
  policyNumber: string;
  memberId: string;
  policyholder: string;
  insurer: string;
  plan: string;
  status: VaultPolicyStatus;
  expiresOn: string;
  // Annual inpatient sum insured (MYR) used by the eligibility check.
  sumInsured: number;
  logo: string;
  documentUrl: string;
};

export const vaultPolicies: VaultPolicy[] = [
  {
    id: "vault-aia-001",
    policyNumber: "AIA-MLY-884201",
    memberId: "AIA-884201",
    policyholder: "Tan Ah Kow",
    insurer: "AIA Malaysia",
    plan: "A-Life Med Regular",
    status: "Active",
    expiresOn: "31 Dec 2026",
    sumInsured: 150000,
    logo: aiaLogo,
    documentUrl: aiaPolicyDocument,
  },
  {
    id: "vault-aia-002",
    policyNumber: "AIA-MLY-661024",
    memberId: "AIA-661024",
    policyholder: "Jasmine Lee",
    insurer: "AIA Malaysia",
    plan: "A-Plus Health 2",
    status: "Expiring soon",
    expiresOn: "30 Aug 2026",
    sumInsured: 1000000,
    logo: aiaLogo,
    documentUrl: aiaPolicyDocument,
  },
  {
    id: "vault-ge-001",
    policyNumber: "GE-MLY-233184",
    memberId: "GE-233184",
    policyholder: "Nur Aisha Rahman",
    insurer: "Great Eastern Malaysia",
    plan: "SmartProtect Essential",
    status: "Active",
    expiresOn: "14 Mar 2027",
    sumInsured: 100000,
    logo: greatEasternLogo,
    documentUrl: greatEasternPolicyDocument,
  },
  {
    id: "vault-ge-002",
    policyNumber: "GE-MLY-551937",
    memberId: "GE-551937",
    policyholder: "Siti Hawa Ismail",
    insurer: "Great Eastern Malaysia",
    plan: "SmartMedic Premier",
    status: "Active",
    expiresOn: "09 Nov 2026",
    sumInsured: 300000,
    logo: greatEasternLogo,
    documentUrl: greatEasternPolicyDocument,
  },
  {
    id: "vault-pru-001",
    policyNumber: "PRU-778420",
    memberId: "PRU-778420",
    policyholder: "Lim Wei Jian",
    insurer: "Prudential Malaysia",
    plan: "PRUHealth Med",
    status: "Active",
    expiresOn: "22 Jan 2027",
    sumInsured: 200000,
    logo: prudentialLogo,
    documentUrl: prudentialPolicyDocument,
  },
  {
    id: "vault-pru-002",
    policyNumber: "PRU-405812",
    memberId: "PRU-405812",
    policyholder: "Daniel Wong",
    insurer: "Prudential Malaysia",
    plan: "PRUMillion Med 2.0",
    status: "Inactive",
    expiresOn: "02 May 2026",
    sumInsured: 1000000,
    logo: prudentialLogo,
    documentUrl: prudentialPolicyDocument,
  },
  {
    id: "vault-allianz-001",
    policyNumber: "AZ-901366",
    memberId: "AZ-901366",
    policyholder: "Amirul Hakim",
    insurer: "Allianz Malaysia",
    plan: "MediSafe Infinite+",
    status: "Active",
    expiresOn: "17 Sep 2026",
    sumInsured: 500000,
    logo: allianzLogo,
    documentUrl: allianzPolicyDocument,
  },
  {
    id: "vault-allianz-002",
    policyNumber: "AZ-340119",
    memberId: "AZ-340119",
    policyholder: "Mei Ling Tan",
    insurer: "Allianz Malaysia",
    plan: "HealthAssured Gold",
    status: "Active",
    expiresOn: "12 Feb 2027",
    sumInsured: 250000,
    logo: allianzLogo,
    documentUrl: allianzPolicyDocument,
  },
];
