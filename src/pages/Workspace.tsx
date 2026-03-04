import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import ImageViewer from '../components/ImageViewer';
import DiffViewer from '../components/DiffViewer';
import MetadataComparison from '../components/MetadataComparison';
import ConfirmModal from '../components/ConfirmModal';
import { normalizeLiteral, normalizeModernizada } from '../utils/normalizer';
import { providers } from '../services/providers';
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Plus, RotateCcw, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { useBenchmarkStore } from '../store/benchmarkStore';
import { runPrecomputeQueue } from '../services/precompute';
import { stableStringify } from '../utils/stableStringify';
import type { ReviewStatus } from '../types';

export default function Workspace() {
  const { docId } = useParams();
  const [searchParams] = useSearchParams();
  const initialModel = searchParams.get('model') || 'gemini-3.1-pro-preview';

  const document = useLiveQuery(() => db.documents.get(docId || ''));
  const groundTruth = useLiveQuery(() => db.groundTruths.where('docId').equals(docId || '').first());
  const variants = useLiveQuery(() => db.imageVariants.where('docId').equals(docId || '').toArray());
  const promptTemplates = useLiveQuery(() => db.promptTemplates.toArray());

  const [mode, setMode] = useState<'literal' | 'modernizada' | 'fast'>('fast');
  const [selectedModelId, setSelectedModelId] = useState<string>(initialModel);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedVariantIds, setSelectedVariantIds] = useState<Record<number, string>>({});
  const [showNormalized, setShowNormalized] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [viewMode, setViewMode] = useState<'diff' | 'raw'>('diff');
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, invert: false });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [variantToDelete, setVariantToDelete] = useState<string | null>(null);
  const [metadataOpen, setMetadataOpen] = useState(() => localStorage.getItem('ui.metadataPanelCollapsed') !== 'false');
  const [reviewComment, setReviewComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const store = useBenchmarkStore();

  const currentVariantId = selectedVariantIds[currentPageIndex] || 'orig';
  const currentPageVariants = variants?.filter(v => v.pageIndex === currentPageIndex) || [];

  // Stable stringify for variant matching (key-order independent)
  const stableVariantIdsString = stableStringify(selectedVariantIds);

  const runResult = useLiveQuery(
    () => db.runResults
      .where('docId')
      .equals(docId || '')
      .and(r => r.modelId === selectedModelId && r.mode === mode && stableStringify(r.variantIds) === stableVariantIdsString)
      .first(),
    [docId, selectedModelId, mode, stableVariantIdsString]
  );

  const promptSnapshot = useLiveQuery(
    () => runResult?.promptSnapshotId ? db.prompts.get(runResult.promptSnapshotId) : undefined,
    [runResult?.promptSnapshotId]
  );

  const template = promptTemplates?.find(t => t.id === runResult?.promptTemplateId);

  // Removed review and reviewCounts queries
  const totalDocs = useLiveQuery(() => db.documents.count(), []);

  const reviewStatusConfig: Record<ReviewStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
    pendiente: { label: 'Pendiente', icon: Clock, color: 'text-ink/50', bg: 'bg-stone' },
    aprobado: { label: 'Aprobado', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    requiere_edicion: { label: 'Requiere edición', icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50' },
    rechazado: { label: 'Rechazado', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50' }
  };

  const currentStatus: ReviewStatus = runResult?.reviewStatus || 'pendiente';
  const StatusIcon = reviewStatusConfig[currentStatus].icon;

  const handleReviewChange = async (newStatus: ReviewStatus) => {
    if (!runResult) return;
    await db.runResults.update(runResult.id, { reviewStatus: newStatus, reviewedAt: Date.now() });
  };

  const handleSaveComment = async () => {
    if (!runResult) return;
    await db.runResults.update(runResult.id, { reviewNote: reviewComment, reviewedAt: Date.now() });
    setShowCommentInput(false);
  };

  useEffect(() => {
    if (runResult?.reviewNote) setReviewComment(runResult.reviewNote);
    else setReviewComment('');
  }, [runResult?.reviewNote]);
  const toggleMetadata = (open: boolean) => {
    setMetadataOpen(open);
    localStorage.setItem('ui.metadataPanelCollapsed', open ? 'true' : 'false');
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (document?.pages && document.pages.length > 0) {
      // Ensure all pages have a selected variant (default 'orig')
      const newSelected = { ...selectedVariantIds };
      let changed = false;
      for (let i = 0; i < document.pages.length; i++) {
        if (!newSelected[i]) {
          newSelected[i] = 'orig';
          changed = true;
        }
      }
      if (changed) {
        setSelectedVariantIds(newSelected);
      }
    }
  }, [document?.pages?.length]);

  useEffect(() => {
    if (currentVariantId === 'orig') {
      if (document?.pages && document.pages[currentPageIndex]) {
        const url = URL.createObjectURL(document.pages[currentPageIndex]);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
      } else if (document?.imageBlob) {
        // Fallback for old data
        const url = URL.createObjectURL(document.imageBlob);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    } else {
      const variant = variants?.find(v => v.id === currentVariantId);
      if (variant?.imageBlob) {
        const url = URL.createObjectURL(variant.imageBlob);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [document, variants, currentVariantId, currentPageIndex]);

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantIds(prev => ({ ...prev, [currentPageIndex]: variantId }));
  };

  const handleBakeVariant = async () => {
    if (!canvasRef.current || !docId) return;
    if (currentPageVariants.length >= 3) {
      alert('Máximo de 3 variantes permitidas por página. Borra una primero.');
      return;
    }

    canvasRef.current.toBlob(async (blob) => {
      if (blob) {
        const variantId = crypto.randomUUID();
        await db.imageVariants.add({
          id: variantId,
          docId,
          pageIndex: currentPageIndex,
          name: `Variant ${currentPageVariants.length + 1}`,
          recipe: { ...filters },
          imageBlob: blob,
          createdAt: Date.now()
        });
        handleSelectVariant(variantId);
        setFilters({ brightness: 100, contrast: 100, invert: false });
      }
    }, 'image/jpeg', 0.8);
  };

  const handleDeleteVariant = async (id: string) => {
    setVariantToDelete(id);
  };

  const confirmDeleteVariant = async () => {
    if (variantToDelete) {
      await db.imageVariants.delete(variantToDelete);
      if (currentVariantId === variantToDelete) {
        handleSelectVariant('orig');
      }
      setVariantToDelete(null);
    }
  };

  const handleRerun = async () => {
    if (!docId || !document || !groundTruth) return;

    const savedKeys = localStorage.getItem('paleobench_api_keys');
    const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

    if (selectedModelId !== 'gemini-3.1-pro-preview' && !apiKeys[selectedModelId]) {
      alert(`Configura la clave de API para ${providers.find(p => p.id === selectedModelId)?.name} en Ajustes.`);
      return;
    }

    const provider = providers.find(p => p.id === selectedModelId);
    if (!provider) return;

    // Use the template from the existing result, or fallback to the default template
    let templateToUse = template;
    if (!templateToUse) {
      const allTemplates = await db.promptTemplates.toArray();
      templateToUse = allTemplates.find(t => t.isDefault) || allTemplates[0];
    }

    if (!templateToUse) {
      alert('No se encontró plantilla de prompt. Crea una en Ajustes.');
      return;
    }

    // Delete existing result to force re-run
    if (runResult) {
      await db.runResults.delete(runResult.id);
    }

    let promptSnapshotId = runResult?.promptSnapshotId;
    let promptContent = '';

    if (!promptSnapshotId) {
      // Create a new snapshot if we don't have one
      if (templateToUse.engine === 'split') {
        promptContent = mode === 'literal' ? `${templateToUse.systemPrompt || ''}\n\n${templateToUse.literalPrompt || ''}`.trim() : `${templateToUse.systemPrompt || ''}\n\n${templateToUse.modernizadaPrompt || ''}`.trim();
      } else if (templateToUse.engine === 'fast') {
        promptContent = `${templateToUse.systemPrompt || ''}\n\n${templateToUse.fastPrompt || ''}`.trim();
      } else {
        promptContent = `${templateToUse.systemPrompt || ''}\n\n${templateToUse.unifiedPrompt || ''}`.trim();
      }
      const newSnap = { id: crypto.randomUUID(), mode: (templateToUse.engine === 'fast' ? 'fast' : mode) as 'literal' | 'modernizada' | 'fast', version: 1, content: promptContent, createdAt: Date.now() };
      await db.prompts.add(newSnap);
      promptSnapshotId = newSnap.id;
    } else {
      const existingSnap = await db.prompts.get(promptSnapshotId);
      promptContent = existingSnap?.content || '';
    }

    const cacheKey = templateToUse.engine === 'split'
      ? `${docId}:${selectedModelId}:${mode}:${stableVariantIdsString}:${templateToUse.id}`
      : `${docId}:${selectedModelId}:unified:${stableVariantIdsString}:${templateToUse.id}`;

    const newTask = {
      id: crypto.randomUUID(),
      docId: docId,
      docTitle: document.title,
      provider,
      mode: templateToUse.engine === 'fast' ? 'fast' : (templateToUse.engine === 'split' ? mode : 'unified') as any,
      engine: templateToUse.engine,
      promptTemplateId: templateToUse.id,
      prompt: { id: promptSnapshotId, mode: (templateToUse.engine === 'fast' ? 'fast' : mode) as 'literal' | 'modernizada' | 'fast', version: 1, content: promptContent, createdAt: Date.now() },
      cacheKey,
      variantIds: selectedVariantIds,
      status: 'pending' as const
    };

    store.setTasks([...store.tasks, newTask]);
    store.setDrawerOpen(true);
    runPrecomputeQueue(apiKeys);
  };

  if (!document || !groundTruth) {
    return <div className="p-8 text-center text-ink/60">Cargando documento...</div>;
  }

  const gtText = mode === 'literal' ? groundTruth.literal : groundTruth.modernizada;
  const normalizedGtText = mode === 'literal' ? normalizeLiteral(gtText) : normalizeModernizada(gtText);

  const displayText = showNormalized ? normalizedGtText : gtText;

  const predictionText = runResult?.parsedText || 'No hay resultados para este modelo y modo.';
  const displayPrediction = showNormalized && runResult?.status === 'success'
    ? (mode === 'literal' ? normalizeLiteral(predictionText) : normalizeModernizada(predictionText))
    : predictionText;

  const isDemoResult = runResult?.rawResponse?.includes('ground_truth_demo') || (runResult?.tokens as any)?.totalTokens === 0 && runResult?.latencyMs === 0;
  const lastKeyError = (() => { try { return JSON.parse(localStorage.getItem('paleobench_last_key_error') || 'null'); } catch { return null; } })();

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel: Image Viewer & Filters */}
      <div className="w-1/2 border-r border-ink/10 flex flex-col bg-stone/20">
        <div className="h-auto min-h-[3rem] border-b border-ink/10 flex flex-col justify-center px-4 py-2 bg-paper">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {document.pages && document.pages.length > 1 && (
                <div className="flex items-center space-x-1 mr-4 border-r border-ink/10 pr-4">
                  <span className="text-xs text-ink/60">Página:</span>
                  <select
                    value={currentPageIndex}
                    onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                    className="text-xs bg-stone border-none rounded px-2 py-1 focus:ring-0"
                  >
                    {document.pages.map((_, idx) => (
                      <option key={idx} value={idx}>{idx + 1} de {document.pages?.length}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={() => handleSelectVariant('orig')}
                className={`text-xs px-2 py-1 rounded font-medium ${currentVariantId === 'orig' ? 'bg-ink text-paper' : 'bg-stone text-ink/70 hover:bg-stone/80'}`}
              >
                Original
              </button>
              {currentPageVariants.map(v => (
                <div key={v.id} className={`flex items-center text-xs rounded font-medium ${currentVariantId === v.id ? 'bg-ink text-paper' : 'bg-stone text-ink/70 hover:bg-stone/80'}`}>
                  <button
                    onClick={() => handleSelectVariant(v.id)}
                    className="px-2 py-1"
                  >
                    {v.name}
                  </button>
                  <button
                    onClick={() => handleDeleteVariant(v.id)}
                    className="px-1 py-1 hover:text-burgundy"
                    title="Borrar variante"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {currentPageVariants.length < 3 && currentVariantId === 'orig' && (
                <button
                  onClick={handleBakeVariant}
                  className="text-xs px-2 py-1 bg-olive/10 text-olive rounded hover:bg-olive/20 transition-colors flex items-center space-x-1"
                  title="Guardar filtros actuales como nueva variante"
                >
                  <Plus className="w-3 h-3" />
                  <span>Fijar variante</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-xs text-ink/60 hover:text-ink transition-colors ml-4"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Filtros</span>
              {showFilters ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          {imageUrl ? (
            <ImageViewer imageUrl={imageUrl} filters={filters} canvasRef={canvasRef} />
          ) : (
            <div className="flex items-center justify-center h-full text-ink/40 text-sm">No hay imagen disponible</div>
          )}
        </div>

        {showFilters && (
          <div className="border-t border-ink/10 bg-paper p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-ink/60 uppercase tracking-wider">Filtros</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-xs font-medium text-ink cursor-pointer">
                  <input
                    type="checkbox" checked={filters.invert}
                    onChange={(e) => setFilters(f => ({ ...f, invert: e.target.checked }))}
                    className="rounded border-ink/20 text-olive focus:ring-olive/50"
                  />
                  <span>Invertir colores</span>
                </label>
                <button
                  onClick={() => setFilters({ brightness: 100, contrast: 100, invert: false })}
                  className="text-xs text-ink/50 hover:text-ink"
                >
                  Restablecer
                </button>
              </div>
            </div>
            <div className="flex space-x-6">
              <div className="flex-1">
                <label className="flex justify-between text-xs font-medium text-ink mb-1">
                  <span>Brillo</span>
                  <span>{filters.brightness}%</span>
                </label>
                <input
                  type="range" min="0" max="200" value={filters.brightness}
                  onChange={(e) => setFilters(f => ({ ...f, brightness: parseInt(e.target.value) }))}
                  className="w-full accent-olive"
                />
              </div>
              <div className="flex-1">
                <label className="flex justify-between text-xs font-medium text-ink mb-1">
                  <span>Contraste</span>
                  <span>{filters.contrast}%</span>
                </label>
                <input
                  type="range" min="0" max="200" value={filters.contrast}
                  onChange={(e) => setFilters(f => ({ ...f, contrast: parseInt(e.target.value) }))}
                  className="w-full accent-olive"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Ground Truth & Diff Viewer */}
      <div className="w-1/2 flex flex-col bg-white">
        {/* Review status bar */}
        <div className="border-b border-ink/10 px-4 py-2 bg-paper flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${reviewStatusConfig[currentStatus].color}`} />
            <select
              value={currentStatus}
              onChange={(e) => handleReviewChange(e.target.value as ReviewStatus)}
              className={`text-xs font-medium px-2 py-1 rounded border border-ink/10 ${reviewStatusConfig[currentStatus].bg} ${reviewStatusConfig[currentStatus].color} cursor-pointer`}
            >
              {Object.entries(reviewStatusConfig).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="text-[10px] text-ink/50 hover:text-ink underline"
            >
              {runResult?.reviewNote ? 'Editar nota' : 'Añadir nota'}
            </button>
          </div>
        </div>
        {showCommentInput && (
          <div className="border-b border-ink/10 px-4 py-2 bg-amber-50/50 flex items-center gap-2">
            <input
              type="text"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Nota de revisión…"
              className="flex-1 text-xs px-2 py-1 rounded border border-ink/10 bg-white"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveComment()}
            />
            <button onClick={handleSaveComment} className="text-xs px-2 py-1 bg-olive/10 text-olive rounded hover:bg-olive/20">Guardar</button>
          </div>
        )}
        <div className="h-12 border-b border-ink/10 flex items-center px-4 justify-between bg-paper">
          <div className="flex space-x-4">
            <button
              onClick={() => setMode('literal')}
              className={`text-sm font-medium pb-1 ${mode === 'literal' ? 'text-ink border-b-2 border-ink' : 'text-ink/50 hover:text-ink'}`}
            >
              Literal
            </button>
            <button
              onClick={() => setMode('modernizada')}
              className={`text-sm font-medium pb-1 ${mode === 'modernizada' ? 'text-ink border-b-2 border-ink' : 'text-ink/50 hover:text-ink'}`}
            >
              Modernizada
            </button>
            <button
              onClick={() => setMode('fast')}
              className={`text-sm font-medium pb-1 ${mode === 'fast' ? 'text-ink border-b-2 border-ink' : 'text-ink/50 hover:text-ink'}`}
            >
              FAST (Modernizada)
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="text-xs bg-stone border-none rounded px-2 py-1 focus:ring-0"
            >
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {template && (
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-ink/10`}
                style={{ backgroundColor: `var(--color-${template.color}-100, #f5f5f4)`, color: `var(--color-${template.color}-700, #444)` }}
                title={template.name}
              >
                {template.engine}
              </span>
            )}
            <button
              onClick={handleRerun}
              title="Reejecutar modelo para este documento"
              className="p-1 rounded bg-stone hover:bg-stone/80 text-ink/70 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <label className="flex items-center space-x-2 text-xs font-medium text-ink/70 ml-2">
              <input
                type="checkbox" checked={showNormalized}
                onChange={(e) => setShowNormalized(e.target.checked)}
                className="rounded border-ink/20 text-olive focus:ring-olive/50"
              />
              <span>Normalizado</span>
            </label>
            <span className="text-xs font-mono bg-stone px-2 py-1 rounded text-ink/70">
              Puntuación: {runResult?.scoreGlobal !== undefined ? Math.round(runResult.scoreGlobal) : '--'}/100
            </span>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-ink/60 uppercase tracking-wider">Ground Truth</h3>
              {promptSnapshot && (
                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="text-xs text-ink/50 hover:text-ink transition-colors"
                >
                  {showPrompt ? 'Ocultar prompt' : 'Ver prompt'}
                </button>
              )}
            </div>

            {showPrompt && promptSnapshot && (
              <div className="mb-4 p-3 bg-stone/10 rounded border border-ink/5 text-xs font-mono text-ink/80 whitespace-pre-wrap">
                <div className="font-semibold mb-1 text-ink/60">Prompt utilizado:</div>
                {promptSnapshot.content}
              </div>
            )}

            <div className="p-4 bg-stone/5 rounded-lg border border-ink/5 font-serif text-sm whitespace-pre-wrap">
              {displayText}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-ink/60 uppercase tracking-wider flex items-center space-x-2">
                <span>{providers.find(p => p.id === selectedModelId)?.name}</span>
                {runResult && (
                  <span
                    className="text-ink/40 font-mono text-[10px] bg-stone px-1.5 py-0.5 rounded cursor-help"
                    title="CER: Tasa de error de caracteres. Menor es mejor.&#10;WER: Tasa de error de palabras. Menor es mejor."
                  >
                    CER: {runResult.cer.toFixed(1)}% | WER: {runResult.wer.toFixed(1)}%
                  </span>
                )}
                {isDemoResult && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300" title="Resultado generado en Modo Demo con Ground Truth">
                    DEMO
                  </span>
                )}
                {runResult?.tokens && (
                  <span
                    className="text-ink/40 font-mono text-[10px] bg-stone px-1.5 py-0.5 rounded cursor-help"
                    title={`Entrada: ${(runResult.tokens as any).inputTokens || (runResult.tokens as any).promptTokens || 0} | Salida: ${(runResult.tokens as any).outputTokens || (runResult.tokens as any).completionTokens || 0} | Latencia: ${runResult.latencyMs}ms`}
                  >
                    {runResult.tokens.totalTokens} tokens | {runResult.latencyMs}ms
                  </span>
                )}
                {runResult?.passes && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${runResult.passes > 1 ? 'bg-amber-100 text-amber-700' : 'bg-stone/20 text-ink/60'}`} title={`Pasadas: ${runResult.passes}`}>
                    P{runResult.passes}
                  </span>
                )}
                {runResult?.ocrFallbackUsed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-800" title="Se usó OCR como alternativa">
                    OCR
                  </span>
                )}
              </h3>
              <div className="flex bg-stone rounded p-0.5">
                <button
                  onClick={() => setViewMode('diff')}
                  className={`text-xs px-2 py-1 rounded ${viewMode === 'diff' ? 'bg-white shadow-sm font-medium' : 'text-ink/60 hover:text-ink'}`}
                >
                  Diff
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`text-xs px-2 py-1 rounded ${viewMode === 'raw' ? 'bg-white shadow-sm font-medium' : 'text-ink/60 hover:text-ink'}`}
                >
                  Raw
                </button>
              </div>
            </div>

            {viewMode === 'diff' ? (
              <DiffViewer groundTruth={displayText} prediction={displayPrediction} mode={mode === 'literal' ? 'literal' : 'modernizada'} />
            ) : (
              <div className="p-4 bg-stone/5 rounded-lg border border-ink/5 font-serif text-sm whitespace-pre-wrap">
                {displayPrediction}
              </div>
            )}
          </div>

          {/* Collapsible Metadata Panel — moved to bottom */}
          {(groundTruth?.metadata || runResult?.parsedMetadata) && (
            <div className="mt-4 border border-ink/10 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleMetadata(!metadataOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-stone/30 hover:bg-stone/50 transition-colors"
              >
                <span className="text-xs font-semibold text-ink/60 uppercase tracking-wider">Metadatos (opcional)</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink/40">GT vs Predicción</span>
                  {metadataOpen ? <ChevronUp className="w-3.5 h-3.5 text-ink/40" /> : <ChevronDown className="w-3.5 h-3.5 text-ink/40" />}
                </div>
              </button>
              {metadataOpen && (
                <div className="p-3">
                  <MetadataComparison
                    groundTruth={groundTruth?.metadata}
                    prediction={runResult?.parsedMetadata}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={!!variantToDelete}
        title="Borrar variante"
        message="¿Seguro que quieres borrar esta variante?"
        confirmText="Borrar"
        onConfirm={confirmDeleteVariant}
        onCancel={() => setVariantToDelete(null)}
      />
    </div>
  );
}
