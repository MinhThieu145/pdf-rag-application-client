'use client';

import Editor from './editor';

export default function FeaturesDemo() {
  const handleEditorChange = (data: any) => {
    console.log('Editor content changed:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Editor Demo</h1>
        <Editor onChange={handleEditorChange} />
      </div>
    </div>
  );
}