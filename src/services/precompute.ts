import { db } from '../db/db';
import { providers, blobToBase64 } from './providers';
import { normalizeLiteral, normalizeModernizada } from '../utils/normalizer';
import { calculateCER, calculateWER, computeScore } from '../utils/scoring';
import { useBenchmarkStore, BenchmarkTask } from '../store/benchmarkStore';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function extractJSON(raw: string): any {
  try {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function normalizeProviderResponse(jsonResponse: any, initialParsedShape: 'object' | 'array_ocr' | 'array_objects'): { normalizedJson: any, shape: 'object' | 'array_ocr' | 'array_objects' } {
  let shape = initialParsedShape;
  let normalizedJson = jsonResponse;

  if (jsonResponse && Array.isArray(jsonResponse)) {
    const hasOcrBoxes = jsonResponse.some((item: any) => item.text_content !== undefined);
    if (hasOcrBoxes) {
      shape = 'array_ocr';
    } else {
      shape = 'array_objects';
      let bestObj = null;
      let maxLen = -1;
      for (const item of jsonResponse) {
        if (item && typeof item === 'object') {
          const text = item.transcripcion?.modernizada || item.transcripcion_modernizada || '';
          if (text.length > maxLen) {
            maxLen = text.length;
            bestObj = item;
          }
        }
      }
      if (bestObj) {
        normalizedJson = bestObj;
      }
    }
  }
  return { normalizedJson, shape };
}

function validateByPreset(obj: any, isFast: boolean, modernizadaOnly: boolean): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  if (typeof obj.idioma_detectado !== 'string' || obj.idioma_detectado.trim() === '') return false;

  if (!isFast) {
    if (!obj.metadatos || typeof obj.metadatos !== 'object') return false;
  }

  // Either direct or nested transcripcion
  const modText = obj.transcripcion?.modernizada ?? obj.transcripcion_modernizada;
  if (typeof modText !== 'string' || modText.trim() === '') return false;

  if (!modernizadaOnly && !isFast) {
    const litText = obj.transcripcion?.literal ?? obj.transcripcion_literal;
    if (typeof litText !== 'string' || litText.trim() === '') return false;
  }

  return true;
}

export async function runPrecomputeQueue(apiKeys: Record<string, string>) {
  const store = useBenchmarkStore.getState();
  if (store.isRunning) return;

  const tasks = store.tasks.filter(t => t.status === 'pending');
  if (tasks.length === 0) return;

  store.setIsRunning(true);

  // Process tasks sequentially to avoid rate limits and make logs easier to follow
  while (true) {
    const currentStore = useBenchmarkStore.getState();
    const nextTask = currentStore.tasks.find(t => t.status === 'pending');

    if (!nextTask) {
      break;
    }

    try {
      await processTask(nextTask, apiKeys[nextTask.provider.id]);
    } catch (err: any) {
      console.error('Task failed:', err);
      useBenchmarkStore.getState().updateTask(nextTask.id, {
        status: 'error',
        error: err?.message || String(err),
        endTime: Date.now()
      });
    }
  }

  useBenchmarkStore.getState().setIsRunning(false);
}

async function processTask(task: BenchmarkTask, apiKey: string) {
  const store = useBenchmarkStore.getState();
  store.updateTask(task.id, { status: 'running', startTime: Date.now(), logs: [] });
  store.addLog(task.id, { type: 'info', message: `Starting task for ${task.docTitle} using ${task.provider.name} (${task.engine} engine)` });

  const doc = await db.documents.get(task.docId);
  const gt = await db.groundTruths.where('docId').equals(task.docId).first();

  const hasImages = (doc?.pages && doc.pages.length > 0) || doc?.imageBlob;
  if (!hasImages || !gt) {
    store.addLog(task.id, { type: 'error', message: 'Missing document image or ground truth data' });
    store.updateTask(task.id, { status: 'error', error: 'Missing doc or GT', endTime: Date.now() });
    return;
  }

  // Check cache (only for split engine, unified is always fresh for now or we can check both)
  if (task.engine === 'split') {
    const cached = await db.runResults.where('cacheKey').equals(task.cacheKey).first();
    if (cached) {
      store.addLog(task.id, { type: 'success', message: 'Found cached result, skipping API call' });
      store.updateTask(task.id, {
        status: 'success',
        endTime: Date.now(),
        apiMetrics: { inputTokens: 0, outputTokens: 0, totalTokens: 0, latencyMs: 0 }
      });
      return;
    }
  }

  store.addLog(task.id, { type: 'info', message: 'Preparing image payload' });
  const basePages = doc.pages && doc.pages.length > 0 ? doc.pages : (doc.imageBlob ? [doc.imageBlob] : []);
  const blobsToProcess: Blob[] = [];

  for (let i = 0; i < basePages.length; i++) {
    const variantId = task.variantIds?.[i];
    if (variantId && variantId !== 'orig') {
      const variant = await db.imageVariants.get(variantId);
      if (variant?.imageBlob) {
        blobsToProcess.push(variant.imageBlob);
      } else {
        blobsToProcess.push(basePages[i]);
      }
    } else {
      blobsToProcess.push(basePages[i]);
    }
  }

  const imageBase64s = await Promise.all(blobsToProcess.map(b => blobToBase64(b)));

  const totalSize = imageBase64s.reduce((acc, val) => acc + val.length, 0);
  store.updateTask(task.id, {
    payload: {
      model: task.provider.id,
      prompt: task.prompt.content,
      imageSize: Math.round(totalSize / 1024) + ' KB'
    }
  });

  let rawResponse = '';
  let finalJsonResponse: any = null;
  let tokenUsage: any = undefined;
  let status: 'success' | 'error' = 'error';
  let latencyMs = 0;
  let lastError = '';
  let passes = 1;

  let maxAttempts = 3;
  let backoffIncrementMs = 2000;

  if (task.promptTemplateId) {
    const template = await db.promptTemplates.get(task.promptTemplateId);
    if (template) {
      if (template.maxAttempts) maxAttempts = template.maxAttempts;
      if (template.backoffIncrementMs) backoffIncrementMs = template.backoffIncrementMs;
    }
  }

  let extractedOcrText: string | undefined = undefined;
  let initialParsedShape: 'object' | 'array_ocr' | 'array_objects' = 'object';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      store.addLog(task.id, { type: 'info', message: `Calling LLM API (Attempt ${attempt}/${maxAttempts})...` });
      const startApiTime = Date.now();

      const provider = providers.find(p => p.id === task.provider.id);
      if (!provider) throw new Error(`Provider ${task.provider.id} not found`);

      const result = await provider.generateTranscription(
        imageBase64s,
        task.prompt.content,
        apiKey,
        (type, msg, data) => store.addLog(task.id, { type, message: msg, data })
      );

      latencyMs = Date.now() - startApiTime;
      rawResponse = result.text;
      tokenUsage = result.tokens;
      status = 'success';

      let jsonResponse = extractJSON(rawResponse);
      const modernizadaOnly = task.prompt.content.includes('--modernizada_only') || task.prompt.content.includes('modernizada_only: true');
      const isFast = task.engine === 'fast';

      const normResult = normalizeProviderResponse(jsonResponse, initialParsedShape);
      initialParsedShape = normResult.shape;
      jsonResponse = normResult.normalizedJson;

      if (initialParsedShape === 'array_ocr') {
        passes = 2;
        store.addLog(task.id, { type: 'warning', message: 'Received OCR array. Attempting 2-step fallback...' });

        // Sort boxes primarily by Y (top to bottom), then by X (left to right)
        const sortedBoxes = jsonResponse.sort((a: any, b: any) => {
          const yDist = (a.box_2d?.[1] || 0) - (b.box_2d?.[1] || 0);
          if (Math.abs(yDist) > 20) return yDist; // Assuming 20px is a line height threshold
          return (a.box_2d?.[0] || 0) - (b.box_2d?.[0] || 0);
        });

        extractedOcrText = sortedBoxes.map((b: any) => b.text_content).join('\n');
        store.addLog(task.id, { type: 'info', message: 'OCR Extracted. Sending secondary request for JSON formatting...' });

        const fallbackPrompt = `
You are a historical data formatter. I have extracted the raw OCR text from a historical manuscript.
Your task is to take this raw text and format it into the EXACT JSON schema requested below. Do NOT hallucinate information; use ONLY the provided text.

CRITICAL INSTRUCTION: Return ONLY a valid JSON object. Do not include markdown formatting or conversational text.

REQUESTED SCHEMA:
{
  "idioma_detectado": "castellano|catalan",
  ${isFast ? '' : '"metadatos": { ... },\n  "transcripcion_literal": "",'}
  "transcripcion_modernizada": "La transcripción con ortografía moderna"
}

RAW OCR TEXT:
---
${extractedOcrText}
---
`;

        const fallbackResult = await provider.generateTranscription(
          [], // No images in step 2
          fallbackPrompt,
          apiKey,
          (type, msg, data) => store.addLog(task.id, { type, message: `Fallback: ${msg}`, data })
        );

        rawResponse = fallbackResult.text;
        jsonResponse = extractJSON(rawResponse);

        if (fallbackResult.tokens) {
          if (tokenUsage) {
            tokenUsage.promptTokens += fallbackResult.tokens.promptTokens;
            tokenUsage.completionTokens += fallbackResult.tokens.completionTokens;
            tokenUsage.totalTokens += fallbackResult.tokens.totalTokens;
          } else {
            tokenUsage = fallbackResult.tokens;
          }
        }
        latencyMs = Date.now() - startApiTime;
      } else if (initialParsedShape === 'array_objects') {
        store.addLog(task.id, { type: 'warning', message: 'Received array of objects instead of single object. Normalized to best single object.' });
        rawResponse = JSON.stringify(jsonResponse, null, 2);
      }

      if (!validateByPreset(jsonResponse, isFast, modernizadaOnly)) {
        throw new Error('JSON Response failed strict schema validation (missing required keys or returned an array).');
      }

      finalJsonResponse = jsonResponse;
      store.addLog(task.id, { type: 'success', message: `API call successful in ${latencyMs}ms` });
      store.updateTask(task.id, { rawResponse });
      break;
    } catch (err: any) {
      status = 'error';
      const errorMessage = err?.message || String(err);
      lastError = errorMessage;
      store.addLog(task.id, { type: 'error', message: `API call failed: ${errorMessage}` });
      if (attempt < maxAttempts) {
        const waitTime = attempt * backoffIncrementMs;
        store.addLog(task.id, { type: 'warning', message: `Retrying in ${waitTime / 1000} seconds...` });
        await sleep(waitTime);
      } else {
        rawResponse = errorMessage;
      }
    }
  }

  if (status === 'error' || !finalJsonResponse) {
    store.updateTask(task.id, {
      status: 'error',
      endTime: Date.now(),
      error: `Failed after ${maxAttempts} attempts: ${lastError}`
    });
    return;
  }

  const jsonResponse = finalJsonResponse;

  const apiMetrics = {
    inputTokens: tokenUsage?.promptTokens || 0,
    outputTokens: tokenUsage?.completionTokens || 0,
    totalTokens: tokenUsage?.totalTokens || 0,
    latencyMs
  };

  const fallbackLogs = {
    parsedShape: initialParsedShape,
    ocrFallbackUsed: passes === 2,
    ocrText: extractedOcrText,
    finalJson: JSON.stringify(jsonResponse, null, 2),
    passes
  };

  if (task.engine === 'split' || task.engine === 'fast') {
    await saveSplitResult(task, doc.id, gt, jsonResponse, rawResponse, apiMetrics, fallbackLogs);
  } else {
    await saveUnifiedResult(task, doc.id, gt, jsonResponse, rawResponse, apiMetrics, fallbackLogs);
  }

  store.addLog(task.id, { type: 'success', message: 'Task completed successfully' });
  store.updateTask(task.id, {
    status: 'success',
    endTime: Date.now(),
    apiMetrics,
    passes,
    fallbackLogs
  });

  await sleep(1000);
}

