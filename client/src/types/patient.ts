export type PatientGender = "male" | "female";

export function inferPatientGenderFromNric(
  nric: string,
): PatientGender | "" {
  const digits = nric.replace(/\D/g, "");

  if (!/^\d{12}$/.test(digits)) {
    return "";
  }

  const lastDigit = Number(digits.at(-1));

  return lastDigit % 2 === 0 ? "female" : "male";
}

export function getPatientGenderFromNric(nric: string): PatientGender {
  const inferredGender = inferPatientGenderFromNric(nric);

  return inferredGender || "female";
}
