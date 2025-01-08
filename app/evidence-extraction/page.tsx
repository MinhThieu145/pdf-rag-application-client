'use client';

import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiX, FiSearch, FiFile, FiTrash2 } from "react-icons/fi";
import { CgSpinner } from "react-icons/cg";
import toast, { Toaster } from "react-hot-toast";

interface FileWithProgress {
  id: string;
  file: File;
  progress: number;
  size: string;
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

  const createNewGroup = (file: File) => {
    const fileName = file.name.split(".")[0];
    const newItems: GroupItem[] = [];
    const numItems = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < numItems; i++) {
      const numEvidence = Math.floor(Math.random() * 3) + 1;
      const evidence = Array.from({ length: numEvidence }, () => 
        placeholderEvidence[Math.floor(Math.random() * placeholderEvidence.length)]
      );

      newItems.push({
        id: Math.random().toString(36).substr(2, 9),
        title: `${fileName} Evidence ${i + 1}`,
        description: `Extracted evidence from ${fileName}`,
        evidence
      });
    }

    const newGroup: Group = {
      id: Math.random().toString(36).substr(2, 9),
      title: `${fileName} Analysis`,
      items: newItems
    };

    setGroups(prev => [...prev, newGroup]);
    setSelectedGroup(newGroup.id);
    toast.success("Evidence extracted successfully");
  };

  const handleFiles = (newFiles: File[]) => {
    setLoading(true);
    const filesWithProgress: FileWithProgress[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      size: (file.size / 1024).toFixed(2) + " KB"
    }));
    
    setFiles(prev => [...prev, ...filesWithProgress]);
    
    newFiles.forEach(file => createNewGroup(file));

    filesWithProgress.forEach(fileObj => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        if (progress <= 100) {
          setFiles(prev => 
            prev.map(f => 
              f.id === fileObj.id 
                ? { ...f, progress }
                : f
            )
          );
        } else {
          clearInterval(interval);
        }
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        setLoading(false);
      }, 2500);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success("File removed");
  };

  const clearAll = () => {
    setFiles([]);
    setSelectedItem(null);
    setSelectedGroup(null);
    setGroups(prev => prev.slice(0, 2));
    toast.success("All files cleared");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Toaster position="top-right" />
      {/* File Upload Panel */}
      <div className="w-full md:w-1/3 p-4 border-r border-gray-200 overflow-y-auto">
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

      {/* Grouped Evidence Column */}
      <div className="w-full md:w-1/3 p-4 border-r border-gray-200 overflow-y-auto">
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

      {/* Evidence Details Section */}
      <div className="w-full md:w-1/3 p-4 overflow-y-auto bg-gray-50">
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
  );
};

export default Page;
