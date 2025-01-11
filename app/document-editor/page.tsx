'use client';

import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FiEdit2, FiRefreshCw, FiFileText, FiSave, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import dynamic from 'next/dynamic';
import { useEssayStore } from '@/store/essayStore';
import type { Paragraph } from '@/store/essayStore';

interface DraggableParagraphProps {
  paragraph_number: number;
  content: string;
  index: number;
  moveItem: (fromIndex: number, toIndex: number) => void;
  onClick: (number: number) => void;
  isSelected: boolean;
  purpose: string;
}

interface DragItem {
  paragraph_number: number;
  index: number;
}

const DndProviderWrapper = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => (
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  )),
  { ssr: false }
);

const DraggableParagraphWithDnd = React.memo(({ paragraph_number, content, index, moveItem, onClick, isSelected, purpose }: DraggableParagraphProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: "paragraph",
    item: { paragraph_number, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "paragraph",
    hover(item: DragItem) {
      if (item.index !== index) {
        moveItem(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={() => onClick(paragraph_number)}
      className={`p-4 mb-4 rounded-lg cursor-move transition-all duration-200 ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${
        isSelected
          ? "bg-blue-50 border-2 border-blue-500"
          : "bg-gray-50 border border-gray-200 hover:border-blue-300"
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="prose max-w-none">
        <p className="text-gray-800">{content}</p>
        <p className="text-sm text-gray-500 mt-2">Purpose: {purpose}</p>
      </div>
    </div>
  );
});

DraggableParagraphWithDnd.displayName = 'DraggableParagraphWithDnd';

const Page = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editData, setEditData] = useState<Paragraph | null>(null);

  const { essayStructure, paragraphOrder, reorderParagraphs } = useEssayStore();
  const paragraphs = essayStructure?.essay_structure.body_paragraphs || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const moveItem = (fromIndex: number, toIndex: number): void => {
    reorderParagraphs(fromIndex, toIndex);
  };

  const handleEdit = () => {
    if (!selectedNumber) return;
    const paragraph = paragraphs.find(p => p.paragraph_number === selectedNumber);
    if (paragraph) {
      setEditData(paragraph);
      setEditMode(true);
    }
  };

  const handleSave = () => {
    if (!editData) return;
    
    // For now, we'll just show a message since we're not persisting changes
    toast.success("Changes saved to local state");
    setEditMode(false);
    setEditData(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData(null);
  };

  if (!mounted) return null;

  if (!essayStructure) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">No essay structure available. Generate an essay first.</div>
      </div>
    );
  }

  const orderedParagraphs = paragraphOrder.map(index => paragraphs[index]);

  return (
    <DndProviderWrapper>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Toaster position="top-right" />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Essay Editor</h1>
          
          {/* Essay Planning */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Essay Planning</h2>
            <div className="prose max-w-none">
              <p>{essayStructure.essay_planning}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Introduction */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>
                <div className="prose max-w-none">
                  <p>{essayStructure.essay_structure.introduction.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Purpose: {essayStructure.essay_structure.introduction.purpose}
                  </p>
                </div>
              </div>

              {/* Body Paragraphs */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Body Paragraphs</h2>
                {orderedParagraphs.map((paragraph, index) => (
                  <DraggableParagraphWithDnd
                    key={paragraph.paragraph_number}
                    {...paragraph}
                    index={index}
                    moveItem={moveItem}
                    onClick={setSelectedNumber}
                    isSelected={selectedNumber === paragraph.paragraph_number}
                  />
                ))}
              </div>

              {/* Conclusion */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Conclusion</h2>
                <div className="prose max-w-none">
                  <p>{essayStructure.essay_structure.conclusion.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Purpose: {essayStructure.essay_structure.conclusion.purpose}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tools</h2>
              
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={editData?.content || ''}
                      onChange={(e) => setEditData(prev => prev ? {...prev, content: e.target.value} : null)}
                      className="w-full h-40 p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose
                    </label>
                    <textarea
                      value={editData?.purpose || ''}
                      onChange={(e) => setEditData(prev => prev ? {...prev, purpose: e.target.value} : null)}
                      className="w-full h-20 p-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FiSave />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <FiX />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleEdit}
                    disabled={!selectedNumber}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full ${
                      selectedNumber
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } transition-colors duration-200`}
                  >
                    <FiEdit2 />
                    <span>Edit Paragraph</span>
                  </button>
                  <button
                    disabled={!selectedNumber}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full ${
                      selectedNumber
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } transition-colors duration-200`}
                  >
                    <FiRefreshCw />
                    <span>Rewrite Paragraph</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProviderWrapper>
  );
};

export default Page;
