'use client';

import React from 'react';
import { ApiEvidence } from '../types';

interface EvidenceDetailsProps {
  selectedExtraction: ApiEvidence | null;
}

export default function EvidenceDetails({ selectedExtraction }: EvidenceDetailsProps) {
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
}
