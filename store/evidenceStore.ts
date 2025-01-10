import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ApiEvidence } from '../types/evidence';

interface EvidenceStore {
  selectedExtractions: ApiEvidence[];
  addExtraction: (extraction: ApiEvidence) => void;
  removeExtraction: (extraction: ApiEvidence) => void;
  clearExtractions: () => void;
}

export const useEvidenceStore = create<EvidenceStore>()(
  persist(
    (set) => ({
      selectedExtractions: [],
      addExtraction: (extraction) =>
        set((state) => ({
          selectedExtractions: [...state.selectedExtractions, extraction],
        })),
      removeExtraction: (extraction) =>
        set((state) => ({
          selectedExtractions: state.selectedExtractions.filter(
            (item) => item.raw_text !== extraction.raw_text
          ),
        })),
      clearExtractions: () => set({ selectedExtractions: [] }),
    }),
    {
      name: 'evidence-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({ selectedExtractions: state.selectedExtractions }), // only persist selectedExtractions
    }
  )
);