async function saveSplitResult(task: BenchmarkTask, docId: string, gt: any, jsonResponse: any, rawResponse: string, apiMetrics: any, fallbackLogs?: any) {
  let parsedText = rawResponse;
  let parsedMetadata: any = { ...jsonResponse };
  delete parsedMetadata.transcripcion;

  if (task.mode === 'literal' && jsonResponse.transcripcion?.literal) {
    parsedText = jsonResponse.transcripcion.literal;
  } else if ((task.mode === 'modernizada' || task.mode === 'fast') && jsonResponse.transcripcion?.modernizada) {
    parsedText = jsonResponse.transcripcion.modernizada;
  } else if ((task.mode === 'modernizada' || task.mode === 'fast') && jsonResponse.transcripcion_modernizada) {
    parsedText = jsonResponse.transcripcion_modernizada;
  } else if (jsonResponse.transcripcion && typeof jsonResponse.transcripcion === 'string') {
    parsedText = jsonResponse.transcripcion;
  }

  const gtText = task.mode === 'literal' ? gt.literal : gt.modernizada;
  const normalizedGt = task.mode === 'literal' ? normalizeLiteral(gtText) : normalizeModernizada(gtText);
  const normalizedPred = task.mode === 'literal' ? normalizeLiteral(parsedText) : normalizeModernizada(parsedText);

  const cer = calculateCER(normalizedGt, normalizedPred);
  const wer = calculateWER(normalizedGt, normalizedPred);

  await db.runResults.add({
    id: crypto.randomUUID(),
    cacheKey: task.cacheKey,
    docId,
    modelId: task.provider.id,
    mode: task.mode as 'literal' | 'modernizada' | 'fast',
    variantIds: task.variantIds || {},
    promptSnapshotId: task.prompt.id,
    promptTemplateId: task.promptTemplateId,
    createdAt: Date.now(),
    rawResponse,
    parsedText,
    parsedMetadata,
    cer,
    wer,
    scoreLiteral: task.mode === 'literal' ? computeScore(cer, wer, 'literal') : 0,
    scoreModernizada: (task.mode === 'modernizada' || task.mode === 'fast') ? computeScore(cer, wer, 'modernizada') : 0,
    scoreGlobal: computeScore(cer, wer, task.mode === 'literal' ? 'literal' : 'modernizada'),
    status: 'success',
    normalizationProfile: task.mode === 'literal' ? 'Profile A' : 'Lexical Automático',
    tokens: apiMetrics,
    latencyMs: apiMetrics.latencyMs,
    ...fallbackLogs
  });
}

