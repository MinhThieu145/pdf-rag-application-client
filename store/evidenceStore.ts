import { create } from 'zustand';
import { ApiEvidence } from '../app/evidence-extraction/types';

interface EvidenceState {
  selectedExtractions: Set<string>;
  removeExtraction: (id: string) => void;
  addExtraction: (id: string) => void;
  clearExtractions: () => void;
  isSelected: (id: string) => boolean;
}

const useEvidenceStore = create<EvidenceState>()((set, get) => ({
  selectedExtractions: new Set<string>(),
  removeExtraction: (id) => {
    console.log('Store: Removing extraction', id);
    set((state) => {
      const newSet = new Set(state.selectedExtractions);
      newSet.delete(id);
      console.log('Store: New set after remove:', Array.from(newSet));
      return { selectedExtractions: newSet };
    });
  },
  addExtraction: (id) => {
    console.log('Store: Adding extraction', id);
    set((state) => {
      const newSet = new Set(state.selectedExtractions);
      newSet.add(id);
      console.log('Store: New set after add:', Array.from(newSet));
      return { selectedExtractions: newSet };
    });
  },
  clearExtractions: () => {
    console.log('Store: Clearing all extractions');
    set({ selectedExtractions: new Set() });
  },
  isSelected: (id) => {
    const result = get().selectedExtractions.has(id);
    console.log('Store: Checking if selected', id, result);
    return result;
  },
}));

export default useEvidenceStore;
