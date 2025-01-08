'use client';

import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiX, FiSearch, FiFile, FiTrash2 } from "react-icons/fi";
import { CgSpinner } from "react-icons/cg";
import toast, { Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';

interface FileWithProgress {
  id: string;
  file: File;
  progress: number;
  size: string;
  url?: string;
}

interface GroupItem {
  id: string;
  title: string;
  description: string;
  evidence?: string[];
}

interface Group {
  id: string;
  title: string;
  items: GroupItem[];
}

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

interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TextItem {
  type: string;
  value: string;
  md: string;
  bBox: BBox;
}

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

interface JobMetadata {
  credits_used: number;
  job_credits_usage: number;
  job_pages: number;
  job_auto_mode_triggered_pages: number;
  job_is_cache_hit: boolean;
  credits_max: number;
}

interface JsonData {
  pages: Page[];
  job_metadata: JobMetadata;
  job_id: string;
  file_path: string;
}

interface ProcessEvidenceRequest {
  file_name: string;
  json_data: JsonData;
  essay_topic: string;
}

interface Evidence {
  raw_text: string;
  meaning: string;
  relevance_score: number;
}

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

interface ExtractionResponse {
  message: string;
  result: {
    extractions: Evidence[];
    analysis: PaperAnalysis;
  };
  metadata: {
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

const Page: React.FC = () => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroupItem | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const groupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFiles = async (acceptedFiles: File[]) => {
    try {
      setLoading(true);
      const newFiles = acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        progress: 0,
        size: formatBytes(file.size),
      }));

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      for (const fileInfo of newFiles) {
        const formData = new FormData();
        formData.append("file", fileInfo.file);

        try {
          // Upload file
          const uploadResponse = await fetch("/api/evidence/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
          }

          const uploadData = await uploadResponse.json();
          console.log("Upload successful:", uploadData);

          if (!uploadData || !uploadData.evidence) {
            throw new Error("Invalid response from server: missing evidence data");
          }

          // Extract evidence
          const extractionResponse = await fetch("/api/evidence/process-evidence", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file_name: fileInfo.file.name,
              json_data: uploadData.evidence,
            }),
          });

          if (!extractionResponse.ok) {
            const errorText = await extractionResponse.text();
            throw new Error(`Evidence extraction failed: ${extractionResponse.status} ${extractionResponse.statusText} - ${errorText}`);
          }

          const extractionData = (await extractionResponse.json()) as ExtractionResponse;
          console.log('Raw extraction data:', JSON.stringify(extractionData, null, 2));
          
          // Safely access nested properties with null checks
          const analysis = extractionData?.result?.analysis;
          const extractions = extractionData?.result?.extractions;
          const model = extractionData?.metadata?.model;
          const usage = extractionData?.metadata?.usage;
          
          if (!analysis || !extractions) {
            throw new Error("Invalid extraction response: missing analysis or extractions");
          }

          console.log('Analysis:', analysis);
          console.log('Extractions:', extractions);
          console.log('Model:', model || 'N/A');
          console.log('Usage:', usage || 'N/A');

          // Create new groups from the extraction data
          const newGroups = [
            {
              id: uuidv4(),
              title: "Evidence",
              items: extractions.map(evidence => ({
                id: uuidv4(),
                title: "Evidence",
                description: evidence.meaning,
                evidence: [evidence.raw_text]
              }))
            },
            {
              id: uuidv4(),
              title: "Themes",
              items: analysis.themes?.map(theme => ({
                id: uuidv4(),
                title: theme.theme,
                description: theme.relevance
              })) || []
            }
          ];

          setGroups(prevGroups => [...prevGroups, ...newGroups]);
          toast.success(`Successfully processed ${fileInfo.file.name}`);

        } catch (error) {
          console.error("Error processing file:", error);
          toast.error(`Error processing ${fileInfo.file.name}: ${error.message}`);
          
          // Update file status to show error
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileInfo.id
                ? {
                    ...f,
                    progress: -1, // Use negative progress to indicate error
                  }
                : f
            )
          );
        }
      }
    } catch (error) {
      console.error("Error handling files:", error);
      toast.error(`Error handling files: ${error.message}`);
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
      const deleteUrl = `/api/evidence/delete/${encodeURIComponent(file.file.name)}`;
      console.log('Sending delete request to:', deleteUrl);

      const response = await fetch(deleteUrl, { 
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Delete response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        throw new Error(`Failed to delete file: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Delete success response:', responseData);

      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
      
      // Also remove from groups
      setGroups(prevGroups => {
        const updatedGroups = prevGroups.map(group => ({
          ...group,
          items: group.items.filter(item => 
            !item.evidence?.some(evidence => evidence.includes(file.file.name))
          )
        }));
        console.log('Updated groups after delete:', updatedGroups);
        return updatedGroups;
      });

      toast.success(responseData.message || 'File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete file: ${error.message}`);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setSelectedItem(null);
    setSelectedGroup(null);
    setGroups(prev => prev.slice(0, 2));
    toast.success("All files cleared");
  };

  // Fetch existing files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/list`);
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await response.json();
        
        // Convert the fetched files to our file format
        const existingFiles = data.files.map((file: any) => ({
          id: Math.random().toString(36).substring(7),
          file: new File([], file.name, { type: 'application/pdf' }), // Dummy File object
          progress: 100,
          size: formatBytes(file.size),
          url: file.url
        }));

        setFiles(existingFiles);
      } catch (error) {
        console.error('Fetch files error:', error);
        toast.error('Failed to fetch existing files');
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Toaster position="top-right" />
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
                <div className="flex items-start justify-between">
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
                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped Evidence Column */}
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

          {loading && (
            <div className="flex items-center justify-center py-4">
              <CgSpinner className="animate-spin text-2xl text-blue-600" />
            </div>
          )}

          {groups.map(group => (
            <div 
              key={group.id} 
              className="mb-6"
              ref={el => groupRefs.current[group.id] = el}
            >
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b text-gray-800">{group.title}</h2>
              <div className="space-y-3">
                {group.items
                  .filter(item => 
                    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedItem?.id === item.id
                          ? "bg-blue-50 border-blue-200 shadow-md transform scale-[1.02]"
                          : "bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <h3 className="font-medium mb-1 text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Details Section */}
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
            <div className="text-center text-gray-500 mt-10">
              <p>Select an evidence item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