async function saveUnifiedResult(task: BenchmarkTask, docId: string, gt: any, jsonResponse: any, rawResponse: string, apiMetrics: any, fallbackLogs?: any) {
  let parsedMetadata: any = { ...jsonResponse };
  delete parsedMetadata.transcripcion;

  // Save Literal
  let literalText = jsonResponse.transcripcion?.literal || '';
  let normGtLit = normalizeLiteral(gt.literal);
  let normPredLit = normalizeLiteral(literalText);
  let cerLit = calculateCER(normGtLit, normPredLit);
  let werLit = calculateWER(normGtLit, normPredLit);

  await db.runResults.add({
    id: crypto.randomUUID(),
    cacheKey: task.cacheKey.replace(':unified:', ':literal:'), // Fake cache key for compatibility
    docId,
    modelId: task.provider.id,
    mode: 'literal',
    variantIds: task.variantIds || {},
    promptSnapshotId: task.prompt.id,
    promptTemplateId: task.promptTemplateId,
    createdAt: Date.now(),
    rawResponse,
    parsedText: literalText,
    parsedMetadata,
    cer: cerLit,
    wer: werLit,
    scoreLiteral: computeScore(cerLit, werLit, 'literal'),
    scoreModernizada: 0,
    scoreGlobal: computeScore(cerLit, werLit, 'literal'),
    status: 'success',
    normalizationProfile: 'Profile A',
    tokens: apiMetrics,
    latencyMs: apiMetrics.latencyMs,
    ...fallbackLogs
  });

  // Save Modernizada
  let modText = jsonResponse.transcripcion?.modernizada || '';
  let normGtMod = normalizeModernizada(gt.modernizada);
  let normPredMod = normalizeModernizada(modText);
  let cerMod = calculateCER(normGtMod, normPredMod);
  let werMod = calculateWER(normGtMod, normPredMod);

  await db.runResults.add({
    id: crypto.randomUUID(),
    cacheKey: task.cacheKey.replace(':unified:', ':modernizada:'), // Fake cache key for compatibility
    docId,
    modelId: task.provider.id,
    mode: 'modernizada',
    variantIds: task.variantIds || {},
    promptSnapshotId: task.prompt.id,
    promptTemplateId: task.promptTemplateId,
    createdAt: Date.now(),
    rawResponse,
    parsedText: modText,
    parsedMetadata,
    cer: cerMod,
    wer: werMod,
    scoreLiteral: 0,
    scoreModernizada: computeScore(cerMod, werMod, 'modernizada'),
    scoreGlobal: computeScore(cerMod, werMod, 'modernizada'),
    status: 'success',
    normalizationProfile: 'Lexical Automático',
    tokens: apiMetrics,
    latencyMs: apiMetrics.latencyMs,
    ...fallbackLogs
  });
}

