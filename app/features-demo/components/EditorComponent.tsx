'use client';

import { useEffect, useRef, useId, useState } from 'react';
import type { OutputData } from '@editorjs/editorjs';

interface EditorProps {
  onChange?: (data: OutputData) => void;
  initialData?: OutputData;
}

const LOCAL_STORAGE_KEY = 'editorData';

const DEFAULT_INITIAL_DATA = {
  blocks: [
    {
      type: "header",
      data: {
        text: "Welcome to the Editor",
        level: 1
      }
    },
    {
      type: "paragraph",
      data: {
        text: "Start writing your content here..."
      }
    }
  ],
  version: "2.28.2"
};

// Keep track of initialized editors globally
const initializedEditors = new Set<string>();

export default function EditorComponent({ onChange, initialData }: EditorProps = {}) {
  const editorRef = useRef<any>();
  const holderId = useId();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let editor: any = null;

    const initEditor = async () => {
      // Check if this editor instance is already initialized
      if (initializedEditors.has(holderId) || editorRef.current) {
        return;
      }

      try {
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

        // Only proceed if another initialization hasn't happened
        if (initializedEditors.has(holderId)) {
          return;
        }

        // Mark this editor as initialized
        initializedEditors.add(holderId);

        // Load data from localStorage only on first initialization
        let savedData;
        if (!isInitialized) {
          try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
              savedData = JSON.parse(storedData);
            }
          } catch (error) {
            console.error('Error loading editor data:', error);
          }
        }

        editor = new EditorJS({
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
          placeholder: 'Click here to start writing...',
          inlineToolbar: ['bold', 'italic', 'link'],
          data: savedData || initialData || DEFAULT_INITIAL_DATA,
          onChange: async () => {
            try {
              const savedData = await editor.save();
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedData));
              onChange?.(savedData);
            } catch (error) {
              console.error('Error saving editor data:', error);
            }
          },
        });

        editorRef.current = editor;
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing editor:', error);
      }
    };

    initEditor();

    return () => {
      if (editor && typeof editor.destroy === 'function') {
        editor.destroy();
        editorRef.current = null;
        initializedEditors.delete(holderId);
      }
    };
  }, [onChange, initialData, holderId, isInitialized]);

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
