import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { providers } from '../services/providers';
import { useBenchmarkStore, BenchmarkTask } from '../store/benchmarkStore';
import { runPrecomputeQueue } from '../services/precompute';
import { X, Play, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

interface RunBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocIds?: string[];
}

export default function RunBenchmarkModal({ isOpen, onClose, selectedDocIds }: RunBenchmarkModalProps) {
  const navigate = useNavigate();
  const templates = useLiveQuery(() => db.promptTemplates.toArray());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);
  const [skipProcessed, setSkipProcessed] = useState(true);
  const [taskCount, setTaskCount] = useState<number | null>(null);
  
  const store = useBenchmarkStore();

  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplateId) {
      const defaultTemplate = templates.find(t => t.isDefault) || templates[0];
      setSelectedTemplateId(defaultTemplate.id);
    }
  }, [templates, selectedTemplateId]);

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  useEffect(() => {
    if (isOpen && selectedTemplate) {
      const calculateTasks = async () => {
        const savedKeys = localStorage.getItem('paleobench_api_keys');
        const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
        
        let docs = await db.documents.toArray();
        if (selectedDocIds && selectedDocIds.length > 0) {
          docs = docs.filter(d => selectedDocIds.includes(d.id));
        }

        let count = 0;
        for (const doc of docs) {
          for (const provider of providers) {
            if (provider.id !== 'gemini-3.1-pro-preview' && !apiKeys[provider.id]) continue;
            
            if (selectedTemplate.engine === 'split') {
              for (const mode of ['literal', 'modernizada'] as const) {
                if (skipProcessed) {
                  const existing = await db.runResults
                    .where('docId').equals(doc.id)
                    .and(r => r.modelId === provider.id && r.mode === mode && r.promptTemplateId === selectedTemplate.id)
                    .first();
                  if (existing) continue;
                }
                count++;
              }
            } else {
              // Unified engine: 1 task per document per provider
              if (skipProcessed) {
                // Check if we already have both literal and modernizada for this template
                const existingLit = await db.runResults
                  .where('docId').equals(doc.id)
                  .and(r => r.modelId === provider.id && r.mode === 'literal' && r.promptTemplateId === selectedTemplate.id)
                  .first();
                const existingMod = await db.runResults
                  .where('docId').equals(doc.id)
                  .and(r => r.modelId === provider.id && r.mode === 'modernizada' && r.promptTemplateId === selectedTemplate.id)
                  .first();
                if (existingLit && existingMod) continue;
              }
              count++;
            }
          }
        }
        setTaskCount(count);
      };
      calculateTasks();
    }
  }, [isOpen, selectedTemplate, skipProcessed, selectedDocIds]);

  if (!isOpen) return null;

  const handleStart = async () => {
    if (!selectedTemplate) return;
    setIsStarting(true);
    
    try {
      const savedKeys = localStorage.getItem('paleobench_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      
      // Create prompt snapshots for history
      let litSnapshotId = '';
      let modSnapshotId = '';
      let unifiedSnapshotId = '';

      if (selectedTemplate.engine === 'split') {
        const litContent = `${selectedTemplate.systemPrompt}\n\n${selectedTemplate.literalPrompt}`;
        const modContent = `${selectedTemplate.systemPrompt}\n\n${selectedTemplate.modernizadaPrompt}`;
        
        const litSnap = { id: crypto.randomUUID(), mode: 'literal' as const, version: 1, content: litContent, createdAt: Date.now() };
        const modSnap = { id: crypto.randomUUID(), mode: 'modernizada' as const, version: 1, content: modContent, createdAt: Date.now() };
        
        await db.prompts.bulkAdd([litSnap, modSnap]);
        litSnapshotId = litSnap.id;
        modSnapshotId = modSnap.id;
      } else {
        const unifiedContent = `${selectedTemplate.systemPrompt}\n\n${selectedTemplate.unifiedPrompt}`;
        const uniSnap = { id: crypto.randomUUID(), mode: 'literal' as const, version: 1, content: unifiedContent, createdAt: Date.now() };
        await db.prompts.add(uniSnap);
        unifiedSnapshotId = uniSnap.id;
      }

      // Generate tasks
      let docs = await db.documents.toArray();
      if (selectedDocIds && selectedDocIds.length > 0) {
        docs = docs.filter(d => selectedDocIds.includes(d.id));
      }
      
      const newTasks: BenchmarkTask[] = [];
      
      for (const doc of docs) {
        for (const provider of providers) {
          if (provider.id !== 'gemini-3.1-pro-preview' && !apiKeys[provider.id]) continue;
          
          if (selectedTemplate.engine === 'split') {
            for (const mode of ['literal', 'modernizada'] as const) {
              const cacheKey = `${doc.id}:${provider.id}:${mode}:orig:${selectedTemplate.id}`;
              
              if (skipProcessed) {
                const existing = await db.runResults
                  .where('docId').equals(doc.id)
                  .and(r => r.modelId === provider.id && r.mode === mode && r.promptTemplateId === selectedTemplate.id)
                  .first();
                if (existing) continue;
              }
              
              newTasks.push({
                id: crypto.randomUUID(),
                docId: doc.id,
                docTitle: doc.title,
                provider,
                mode,
                engine: 'split',
                promptTemplateId: selectedTemplate.id,
                prompt: { id: mode === 'literal' ? litSnapshotId : modSnapshotId, mode, version: 1, content: mode === 'literal' ? selectedTemplate.literalPrompt! : selectedTemplate.modernizadaPrompt!, createdAt: Date.now() },
                cacheKey,
                status: 'pending'
              });
            }
          } else {
            // Unified engine
            const cacheKey = `${doc.id}:${provider.id}:unified:orig:${selectedTemplate.id}`;
            
            if (skipProcessed) {
              const existingLit = await db.runResults
                .where('docId').equals(doc.id)
                .and(r => r.modelId === provider.id && r.mode === 'literal' && r.promptTemplateId === selectedTemplate.id)
                .first();
              const existingMod = await db.runResults
                .where('docId').equals(doc.id)
                .and(r => r.modelId === provider.id && r.mode === 'modernizada' && r.promptTemplateId === selectedTemplate.id)
                .first();
              if (existingLit && existingMod) continue;
            }
            
            newTasks.push({
              id: crypto.randomUUID(),
              docId: doc.id,
              docTitle: doc.title,
              provider,
              mode: 'unified',
              engine: 'unified',
              promptTemplateId: selectedTemplate.id,
              prompt: { id: unifiedSnapshotId, mode: 'literal', version: 1, content: selectedTemplate.unifiedPrompt!, createdAt: Date.now() },
              cacheKey,
              status: 'pending'
            });
          }
        }
      }
      
      store.setTasks([...store.tasks, ...newTasks]);
      store.setDrawerOpen(true);
      onClose();
      
      // Start queue in background
      runPrecomputeQueue(apiKeys);
      
    } catch (err) {
      console.error(err);
      alert('Failed to start benchmark');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
      <div className="bg-paper w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <h2 className="font-serif text-xl font-medium">Configure Benchmark</h2>
          <button onClick={onClose} className="text-ink/50 hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-stone/30 p-4 rounded-lg border border-ink/5 text-sm text-ink/70">
            Select a Prompt Template to run. You can create and manage templates in the Settings page.
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-ink">Prompt Template</label>
              <button 
                onClick={() => { onClose(); navigate('/settings'); }}
                className="text-xs text-ink/50 hover:text-ink flex items-center space-x-1"
              >
                <Settings className="w-3 h-3" />
                <span>Manage Templates</span>
              </button>
            </div>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50 bg-white text-sm"
            >
              {templates?.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.engine === 'unified' ? '1 API Call' : '2 API Calls'})</option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="p-4 bg-white border border-ink/10 rounded-lg space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Engine:</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-ink/10`}
                  style={{ backgroundColor: `var(--color-${selectedTemplate.color}-100, #f5f5f4)`, color: `var(--color-${selectedTemplate.color}-700, #444)` }}
                >
                  {selectedTemplate.engine}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider block mb-1">System Prompt:</span>
                <div className="text-xs font-mono text-ink/80 bg-stone/10 p-2 rounded">{selectedTemplate.systemPrompt}</div>
              </div>
              {selectedTemplate.engine === 'unified' ? (
                <div>
                  <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider block mb-1">Unified Prompt:</span>
                  <div className="text-xs font-mono text-ink/80 bg-stone/10 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">{selectedTemplate.unifiedPrompt}</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider block mb-1">Literal Prompt:</span>
                    <div className="text-xs font-mono text-ink/80 bg-stone/10 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">{selectedTemplate.literalPrompt}</div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider block mb-1">Modernizada Prompt:</span>
                    <div className="text-xs font-mono text-ink/80 bg-stone/10 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">{selectedTemplate.modernizadaPrompt}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between bg-olive/5 p-4 rounded-lg border border-olive/20">
            <div>
              <h3 className="font-medium text-ink">Execution Scope</h3>
              <p className="text-xs text-ink/60 mt-1">
                {selectedDocIds ? `Running on ${selectedDocIds.length} selected document(s).` : 'Running on all documents.'}
                {' '}This will generate <strong className="text-ink">{taskCount !== null ? taskCount : '...'} tasks</strong>.
              </p>
            </div>
            <label className="flex items-center space-x-2 text-sm font-medium text-ink cursor-pointer">
              <input 
                type="checkbox" 
                checked={skipProcessed}
                onChange={(e) => setSkipProcessed(e.target.checked)}
                className="rounded border-ink/20 text-olive focus:ring-olive/50"
              />
              <span>Skip already processed</span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-ink/10 bg-stone/20 flex justify-end items-center">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink/70 hover:text-ink"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={isStarting || !selectedTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-ink text-paper rounded-md text-sm font-medium hover:bg-ink/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none"
            >
              <Play className="w-4 h-4" />
              <span>{isStarting ? 'Starting...' : 'Start Benchmark'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
