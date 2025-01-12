'use client';

import { useEffect, useRef, useId } from 'react';
import type { OutputData } from '@editorjs/editorjs';
import { useEssayStore } from '@/store/essayStore';
import type { EssayStructure } from '@/store/essayStore';

interface EditorProps {
  onChange?: (data: OutputData) => void;
  initialData?: OutputData;
}

const LOCAL_STORAGE_KEY = 'editorData';

const DEFAULT_INITIAL_DATA = {
  blocks: [],
  version: "2.28.2"
};

const createEssayBlocks = (essayStructure: EssayStructure | null) => {
  if (!essayStructure) return null;

  const blocks = [];
  let blockId = Date.now();

  // Add essay planning
  if (essayStructure.essay_planning) {
    blocks.push(
      {
        id: `planning-header-${blockId++}`,
        type: "header",
        data: {
          text: "Essay Planning",
          level: 1
        }
      },
      {
        id: `planning-content-${blockId++}`,
        type: "paragraph",
        data: {
          text: essayStructure.essay_planning || ''
        }
      }
    );
  }

  // Add introduction
  if (essayStructure.essay_structure?.introduction) {
    blocks.push(
      {
        id: `intro-header-${blockId++}`,
        type: "header",
        data: {
          text: "Introduction",
          level: 2
        }
      },
      {
        id: `intro-content-${blockId++}`,
        type: "paragraph",
        data: {
          text: essayStructure.essay_structure.introduction.content || ''
        }
      },
      {
        id: `intro-purpose-${blockId++}`,
        type: "paragraph",
        data: {
          text: `Purpose: ${essayStructure.essay_structure.introduction.purpose || ''}`
        }
      }
    );
  }

  // Add body paragraphs
  if (essayStructure.essay_structure?.body_paragraphs) {
    blocks.push({
      id: `body-header-${blockId++}`,
      type: "header",
      data: {
        text: "Body Paragraphs",
        level: 2
      }
    });

    const { body_paragraphs } = essayStructure.essay_structure;
    const { paragraphOrder } = useEssayStore.getState();
    const orderedParagraphs = paragraphOrder.length === body_paragraphs.length
      ? paragraphOrder.map(index => body_paragraphs[index])
      : body_paragraphs;

    orderedParagraphs.forEach((para, index) => {
      if (para) {
        blocks.push(
          {
            id: `body-content-${index}-${blockId++}`,
            type: "paragraph",
            data: {
              text: para.content || ''
            }
          },
          {
            id: `body-purpose-${index}-${blockId++}`,
            type: "paragraph",
            data: {
              text: `Purpose: ${para.purpose || ''}`
            }
          }
        );
      }
    });
  }

  // Add conclusion
  if (essayStructure.essay_structure?.conclusion) {
    blocks.push(
      {
        id: `conclusion-header-${blockId++}`,
        type: "header",
        data: {
          text: "Conclusion",
          level: 2
        }
      },
      {
        id: `conclusion-content-${blockId++}`,
        type: "paragraph",
        data: {
          text: essayStructure.essay_structure.conclusion.content || ''
        }
      },
      {
        id: `conclusion-purpose-${blockId++}`,
        type: "paragraph",
        data: {
          text: `Purpose: ${essayStructure.essay_structure.conclusion.purpose || ''}`
        }
      }
    );
  }

  return {
    time: Date.now(),
    blocks,
    version: "2.28.2"
  };
};

const initializedEditors = new Set<string>();

