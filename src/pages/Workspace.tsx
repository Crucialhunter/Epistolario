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
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Plus, RotateCcw } from 'lucide-react';
import { useBenchmarkStore } from '../store/benchmarkStore';
import { runPrecomputeQueue } from '../services/precompute';

export default function Workspace() {
  const { docId } = useParams();
  const [searchParams] = useSearchParams();
  const initialModel = searchParams.get('model') || 'gemini-3.1-pro-preview';
  
  const document = useLiveQuery(() => db.documents.get(docId || ''));
  const groundTruth = useLiveQuery(() => db.groundTruths.where('docId').equals(docId || '').first());
  const variants = useLiveQuery(() => db.imageVariants.where('docId').equals(docId || '').toArray());
  const promptTemplates = useLiveQuery(() => db.promptTemplates.toArray());
  
  const [mode, setMode] = useState<'literal' | 'modernizada'>('literal');
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
  const store = useBenchmarkStore();

  const currentVariantId = selectedVariantIds[currentPageIndex] || 'orig';
  const currentPageVariants = variants?.filter(v => v.pageIndex === currentPageIndex) || [];
  
  // We need to stringify selectedVariantIds for the cacheKey
  const variantIdsString = JSON.stringify(selectedVariantIds);

  const runResult = useLiveQuery(
    () => db.runResults
      .where('docId')
      .equals(docId || '')
      .and(r => r.modelId === selectedModelId && r.mode === mode && JSON.stringify(r.variantIds || {}) === variantIdsString)
      .first(),
    [docId, selectedModelId, mode, variantIdsString]
  );

  const promptSnapshot = useLiveQuery(
    () => runResult?.promptSnapshotId ? db.prompts.get(runResult.promptSnapshotId) : undefined,
    [runResult?.promptSnapshotId]
  );

  const template = promptTemplates?.find(t => t.id === runResult?.promptTemplateId);

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
      alert('Maximum of 3 variants allowed per page. Please delete one first.');
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
      alert(`Please configure API key for ${providers.find(p => p.id === selectedModelId)?.name} in Settings.`);
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
      alert('No prompt template found. Please create one in Settings.');
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
        promptContent = mode === 'literal' ? `${templateToUse.systemPrompt}\n\n${templateToUse.literalPrompt}` : `${templateToUse.systemPrompt}\n\n${templateToUse.modernizadaPrompt}`;
      } else {
        promptContent = `${templateToUse.systemPrompt}\n\n${templateToUse.unifiedPrompt}`;
      }
      const newSnap = { id: crypto.randomUUID(), mode: mode as 'literal' | 'modernizada', version: 1, content: promptContent, createdAt: Date.now() };
      await db.prompts.add(newSnap);
      promptSnapshotId = newSnap.id;
    } else {
      const existingSnap = await db.prompts.get(promptSnapshotId);
      promptContent = existingSnap?.content || '';
    }

    const cacheKey = templateToUse.engine === 'split' 
      ? `${docId}:${selectedModelId}:${mode}:${variantIdsString}:${templateToUse.id}`
      : `${docId}:${selectedModelId}:unified:${variantIdsString}:${templateToUse.id}`;

    const newTask = {
      id: crypto.randomUUID(),
      docId: docId,
      docTitle: document.title,
      provider,
      mode: templateToUse.engine === 'split' ? mode : 'unified' as const,
      engine: templateToUse.engine,
      promptTemplateId: templateToUse.id,
      prompt: { id: promptSnapshotId, mode: mode as 'literal' | 'modernizada', version: 1, content: promptContent, createdAt: Date.now() },
      cacheKey,
      variantIds: selectedVariantIds,
      status: 'pending' as const
    };

    store.setTasks([...store.tasks, newTask]);
    store.setDrawerOpen(true);
    runPrecomputeQueue(apiKeys);
  };

  if (!document || !groundTruth) {
    return <div className="p-8 text-center text-ink/60">Loading document...</div>;
  }

  const gtText = mode === 'literal' ? groundTruth.literal : groundTruth.modernizada;
  const normalizedGtText = mode === 'literal' ? normalizeLiteral(gtText) : normalizeModernizada(gtText);
  
  const displayText = showNormalized ? normalizedGtText : gtText;
  
  const predictionText = runResult?.parsedText || 'No benchmark run yet for this model and mode.';
  const displayPrediction = showNormalized && runResult?.status === 'success'
    ? (mode === 'literal' ? normalizeLiteral(predictionText) : normalizeModernizada(predictionText))
    : predictionText;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel: Image Viewer & Filters */}
      <div className="w-1/2 border-r border-ink/10 flex flex-col bg-stone/20">
        <div className="h-auto min-h-[3rem] border-b border-ink/10 flex flex-col justify-center px-4 py-2 bg-paper">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {document.pages && document.pages.length > 1 && (
                <div className="flex items-center space-x-1 mr-4 border-r border-ink/10 pr-4">
                  <span className="text-xs text-ink/60">Page:</span>
                  <select
                    value={currentPageIndex}
                    onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                    className="text-xs bg-stone border-none rounded px-2 py-1 focus:ring-0"
                  >
                    {document.pages.map((_, idx) => (
                      <option key={idx} value={idx}>{idx + 1} of {document.pages?.length}</option>
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
                    title="Delete variant"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {currentPageVariants.length < 3 && currentVariantId === 'orig' && (
                <button 
                  onClick={handleBakeVariant}
                  className="text-xs px-2 py-1 bg-olive/10 text-olive rounded hover:bg-olive/20 transition-colors flex items-center space-x-1"
                  title="Save current filters as a new variant"
                >
                  <Plus className="w-3 h-3" />
                  <span>Bake Variant</span>
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-xs text-ink/60 hover:text-ink transition-colors ml-4"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Filters</span>
              {showFilters ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          {imageUrl ? (
            <ImageViewer imageUrl={imageUrl} filters={filters} canvasRef={canvasRef} />
          ) : (
            <div className="flex items-center justify-center h-full text-ink/40 text-sm">No image available</div>
          )}
        </div>
        
        {showFilters && (
          <div className="border-t border-ink/10 bg-paper p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-ink/60 uppercase tracking-wider">Filters</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-xs font-medium text-ink cursor-pointer">
                  <input 
                    type="checkbox" checked={filters.invert}
                    onChange={(e) => setFilters(f => ({ ...f, invert: e.target.checked }))}
                    className="rounded border-ink/20 text-olive focus:ring-olive/50"
                  />
                  <span>Invert Colors</span>
                </label>
                <button 
                  onClick={() => setFilters({ brightness: 100, contrast: 100, invert: false })}
                  className="text-xs text-ink/50 hover:text-ink"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex space-x-6">
              <div className="flex-1">
                <label className="flex justify-between text-xs font-medium text-ink mb-1">
                  <span>Brightness</span>
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
                  <span>Contrast</span>
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
              title="Rerun this model for this document"
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
              <span>Show Normalized</span>
            </label>
            <span className="text-xs font-mono bg-stone px-2 py-1 rounded text-ink/70">
              Score: {runResult?.scoreGlobal !== undefined ? Math.round(runResult.scoreGlobal) : '--'}/100
            </span>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
           {/* Metadata Comparison */}
           {(groundTruth?.metadata || runResult?.parsedMetadata) && (
             <MetadataComparison 
               groundTruth={groundTruth?.metadata} 
               prediction={runResult?.parsedMetadata} 
             />
           )}
           
           <div className="mb-4">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-xs font-semibold text-ink/60 uppercase tracking-wider">Ground Truth</h3>
               {promptSnapshot && (
                 <button 
                   onClick={() => setShowPrompt(!showPrompt)}
                   className="text-xs text-ink/50 hover:text-ink transition-colors"
                 >
                   {showPrompt ? 'Hide Prompt' : 'View Prompt'}
                 </button>
               )}
             </div>
             
             {showPrompt && promptSnapshot && (
               <div className="mb-4 p-3 bg-stone/10 rounded border border-ink/5 text-xs font-mono text-ink/80 whitespace-pre-wrap">
                 <div className="font-semibold mb-1 text-ink/60">Prompt used for this result:</div>
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
                     title="CER (Character Error Rate): % of characters that differ. Lower is better.&#10;WER (Word Error Rate): % of words that differ. Lower is better."
                   >
                     CER: {runResult.cer.toFixed(1)}% | WER: {runResult.wer.toFixed(1)}%
                   </span>
                 )}
                 {runResult?.tokens && (
                   <span 
                     className="text-ink/40 font-mono text-[10px] bg-stone px-1.5 py-0.5 rounded cursor-help"
                     title={`Input: ${(runResult.tokens as any).inputTokens || (runResult.tokens as any).promptTokens || 0} | Output: ${(runResult.tokens as any).outputTokens || (runResult.tokens as any).completionTokens || 0} | Latency: ${runResult.latencyMs}ms`}
                   >
                     {runResult.tokens.totalTokens} tokens | {runResult.latencyMs}ms
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
               <DiffViewer groundTruth={displayText} prediction={displayPrediction} mode={mode} />
             ) : (
               <div className="p-4 bg-stone/5 rounded-lg border border-ink/5 font-serif text-sm whitespace-pre-wrap">
                 {displayPrediction}
               </div>
             )}
           </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={!!variantToDelete}
        title="Delete Variant"
        message="Are you sure you want to delete this image variant?"
        confirmText="Delete"
        onConfirm={confirmDeleteVariant}
        onCancel={() => setVariantToDelete(null)}
      />
    </div>
  );
}
