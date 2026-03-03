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
  let tokenUsage = undefined;
  let status: 'success' | 'error' = 'error';
  let latencyMs = 0;
  let lastError = '';
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      store.addLog(task.id, { type: 'info', message: `Calling LLM API (Attempt ${attempt}/3)...` });
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
      
      store.addLog(task.id, { type: 'success', message: `API call successful in ${latencyMs}ms` });
      store.updateTask(task.id, { rawResponse });
      break;
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      lastError = errorMessage;
      store.addLog(task.id, { type: 'error', message: `API call failed: ${errorMessage}` });
      if (attempt < 3) {
        store.addLog(task.id, { type: 'warning', message: `Retrying in ${attempt === 1 ? 2 : 5} seconds...` });
        await sleep(attempt === 1 ? 2000 : 5000);
      } else {
        rawResponse = errorMessage;
      }
    }
  }
  
  if (status === 'error') {
    store.updateTask(task.id, { 
      status: 'error', 
      endTime: Date.now(), 
      error: `Failed after 3 attempts: ${lastError}` 
    });
    return;
  }

  store.addLog(task.id, { type: 'info', message: 'Parsing JSON response' });
  const jsonResponse = extractJSON(rawResponse);
  
  if (!jsonResponse) {
    store.addLog(task.id, { type: 'error', message: 'Failed to parse JSON from response' });
    store.updateTask(task.id, { status: 'error', error: 'Invalid JSON response', endTime: Date.now() });
    return;
  }

  const apiMetrics = {
    inputTokens: tokenUsage?.promptTokens || 0,
    outputTokens: tokenUsage?.completionTokens || 0,
    totalTokens: tokenUsage?.totalTokens || 0,
    latencyMs
  };

  if (task.engine === 'split') {
    await saveSplitResult(task, doc.id, gt, jsonResponse, rawResponse, apiMetrics);
  } else {
    await saveUnifiedResult(task, doc.id, gt, jsonResponse, rawResponse, apiMetrics);
  }
  
  store.addLog(task.id, { type: 'success', message: 'Task completed successfully' });
  store.updateTask(task.id, { 
    status: 'success', 
    endTime: Date.now(), 
    apiMetrics
  });
  
  await sleep(1000);
}

async function saveSplitResult(task: BenchmarkTask, docId: string, gt: any, jsonResponse: any, rawResponse: string, apiMetrics: any) {
  let parsedText = rawResponse;
  let parsedMetadata: any = { ...jsonResponse };
  delete parsedMetadata.transcripcion;
  
  if (task.mode === 'literal' && jsonResponse.transcripcion?.literal) {
    parsedText = jsonResponse.transcripcion.literal;
  } else if (task.mode === 'modernizada' && jsonResponse.transcripcion?.modernizada) {
    parsedText = jsonResponse.transcripcion.modernizada;
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
    mode: task.mode as 'literal' | 'modernizada',
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
    scoreModernizada: task.mode === 'modernizada' ? computeScore(cer, wer, 'modernizada') : 0,
    scoreGlobal: computeScore(cer, wer, task.mode as 'literal' | 'modernizada'),
    status: 'success',
    normalizationProfile: task.mode === 'literal' ? 'Profile A' : 'Lexical Automático',
    tokens: apiMetrics,
    latencyMs: apiMetrics.latencyMs
  });
}

async function saveUnifiedResult(task: BenchmarkTask, docId: string, gt: any, jsonResponse: any, rawResponse: string, apiMetrics: any) {
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
    latencyMs: apiMetrics.latencyMs
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
    latencyMs: apiMetrics.latencyMs
  });
}
