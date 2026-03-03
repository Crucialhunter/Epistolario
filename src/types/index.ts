export interface DocumentMetadata {
  id_carta?: string;
  url_origen?: string;
  legajo?: number | string;
  signatura?: string;
  nombre_carta?: string;
  fecha?: string;
  lugar?: string;
  remitente?: string;
  destinatario?: string;
  temas?: string;
  idioma?: string;
  resumen?: string;
  [key: string]: any;
}

export interface Document {
  id: string;
  title: string;
  pages: Blob[];
  imageBlob?: Blob; // Deprecated, kept for migration
  metadata?: DocumentMetadata;
  createdAt: number;
  archived?: boolean;
}

export interface GroundTruth {
  id: string;
  docId: string;
  literal: string;
  modernizada: string;
  metadata?: DocumentMetadata;
  updatedAt: number;
}

export interface ImageVariant {
  id: string;
  docId: string;
  pageIndex: number;
  name: string;
  recipe: {
    brightness: number;
    contrast: number;
    invert: boolean;
  };
  imageBlob: Blob;
  createdAt: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  color: string;
  engine: 'split' | 'unified';
  systemPrompt: string;
  literalPrompt?: string;
  modernizadaPrompt?: string;
  unifiedPrompt?: string;
  createdAt: number;
  isDefault?: boolean;
}

export interface RunResult {
  id: string;
  cacheKey: string;
  docId: string;
  modelId: string;
  mode: 'literal' | 'modernizada';
  variantIds: Record<number, string>; // pageIndex -> variantId
  variantId?: string; // Deprecated, kept for migration
  promptSnapshotId: string;
  createdAt: number;
  rawResponse: string;
  parsedText: string;
  parsedMetadata?: DocumentMetadata;
  cer: number;
  wer: number;
  scoreLiteral?: number;
  scoreModernizada?: number;
  scoreGlobal?: number;
  status: 'success' | 'error';
  normalizationProfile: string;
  promptTemplateId?: string;
  latencyMs?: number;
  tokens?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface PromptSnapshot {
  id: string;
  mode: 'literal' | 'modernizada';
  version: number;
  content: string;
  createdAt: number;
}
