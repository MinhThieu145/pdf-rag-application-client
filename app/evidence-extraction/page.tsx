'use client';

import React, { useState, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { API_BASE_URL } from '@/config';
import useEvidenceStore from '@/store/evidenceStore';
import { useEssayStore } from '@/store/essayStore';
import { FileWithProgress, ApiEvidence } from './types';
import FileUpload from './components/FileUpload';
import EvidenceList from './components/EvidenceList';
import EvidenceDetails from './components/EvidenceDetails';

// Configure axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/evidence`,
  headers: {
    'Accept': 'application/json',
  }
});

/**
 * Main page component for evidence extraction functionality
 * Handles file uploads, document processing, and evidence display
 */
export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [selectedExtraction, setSelectedExtraction] = useState<ApiEvidence | null>(null);
  const [extractions, setExtractions] = useState<ApiEvidence[]>([]);
  const [groupedExtractions, setGroupedExtractions] = useState<{ [key: string]: ApiEvidence[] }>({});
  const [currentTopic, setCurrentTopic] = useState<string>("Analyze the key findings and methodology of this research paper");

  const selectedExtractions = useEvidenceStore(state => {
    console.log('Page: Selected extractions updated:', Array.from(state.selectedExtractions));
    return state.selectedExtractions;
  });
  const addExtraction = useEvidenceStore(state => state.addExtraction);
  const removeExtraction = useEvidenceStore(state => state.removeExtraction);

  const essayState = useEssayStore.getState();
  const { essayStructure, setEssayStructure, isGenerating, setIsGenerating } = essayState;

  const evidenceState = useEvidenceStore.getState();
  const { selectedExtractions: selectedExtractionsSet, addExtraction: addExtractionToSet, removeExtraction: removeExtractionFromSet } = evidenceState;

  // Fetch evidence data from API and update state
  const fetchEvidence = async (setLoadingState = true) => {
    if (setLoadingState) setLoading(true);
    try {
      console.log('Fetching evidence data...');
      const response = await api.get<ApiEvidence[]>('/list-evidence');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid evidence data received');
      }

      console.log(`Fetched ${response.data.length} evidence items`);

      // Group extractions by document_name
      const grouped = response.data.reduce((acc, item) => {
        if (!acc[item.document_name]) {
          acc[item.document_name] = [];
        }
        acc[item.document_name].push(item);
        return acc;
      }, {} as { [key: string]: ApiEvidence[] });

      // Sort extractions within each group by strength
      Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => {
          const strengthOrder = { 'High': 3, 'Moderate': 2, 'Low': 1 } as const;
          return (strengthOrder[b.strength as keyof typeof strengthOrder] || 0) - (strengthOrder[a.strength as keyof typeof strengthOrder] || 0);
        });
      });

      console.log('Grouped evidence:', grouped);  
      setGroupedExtractions(grouped);
      setExtractions(response.data);
      return true;
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast.error('Failed to fetch evidence');
      return false;
    } finally {
      if (setLoadingState) setLoading(false);
    }
  };

  // Fetch files from API
  const fetchFiles = async () => {
    try {
      const { data } = await api.get('/list');
      console.log("Fetched files:", data);

      if (data?.files && Array.isArray(data.files)) {
        // Convert the fetched files to our file format
        const existingFiles = data.files.map((file: any) => ({
          id: uuidv4(),
          file: { 
            name: file.pdf_name,
            lastModified: new Date(file.last_modified).getTime()
          } as File,
          progress: 100,
          size: formatBytes(file.size),
          status: 'complete',
          folder: file.folder
        }));

        setFiles(existingFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchEvidence(false),
          fetchFiles()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      initializeData();
    }
  }, [mounted]);

  /**
   * Handles file upload and processing
   * @param acceptedFiles - Array of files to process
   */
  const handleFiles = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    console.log('=== Starting file upload ===');

    const toastId = toast.loading('Preparing files for upload...');
    
    try {
      // Initialize files in state
      const newFiles = acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        progress: 0,
        size: formatBytes(file.size),
        status: 'queued',
        folder: '' // Add the required folder property
      }));

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      // Process each file sequentially
      for (const fileInfo of newFiles) {
        console.log(`Processing file: ${fileInfo.file.name}`);
        
        try {
          // Step 1: Upload File
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? { ...f, status: 'uploading' } : f
            )
          );

          const formData = new FormData();
          formData.append("file", fileInfo.file);

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

          if (!uploadResponse.data?.file?.url) {
            throw new Error('Upload failed: No file URL received');
          }

          console.log(`Upload completed for ${fileInfo.file.name}`);
          toast.success(`Upload completed: ${fileInfo.file.name}`, { id: toastId });

          // Update file state after successful upload
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? {
                ...f,
                progress: 100,
                url: uploadResponse.data.file.url,
                status: 'upload_complete'
              } : f
            )
          );

          // Step 2: Parse File
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? { ...f, status: 'parsing' } : f
            )
          );

          console.log(`Starting parse for ${fileInfo.file.name}`);
          const parseResponse = await api.get(`/parse/${fileInfo.file.name}`);

          if (!parseResponse.data) {
            throw new Error('Parse failed: No data received');
          }

          console.log(`Parse completed for ${fileInfo.file.name}`);
          toast.success(`Parsed: ${fileInfo.file.name}`, { id: toastId });

          // Update file state after successful parse
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? {
                ...f,
                status: 'parse_complete',
                parseResult: parseResponse.data
              } : f
            )
          );

          // Step 3: GPT Analysis
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? { ...f, status: 'analyzing' } : f
            )
          );

          console.log(`Starting GPT analysis for ${fileInfo.file.name}`);
          const processRequest = {
            file_name: fileInfo.file.name,
            essay_topic: currentTopic
          };

          const processResponse = await api.post('/raw-extract', processRequest);

          if (!processResponse.data) {
            throw new Error('Analysis failed: No response data');
          }

          console.log(`Analysis completed for ${fileInfo.file.name}`);
          toast.success(`Analysis completed: ${fileInfo.file.name}`, { id: toastId });

          // Update final state after successful analysis
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? {
                ...f,
                status: 'complete',
                analysis: processResponse.data
              } : f
            )
          );

          // Fetch updated evidence after successful processing
          await fetchEvidence(false); // Don't set loading state here

        } catch (error) {
          console.error(`Error processing ${fileInfo.file.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          // Update file state to reflect the error
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? {
                ...f,
                status: f.status === 'uploading' ? 'upload_failed' :
                       f.status === 'parsing' ? 'parse_failed' :
                       f.status === 'analyzing' ? 'analysis_failed' :
                       'processing_failed',
                progress: 0
              } : f
            )
          );

          toast.error(`Failed to process ${fileInfo.file.name}: ${errorMessage}`, { id: toastId });
          continue; // Move to next file
        }
      }

      // Final evidence fetch after all files are processed
      await fetchEvidence(false); // Don't set loading state here
    } catch (error) {
      console.error('Fatal error in file processing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Fatal error: ${errorMessage}`, { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const removeFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) {
      console.error('File not found:', fileId);
      toast.error('File not found');
      return;
    }

    try {
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

  const reprocessFiles = async () => {
    if (files.length === 0) {
      toast.error('No files to process');
      return;
    }

    const toastId = toast.loading('Reprocessing files with new topic...');
    
    try {
      // Process each file sequentially with the new topic
      for (const fileInfo of files) {
        try {
          console.log(`Reprocessing file: ${fileInfo.file.name}`);
          
          // Update file status
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? { ...f, status: 'analyzing' } : f
            )
          );

          // Process with new topic
          const processRequest = {
            file_name: fileInfo.file.name,
            essay_topic: currentTopic
          };

          const processResponse = await api.post('/raw-extract', processRequest);

          if (!processResponse.data) {
            throw new Error('Analysis failed: No response data');
          }

          console.log(`Analysis completed for ${fileInfo.file.name}`);
          toast.success(`Analysis completed: ${fileInfo.file.name}`, { id: toastId });

          // Update final state after successful analysis
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? {
                ...f,
                status: 'complete',
                analysis: processResponse.data
              } : f
            )
          );

        } catch (error) {
          console.error(`Error reprocessing ${fileInfo.file.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id ? {
                ...f,
                status: 'analysis_failed'
              } : f
            )
          );

          toast.error(`Failed to reprocess ${fileInfo.file.name}: ${errorMessage}`, { id: toastId });
          continue; // Move to next file
        }
      }

      // Fetch updated evidence after all files are processed
      await fetchEvidence(false);
      toast.success('All files reprocessed successfully', { id: toastId });
    } catch (error) {
      console.error('Fatal error in file reprocessing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Fatal error: ${errorMessage}`, { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleGenerateEssay = async () => {
    if (selectedExtractions.size === 0) {
      toast.error("Please select some evidence first");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Generating essay...');

    try {
      // Find the actual evidence objects from the selected IDs
      const selectedEvidenceTexts = Array.from(selectedExtractions).map(id => {
        // Extract the raw text from the ID (remove document name prefix)
        const textPart = id.split('-').slice(1).join('-');
        return extractions.find(e => e.raw_text.startsWith(textPart));
      }).filter((e): e is ApiEvidence => e !== undefined);

      if (selectedEvidenceTexts.length === 0) {
        throw new Error('No valid evidence found from selections');
      }

      // Prepare the context with metadata
      const contextWithMetadata = selectedEvidenceTexts.map(e => {
        return `Source: ${e.document_name}\nEvidence: ${e.raw_text}`;
      }).join('\n\n---\n\n');

      const response = await fetch(`${API_BASE_URL}/api/essay-generation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: contextWithMetadata,
          topic: currentTopic,
          word_count: 1000,
          include_citations: true
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData?.detail || 'Failed to generate essay');
        } catch {
          throw new Error('Failed to generate essay: ' + errorText);
        }
      }

      const data = await response.json();
      setEssayStructure(data);
      toast.success("Essay generated successfully!", { id: toastId });
    } catch (error) {
      console.error('Error generating essay:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate essay", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

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

  const handleExtractionSelect = (extraction: ApiEvidence, event: React.MouseEvent) => {
    event.stopPropagation();
    const uniqueId = `${extraction.document_name}-${extraction.raw_text}`;
    
    if (selectedExtractions.has(uniqueId)) {
      removeExtraction(uniqueId);
    } else {
      addExtraction(uniqueId);
    }
  };

  const handleExtractionClick = (extraction: ApiEvidence) => {
    setSelectedExtraction(extraction);
  };

  const renderFileStatus = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'parsing':
        return 'Parsing document...';
      case 'analyzing':
        return 'Analyzing content...';
      case 'complete':
        return 'Processing complete';
      case 'upload_failed':
        return 'Upload failed';
      case 'parse_failed':
        return 'Parsing failed';
      case 'analysis_failed':
        return 'Analysis failed';
      default:
        return 'Processing...';
    }
  };

  // Handle mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return loading state during SSR or while fetching data
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="flex w-full">
        <div className="w-1/3 h-full">
          <div className="h-full flex flex-col bg-white rounded-lg shadow-sm m-2">
            <FileUpload 
              files={files}
              onFilesSelected={handleFiles}
              onRemoveFile={removeFile}
              onProcessFiles={reprocessFiles}
              onQueryChange={(query) => setCurrentTopic(query)}
            />
          </div>
        </div>
        <div className="w-1/3 h-full">
          <div className="h-full flex flex-col bg-white rounded-lg shadow-sm m-2">
            <EvidenceList 
              extractions={extractions}
              groupedExtractions={groupedExtractions}
              selectedExtraction={selectedExtraction}
              setSelectedExtraction={setSelectedExtraction}
              selectedExtractions={selectedExtractions}
              addExtraction={addExtraction}
              removeExtraction={removeExtraction}
              onGenerateEssay={handleGenerateEssay}
            />
          </div>
        </div>
        <div className="w-1/3 h-full">
          <div className="h-full flex flex-col bg-white rounded-lg shadow-sm m-2">
            <EvidenceDetails
              selectedExtraction={selectedExtraction}
              essayStructure={essayStructure}
              setEssayStructure={setEssayStructure}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} bytes`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};
