'use client';

import React, { useState, useCallback } from 'react';
import { FiUpload, FiFile, FiTrash2 } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';

export default function PDFUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    // Implement your upload logic here
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated upload
    setUploading(false);
    setFiles([]);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            PDF Upload
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload and manage your PDF documents
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
              ${isDragActive 
                ? 'border-gray-900 bg-gray-50 dark:border-gray-50 dark:bg-gray-700' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              {isDragActive
                ? 'Drop the PDF files here...'
                : 'Drag and drop PDF files here, or click to select files'
            }
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Selected Files
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FiFile className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-900 dark:text-gray-50">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors duration-200"
                    >
                      <FiTrash2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`w-full px-4 py-2 rounded-lg text-white transition-colors duration-200
                    ${uploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200'
                    }`}
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
