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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Editor Demo</h1>
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
            <Editor onChange={handleEditorChange} />
          </div>
          <div className="w-[450px] bg-white rounded-lg shadow-lg">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}