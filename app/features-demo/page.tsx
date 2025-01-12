'use client';

import dynamic from 'next/dynamic';
import Chat from './chat';

const Editor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => <div className="min-h-[500px] bg-gray-100 animate-pulse rounded-lg" />
});

export default function FeaturesDemo() {
  const handleEditorChange = (data: any) => {
    console.log('Editor content changed:', data);
  };

  return (
    <div className="h-full bg-gray-50 overflow-hidden">
      <div className="h-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex gap-6 h-full">
          <div className="w-2/3 bg-white rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6 overflow-hidden">
            <div className="h-full overflow-auto">
              <Editor onChange={handleEditorChange} />
            </div>
          </div>
          <div className="w-1/3 bg-white rounded-xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}