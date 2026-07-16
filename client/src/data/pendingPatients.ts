import type { PatientGender } from "../types/patient";

export type PendingPatient = {
  id: string
  name: string
  gender: PatientGender
  medicalRecordNumber: string
  insurer: string
  policyPlan: string
  memberId: string
  requestedAt: string
  admissionReason: string
  priority: 'Urgent' | 'Standard'
}

export const pendingPatients: PendingPatient[] = [
  { id: 'tan-ah-kow', name: 'Tan Ah Kow', gender: 'male', medicalRecordNumber: 'CH-482193', insurer: 'AIA Malaysia', policyPlan: 'A-Life Med Regular', memberId: 'AIA-MLY-884201', requestedAt: 'Today, 10:32 AM', admissionReason: 'Acute gastroenteritis', priority: 'Urgent' },
  { id: 'nur-aisha-rahman', name: 'Nur Aisha Rahman', gender: 'female', medicalRecordNumber: 'CH-482247', insurer: 'Great Eastern Malaysia', policyPlan: 'SmartProtect Essential', memberId: 'GE-MLY-233184', requestedAt: 'Today, 10:48 AM', admissionReason: 'Observation after a fall', priority: 'Standard' },
  { id: 'lim-wei-jian', name: 'Lim Wei Jian', gender: 'male', medicalRecordNumber: 'CH-482289', insurer: 'Prudential Malaysia', policyPlan: 'PRUHealth Med', memberId: 'PRU-778420', requestedAt: 'Today, 11:05 AM', admissionReason: 'Acute appendicitis assessment', priority: 'Urgent' },
  { id: 'siti-hawa-ismail', name: 'Siti Hawa Ismail', gender: 'female', medicalRecordNumber: 'CH-482315', insurer: 'Allianz Malaysia', policyPlan: 'MediSafe Infinite+', memberId: 'AZ-901366', requestedAt: 'Today, 11:21 AM', admissionReason: 'Planned endoscopy', priority: 'Standard' },
]
