import type { Tables } from "@/shared/types/database"

export type Patient = Tables<"patients">
export type PatientMedicalNotes = Tables<"patient_medical_notes">
