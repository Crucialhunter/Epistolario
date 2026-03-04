import Dexie, { Table } from 'dexie';
import { Document, GroundTruth, ImageVariant, RunResult, PromptSnapshot, PromptTemplate, Review } from '../types';

export class PaleoBenchDB extends Dexie {
  documents!: Table<Document, string>;
  groundTruths!: Table<GroundTruth, string>;
  imageVariants!: Table<ImageVariant, string>;
  runResults!: Table<RunResult, string>;
  prompts!: Table<PromptSnapshot, string>;
  promptTemplates!: Table<PromptTemplate, string>;
  reviews!: Table<Review, string>;

  constructor() {
    super('PaleoBenchDB');
    this.version(1).stores({
      documents: 'id, title',
      groundTruths: 'id, docId',
      imageVariants: 'id, docId, name',
      runResults: 'id, cacheKey, docId, modelId, mode, variantId, promptSnapshotId, createdAt',
      prompts: 'id, mode, version'
    });

    this.version(2).stores({
      promptTemplates: 'id, name, engine, createdAt'
    }).upgrade(tx => {
      // Upgrade logic if needed
    });

    this.version(3).stores({
      imageVariants: 'id, docId, pageIndex, name',
      runResults: 'id, cacheKey, docId, modelId, mode, promptSnapshotId, createdAt' // Removed variantId from index
    }).upgrade(tx => {
      // Migrate documents
      tx.table('documents').toCollection().modify(doc => {
        if (doc.imageBlob && !doc.pages) {
          doc.pages = [doc.imageBlob];
          delete doc.imageBlob;
        } else if (!doc.pages) {
          doc.pages = [];
        }
      });

      // Migrate imageVariants
      tx.table('imageVariants').toCollection().modify(variant => {
        if (variant.pageIndex === undefined) {
          variant.pageIndex = 0;
        }
      });

      // Migrate runResults
      tx.table('runResults').toCollection().modify(result => {
        if (result.variantId && !result.variantIds) {
          result.variantIds = { 0: result.variantId };
          delete result.variantId;
        } else if (!result.variantIds) {
          result.variantIds = { 0: 'orig' };
        }
      });
    });

    this.version(4).stores({
      reviews: 'id, docId, modelId, mode, [docId+modelId+mode]'
    });

    this.on('populate', () => {
      this.promptTemplates.bulkAdd([
        {
          id: 'default-split',
          name: 'V1 - Split Engine (Legacy)',
          color: 'stone',
          engine: 'split',
          systemPrompt: 'You are an expert paleographer specializing in 16th-century Spanish manuscripts.',
          literalPrompt: 'Transcribe the following manuscript image literally, preserving original spelling, abbreviations, and punctuation.',
          modernizadaPrompt: 'Provide a modernized transcription of the manuscript image, expanding abbreviations and updating spelling to modern Spanish standards.',
          createdAt: Date.now(),
          isDefault: true
        },
        {
          id: 'default-unified',
          name: 'V2 - Unified Engine (Smart)',
          color: 'emerald',
          engine: 'unified',
          systemPrompt: 'You are an expert paleographer specializing in 16th-century Spanish manuscripts. You must return your response ONLY as a valid JSON object.',
          unifiedPrompt: 'Analyze the provided manuscript image. Determine if the language is Spanish or Catalan. Extract metadata (date, sender, recipient, location). Provide both a literal transcription (preserving original spelling and abbreviations) and a modernized transcription (expanding abbreviations and updating spelling).\n\nIf you see `--modernizada_only` in the prompt, you may omit the literal transcription or leave it empty.\n\nCRITICAL: Return EXACTLY this JSON structure:\n{\n  "idioma_detectado": "castellano o catalan",\n  "razonamiento_idioma": "Breve explicación",\n  "metadatos": {\n    "fecha": "",\n    "remitente": "",\n    "destinatario": "",\n    "lugar": ""\n  },\n  "transcripcion_literal": "",\n  "transcripcion_modernizada": ""\n}',
          createdAt: Date.now() + 1,
          isDefault: true
        },
        {
          id: 'default-fast',
          name: 'V3 - FAST (Modernizada)',
          color: 'blue',
          engine: 'fast',
          systemPrompt: 'You are an expert paleographer for 17th-century Spanish/Catalan manuscripts.',
          fastPrompt: 'Task:\nDetect language: output exactly "castellano" or "catalan".\nProduce a modernized transcription (required): expand abbreviations and modernize spelling; keep meaning.\n\nHard rules:\nReturn a SINGLE JSON OBJECT. Never return an array.\nOutput ONLY JSON (no markdown, no extra keys).\nIf unsure about a word, use [ilegible].\n\nReturn EXACTLY this JSON:\n{\n"idioma_detectado": "castellano|catalan",\n"transcripcion_modernizada": ""\n}',
          createdAt: Date.now() + 2,
          isDefault: true,
          maxAttempts: 3,
          backoffIncrementMs: 2000
        }
      ]);
    });
  }
}

