import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ApiEvidence } from '../types';

interface EvidenceListProps {
  extractions: ApiEvidence[];
  groupedExtractions: { [key: string]: ApiEvidence[] };
  selectedExtraction: ApiEvidence | null;
  setSelectedExtraction: (extraction: ApiEvidence | null) => void;
  selectedExtractions: Set<string>;
  addExtraction: (id: string) => void;
  removeExtraction: (id: string) => void;
  onGenerateEssay: () => void;
}

export default function EvidenceList({
  extractions,
  groupedExtractions,
  selectedExtraction,
  setSelectedExtraction,
  selectedExtractions,
  addExtraction,
  removeExtraction,
  onGenerateEssay
}: EvidenceListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-700';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 h-12 flex justify-between items-center">
        <div className="space-x-2 text-black">
          <Button 
            variant="outline" 
            size="sm"
            style={{ borderRadius: '4px', borderWidth: '1px' }}
            className="hover:bg-gray-100 border-gray-300 text-gray-700"
            onClick={() => {
              extractions.forEach(item => {
                const itemId = item.raw_text;
                addExtraction(itemId);
              });
            }}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            style={{ borderRadius: '4px', borderWidth: '1px' }}
            className="hover:bg-gray-100 focus:bg-gray-100 border-gray-300 text-gray-700"
            onClick={() => {
              extractions.forEach(item => {
                const itemId = item.raw_text;
                removeExtraction(itemId);
              });
            }}
          >
            Deselect All
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="bg-black hover:bg-black/90 text-white-100"
            style={{ borderRadius: '4px' }}
            onClick={onGenerateEssay}
          >
            Generate ({selectedExtractions.size})
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {Object.entries(groupedExtractions).map(([groupName, items]) => (
          <div 
            key={groupName} 
            className="rounded-lg overflow-hidden"
          >
            <div 
              className="bg-gray-100 rounded-xl p-3 flex justify-between items-center cursor-pointer"
              onClick={() => toggleGroup(groupName)}
            >
              <h3 className="font-medium text-gray-900">Evidence from {groupName}</h3>
              <Button variant="ghost" size="sm" className="rounded-xl" style={{ borderRadius: '4px' }}>
                {expandedGroups.has(groupName) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {expandedGroups.has(groupName) && (
              <div className="py-3 space-y-3">
                {items
                  .filter(item =>
                    item.raw_text.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item) => {
                    // Use raw_text as the unique identifier since it contains the exact evidence text
                    const itemId = item.raw_text;
                    return (
                      <div
                        key={itemId}
                        className={`p-4 rounded-2xl transition-all cursor-pointer bg-white border border-gray-200 ${
                          selectedExtraction?.raw_text === item.raw_text
                          ? 'bg-gray-100 border-gray-200'
                          : 'border-gray-100  hover:border-gray-200 hover:bg-gray-50/50'
                        }`}
                        onClick={() => setSelectedExtraction(item)}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Checkbox
                              className="h-4 w-4 rounded-sm border-[1.5px] border-gray-300 data-[state=checked]:bg-white data-[state=checked]:border-black data-[state=checked]:text-black transition-colors hover:border-gray-400"
                              checked={selectedExtractions.has(itemId)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  addExtraction(itemId);
                                } else {
                                  removeExtraction(itemId);
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{item.raw_text}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-gray-500">Source: {item.document_name}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                {item.category}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.strength === 'High'
                                    ? 'bg-green-100 text-green-800'
                                    : item.strength === 'Moderate'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {item.strength}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
