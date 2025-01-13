'use client';

import React, { useRef } from 'react';
import { FiUpload, FiFile, FiTrash2 } from 'react-icons/fi';
import { FileWithProgress } from '../types';

interface FileUploadProps {
  files: FileWithProgress[];
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} bytes`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export default function FileUpload({ files, onFilesAdded, onFileRemove }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFilesAdded(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="p-4">
      <div
        className="border-2 border-dashed rounded-lg p-4 mb-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          multiple
        />
        <div className="flex flex-col items-center justify-center text-center">
          <FiUpload className="w-8 h-8 mb-2 text-blue-500" />
          <p className="text-sm font-medium text-gray-600">Drop your document here</p>
          <p className="text-xs text-gray-400 mt-1">or click to browse</p>
        </div>
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <FiFile className="text-xl text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-400">{file.size}</p>
                </div>
              </div>
              <button
                onClick={() => onFileRemove(file.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
            {file.progress < 100 && (
              <div className="mt-2">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
