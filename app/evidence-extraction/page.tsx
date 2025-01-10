'use client';

import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiX, FiSearch, FiFile, FiTrash2, FiLoader, FiFileText } from "react-icons/fi";
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

interface ApiEvidence {
  document_name: string;
  file_name: string;
  essay_topic: string;
  raw_text: string;
  meaning: string;
  relevance_score: number;
}

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <FiLoader className="animate-spin text-2xl text-blue-600" />
  </div>
);

/**
 * Main page component for evidence extraction functionality
 * Handles file uploads, document processing, and evidence display
 */
export default function Page() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<GroupItem | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const [extractions, setExtractions] = useState<ApiEvidence[]>([]);
  const [selectedExtraction, setSelectedExtraction] = useState<ApiEvidence | null>(null);
  const [groupedExtractions, setGroupedExtractions] = useState<{ [key: string]: ApiEvidence[] }>({});

  // Handle mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        setLoading(true);
        const response = await api.get<ApiEvidence[]>('/list-evidence');
        if (response.data && Array.isArray(response.data)) {
          // Group extractions by document_name
          const grouped = response.data.reduce((acc, item) => {
            if (!acc[item.document_name]) {
              acc[item.document_name] = [];
            }
            acc[item.document_name].push(item);
            return acc;
          }, {} as { [key: string]: ApiEvidence[] });

          // Sort extractions within each group by relevance_score
          Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => b.relevance_score - a.relevance_score);
          });

          setGroupedExtractions(grouped);
          setExtractions(response.data);
        }
      } catch (error) {
        console.error('Error fetching evidence:', error);
        toast.error('Failed to fetch evidence');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchEvidence();
    }
  }, [mounted]);

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

  // Function to render the evidence list in the middle column
  const renderEvidenceList = () => {
    return Object.entries(groupedExtractions).map(([documentName, items]) => (
      <div key={documentName} className="mb-6">
        <div className="bg-gray-100 p-3 rounded-lg mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Document: {documentName}
          </h3>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedExtraction?.raw_text === item.raw_text
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => setSelectedExtraction(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{item.raw_text}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Score: {(item.relevance_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  // Function to render the detail panel in the right column
  const renderDetailPanel = () => {
    if (!selectedExtraction) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Select an evidence item to view details</p>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* Document Details Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Document Details</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid gap-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Document</span>
                <p className="text-gray-900 mt-1">{selectedExtraction.document_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">File</span>
                <p className="text-gray-900 mt-1">{selectedExtraction.file_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Essay Topic</span>
                <p className="text-gray-900 mt-1">{selectedExtraction.essay_topic}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Evidence Details</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Raw Text</h4>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedExtraction.raw_text}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Interpretation</h4>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedExtraction.meaning}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Relevance Score</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${selectedExtraction.relevance_score * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-900 font-medium">
                    {(selectedExtraction.relevance_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Return loading state during SSR or while fetching data
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Column - File List */}
      <div className="w-full md:w-1/5 border-r border-gray-200 overflow-y-auto">
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
              onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
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
                      <p className="text-xs text-gray-400">
                        {formatBytes(file.file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
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
      </div>

      {/* Middle Column - Evidence List */}
      <div className="flex-1 overflow-y-auto p-4 border-l border-r border-gray-200">
        <div className="max-w-3xl mx-auto">
          {renderEvidenceList()}
        </div>
      </div>

      {/* Right Column - Detail View */}
      <div className="w-1/3 overflow-y-auto bg-white">
        {renderDetailPanel()}
      </div>
    </div>
  );
}