export const db = new PaleoBenchDB();

export async function initializeDefaultPrompts() {
  const defaultSplit = await db.promptTemplates.get('default-split');
  if (!defaultSplit) {
    await db.promptTemplates.put({
      id: 'default-split',
      name: 'V1 - Split Engine (Legacy)',
      color: 'stone',
      engine: 'split',
      systemPrompt: 'You are an expert paleographer specializing in 16th-century Spanish manuscripts.',
      literalPrompt: 'Transcribe the following manuscript image literally, preserving original spelling, abbreviations, and punctuation.',
      modernizadaPrompt: 'Provide a modernized transcription of the manuscript image, expanding abbreviations and updating spelling to modern Spanish standards.',
      createdAt: Date.now(),
      isDefault: true
    });
  }

  const defaultUnified = await db.promptTemplates.get('default-unified');
  if (!defaultUnified) {
    await db.promptTemplates.put({
      id: 'default-unified',
      name: 'V2 - Unified Engine (Smart)',
      color: 'emerald',
      engine: 'unified',
      systemPrompt: 'You are an expert paleographer specializing in 16th-century Spanish manuscripts. You must return your response ONLY as a valid JSON object.',
      unifiedPrompt: 'Analyze the provided manuscript image. Determine if the language is Spanish or Catalan. Extract metadata (date, sender, recipient, location). Provide both a literal transcription (preserving original spelling and abbreviations) and a modernized transcription (expanding abbreviations and updating spelling).\n\nIf you see `--modernizada_only` in the prompt, you may omit the literal transcription or leave it empty.\n\nCRITICAL: Return EXACTLY this JSON structure:\n{\n  "idioma_detectado": "castellano o catalan",\n  "razonamiento_idioma": "Breve explicación",\n  "metadatos": {\n    "fecha": "",\n    "remitente": "",\n    "destinatario": "",\n    "lugar": ""\n  },\n  "transcripcion_literal": "",\n  "transcripcion_modernizada": ""\n}',
      createdAt: Date.now() + 1,
      isDefault: true
    });
  }

  const defaultFast = await db.promptTemplates.get('default-fast');
  if (!defaultFast) {
    await db.promptTemplates.put({
      id: 'default-fast',
      name: 'V3 - FAST (Modernizada)',
      color: 'blue',
      engine: 'fast',
      systemPrompt: 'You are an expert paleographer for 17th-century Spanish/Catalan manuscripts.',
      fastPrompt: 'Task:\nDetect language: output exactly "castellano" or "catalan".\nProduce a modernized transcription (required): expand abbreviations and modernize spelling; keep meaning.\n\nHard rules:\nReturn a SINGLE JSON OBJECT. Never return an array.\nOutput ONLY JSON (no markdown, no extra keys).\nIf unsure about a word, use [ilegible].\n\nReturn EXACTLY this JSON:\n{\n"idioma_detectado": "castellano|catalan",\n"transcripcion_modernizada": ""\n}',
      createdAt: Date.now() + 2,
      isDefault: true,
      maxAttempts: 3,
      backoffIncrementMs: 2000
    });
  }
}
