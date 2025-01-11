'use client';

import { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import ImageTool from '@editorjs/image';
import Table from '@editorjs/table';
import Delimiter from '@editorjs/delimiter';

interface EditorProps {
  onChange?: (data: OutputData) => void;
  initialData?: OutputData;
}

export default function Editor({ onChange, initialData }: EditorProps = {}) {
  const editorRef = useRef<EditorJS>();

  useEffect(() => {
    if (editorRef.current) {
      return;
    }

    const editor = new EditorJS({
      holder: 'editor',
      tools: {
        header: {
          class: Header,
          config: {
            levels: [1, 2, 3],
            defaultLevel: 1
          },
          shortcut: 'CMD+SHIFT+H'
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
          shortcut: 'CMD+SHIFT+Q',
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
      data: initialData || {
        time: new Date().getTime(),
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
      },
      onChange: async () => {
        const savedData = await editor.save();
        onChange?.(savedData);
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy();
      }
    };
  }, [onChange, initialData]);

  return (
    <div className="relative w-full max-w-screen-lg mx-auto bg-white">
      <div 
        id="editor"
        className="min-h-[500px] text-black"
      />
      <style jsx global>{`
        .codex-editor {
          color: black !important;
        }
        .ce-block {
          color: black !important;
        }
        .ce-paragraph {
          color: black !important;
        }
        .ce-header {
          color: black !important;
        }
        .cdx-block {
          color: black !important;
        }
        .ce-toolbar__content {
          max-width: none;
          margin-right: 40px;
        }
        .ce-block__content {
          max-width: none;
          margin-right: 40px;
        }
        .ce-toolbar__actions {
          right: -10px !important;
        }
        .ce-conversion-toolbar {
          color: black !important;
        }
        .ce-conversion-tool {
          color: black !important;
        }
        .ce-toolbar__plus {
          color: black !important;
        }
        .ce-toolbar__settings-btn {
          color: black !important;
        }
      `}</style>
    </div>
  );
}
