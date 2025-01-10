'use client';

import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiX, FiSearch, FiFile, FiTrash2 } from "react-icons/fi";
import { CgSpinner } from "react-icons/cg";
import { Toaster, toast } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { API_BASE_URL } from '@/config';

// Configure axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/evidence`,
  headers: {
    'Accept': 'application/json',
  }
});

/**
 * Interface for tracking file upload progress and associated analysis results
 */
interface FileWithProgress {
  id: string;
  file: File;
  progress: number;
  size: string;
  url?: string;
  analysis?: PaperAnalysis;
  parseResult?: JsonData;
  status?: string;
}

/**
 * Interface for evidence items that can be grouped
 */
interface GroupItem {
  id: string;
  title: string;
  description: string;
  evidence?: string[];
}

/**
 * Interface for organizing evidence items into groups
 */
interface Group {
  id: string;
  title: string;
  items: GroupItem[];
}

/**
 * Interface for image information extracted from documents
 */
interface ImageInfo {
  name: string;
  height: number;
  width: number;
  x: number;
  y: number;
  original_width: number;
  original_height: number;
  type: string;
}

/**
 * Interface for bounding box coordinates
 */
interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Interface for text items extracted from documents
 */
interface TextItem {
  type: string;
  value: string;
  md: string;
  bBox: BBox;
}

/**
 * Interface for page-level information from document analysis
 */
interface Page {
  page: number;
  text: string;
  md: string;
  images: ImageInfo[];
  charts: any[];
  items: TextItem[];
  status: string;
  links: any[];
  width: number;
  height: number;
  triggeredAutoMode: boolean;
  structuredData: any | null;
  noStructuredContent: boolean;
  noTextContent: boolean;
}

/**
 * Interface for job processing metadata
 */
interface JobMetadata {
  credits_used: number;
  job_credits_usage: number;
  job_pages: number;
  job_auto_mode_triggered_pages: number;
  job_is_cache_hit: boolean;
  credits_max: number;
}

/**
 * Interface for JSON data returned from document processing
 */
interface JsonData {
  pages: Page[];
  job_metadata: JobMetadata;
  job_id: string;
  file_path: string;
}

/**
 * Interface for evidence processing request
 */
interface ProcessEvidenceRequest {
  file_name: string;
  json_data: JsonData;
  essay_topic: string;
}

/**
 * Interface for extracted evidence items
 */
interface Evidence {
  raw_text: string;
  meaning: string;
  relevance_score: number;
}

/**
 * Interface for paper analysis results
 */
interface PaperAnalysis {
  summary: string;
  methodology: string;
  key_findings: string[];
  relevance_to_topic: string;
  themes: Array<{
    theme: string;
    relevance: string;
  }>;
}

/**
 * Main page component for evidence extraction functionality
 * Handles file uploads, document processing, and evidence display
 */