export default function EditorComponent({ onChange, initialData }: EditorProps = {}) {
  const editorRef = useRef<any>();
  const isInitializedRef = useRef(false);
  const previousEssayRef = useRef<EssayStructure | null>(null);
  const holderId = useId();
  const { essayStructure } = useEssayStore();

  const getStoredData = () => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('Found stored data:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return null;
  };

  const handleEditorChange = async (api: any) => {
    try {
      if (!api) {
        console.log('No editor API available');
        return;
      }

      console.log('Attempting to save editor content...');
      const outputData = await api.save();
      
      if (!outputData) {
        console.warn('Save returned no data');
        return;
      }

      console.log('Save successful, raw data:', JSON.stringify(outputData, null, 2));

      if (!Array.isArray(outputData.blocks)) {
        console.warn('No blocks array in output data');
        return;
      }

      const validData = {
        time: Date.now(),
        blocks: outputData.blocks,
        version: outputData.version
      };

      console.log('Saving data to localStorage:', JSON.stringify(validData, null, 2));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validData));
      
      if (onChange) {
        console.log('Calling onChange handler');
        onChange(validData);
      }
    } catch (error) {
      console.error('Error in handleEditorChange:', error);
    }
  };

  // Effect to handle essay structure changes
  useEffect(() => {
    const handleEssayStructureChange = async () => {
      if (!editorRef.current || !isInitializedRef.current) return;

      // Skip if it's the same structure
      if (previousEssayRef.current === essayStructure) return;
      previousEssayRef.current = essayStructure;

      try {
        // Get current editor content
        const currentContent = await editorRef.current.save();
        
        if (!currentContent || !Array.isArray(currentContent.blocks)) {
          console.warn('No valid current content');
          return;
        }

        // Create blocks from new essay structure
        const newEssayData = createEssayBlocks(essayStructure);
        if (!newEssayData || !Array.isArray(newEssayData.blocks)) {
          console.warn('No valid new essay data');
          return;
        }

        // Combine current content with new blocks
        const combinedBlocks = [
          ...currentContent.blocks,
          // Add a delimiter between old and new content
          {
            id: `delimiter-${Date.now()}`,
            type: 'delimiter',
            data: {}
          },
          ...newEssayData.blocks
        ];

        // Update editor with combined content
        await editorRef.current.render({
          blocks: combinedBlocks,
          version: currentContent.version
        });

        console.log('Editor content updated with new essay structure');
      } catch (error) {
        console.error('Error updating editor content:', error);
      }
    };

    handleEssayStructureChange();
  }, [essayStructure]);

  useEffect(() => {
    let editor: any = null;

    const initEditor = async () => {
      if (initializedEditors.has(holderId) || editorRef.current) {
        return;
      }

      try {
        console.log('Initializing editor...');
        const [
          { default: EditorJS },
          { default: Header },
          { default: List },
          { default: Quote },
          { default: ImageTool },
          { default: Table },
          { default: Delimiter }
        ] = await Promise.all([
          import('@editorjs/editorjs'),
          import('@editorjs/header'),
          import('@editorjs/list'),
          import('@editorjs/quote'),
          import('@editorjs/image'),
          import('@editorjs/table'),
          import('@editorjs/delimiter')
        ]);

        if (initializedEditors.has(holderId)) {
          return;
        }

        initializedEditors.add(holderId);

        // Priority: localStorage > essayData > initialData > empty data
        const storedData = getStoredData();
        const essayData = createEssayBlocks(essayStructure);
        const initialEditorData = storedData || essayData || initialData || DEFAULT_INITIAL_DATA;
        
        console.log('Using initial editor data:', initialEditorData);

        const editorConfig = {
          holder: holderId,
          tools: {
            header: {
              class: Header,
              config: {
                levels: [1, 2, 3],
                defaultLevel: 1
              }
            },
            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              }
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author'
              }
            },
            image: {
              class: ImageTool,
              config: {
                uploader: {
                  uploadByFile(file: File) {
                    return new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        resolve({
                          success: 1,
                          file: {
                            url: e.target?.result
                          }
                        });
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                }
              }
            },
            delimiter: Delimiter,
            table: {
              class: Table,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 3,
              },
            }
          },
          onReady: () => {
            console.log('Editor.js is ready to work!');
            isInitializedRef.current = true;
            previousEssayRef.current = essayStructure;
          },
          onChange: (api: any) => {
            console.log('Content changed, getting editor instance...');
            if (isInitializedRef.current && editorRef.current) {
              console.log('Editor initialized, handling change...');
              handleEditorChange(editorRef.current);
            } else {
              console.log('Editor not ready:', { 
                isInitialized: isInitializedRef.current, 
                hasEditor: !!editorRef.current 
              });
            }
          },
          autofocus: false,
          placeholder: 'Click here to start writing...',
          inlineToolbar: ['bold', 'italic', 'link'],
          data: initialEditorData,
        };

        console.log('Editor configuration:', JSON.stringify(editorConfig, null, 2));
        editor = new EditorJS(editorConfig);
        editorRef.current = editor;

      } catch (error) {
        console.error('Error initializing editor:', error);
        console.error('Stack trace:', error.stack);
      }
    };

    initEditor();

    return () => {
      if (editor && typeof editor.destroy === 'function') {
        console.log('Destroying editor instance');
        editor.destroy();
        editorRef.current = null;
        isInitializedRef.current = false;
        initializedEditors.delete(holderId);
      }
    };
  }, [onChange, initialData, holderId, essayStructure]);

  return (
    <div className="relative w-full max-w-screen-lg mx-auto bg-white">
      <div 
        id={holderId}
        className="min-h-[500px] text-black"
      />
      <style jsx global>{`
        .codex-editor { color: black !important; }
        .ce-block { color: black !important; }
        .ce-paragraph { color: black !important; }
        .ce-header { color: black !important; }
        .cdx-block { color: black !important; }
        .ce-toolbar__content {
          max-width: none;
          margin-right: 40px;
        }
        .ce-block__content {
          max-width: none;
          margin-right: 40px;
        }
        .ce-toolbar__actions { right: -10px !important; }
        .ce-conversion-toolbar { color: black !important; }
        .ce-conversion-tool { color: black !important; }
        .ce-toolbar__plus { color: black !important; }
        .ce-toolbar__settings-btn { color: black !important; }
      `}</style>
    </div>
  );
}
