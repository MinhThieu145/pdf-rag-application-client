import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface EssayStructure {
  essay_planning: string;
  essay_structure: {
    introduction: {
      content: string;
      purpose: string;
    };
    body_paragraphs: Array<{
      paragraph_number: number;
      content: string;
      purpose: string;
    }>;
    conclusion: {
      content: string;
      purpose: string;
    };
  };
}

interface EssayStore {
  essayStructure: EssayStructure | null;
  isGenerating: boolean;
  setEssayStructure: (structure: EssayStructure | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  clearEssayStructure: () => void;
}

export const useEssayStore = create<EssayStore>()(
  persist(
    (set) => ({
      essayStructure: null,
      isGenerating: false,
      setEssayStructure: (structure) => set({ essayStructure: structure }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      clearEssayStructure: () => set({ essayStructure: null }),
    }),
    {
      name: 'essay-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        essayStructure: state.essayStructure,
        isGenerating: state.isGenerating 
      }),
    }
  )
);
