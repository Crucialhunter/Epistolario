import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { FileText, Plus, Trash2, Play, Loader2, Archive, ArchiveRestore } from 'lucide-react';
import DocumentModal from '../components/DocumentModal';
import RunBenchmarkModal from '../components/RunBenchmarkModal';
import ConfirmModal from '../components/ConfirmModal';
import { useBenchmarkStore } from '../store/benchmarkStore';
import { providers } from '../services/providers';

export default function Dashboard() {
  const documents = useLiveQuery(() => db.documents.toArray());
  const runResults = useLiveQuery(() => db.runResults.toArray());
  const promptTemplates = useLiveQuery(() => db.promptTemplates.toArray());
  const store = useBenchmarkStore();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [docToDelete, setDocToDelete] = useState<any>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const sortedDocuments = documents?.sort((a, b) => {
    if (a.archived === b.archived) {
      return b.createdAt - a.createdAt;
    }
    return a.archived ? 1 : -1;
  });

  const handleArchiveOrDelete = async (e: React.MouseEvent, doc: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!doc.archived) {
      // Archive it
      await db.documents.update(doc.id, { archived: true });
    } else {
      // Delete it
      setDocToDelete(doc);
    }
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    
    await db.transaction('rw', [db.documents, db.groundTruths, db.imageVariants, db.runResults], async () => {
      await db.documents.delete(docToDelete.id);
      await db.groundTruths.where('docId').equals(docToDelete.id).delete();
      await db.imageVariants.where('docId').equals(docToDelete.id).delete();
      await db.runResults.where('docId').equals(docToDelete.id).delete();
    });
    
    setDocToDelete(null);
    setSelectedDocs(prev => {
      const newSet = new Set(prev);
      newSet.delete(docToDelete.id);
      return newSet;
    });
  };

  const handleBulkArchive = async () => {
    if (selectedDocs.size === 0) return;
    await db.transaction('rw', db.documents, async () => {
      for (const id of selectedDocs) {
        await db.documents.update(id, { archived: true });
      }
    });
    setSelectedDocs(new Set());
  };

  const handleBulkRestore = async () => {
    if (selectedDocs.size === 0) return;
    await db.transaction('rw', db.documents, async () => {
      for (const id of selectedDocs) {
        await db.documents.update(id, { archived: false });
      }
    });
    setSelectedDocs(new Set());
  };

  const confirmBulkDelete = async () => {
    if (selectedDocs.size === 0) return;
    
    await db.transaction('rw', [db.documents, db.groundTruths, db.imageVariants, db.runResults], async () => {
      for (const id of selectedDocs) {
        await db.documents.delete(id);
        await db.groundTruths.where('docId').equals(id).delete();
        await db.imageVariants.where('docId').equals(id).delete();
        await db.runResults.where('docId').equals(id).delete();
      }
    });
    
    setBulkDeleteConfirm(false);
    setSelectedDocs(new Set());
  };

  const handleRestore = async (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await db.documents.update(docId, { archived: false });
  };

  const handleRunBenchmark = () => {
    setIsRunModalOpen(true);
  };

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSet = new Set(selectedDocs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDocs(newSet);
  };

  const toggleAll = () => {
    if (!documents) return;
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(documents.map(d => d.id)));
    }
  };

  const getStatusBadge = (docId: string, providerId: string) => {
    // Check store first for running tasks
    const activeTask = store.tasks.find(t => t.docId === docId && t.provider.id === providerId && (t.status === 'running' || t.status === 'pending'));
    if (activeTask) {
      return (
        <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium cursor-default">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>{providers.find(p => p.id === providerId)?.name}</span>
        </div>
      );
    }

    // Check DB for completed results
    const results = runResults?.filter(r => r.docId === docId && r.modelId === providerId) || [];
    if (results.length === 0) {
      return (
        <div className="bg-stone text-ink/40 px-2 py-0.5 rounded text-xs font-medium cursor-default border border-ink/5">
          {providers.find(p => p.id === providerId)?.name}
        </div>
      );
    }

    const hasError = results.some(r => r.status === 'error');
    
    // Find the template used for the first result (assuming they all use the same for a run)
    const templateId = results[0]?.promptTemplateId;
    const template = promptTemplates?.find(t => t.id === templateId);
    
    const colorStyle = template ? {
      backgroundColor: `var(--color-${template.color}-100, #f5f5f4)`,
      color: `var(--color-${template.color}-700, #444)`,
      borderColor: `var(--color-${template.color}-200, #e5e5e4)`
    } : {};

    if (hasError) {
      return (
        <Link to={`/workspace/${docId}?model=${providerId}`} className="bg-burgundy text-white px-2 py-0.5 rounded text-xs font-medium hover:bg-burgundy/80 transition-colors shadow-sm inline-flex items-center space-x-1">
          <span>{providers.find(p => p.id === providerId)?.name}</span>
          {template && <span className="w-1.5 h-1.5 rounded-full bg-white/50" />}
        </Link>
      );
    }

    return (
      <Link to={`/workspace/${docId}?model=${providerId}`} className="bg-olive text-white px-2 py-0.5 rounded text-xs font-medium hover:bg-olive/90 transition-colors shadow-sm inline-flex items-center space-x-1">
        <span>{providers.find(p => p.id === providerId)?.name}</span>
        {template && <span className="w-1.5 h-1.5 rounded-full bg-white/50" title={template.name} />}
      </Link>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Documents</h1>
          <p className="text-ink/60 text-sm mt-1">Manage and benchmark paleographic transcriptions</p>
        </div>
        <div className="flex items-center space-x-4">
          {selectedDocs.size > 0 && (
            <div className="flex items-center space-x-2 mr-4 border-r border-ink/10 pr-4">
              <span className="text-sm font-medium text-ink/60 mr-2">{selectedDocs.size} selected</span>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBulkArchive}
                className="flex items-center space-x-1 bg-stone text-ink/70 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-stone/80 transition-all shadow-sm"
                title="Archive selected"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBulkRestore}
                className="flex items-center space-x-1 bg-stone text-ink/70 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-stone/80 transition-all shadow-sm"
                title="Restore selected"
              >
                <ArchiveRestore className="w-4 h-4" />
                <span>Restore</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center space-x-1 bg-burgundy/10 text-burgundy px-3 py-1.5 rounded-md text-sm font-medium hover:bg-burgundy/20 transition-all shadow-sm"
                title="Delete selected"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunBenchmark}
                disabled={store.isRunning}
                className="flex items-center space-x-2 bg-olive text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-olive/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none ml-2"
              >
                <Play className="w-4 h-4" />
                <span>Run</span>
              </motion.button>
            </div>
          )}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRunBenchmark}
            disabled={store.isRunning || documents?.length === 0}
            className="flex items-center space-x-2 bg-stone text-ink px-4 py-2 rounded-md text-sm font-medium hover:bg-stone/80 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none"
          >
            <Play className="w-4 h-4" />
            <span>Run Benchmark</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-ink/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-ink/5 bg-stone/30">
              <th className="px-6 py-3 w-12">
                <input 
                  type="checkbox" 
                  checked={documents ? documents.length > 0 && selectedDocs.size === documents.length : false}
                  onChange={toggleAll}
                  className="rounded border-ink/20 text-olive focus:ring-olive/50 cursor-pointer"
                />
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-ink/60 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-xs font-semibold text-ink/60 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-ink/60 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {sortedDocuments?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-ink/50 text-sm">
                  No documents found. Add one to start benchmarking.
                </td>
              </tr>
            )}
            {sortedDocuments?.map((doc) => (
              <tr 
                key={doc.id} 
                onClick={() => navigate(`/workspace/${doc.id}`)}
                className={`group cursor-pointer transition-colors ${doc.archived ? 'opacity-50 bg-stone/10 hover:bg-stone/20' : 'hover:bg-stone/5'} ${selectedDocs.has(doc.id) ? 'bg-olive/5' : ''}`}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedDocs.has(doc.id)}
                    onChange={(e) => toggleSelection(e as any, doc.id)}
                    className="rounded border-ink/20 text-olive focus:ring-olive/50 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-stone flex items-center justify-center text-ink/50">
                      <FileText className="w-4 h-4" />
                    </div>
                    <Link to={`/workspace/${doc.id}`} className="font-medium text-ink hover:underline" onClick={(e) => e.stopPropagation()}>
                      {doc.title} {doc.archived && <span className="text-xs bg-ink/10 text-ink/60 px-2 py-0.5 rounded ml-2">Archived</span>}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {providers.map(p => (
                      <div key={p.id}>
                        {getStatusBadge(doc.id, p.id)}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-4">
                    {doc.archived && (
                      <button 
                        onClick={(e) => handleRestore(e, doc.id)}
                        className="text-ink/40 hover:text-olive transition-colors"
                        title="Restore"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleArchiveOrDelete(e, doc)}
                      className="text-ink/40 hover:text-burgundy transition-colors"
                      title={doc.archived ? "Delete permanently" : "Archive"}
                    >
                      {doc.archived ? <Trash2 className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <RunBenchmarkModal 
        isOpen={isRunModalOpen} 
        onClose={() => setIsRunModalOpen(false)} 
        selectedDocIds={selectedDocs.size > 0 ? Array.from(selectedDocs) : undefined}
      />
      <ConfirmModal
        isOpen={!!docToDelete}
        title="Delete Document"
        message="Are you sure you want to permanently delete this document and all its results? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDocToDelete(null)}
      />
      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        title={`Delete ${selectedDocs.size} Documents`}
        message={`Are you sure you want to permanently delete ${selectedDocs.size} documents and all their results? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
      </div>
    </div>
  );
}
