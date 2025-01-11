import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Paragraph {
  paragraph_number: number;
  content: string;
  purpose: string;
}

export interface Introduction {
  content: string;
  purpose: string;
}

export interface Conclusion {
  content: string;
  purpose: string;
}

export interface EssayStructure {
  essay_planning: string;
  essay_structure: {
    introduction: Introduction;
    body_paragraphs: Paragraph[];
    conclusion: Conclusion;
  };
}

interface EssayStore {
  essayStructure: EssayStructure | null;
  isGenerating: boolean;
  paragraphOrder: number[]; // Track the order of paragraphs
  setEssayStructure: (structure: EssayStructure | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  clearEssayStructure: () => void;
  reorderParagraphs: (fromIndex: number, toIndex: number) => void;
}

export const useEssayStore = create<EssayStore>()(
  persist(
    (set) => ({
      essayStructure: null,
      isGenerating: false,
      paragraphOrder: [],
      setEssayStructure: (structure) => set((state) => ({
        essayStructure: structure,
        // Initialize paragraph order when setting new essay structure
        paragraphOrder: structure?.essay_structure.body_paragraphs.map((_, i) => i) || []
      })),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      clearEssayStructure: () => set({ essayStructure: null, paragraphOrder: [] }),
      reorderParagraphs: (fromIndex: number, toIndex: number) => 
        set((state) => {
          const newOrder = [...state.paragraphOrder];
          const [movedItem] = newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, movedItem);
          return { paragraphOrder: newOrder };
        }),
    }),
    {
      name: 'essay-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        essayStructure: state.essayStructure,
        isGenerating: state.isGenerating,
        paragraphOrder: state.paragraphOrder
      }),
    }
  )
);
