import React from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX, FiCheck, FiLoader, FiMoreVertical } from 'react-icons/fi';
import { FileWithProgress } from '../types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileUploadProps {
  files: FileWithProgress[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onProcessFiles: () => void;
  onQueryChange?: (query: string) => void;
}

export default function FileUpload({ 
  files, 
  onFilesSelected, 
  onRemoveFile, 
  onProcessFiles,
  onQueryChange
}: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesSelected,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FiFile className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FiFile className="w-5 h-5 text-blue-500" />;
      case 'txt':
        return <FiFile className="w-5 h-5 text-gray-500" />;
      default:
        return <FiFile className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg ">
      <div className="px-3 flex flex-col space-y-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Upload Documents</h2>
          <p className="text-xs text-gray-500">Supported: PDF, TXT, DOC, DOCX</p>
        </div>
        {files.length > 0 && (
          <>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Enter your query..."
                onChange={(e) => onQueryChange?.(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400"
              />
            </div>
            <Button 
              onClick={onProcessFiles}
              size="sm"
              disabled={files.some(f => f.status === 'uploading')}
              className="w-full bg-black hover:bg-black/90 text-white-100"
              style={{ borderRadius: '4px' }}
            >
              Update Topic
            </Button>
          </>
        )}
      </div>

      <div className="p-3 flex-1 overflow-auto space-y-2">
        <div
          {...getRootProps()}
          className={`
            relative flex flex-col items-center justify-center h-28 border-2 border-dashed 
            rounded-xl transition-all duration-200
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <FiUploadCloud className={`w-8 h-8 mb-2 transition-colors duration-200 ${
            isDragActive ? 'text-primary' : 'text-gray-400'
          }`} />
          {isDragActive ? (
            <p className="text-sm font-medium text-primary">Drop your files here</p>
          ) : (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Drop files here</span>
              {' '}or{' '}
              <span className="text-primary">browse</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          {files.map((fileInfo) => (
            <div
              key={fileInfo.id}
              className="group relative flex flex-col bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(fileInfo.file.name)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileInfo.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs flex items-center ${
                          fileInfo.status === 'complete' ? 'text-green-500' :
                          fileInfo.status === 'error' ? 'text-red-500' :
                          'text-primary'
                        }`}>
                          {fileInfo.status === 'complete' && <FiCheck className="w-3 h-3 mr-1" />}
                          {fileInfo.status === 'uploading' && <FiLoader className="w-3 h-3 mr-1 animate-spin" />}
                          {fileInfo.status === 'error' && <FiX className="w-3 h-3 mr-1" />}
                          {fileInfo.status === 'uploading' && `${Math.round(fileInfo.progress)}%`}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 "
                            >
                              <FiMoreVertical className="w-5 h-5 text-gray-500 " />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px] bg-white-100 border-y rounded-xl overflow-hidden p-1">
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-gray-100 focus:text-black data-[highlighted]:bg-gray-100 mx-1 my-1 text-black"
                              style={{ borderRadius: '4px' }}
                            >
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onRemoveFile(fileInfo.id)}
                              className="cursor-pointer text-red-600 focus:bg-gray-100 focus:text-red-600 data-[highlighted]:bg-red-50 mx-1 mb-1"
                              style={{ borderRadius: '4px' }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                      <span>{fileInfo.size}</span>
                      <span>•</span>
                      <span>{new Date(fileInfo.file.lastModified).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'UTC'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
              {fileInfo.status === 'uploading' && (
                <Progress value={fileInfo.progress} className="h-1 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
