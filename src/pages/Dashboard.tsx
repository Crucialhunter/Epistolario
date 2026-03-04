import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { FileText, Plus, Trash2, Play, Loader2, Archive, ArchiveRestore, Clock, CheckCircle2, AlertTriangle, XCircle, Search, Filter, Eye, EyeOff } from 'lucide-react';
import DocumentModal from '../components/DocumentModal';
import RunBenchmarkModal from '../components/RunBenchmarkModal';
import ConfirmModal from '../components/ConfirmModal';
import { useBenchmarkStore } from '../store/benchmarkStore';
import { providers } from '../services/providers';
import { useMemo } from 'react';
import type { ReviewStatus, RunResult } from '../types';

const reviewStatusConfig: Record<ReviewStatus, { label: string; icon: any; color: string; bg: string; priority: number }> = {
  aprobado: { label: 'Aprobado', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', priority: 1 },
  requiere_edicion: { label: 'Requiere ed.', icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50', priority: 2 },
  pendiente: { label: 'Pendiente', icon: Clock, color: 'text-ink/50', bg: 'bg-stone', priority: 3 },
  rechazado: { label: 'Rechazado', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', priority: 4 }
};

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

  const [sortBy, setSortBy] = useState<'editorial' | 'cer_asc' | 'date_desc' | 'no_runs' | 'name_asc' | 'unread_first'>('editorial');
  const [filterStates, setFilterStates] = useState<Set<ReviewStatus>>(new Set(['aprobado', 'requiere_edicion', 'pendiente', 'rechazado']));
  const [filterConAprobado, setFilterConAprobado] = useState(false);
  const [filterSinEjecuciones, setFilterSinEjecuciones] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterUnreadWithRuns, setFilterUnreadWithRuns] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const docResults = useMemo(() => {
    if (!runResults) return {};
    return runResults.reduce((acc, r) => {
      if (!acc[r.docId]) acc[r.docId] = [];
      acc[r.docId].push(r);
      return acc;
    }, {} as Record<string, RunResult[]>);
  }, [runResults]);

  const getEditorialState = (docId: string) => {
    const results = docResults[docId] || [];
    if (results.length === 0) return { status: 'pendiente' as ReviewStatus, primaryRun: null as RunResult | null, bestCer: null as number | null, latestRun: 0, totalRuns: 0 };

    const approved = results.filter(r => r.reviewStatus === 'aprobado');
    const needsEdit = results.filter(r => r.reviewStatus === 'requiere_edicion');

    const sortByBest = (runs: RunResult[]) => [...runs].sort((a, b) => {
      const cerA = typeof a.cer === 'number' ? a.cer : 100;
      const cerB = typeof b.cer === 'number' ? b.cer : 100;
      if (cerA !== cerB) return cerA - cerB;
      return b.createdAt - a.createdAt;
    });

    let primaryRun: RunResult | null = null;
    let status: ReviewStatus = 'pendiente';

    if (approved.length > 0) {
      primaryRun = sortByBest(approved)[0];
      status = 'aprobado';
    } else if (needsEdit.length > 0) {
      primaryRun = sortByBest(needsEdit)[0];
      status = 'requiere_edicion';
    } else if (results.length > 0) {
      primaryRun = sortByBest(results)[0];
      status = primaryRun.reviewStatus || 'pendiente';
    }

    const validCers = results.map(r => r.cer).filter(c => typeof c === 'number');
    const bestCer = validCers.length > 0 ? Math.min(...validCers) : null;
    const latestRun = Math.max(...results.map(r => r.createdAt));

    return { status, primaryRun, bestCer, latestRun, totalRuns: results.length };
  };

  const enrichedDocuments = useMemo(() => {
    if (!documents) return [];
    return documents.map(doc => ({
      ...doc,
      isUnread: doc.isUnreadOverride === true || doc.lastViewedAt == null,
      editorial: getEditorialState(doc.id)
    }));
  }, [documents, docResults]);

  const sortedAndFiltered = useMemo(() => {
    let filtered = enrichedDocuments.filter(doc => {
      if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterUnread && !doc.isUnread) return false;
      if (filterUnreadWithRuns && (!doc.isUnread || doc.editorial.totalRuns === 0)) return false;
      if (filterSinEjecuciones && doc.editorial.totalRuns > 0) return false;
      if (filterConAprobado && doc.editorial.status !== 'aprobado') return false;
      if (!filterSinEjecuciones && !filterConAprobado && !filterUnread && !filterUnreadWithRuns) {
        if (!filterStates.has(doc.editorial.status)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (a.archived !== b.archived) return a.archived ? 1 : -1;

      switch (sortBy) {
        case 'editorial':
          const pA = reviewStatusConfig[a.editorial.status].priority;
          const pB = reviewStatusConfig[b.editorial.status].priority;
          if (pA !== pB) return pA - pB;
          return (a.editorial.bestCer ?? 100) - (b.editorial.bestCer ?? 100);
        case 'cer_asc':
          return (a.editorial.bestCer ?? 100) - (b.editorial.bestCer ?? 100);
        case 'date_desc':
          return b.editorial.latestRun - a.editorial.latestRun;
        case 'no_runs':
          if (a.editorial.totalRuns === 0 && b.editorial.totalRuns > 0) return -1;
          if (b.editorial.totalRuns === 0 && a.editorial.totalRuns > 0) return 1;
          return b.createdAt - a.createdAt;
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'unread_first':
          if (a.isUnread !== b.isUnread) return a.isUnread ? -1 : 1;
          return b.editorial.latestRun - a.editorial.latestRun;
        default:
          return 0;
      }
    });
  }, [enrichedDocuments, sortBy, filterStates, filterConAprobado, filterSinEjecuciones, searchQuery]);

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
            <h1 className="font-serif text-3xl font-medium text-ink">Documentos</h1>
            <p className="text-ink/60 text-sm mt-1">Gestiona y compara transcripciones paleográficas</p>
          </div>
          <div className="flex items-center space-x-4">
            {selectedDocs.size > 0 && (
              <div className="flex items-center space-x-2 mr-4 border-r border-ink/10 pr-4">
                <span className="text-sm font-medium text-ink/60 mr-2">{selectedDocs.size} seleccionados</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBulkArchive}
                  className="flex items-center space-x-1 bg-stone text-ink/70 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-stone/80 transition-all shadow-sm"
                  title="Archivar seleccionados"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archivar</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBulkRestore}
                  className="flex items-center space-x-1 bg-stone text-ink/70 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-stone/80 transition-all shadow-sm"
                  title="Restaurar seleccionados"
                >
                  <ArchiveRestore className="w-4 h-4" />
                  <span>Restaurar</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="flex items-center space-x-1 bg-burgundy/10 text-burgundy px-3 py-1.5 rounded-md text-sm font-medium hover:bg-burgundy/20 transition-all shadow-sm"
                  title="Eliminar seleccionados"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRunBenchmark}
                  disabled={store.isRunning}
                  className="flex items-center space-x-2 bg-olive text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-olive/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none ml-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Ejecutar</span>
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
              <span>Ejecutar benchmark</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir documento</span>
            </motion.button>
          </div>
        </div>

        {/* Filters and sorting bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/50 focus:border-olive/50 transition-all shadow-sm"
              />
            </div>

            <div className="flex bg-white border border-ink/10 rounded-lg p-1 shadow-sm">
              {(Object.keys(reviewStatusConfig) as ReviewStatus[]).map(status => {
                const cfg = reviewStatusConfig[status];
                const isActive = filterStates.has(status);
                const Icon = cfg.icon;
                return (
                  <button
                    key={status}
                    onClick={() => {
                      const newSet = new Set(filterStates);
                      if (isActive) newSet.delete(status);
                      else newSet.add(status);
                      setFilterStates(newSet);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${isActive ? cfg.bg + ' ' + cfg.color : 'text-ink/40 hover:bg-stone/50'}`}
                    title={cfg.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 border-l border-ink/10 pl-3">
              <label className="flex items-center gap-1.5 text-xs text-ink/60 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-ink/10 shadow-sm hover:bg-stone/50 transition-colors">
                <input type="checkbox" checked={filterConAprobado} onChange={(e) => setFilterConAprobado(e.target.checked)} className="rounded border-ink/20 text-olive focus:ring-olive/50" />
                <span>Solo aprobados</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-ink/60 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-ink/10 shadow-sm hover:bg-stone/50 transition-colors">
                <input type="checkbox" checked={filterSinEjecuciones} onChange={(e) => setFilterSinEjecuciones(e.target.checked)} className="rounded border-ink/20 text-olive focus:ring-olive/50" />
                <span>Sin ejecuciones</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-ink/60 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-ink/10 shadow-sm hover:bg-stone/50 transition-colors">
                <input type="checkbox" checked={filterUnread} onChange={(e) => setFilterUnread(e.target.checked)} className="rounded border-ink/20 text-olive focus:ring-olive/50" />
                <span>No vistos</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-ink/60 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-ink/10 shadow-sm hover:bg-stone/50 transition-colors">
                <input type="checkbox" checked={filterUnreadWithRuns} onChange={(e) => setFilterUnreadWithRuns(e.target.checked)} className="rounded border-ink/20 text-olive focus:ring-olive/50" />
                <span>No vistos + transcr.</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-ink/10 shadow-sm shrink-0">
            <Filter className="w-4 h-4 text-ink/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border-none bg-transparent focus:outline-none focus:ring-0 cursor-pointer text-ink/70 font-medium"
            >
              <option value="editorial">Estado editorial</option>
              <option value="cer_asc">Mejor CER</option>
              <option value="date_desc">Última transcripción</option>
              <option value="unread_first">No vistos primero</option>
              <option value="no_runs">Sin ejecuciones</option>
              <option value="name_asc">Nombre</option>
            </select>
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
                <th className="px-6 py-3 text-xs font-semibold text-ink/60 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-xs font-semibold text-ink/60 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-xs font-semibold text-ink/60 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {sortedAndFiltered?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-ink/50 text-sm">
                    No se encontraron documentos coincidentes.
                  </td>
                </tr>
              )}
              {sortedAndFiltered?.map((doc) => (
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
                      <Link to={`/workspace/${doc.id}`} className="font-medium text-ink flex items-center flex-wrap gap-2 hover:underline" onClick={(e) => e.stopPropagation()}>
                        <span>{doc.title}</span>
                        {doc.archived && <span className="text-[10px] uppercase font-bold tracking-wider bg-ink/10 text-ink/60 px-1.5 py-0.5 rounded">Archivado</span>}
                        {doc.isUnread && <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">No visto</span>}
                        {doc.isUnread && doc.editorial.totalRuns > 0 && <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shadow-sm ring-1 ring-emerald-200">Transcripción lista</span>}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        {doc.editorial.primaryRun ? (
                          <select
                            value={doc.editorial.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={async (e) => {
                              const newStatus = e.target.value as ReviewStatus;
                              await db.runResults.update(doc.editorial.primaryRun!.id, { reviewStatus: newStatus, reviewedAt: Date.now() });
                            }}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded border ${reviewStatusConfig[doc.editorial.status].bg} ${reviewStatusConfig[doc.editorial.status].color} ${doc.editorial.status === 'aprobado' ? 'border-emerald-200' : 'border-ink/10'} cursor-pointer outline-none hover:brightness-95 transition-all`}
                            title="Cambiar estado de la ejecución principal"
                          >
                            {Object.entries(reviewStatusConfig).map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-ink/10 text-[11px] font-medium ${reviewStatusConfig[doc.editorial.status].bg} ${reviewStatusConfig[doc.editorial.status].color}`}>
                            {(() => { const Icon = reviewStatusConfig[doc.editorial.status].icon; return <Icon className="w-3 h-3" />; })()}
                            <span>{reviewStatusConfig[doc.editorial.status].label}</span>
                          </span>
                        )}

                        {doc.editorial.primaryRun && (
                          <span className="text-[11px] text-ink/60 bg-stone px-1.5 py-0.5 rounded border border-ink/5 font-medium shadow-sm">
                            {providers.find(p => p.id === doc.editorial.primaryRun?.modelId)?.name || doc.editorial.primaryRun.modelId} · {doc.editorial.primaryRun.mode}
                          </span>
                        )}
                      </div>

                      {doc.editorial.totalRuns > 0 ? (
                        <div className="text-[10px] text-ink/40 font-mono">
                          Ejec.: {doc.editorial.totalRuns} · Mejor CER: {doc.editorial.bestCer !== null ? `${(doc.editorial.bestCer * 100).toFixed(1)}%` : 'N/A'} · Último: {new Date(doc.editorial.latestRun).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-[10px] text-ink/40 font-mono flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 opacity-50" /> Sin ejecuciones, listo para benchmark.
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-4">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (doc.isUnread) {
                            await db.documents.update(doc.id, { isUnreadOverride: false, lastViewedAt: doc.lastViewedAt || Date.now() });
                          } else {
                            await db.documents.update(doc.id, { isUnreadOverride: true });
                          }
                        }}
                        className="text-ink/40 hover:text-blue-600 transition-colors"
                        title={doc.isUnread ? "Marcar como visto" : "Marcar como no visto"}
                      >
                        {doc.isUnread ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      {doc.archived && (
                        <button
                          onClick={(e) => handleRestore(e, doc.id)}
                          className="text-ink/40 hover:text-olive transition-colors"
                          title="Restaurar"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleArchiveOrDelete(e, doc)}
                        className="text-ink/40 hover:text-burgundy transition-colors"
                        title={doc.archived ? "Eliminar definitivamente" : "Archivar"}
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
          title="Eliminar documento"
          message="¿Seguro que quieres eliminar definitivamente este documento y todos sus resultados? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          onConfirm={confirmDelete}
          onCancel={() => setDocToDelete(null)}
        />
        <ConfirmModal
          isOpen={bulkDeleteConfirm}
          title={`Eliminar ${selectedDocs.size} documentos`}
          message={`¿Seguro que quieres eliminar definitivamente ${selectedDocs.size} documentos y todos sus resultados? Esta acción no se puede deshacer.`}
          confirmText="Eliminar todos"
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
        />
      </div>
    </div>
  );
}
