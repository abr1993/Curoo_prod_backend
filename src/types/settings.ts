import type { USState } from "@prisma/client";

export interface StateSettings {
  state: USState;
  price: number;
  dailyCap: number;
}

export interface SpecialtySettings {
  id: string; // specialty_id
  available: boolean;
  experience_in_years: number;
  states: StateSettings[];
}

export interface SettingsBody {
  displayName: string;
  avatar?: string;
  unavailable: boolean;
  specialties: SpecialtySettings[];
}