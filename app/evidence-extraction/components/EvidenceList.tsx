'use client';

import React from 'react';
import { FiLoader, FiFileText } from 'react-icons/fi';
import { ApiEvidence } from '../types';

interface EvidenceListProps {
  groupedExtractions: { [key: string]: ApiEvidence[] };
  selectedExtractions: ApiEvidence[];
  selectedExtraction: ApiEvidence | null;
  onExtractionSelect: (extraction: ApiEvidence, event: React.MouseEvent) => void;
  onExtractionClick: (extraction: ApiEvidence) => void;
  onGenerateEssay: () => void;
  isGenerating: boolean;
  essayStructure: any;
}

export default function EvidenceList({
  groupedExtractions,
  selectedExtractions,
  selectedExtraction,
  onExtractionSelect,
  onExtractionClick,
  onGenerateEssay,
  isGenerating,
  essayStructure,
}: EvidenceListProps) {
  return (
    <div className="relative">
      {/* Write Essay Button */}
      {selectedExtractions.length > 0 && (
        <div className="sticky top-0 z-10 bg-white py-2">
          <div className="flex justify-end pr-2">
            <button
              onClick={onGenerateEssay}
              disabled={isGenerating || selectedExtractions.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isGenerating ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FiFileText />
                  <span>Generate Essay</span>
                </>
              )}
            </button>
            {essayStructure && (
              <span className="text-green-600">✓ Essay structure ready</span>
            )}
          </div>
        </div>
      )}

      {/* Evidence List */}
      <div className="space-y-6">
        {Object.entries(groupedExtractions).map(([documentName, items]) => (
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
                  className={`group p-4 rounded-lg transition-all duration-200 ${
                    selectedExtraction?.raw_text === item.raw_text
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom Checkbox */}
                    <div 
                      onClick={(e) => onExtractionSelect(item, e)}
                      className={`relative flex-shrink-0 w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                        selectedExtractions.some(
                          selected => 
                            selected.raw_text === item.raw_text && 
                            selected.document_name === item.document_name
                        )
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}
                    >
                      {selectedExtractions.some(
                        selected => 
                          selected.raw_text === item.raw_text && 
                          selected.document_name === item.document_name
                      ) && (
                        <svg 
                          className="absolute inset-0 w-full h-full text-white p-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    {/* Content */}
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onExtractionClick(item)}
                    >
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
        ))}
      </div>
    </div>
  );
}
