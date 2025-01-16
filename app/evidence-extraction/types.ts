export interface FileWithProgress {
  id: string;
  file: File;
  progress: number;
  size: string;
  url?: string;
  analysis?: PaperAnalysis;
  parseResult?: JsonData;
  status?: string;
  error?: string;
  folder: string;
}

export interface GroupItem {
  id: string;
  title: string;
  description: string;
  evidence?: string[];
}

export interface Group {
  id: string;
  title: string;
  items: GroupItem[];
}

export interface ImageInfo {
  name: string;
  height: number;
  width: number;
  x: number;
  y: number;
  original_width: number;
  original_height: number;
  type: string;
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextItem {
  type: string;
  value: string;
  md: string;
  bBox: BBox;
}

export interface Page {
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

export interface JobMetadata {
  credits_used: number;
  job_credits_usage: number;
  job_pages: number;
  job_auto_mode_triggered_pages: number;
  job_is_cache_hit: boolean;
  credits_max: number;
}

export interface JsonData {
  pages: Page[];
  job_metadata: JobMetadata;
  job_id: string;
  file_path: string;
}

export interface ProcessEvidenceRequest {
  file_name: string;
  json_data: JsonData;
  essay_topic: string;
}

export interface Evidence {
  raw_text: string;
  meaning: string;
  relevance_score: number;
}

export interface PaperAnalysis {
  summary: string;
  methodology: string;
  key_findings: string[];
  relevance_to_topic: string;
  themes: Array<{
    theme: string;
    relevance: string;
  }>;
}

export interface ApiEvidence {
  document_name: string;
  file_name: string;
  essay_topic: string;
  refined_topic: string;
  raw_text: string;
  category: string;
  reasoning: string;
  strength: string;
  strength_justification: string;
}

export interface EssayGenerationRequest {
  context: string
  topic: string
  word_count: number
}

export interface EssayGenerationResponse {
  essay: string
  structure: {
    introduction: string
    body: string[]
    conclusion: string
  }
}
