'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  FiUpload,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiX,
  FiList,
  FiFileText,
} from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

// Configure axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8080/api/pdf/',
  headers: {
    'Accept': 'application/json',
  }
});

const processApi = axios.create({
  baseURL: 'http://127.0.0.1:8080/api/process/',
  headers: {
    'Accept': 'application/json',
  }
});

interface PDFFile {
  key: string;
  name: string;
  size: number;
  last_modified: string;
  url: string;
}

interface Screenshot {
  key: string;
  url: string;
  page: number;
}

interface PageContent {
  page: number;
  md: string;
  text: string;
}

export default function PDFViewerLayout() {
  const [selectedFile, setSelectedFile] = useState<PDFFile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageContents, setPageContents] = useState<PageContent[]>([]);
  const [processing, setProcessing] = useState(false);

  // Fetch PDF files on component mount
  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const response = await api.get('/list');
        if (response.data && Array.isArray(response.data.files)) {
          setFiles(response.data.files);
        }
      } catch (error) {
        console.error('Failed to fetch PDFs:', error);
        toast.error('Failed to load PDF files');
      }
    };
    fetchPDFs();
  }, []);

  // Fetch screenshots and markdown when a file is selected
  useEffect(() => {
    const fetchFileData = async () => {
      if (!selectedFile) return;
      
      setLoading(true);
      try {
        // Fetch screenshots
        const screenshotsResponse = await api.get(`/screenshots/${selectedFile.name}`);
        if (screenshotsResponse.data && Array.isArray(screenshotsResponse.data.screenshots)) {
          setScreenshots(screenshotsResponse.data.screenshots);
          if (screenshotsResponse.data.screenshots.length > 0) {
            setCurrentPage(1);
          }
        }

        // Fetch markdown content
        const contentResponse = await api.get(`/content/${selectedFile.name}`);
        if (contentResponse.data?.content?.[0]?.pages) {
          setPageContents(contentResponse.data.content[0].pages);
        }
      } catch (error) {
        console.error('Failed to fetch file data:', error);
        toast.error('Failed to load file data');
      } finally {
        setLoading(false);
      }
    };
    fetchFileData();
  }, [selectedFile]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 100)
            );
            // You can use this to show upload progress if needed
          },
        });
        
        toast.success('File uploaded successfully');
        // Refresh the file list
        const listResponse = await api.get('/list');
        if (listResponse.data && Array.isArray(listResponse.data.files)) {
          setFiles(listResponse.data.files);
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
        toast.error('Failed to upload file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentScreenshot = screenshots.find(s => s.page === currentPage);
  const maxPage = screenshots.length;

  const handleProcessPDF = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF first');
      return;
    }
    
    setProcessing(true);
    try {
      await processApi.post(`/process-pdf-content/${selectedFile.name}`);
      toast.success('PDF processed successfully');
    } catch (error) {
      console.error('Failed to process PDF:', error);
      toast.error('Failed to process PDF');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black text-black dark:text-white">
      {/** Top Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold">My PDF Viewer</h1>
        {/* Top-right nav items, if any */}
      </header>

      {/** Main area: PDF viewer + slide-out panel */}
      <div className="flex flex-1 overflow-hidden">
        {/** Main content (PDF viewer + results) */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
          {/* Action Buttons */}
          <div className="mb-6 flex justify-end space-x-4">
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="flex items-center space-x-2 px-4 py-2 
                       border border-gray-300 dark:border-gray-700 
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 
                       transition-colors"
            >
              <FiList className="w-5 h-5" />
              <span className="text-sm font-medium">View Files</span>
            </button>

            <button
              onClick={handleProcessPDF}
              disabled={processing || !selectedFile}
              className="px-4 py-2 
                         rounded-lg 
                         bg-black text-white-100 
                         dark:bg-black dark:text-white 
                         hover:bg-gray-800 dark:hover:bg-gray-800 
                         transition-colors
                         disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Process PDF'}
            </button>
          </div>

          {/** Two columns, each 50% width on large screens */}
          <div className="flex flex-1 flex-col lg:flex-row gap-6 overflow-hidden">
            {/* Left Column: PDF Viewer */}
            <div className="flex-1 w-full lg:w-1/2 min-h-0">
              <div
                {...getRootProps()}
                className={`h-full rounded-lg flex flex-col items-center justify-center transition-colors
                  border-2 border-dashed overflow-hidden
                  ${
                    isDragActive
                      ? 'border-gray-600 bg-gray-100 dark:bg-gray-900'
                      : 'border-gray-300 dark:border-gray-700'
                  }
                `}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  </div>
                ) : selectedFile && currentScreenshot ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 relative overflow-hidden">
                      <img
                        src={currentScreenshot.url}
                        alt={`Page ${currentPage}`}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-center space-x-4 p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }}
                        disabled={currentPage === 1}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <FiChevronLeft className="w-6 h-6" />
                      </button>
                      <span className="text-gray-600 dark:text-gray-300">
                        Page {currentPage} of {maxPage}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPage((prev) => Math.min(prev + 1, maxPage));
                        }}
                        disabled={currentPage === maxPage}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <FiChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium">Select a PDF from the sidebar</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      or drag & drop to upload a new one
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Parsing Results */}
            <div className="flex-1 w-full lg:w-1/2 min-h-0">
              <div className="h-full border-2 border-gray-200 dark:border-gray-800 rounded-lg p-6 overflow-auto">
                <h2 className="text-lg font-semibold mb-4">Parsing Results</h2>
                {selectedFile ? (
                  <div>
                    <h3 className="font-medium mb-2">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Size: {Math.round(selectedFile.size / 1024)} KB
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Modified: {new Date(selectedFile.last_modified).toLocaleString()}
                    </p>
                    
                    {/* Markdown Content */}
                    <div className="mt-6 prose dark:prose-invert max-w-none">
                      {loading ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Loading content...</p>
                        </div>
                      ) : pageContents.length > 0 ? (
                        <ReactMarkdown>
                          {pageContents.find(p => p.page === currentPage)?.md || 'No content for this page'}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No parsing results available</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-12 text-center">
                    <p>Select a PDF to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/** Slide-out Sidebar */}
        <aside
          className={`
            ${isPanelOpen ? 'w-80' : 'w-0'}
            flex flex-col 
            bg-white dark:bg-gray-900
            border-l border-gray-200 dark:border-gray-800 
            transition-all duration-300
            overflow-hidden
          `}
        >
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold">PDF Files</h2>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredFiles.map((file) => (
              <div
                key={file.key}
                className={`flex items-center p-3 mb-2 rounded-md 
                           hover:bg-gray-100 dark:hover:bg-gray-800 
                           cursor-pointer transition-colors
                           ${selectedFile?.key === file.key ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                onClick={() => {
                  setSelectedFile(file);
                  setIsPanelOpen(false);
                }}
              >
                <FiFileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(file.size / 1024)} KB &middot; {new Date(file.last_modified).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            {filteredFiles.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                No files found
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
