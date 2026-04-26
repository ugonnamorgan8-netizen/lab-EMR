import { create } from "zustand";
import type { VisitSummary } from "../types/app";

type PatientStore = {
  activeVisit: VisitSummary | null;
  setActiveVisit: (visit: VisitSummary | null) => void;
};

export const usePatientStore = create<PatientStore>((set) => ({
  activeVisit: null,
  setActiveVisit: (activeVisit) => set({ activeVisit }),
}));
