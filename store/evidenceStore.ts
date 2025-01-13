import { create } from 'zustand';
import { ApiEvidence } from '../app/evidence-extraction/types';

interface EvidenceState {
  selectedExtractions: ApiEvidence[];
  removeExtraction: (extraction: ApiEvidence) => void;
  addExtraction: (extraction: ApiEvidence) => void;
  clearExtractions: () => void;
  isSelected: (extraction: ApiEvidence) => boolean;
}

const useEvidenceStore = create<EvidenceState>()((set, get) => ({
  selectedExtractions: [],
  removeExtraction: (extraction) => {
    set((state) => ({
      selectedExtractions: state.selectedExtractions.filter(
        (e) => !(e.raw_text === extraction.raw_text && e.document_name === extraction.document_name)
      ),
    }));
  },
  addExtraction: (extraction) => {
    if (!get().isSelected(extraction)) {
      set((state) => ({
        selectedExtractions: [...state.selectedExtractions, extraction],
      }));
    }
  },
  clearExtractions: () => {
    set({ selectedExtractions: [] });
  },
  isSelected: (extraction) => {
    return get().selectedExtractions.some(
      (e) => e.raw_text === extraction.raw_text && e.document_name === extraction.document_name
    );
  },
}));

export default useEvidenceStore;
