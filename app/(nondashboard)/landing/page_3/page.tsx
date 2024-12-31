'use client';

import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiFilter, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { BsFileEarmarkPdf } from "react-icons/bs";
import toast from "react-hot-toast";
import axios from "axios";

// Configure axios base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8080/api/pdf/',
  headers: {
    'Accept': 'application/json',
  }
});

export default function FileManagement() {
  // ... (previous state declarations remain the same)
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch existing files on component mount
  useEffect(() => {
    if (mounted) {
      fetchFiles();
    }
  }, [mounted]);

  // Reset selected files when files list changes
  useEffect(() => {
    setSelectedFiles(new Set());
  }, [files]);

  const formatDate = (dateString) => {
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
    } catch (error) {
      return dateString;
    }
  };

  const fetchFiles = async () => {
    const loadingToast = toast.loading('Loading files...');
    try {
      const response = await api.get('/list');
      if (response.data && Array.isArray(response.data.files)) {
        const formattedFiles = response.data.files.map(file => ({
          id: file.key,
          name: file.key,
          size: formatFileSize(file.size),
          type: 'pdf',
          lastModified: formatDate(file.last_modified),
          url: file.url
        }));
        setFiles(formattedFiles);
        toast.success('Files loaded successfully', { id: loadingToast });
      } else {
        setFiles([]);
        toast.error('No files found', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
      toast.error(error.response?.data?.detail || 'Failed to load files', { id: loadingToast });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFiles(new Set(filteredFiles.map(file => file.id)));
    } else {
      setSelectedFiles(new Set());
    }
  };

  const handleSelectFile = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)) {
      const deleteToast = toast.loading(`Deleting ${selectedFiles.size} file(s)...`);
      try {
        for (const fileId of selectedFiles) {
          const file = files.find(f => f.id === fileId);
          if (file) {
            await api.delete(`/delete/${encodeURIComponent(file.name)}`);
          }
        }
        toast.success('Files deleted successfully', { id: deleteToast });
        fetchFiles();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(
          error.response?.data?.detail || 'Failed to delete files. Please try again.',
          { id: deleteToast }
        );
      }
    }
  };

  const handleBulkConvert = async () => {
    if (selectedFiles.size === 0) return;
    
    setIsConverting(true);
    const convertToast = toast.loading(`Converting ${selectedFiles.size} file(s)...`);
    
    try {
      const selectedFilesList = Array.from(selectedFiles).map(id => 
        files.find(f => f.id === id)
      ).filter(Boolean);

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

      toast.success(`Successfully converted ${selectedFiles.size} file(s)`, { id: convertToast });
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error('Convert error:', error);
      toast.error(
        error.response?.data?.detail || 'Failed to convert files. Please try again.',
        { id: convertToast }
      );
    } finally {
      setIsConverting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  };

  const handleFileUpload = async (uploadedFiles) => {
    for (const file of uploadedFiles) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Only PDF files are allowed');
        continue;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        continue;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const uploadToast = toast.loading(`Uploading ${file.name}...`);

      try {
        // Updated to match backend endpoint
        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
            toast.loading(`Uploading: ${progress}%`, { id: uploadToast });
          },
        });

        if (response.status === 200) {
          toast.success('File uploaded successfully!', { id: uploadToast });
          fetchFiles();
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(
          error.response?.data?.detail || 'Failed to upload file. Please try again.',
          { id: uploadToast }
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async (fileName) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      const deleteToast = toast.loading(`Deleting ${fileName}...`);
      try {
        // Updated to match backend endpoint
        const response = await api.delete(`/delete/${encodeURIComponent(fileName)}`);
        if (response.status === 200) {
          toast.success('File deleted successfully', { id: deleteToast });
          fetchFiles();
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(
          error.response?.data?.detail || 'Failed to delete file. Please try again.',
          { id: deleteToast }
        );
      }
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
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
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
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
            disabled={selectedFiles.size === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
              selectedFiles.size === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <FiTrash2 className="w-5 h-5" />
            <span>Delete Selected ({selectedFiles.size})</span>
          </button>
          <button
            onClick={handleBulkConvert}
            disabled={selectedFiles.size === 0 || isConverting}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
              selectedFiles.size === 0 || isConverting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <BsFileEarmarkPdf className={`w-5 h-5 ${isConverting ? 'animate-spin' : ''}`} />
            <span>
              {isConverting 
                ? `Converting (${selectedFiles.size})...` 
                : `Convert Selected (${selectedFiles.size})`
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilterModal(!showFilterModal)}
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
                    checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
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
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => handleSelectFile(file.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BsFileEarmarkPdf className="w-5 h-5 text-red-500" />
                      <span className="ml-3 text-sm text-gray-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{file.size}</td>
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
