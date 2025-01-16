'use client';

import React from 'react';
import { ApiEvidence } from '../types';
import { Copy, BookOpen, Lightbulb, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EvidenceDetailsProps {
  selectedExtraction: ApiEvidence | null;
  essayStructure: any;
  setEssayStructure: (structure: any) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export default function EvidenceDetails({
  selectedExtraction,
  essayStructure,
  setEssayStructure,
  isGenerating,
  setIsGenerating,
}: EvidenceDetailsProps) {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('content');

  if (!selectedExtraction) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
        <div>
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Evidence Selected</h3>
          <p className="text-sm">Select an evidence item from the list to view its details</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for environments where clipboard API is not available
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col px-4">
        <div className="bg-background/95 backdrop-blur rounded-lg supports-[backdrop-filter]:bg-background/60">
          <TabsList className="w-full h-12 p-1 bg-transparent text-white-100">
            {['content', 'analysis', 'metadata'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 text-black data-[state=active]:bg-gray-900 data-[state=active]:text-white-100 transition-all duration-200 ease-in-out"
              >
                {tab === 'content' && <BookOpen className="w-4 h-4 mr-2" />}
                {tab === 'analysis' && <Lightbulb className="w-4 h-4 mr-2" />}
                {tab === 'metadata' && <FileText className="w-4 h-4 mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="flex-grow">
          <TabsContent value="content" className="py-2 focus-visible:outline-none focus-visible:ring-0">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted">
                <CardTitle className="text-lg flex items-center justify-between">
                  Evidence Content
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-100 border-gray-200"
                          style={{ borderRadius: '4px' }}
                          onClick={() => copyToClipboard(selectedExtraction.raw_text)}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed text-foreground">
                  {selectedExtraction.raw_text}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="px-6 py-2 space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>Evidence Strength</span>
                  <Badge variant="secondary">{selectedExtraction.strength}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${selectedExtraction.strength === 'Strong' ? 100 : selectedExtraction.strength === 'Medium' ? 66 : 33}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedExtraction.strength_justification}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-sm">{selectedExtraction.category}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reasoning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{selectedExtraction.reasoning}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Annotations</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your notes about this evidence..."
                  className="min-h-[120px] resize-none focus-visible:ring-primary"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="px-6 py-2 space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Document Name</h4>
                  <p className="text-sm bg-muted p-2 rounded">{selectedExtraction.document_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">File Name</h4>
                  <p className="text-sm bg-muted p-2 rounded">{selectedExtraction.file_name}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Topic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Essay Topic</h4>
                  <p className="text-sm bg-muted p-2 rounded">{selectedExtraction.essay_topic}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Refined Topic</h4>
                  <p className="text-sm bg-muted p-2 rounded">{selectedExtraction.refined_topic}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
