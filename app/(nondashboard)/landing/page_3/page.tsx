'use client';

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiSearch, FiFilter, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { BsFileEarmarkPdf } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from '@/config';

// Define interfaces for our data structures
interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: string;
  url: string;
}

interface ApiResponse {
  message: string;
  files: APIFileData[];
}

interface APIFileData {
  key: string;
  name: string;
  size: number;
  last_modified: string;
  url: string;
}

// Configure axios base URL
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/pdf`,  
  headers: {
    'Accept': 'application/json',
  }
});

export default function FileManagement() {
  // State with proper types
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Computed values with proper types
  const filteredFiles = files.filter((file: FileData) => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to fetch files
  const fetchFiles = useCallback(async () => {
    const loadingToast = toast.loading('Loading files...');
    try {
      const response = await api.get<ApiResponse>('/list');
      console.log('API Response:', response.data); // Debug log
      
      // Check if response.data exists and has files property
      if (response.data) {
        const files = response.data.files || [];
        const formattedFiles = files.map((file: APIFileData) => ({
          id: file.key,
          name: file.name,
          size: file.size,
          type: 'pdf',
          lastModified: formatDate(file.last_modified),
          url: file.url
        }));
        setFiles(formattedFiles);
        toast.success(`Loaded ${formattedFiles.length} files successfully`, { id: loadingToast });
      } else {
        console.error('Invalid response format:', response.data);
        setFiles([]);
        toast.error('No files found or invalid response format', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
      toast.error('Failed to fetch files', { id: loadingToast });
    }
  }, []);

  // Event handlers with proper types
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    const uploadToast = toast.loading(`Uploading ${uploadedFiles.length} file(s)...`);

    try {
      for (const file of uploadedFiles) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          toast.error('Only PDF files are allowed');
          continue;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error('File size must be less than 10MB');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        await api.post('/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
            toast.loading(`Uploading: ${progress}%`, { id: uploadToast });
          },
        });
      }

      toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`, { id: uploadToast });
      fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files', { id: uploadToast });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileName: string) => {
    const deleteToast = toast.loading(`Deleting ${fileName}...`);
    try {
      await api.delete(`/delete/${encodeURIComponent(fileName)}`);
      toast.success(`Successfully deleted ${fileName}`, { id: deleteToast });
      setSelectedFiles(prev => prev.filter(id => id !== fileName));
      fetchFiles();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete ${fileName}. Please try again.`, { id: deleteToast });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected for deletion');
      return;
    }

    const deleteToast = toast.loading(`Deleting ${selectedFiles.length} files...`);
    try {
      await Promise.all(
        selectedFiles.map(fileName =>
          api.delete(`/delete/${encodeURIComponent(fileName)}`)
        )
      );
      toast.success(`Successfully deleted ${selectedFiles.length} files`, { id: deleteToast });
      setSelectedFiles([]);
      fetchFiles();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some files. Please try again.', { id: deleteToast });
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFiles(filteredFiles.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSelection = prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId];
      
      toast.success(
        newSelection.length > prev.length ? 'File selected' : 'File deselected',
        {
          id: `select-${fileId}`,
          duration: 2000,
          icon: '📄'
        }
      );
      
      return newSelection;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      toast.success(`Searching for "${term}"`, {
        id: 'search',
        duration: 2000,
        icon: '🔍'
      });
    }
  };

  const handleFilterToggle = () => {
    setShowFilterModal(prev => !prev);
    if (!showFilterModal) {
      toast('Filter options opened', {
        id: 'filter',
        icon: '🔍',
        duration: 2000
      });
    }
  };

  const handleBulkConvert = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsConverting(true);
    const convertToast = toast.loading(`Converting ${selectedFiles.length} file(s)...`);
    
    try {
      const selectedFilesList = filteredFiles.filter(file => selectedFiles.includes(file.id));

      for (const file of selectedFilesList) {
        // Extract just the filename from the full path
        const filename = file.name.split('/').pop() || file.name;
        
        // Step 1: Parse the PDF
        const parseResponse = await api.post(`/parse/${encodeURIComponent(filename)}`);
        const { job_id } = parseResponse.data;

        // Step 2: Process screenshots
        await api.post(`/process-screenshots/${encodeURIComponent(filename)}`, null, {
          params: { job_id }
        });

        toast.success(`Converted ${filename}`, { id: convertToast });
      }

      toast.success(`Successfully converted ${selectedFiles.length} file(s)`, { id: convertToast });
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error('Convert error:', error);
      toast.error('Failed to convert some files', { id: convertToast });
    } finally {
      setIsConverting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return dateString;
    }
  };

  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchFiles();
    }
  }, [mounted, fetchFiles]);

  useEffect(() => {
    setSelectedFiles([]);
  }, [files]);

  useEffect(() => {
    if (!mounted) {
      toast.success('Welcome to File Management! 👋', {
        id: 'welcome',
        duration: 3000,
        icon: '📁',
        style: {
          minWidth: '250px'
        }
      });
      setMounted(true);
    }
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
              color: 'white',
            },
          },
        }}
      />
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 transition-colors duration-300 bg-white shadow-sm"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                handleFileUpload(Array.from(files));
              }
            }}
            multiple
            accept=".pdf"
          />
          <FiUpload className="mx-auto h-14 w-14 text-gray-400" />
          <p className="mt-4 text-base text-gray-600">Drag your files here or click to upload</p>
          <p className="text-sm text-gray-400 mt-2">Supported files: PDF (Max: 10MB)</p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="relative pt-1 bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => setIsUploading(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">{uploadProgress}% uploaded</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 items-center">
          <button
            onClick={handleBulkDelete}
            disabled={selectedFiles.length === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
              selectedFiles.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <FiTrash2 className="w-5 h-5" />
            <span>Delete Selected ({selectedFiles.length})</span>
          </button>
          <button
            onClick={handleBulkConvert}
            disabled={selectedFiles.length === 0 || isConverting}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
              selectedFiles.length === 0 || isConverting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <BsFileEarmarkPdf className={`w-5 h-5 ${isConverting ? 'animate-spin' : ''}`} />
            <span>
              {isConverting 
                ? `Converting (${selectedFiles.length})...` 
                : `Convert Selected (${selectedFiles.length})`
              }
            </span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-stretch">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 bg-white shadow-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button
            onClick={handleFilterToggle}
            className="px-6 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
          >
            <FiFilter className="text-gray-600" />
            <span className="text-gray-600">Filter</span>
          </button>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFiles.map((file: FileData) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BsFileEarmarkPdf className="w-5 h-5 text-red-500" />
                      <span className="ml-3 text-sm text-gray-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatFileSize(file.size)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{file.lastModified}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No files found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
