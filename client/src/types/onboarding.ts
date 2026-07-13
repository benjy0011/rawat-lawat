import type { Dispatch, SetStateAction } from "react";

export type DocumentKind = "identity" | "policy";
export type ScanState = "idle" | "camera" | "reading" | "ready" | "error";
export type Identity = { fullName: string; nric: string; dateOfBirth: string };
export type Policy = {
  provider: string;
  policyNumber: string;
  coverageTier: string;
  expiryDate: string;
};
export type FormValues = Record<string, string>;
export type StateSetter<T> = Dispatch<SetStateAction<T>>;

export const emptyIdentity: Identity = {
  fullName: "",
  nric: "",
  dateOfBirth: "",
};
export const emptyPolicy: Policy = {
  provider: "",
  policyNumber: "",
  coverageTier: "",
  expiryDate: "",
};