// =========================================================================
// DEV SMOKE TEST HARNESS
// =========================================================================
// @ts-ignore: import.meta.env is defined by Vite during dev
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  (window as any).__smokeBench = async (
    docId: string,
    modelId: string,
    engine: 'fast' | 'unified' = 'fast',
    shapeType: 'valid_fast' | 'array_objects' | 'array_ocr' = 'valid_fast'
  ) => {
    console.log(`[SmokeTest] Starting mock run for doc=${docId}, model=${modelId}, engine=${engine}, shape=${shapeType}`);

    let rawResponse = '';
    let jsonResponse: any = null;
    let initialParsedShape: 'object' | 'array_ocr' | 'array_objects' = 'object';
    let passes = 1;

    if (shapeType === 'valid_fast') {
      jsonResponse = {
        idioma_detectado: "castellano",
        transcripcion_modernizada: "(SMOKE TEST) En la villa de Madrid, a veinte días del mes..."
      };
      rawResponse = JSON.stringify(jsonResponse, null, 2);
    } else if (shapeType === 'array_objects') {
      initialParsedShape = 'array_objects';
      jsonResponse = [
        { idioma_detectado: "castellano", transcripcion_modernizada: "(SMOKE B1) Texto corto ignorado." },
        { idioma_detectado: "castellano", transcripcion_modernizada: "(SMOKE B2) Texto más largo que debe ganar tras normalizar." }
      ];
      rawResponse = JSON.stringify(jsonResponse, null, 2);
    } else if (shapeType === 'array_ocr') {
      initialParsedShape = 'array_ocr';
      jsonResponse = [
        { text_content: "Este es un texto", box_2d: [10, 10, 100, 20] },
        { text_content: "extraído por OCR", box_2d: [15, 30, 120, 40] }
      ];
      rawResponse = JSON.stringify(jsonResponse, null, 2);
    }

    const { normalizedJson, shape } = normalizeProviderResponse(jsonResponse, initialParsedShape);
    initialParsedShape = shape;
    jsonResponse = normalizedJson;

    if (initialParsedShape === 'array_ocr') {
      passes = 2;
      console.log('[SmokeTest] Triggered array_ocr fallback. Bypassing API and dropping fallback fake object.');
      jsonResponse = {
        idioma_detectado: "castellano",
        transcripcion_modernizada: "(SMOKE OCR FALLBACK) Texto procesado tras OCR extraction."
      };
      rawResponse = JSON.stringify(jsonResponse, null, 2);
    } else if (initialParsedShape === 'array_objects') {
      console.log('[SmokeTest] array_objects collapsed into longest string:', jsonResponse.transcripcion_modernizada);
      rawResponse = JSON.stringify(jsonResponse, null, 2);
    }

    const isValid = validateByPreset(jsonResponse, engine === 'fast', false);
    if (!isValid) {
      console.error('[SmokeTest] Validation failed for generated shape!');
      return;
    }

    const gt = await db.groundTruths.where('docId').equals(docId).first();
    if (!gt) {
      console.error(`[SmokeTest] No Ground Truth found for doc ${docId}`);
      return;
    }

    const template = await db.promptTemplates.where('engine').equals(engine).first();

    const mockTask: BenchmarkTask = {
      id: crypto.randomUUID(),
      docId,
      docTitle: 'Smoke Test Doc',
      provider: providers.find(p => p.id === modelId) || providers[0],
      mode: engine === 'fast' ? 'fast' : 'unified',
      engine,
      prompt: { id: 'mock-prompt', mode: (engine === 'fast' ? 'fast' : 'literal') as any, version: 1, content: 'Mock prompt', createdAt: Date.now() },
      promptTemplateId: template?.id || 'mock-template',
      cacheKey: `${docId}:${modelId}:unified:{"0":"orig"}:${template?.id || 'mock'}`,
      variantIds: { 0: 'orig' },
      status: 'success'
    };

    const apiMetrics = { inputTokens: 100, outputTokens: 50, totalTokens: 150, latencyMs: 1200 };
    const fallbackLogs = { parsedShape: initialParsedShape, ocrFallbackUsed: passes === 2, passes };

    console.log(`[SmokeTest] Dispatching DB Save...`);
    console.log(`[SmokeTest] DB Lookup Key Config -> { docId: "${docId}", modelId: "${modelId}", mode: "${mockTask.mode}", variantIds: {"0":"orig"} }`);

    if (engine === 'fast') {
      await saveSplitResult(mockTask, docId, gt, jsonResponse, rawResponse, apiMetrics, fallbackLogs);
    } else {
      await saveUnifiedResult(mockTask, docId, gt, jsonResponse, rawResponse, apiMetrics, fallbackLogs);
    }

    console.log(`[SmokeTest] COMPLETED. Check UI for the generated records.`);
  };
}
