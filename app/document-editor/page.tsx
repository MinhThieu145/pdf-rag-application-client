'use client';

import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FiEdit2, FiRefreshCw, FiFileText, FiSave } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import dynamic from 'next/dynamic';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

// Configure axios base URL
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/essay`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

interface Paragraph {
  id: number;
  text: string;
  name?: string;
  purposes?: string[];
  evidence_source?: string;
  created_at?: string;
  updated_at?: string;
}

interface DraggableParagraphProps {
  id: number;
  text: string;
  index: number;
  moveItem: (fromIndex: number, toIndex: number) => void;
  onClick: (id: number) => void;
  isSelected: boolean;
  name?: string;
  purposes?: string[];
  evidence_source?: string;
}

interface DragItem {
  id: number;
  index: number;
}

const DndProviderWrapper = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => (
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  )),
  { ssr: false }
);

const DraggableParagraphWithDnd = dynamic<DraggableParagraphProps>(() =>
  Promise.resolve((props: DraggableParagraphProps) => {
    const { id, text, index, moveItem, onClick, isSelected, name, purposes, evidence_source } = props;
    const [{ isDragging }, drag] = useDrag({
      type: "paragraph",
      item: { id, index } as DragItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    });

    const [, drop] = useDrop({
      accept: "paragraph",
      hover: (item: DragItem) => {
        if (item.index !== index) {
          moveItem(item.index, index);
          item.index = index;
        }
      }
    });

    return (
      <div
        ref={(node) => drag(drop(node))}
        className={`p-4 mb-4 border rounded-lg cursor-move transition-all ${
          isDragging ? "opacity-50" : "opacity-100"
        } ${
          isSelected ? "bg-blue-50 border-blue-400" : "border-gray-200"
        }`}
        onClick={() => onClick(id)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{text}</h3>
          {name && <span className="text-sm text-gray-500">{name}</span>}
        </div>
        {purposes && purposes.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Purposes: </span>
            {purposes.join(", ")}
          </div>
        )}
        {evidence_source && evidence_source !== "None" && (
          <div className="mt-1 text-sm text-blue-600">
            <span className="font-medium">Evidence: </span>
            {evidence_source}
          </div>
        )}
      </div>
    );
  }),
  { ssr: false }
);

const Page = () => {
  const [mounted, setMounted] = useState(false);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editData, setEditData] = useState<Paragraph | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParagraphs = async () => {
    try {
      const response = await api.get('/paragraphs/');
      setParagraphs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching paragraphs:', err);
      setError('Failed to load paragraphs');
      toast.error('Failed to load paragraphs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchParagraphs();
  }, []);

  const moveItem = async (fromIndex: number, toIndex: number): Promise<void> => {
    try {
      const updatedParagraphs = [...paragraphs];
      const [movedItem] = updatedParagraphs.splice(fromIndex, 1);
      updatedParagraphs.splice(toIndex, 0, movedItem);
      
      // Update local state immediately for smooth UI
      setParagraphs(updatedParagraphs);

      // Send reorder request to backend
      const paragraphIds = updatedParagraphs.map(p => p.id);
      await api.post('/paragraphs/reorder', paragraphIds);
      
      toast.success("Paragraph order updated");
    } catch (err) {
      console.error('Error reordering paragraphs:', err);
      toast.error('Failed to update paragraph order');
      // Revert to original order by refetching
      fetchParagraphs();
    }
  };

  const handleEdit = async (): Promise<void> => {
    if (!selectedId) {
      toast.error("Please select a paragraph first");
      return;
    }
    try {
      const response = await api.get(`/paragraphs/${selectedId}`);
      setEditData(response.data);
      setEditMode(true);
    } catch (err) {
      console.error('Error fetching paragraph:', err);
      toast.error('Failed to load paragraph data');
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!editData) return;
    try {
      const { id, created_at, updated_at, ...updateData } = editData;
      await api.put(`/paragraphs/${id}`, updateData);
      await fetchParagraphs(); // Refresh the list
      setEditMode(false);
      setEditData(null);
      toast.success("Paragraph updated successfully");
    } catch (err) {
      console.error('Error updating paragraph:', err);
      toast.error('Failed to update paragraph');
    }
  };

  const handleAddParagraph = async (): Promise<void> => {
    try {
      const newParagraph = {
        text: "Enter your text here...",
        name: `Paragraph ${paragraphs.length + 1}`,
        purposes: ["Add your purpose here"],
        evidence_source: "None"
      };
      await api.post('/paragraphs/', newParagraph);
      await fetchParagraphs(); // Refresh the list
      toast.success("New paragraph added");
    } catch (err) {
      console.error('Error adding paragraph:', err);
      toast.error('Failed to add paragraph');
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await api.delete(`/paragraphs/${id}`);
      await fetchParagraphs(); // Refresh the list
      toast.success("Paragraph deleted successfully");
    } catch (err) {
      console.error('Error deleting paragraph:', err);
      toast.error('Failed to delete paragraph');
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <DndProviderWrapper>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Toaster position="top-right" />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Interactive Document Editor</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Document Paragraphs</h2>
              {paragraphs.map((paragraph, index) => (
                <DraggableParagraphWithDnd
                  key={paragraph.id}
                  {...paragraph}
                  index={index}
                  moveItem={moveItem}
                  onClick={setSelectedId}
                  isSelected={selectedId === paragraph.id}
                />
              ))}
            </div>

            {/* Right Column */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tools</h2>
              
              {/* Paragraph Tools */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4 text-gray-700">Paragraph Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleEdit}
                    disabled={!selectedId}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full ${
                      selectedId
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } transition-colors duration-200`}
                  >
                    <FiEdit2 />
                    <span>Edit Paragraph</span>
                  </button>
                  <button
                    disabled={!selectedId}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full ${
                      selectedId
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } transition-colors duration-200`}
                  >
                    <FiRefreshCw />
                    <span>Rewrite Paragraph</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedId!)}
                    disabled={!selectedId}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full ${
                      selectedId
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } transition-colors duration-200`}
                  >
                    <FiRefreshCw />
                    <span>Delete Paragraph</span>
                  </button>
                </div>
              </div>

              {/* Document Tools */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-700">Document Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleAddParagraph}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FiFileText />
                    <span>Add Paragraph</span>
                  </button>
                  <button 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FiSave />
                    <span>Summarize Document</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {editMode && editData && (
            <div className="fixed inset-0 bg-black/50 text-black flex items-center justify-center p-4 z-50">
              <div style={{ backgroundColor: 'white' }} className="rounded-xl shadow-xl p-6 w-full max-w-2xl">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 style={{ color: '#1f2937' }} className="text-xl font-semibold">Edit Paragraph</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="Paragraph name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={editData.text}
                      onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                      className="w-full h-40 p-4 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Enter your text here..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purposes (comma separated)</label>
                    <input
                      type="text"
                      value={editData.purposes?.join(', ') || ''}
                      onChange={(e) => setEditData({ ...editData, purposes: e.target.value.split(',').map(p => p.trim()).filter(p => p) })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="Purpose 1, Purpose 2, ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Source</label>
                    <input
                      type="text"
                      value={editData.evidence_source || ''}
                      onChange={(e) => setEditData({ ...editData, evidence_source: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="Source of evidence"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditData(null);
                    }}
                    style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProviderWrapper>
  );
};

export default Page;