export default function Page() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<GroupItem | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "1",
      title: "Research Evidence",
      items: [
        { 
          id: "1", 
          title: "Academic Sources", 
          description: "Scholarly articles and research papers",
          evidence: ["Strong correlation found in multiple studies", "Peer-reviewed research supports this claim"]
        },
        { 
          id: "2", 
          title: "Statistical Data", 
          description: "Numerical evidence and analysis",
          evidence: ["85% success rate in trials", "Statistically significant results (p < 0.05)"]
        }
      ]
    },
    {
      id: "2",
      title: "Document Evidence",
      items: [
        { 
          id: "3", 
          title: "Primary Sources", 
          description: "Original documents and direct evidence",
          evidence: ["Original manuscript dated 1945", "Direct eyewitness accounts"]
        },
        { 
          id: "4", 
          title: "Secondary Analysis", 
          description: "Interpretations and expert analysis",
          evidence: ["Expert analysis from Dr. Smith", "Comparative study results"]
        }
      ]
    }
  ]);

  // Handle mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
    }, []);

  const placeholderEvidence = [
    "Strong supporting evidence found",
    "Multiple sources confirm this finding",
    "Direct correlation observed",
    "Expert opinion supports this",
    "Statistical significance demonstrated",
    "Historical records validate this"
  ];

  useEffect(() => {
    if (selectedGroup && groupRefs.current[selectedGroup]) {
      groupRefs.current[selectedGroup]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedGroup]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data } = await api.get('/list');
        console.log("Fetched files:", data);

        // Convert the fetched files to our file format
        const existingFiles = data.files.map((file: any) => ({
          id: uuidv4(),
          file: { name: file.name } as File, // Only keep the name
          progress: 100,
        }));

        setFiles(existingFiles);
      } catch (error) {
        console.error('Fetch files error:', error);
        toast.error('Failed to fetch existing files');
      }
    };

    if (mounted) {
      fetchFiles();
    }
  }, [mounted]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  /**
   * Handles file upload and processing
   * @param acceptedFiles - Array of files to process
   */
  const handleFiles = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    console.log('=== Starting file upload ===');

    try {
      setLoading(true);
      const newFiles = acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        progress: 0,
        size: formatBytes(file.size),
      }));

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      toast.loading('Preparing files for upload...');

      for (const fileInfo of newFiles) {
        const formData = new FormData();
        formData.append("file", fileInfo.file);

        try {
          // Step 1: Upload file
          toast.loading(`Uploading ${fileInfo.file.name}...`, { id: fileInfo.id });
          const uploadResponse = await api.post('/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setFiles((prevFiles) =>
                  prevFiles.map((f) =>
                    f.id === fileInfo.id ? { ...f, progress } : f
                  )
                );
              }
            },
          });

          toast.success(`${fileInfo.file.name} uploaded successfully`, { id: fileInfo.id });

          // Update file with URL and set to processing state
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id
                ? {
                    ...f,
                    progress: 100,
                    url: uploadResponse.data.file.url,
                  }
                : f
            )
          );

          // Step 2: Extract evidence data
          try {
            toast.loading(`Parsing ${fileInfo.file.name}...`, { id: `parse-${fileInfo.id}` });
            const evidenceResponse = await api.get(`/parse/${fileInfo.file.name}`);
            console.log('Parse response:', evidenceResponse.data);
            toast.success(`${fileInfo.file.name} parsed successfully`, { id: `parse-${fileInfo.id}` });

            // Update file status to show parsing is complete
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === fileInfo.id
                  ? {
                      ...f,
                      status: 'Parsed successfully',
                    }
                  : f
              )
            );
          } catch (error) {
            handleProcessingError(error);
            toast.error(`Failed to process ${fileInfo.file.name}`, { id: fileInfo.id });
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === fileInfo.id ? { ...f, progress: 0 } : f
              )
            );
            continue; // Exit if parsing failed
          }

          // Step 3: Process with GPT
          try {
            toast.loading(`Analyzing ${fileInfo.file.name} with GPT...`, { id: `gpt-${fileInfo.id}` });
            console.log('Starting GPT analysis for:', fileInfo.file.name);
            
            const processRequest = {
              file_name: fileInfo.file.name,
              essay_topic: "Analyze the key findings and methodology of this research paper"
            };
            console.log('GPT Analysis Request:', processRequest);
            
            const processResponse = await api.post('/raw-extract', processRequest);
            console.log('GPT Analysis Response:', processResponse.data);
            
            // Update file with final results
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === fileInfo.id
                  ? {
                      ...f,
                      progress: 100,
                      status: 'Analysis complete',
                      analysis: processResponse.data.result.analysis,
                    }
                  : f
              )
            );
            
            toast.success(`Analysis complete for ${fileInfo.file.name}`, { id: `gpt-${fileInfo.id}` });
          } catch (error) {
            console.error('GPT Analysis Error:', error);
            toast.error(`Failed to analyze ${fileInfo.file.name}`, { id: `gpt-${fileInfo.id}` });
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === fileInfo.id
                  ? {
                      ...f,
                      status: 'Analysis failed',
                      progress: 0
                    }
                  : f
              )
            );
          }
        } catch (error) {
          handleProcessingError(error);
          toast.error(`Failed to process ${fileInfo.file.name}`, { id: fileInfo.id });
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? { ...f, progress: 0 } : f
            )
          );
        }
      }
    } catch (error) {
      handleProcessingError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) {
      console.error('File not found:', fileId);
      toast.error('File not found');
      return;
    }

    console.log('Attempting to delete file:', {
      fileId,
      fileName: file.file.name,
      fileSize: file.size,
      fileUrl: file.url
    });

    try {
      // Delete from evidence endpoint
      await api.delete(`/delete/${encodeURIComponent(file.file.name)}`);
      
      setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));
      toast.success('File deleted successfully');
    } catch (error: unknown) {
      console.error('Delete error:', error);
      if (error instanceof Error) {
        toast.error(`Failed to delete file: ${error.message}`);
      } else {
        toast.error('Failed to delete file: An unknown error occurred');
      }
    }
  };

  const clearAll = () => {
    setFiles([]);
    setSelectedItem(null);
    setSelectedGroup(null);
    setGroups(prev => prev.slice(0, 2));
    toast.success("All files cleared");
  };

  /**
   * Handles error during file processing
   * @param error - Error object from API call
   */
  const handleProcessingError = (error: any) => {
    console.error('=== Processing error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    toast.error("Failed to process file: " + (error.response?.data?.detail || error.message));
  };

  // Return loading state during SSR
  if (!mounted) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-white">
        <div className="w-full md:w-1/3 border-r border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4">Loading...</div>
        </div>
        <div className="w-full md:w-1/3 border-r border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4">Loading...</div>
        </div>
        <div className="w-full md:w-1/3 overflow-hidden flex flex-col bg-gray-50">
          <div className="p-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      {/* Toast container - moved outside the main layout */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#10B981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
              color: '#fff',
            },
          },
          duration: 3000,
        }}
      />

      {/* File Upload Panel */}
      <div className="w-full md:w-1/3 border-r border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 overflow-y-auto">
          <div
            className="border-2 border-dashed rounded-lg p-8 mb-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
              accept=".pdf,.doc,.docx"
            />
            <div className="text-center">
              <FiUpload className="mx-auto text-4xl mb-2 text-blue-600" />
              <p className="text-gray-800 font-medium">Drop your documents here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
          </div>

          {files.length > 0 && (
            <button
              onClick={clearAll}
              className="w-full mb-4 py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              Clear All
            </button>
          )}

          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <FiFile className="text-2xl text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800 truncate">{file.file.name}</p>
                      <p className="text-sm text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                {file.status && (
                  <p className="text-sm text-gray-600 mb-2">{file.status}</p>
                )}
                {file.progress < 100 && (
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      <div className="w-full md:w-1/3 border-r border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 overflow-y-auto">
          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search evidence..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <CgSpinner className="animate-spin text-2xl text-blue-600" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-200px)] text-center text-gray-500">
              <p>Evidence extraction is temporarily disabled</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Panel */}
      <div className="w-full md:w-1/3 overflow-hidden flex flex-col bg-gray-50">
        <div className="p-4 overflow-y-auto">
          {selectedItem ? (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-gray-800">{selectedItem.title}</h1>
              <p className="text-gray-600 mb-6">{selectedItem.description}</p>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2 text-gray-800">Extracted Evidence</h2>
                  <div className="space-y-2">
                    {selectedItem.evidence?.map((evidence, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-700">{evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h2 className="text-lg font-semibold mb-2 text-gray-800">Analysis Details</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>Category: Evidence Analysis</li>
                    <li>Created: {new Date().toLocaleDateString()}</li>
                    <li>Status: Active</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-200px)] text-center text-gray-500">
              <p>Select an item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
