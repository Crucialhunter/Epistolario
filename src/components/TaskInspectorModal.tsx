import { X, Clock, Database, FileText, CheckCircle2, AlertCircle, Loader2, Activity, Terminal, Code } from 'lucide-react';
import { BenchmarkTask } from '../store/benchmarkStore';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface TaskInspectorModalProps {
  task: BenchmarkTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskInspectorModal({ task, isOpen, onClose }: TaskInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'payload' | 'response' | 'metrics'>('logs');

  if (!isOpen || !task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-olive';
      case 'error': return 'text-burgundy';
      case 'running': return 'text-amber-600';
      default: return 'text-ink/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-olive" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-burgundy" />;
      case 'running': return <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-ink/50" />;
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-paper rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-ink/10"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4">
            {getStatusIcon(task.status)}
            <div>
              <h2 className="text-lg font-medium text-ink flex items-center space-x-2">
                <span>{task.docTitle}</span>
                <span className="text-ink/30">•</span>
                <span className="text-sm font-mono bg-stone px-2 py-0.5 rounded text-ink/70">
                  {task.provider.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${
                  task.engine === 'unified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone/50 text-ink/60 border-ink/10'
                }`}>
                  {task.engine === 'unified' ? 'Unified' : 'Split'}
                </span>
              </h2>
              <p className="text-xs text-ink/60 mt-1">
                Task ID: <span className="font-mono">{task.id}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone rounded-full transition-colors">
            <X className="w-5 h-5 text-ink/50" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-stone/5">
          
          {/* Left Sidebar: Stepper & Info */}
          <div className="w-full md:w-64 border-r border-ink/10 bg-white p-6 overflow-y-auto flex flex-col">
            <h3 className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-6">Execution Flow</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-ink/10 before:to-transparent flex-1">
              {/* Queued */}
              <div className="relative flex items-center group">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-olive bg-white text-olive shadow shrink-0 z-10">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div className="ml-4 p-3 rounded border border-ink/10 bg-white shadow-sm w-full">
                  <div className="text-xs font-medium text-ink">Queued</div>
                </div>
              </div>

              {/* Preparing */}
              <div className="relative flex items-center group">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shadow shrink-0 z-10 ${
                  (task.logs?.length || 0) > 0 ? 'border-olive bg-white text-olive' : 'border-ink/20 bg-stone text-ink/30'
                }`}>
                  {(task.logs?.length || 0) > 0 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                <div className="ml-4 p-3 rounded border border-ink/10 bg-white shadow-sm w-full">
                  <div className="text-xs font-medium text-ink">Preparing</div>
                </div>
              </div>

              {/* Awaiting LLM */}
              <div className="relative flex items-center group">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shadow shrink-0 z-10 ${
                  task.status === 'running' ? 'border-amber-500 bg-white text-amber-500' : 
                  (task.status === 'success' || task.status === 'error') ? 'border-olive bg-white text-olive' : 'border-ink/20 bg-stone text-ink/30'
                }`}>
                  {task.status === 'running' ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                   (task.status === 'success' || task.status === 'error') ? <CheckCircle2 className="w-3 h-3" /> : 
                   <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                <div className="ml-4 p-3 rounded border border-ink/10 bg-white shadow-sm w-full">
                  <div className="text-xs font-medium text-ink">LLM API</div>
                  {task.status === 'running' && task.startTime && (
                    <div className="text-[10px] text-amber-600 mt-1 font-mono">
                      {formatTime(Date.now() - task.startTime)}
                    </div>
                  )}
                </div>
              </div>

              {/* Done */}
              <div className="relative flex items-center group">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shadow shrink-0 z-10 ${
                  task.status === 'success' ? 'border-olive bg-white text-olive' : 
                  task.status === 'error' ? 'border-burgundy bg-white text-burgundy' : 'border-ink/20 bg-stone text-ink/30'
                }`}>
                  {task.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : 
                   task.status === 'error' ? <AlertCircle className="w-3 h-3" /> : 
                   <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                <div className="ml-4 p-3 rounded border border-ink/10 bg-white shadow-sm w-full">
                  <div className="text-xs font-medium text-ink">Result</div>
                </div>
              </div>
            </div>

            {task.error && (
              <div className="mt-6 p-3 bg-burgundy/5 border border-burgundy/20 rounded-lg">
                <div className="flex items-center space-x-2 text-burgundy mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Error Details</span>
                </div>
                <div className="text-xs text-burgundy/80 font-mono break-words whitespace-pre-wrap">
                  {task.error}
                </div>
              </div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex px-4 pt-4 border-b border-ink/10 bg-white space-x-4">
              <button 
                onClick={() => setActiveTab('logs')}
                className={`flex items-center space-x-2 pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'logs' ? 'border-ink text-ink' : 'border-transparent text-ink/50 hover:text-ink'}`}
              >
                <Terminal className="w-4 h-4" />
                <span>Logs</span>
              </button>
              <button 
                onClick={() => setActiveTab('payload')}
                className={`flex items-center space-x-2 pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payload' ? 'border-ink text-ink' : 'border-transparent text-ink/50 hover:text-ink'}`}
              >
                <Database className="w-4 h-4" />
                <span>Payload</span>
              </button>
              <button 
                onClick={() => setActiveTab('response')}
                className={`flex items-center space-x-2 pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'response' ? 'border-ink text-ink' : 'border-transparent text-ink/50 hover:text-ink'}`}
              >
                <Code className="w-4 h-4" />
                <span>Raw Response</span>
              </button>
              <button 
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center space-x-2 pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'metrics' ? 'border-ink text-ink' : 'border-transparent text-ink/50 hover:text-ink'}`}
              >
                <Activity className="w-4 h-4" />
                <span>Metrics</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-stone/5">
              {activeTab === 'logs' && (
                <div className="font-mono text-xs space-y-2">
                  {task.logs?.map((log, i) => (
                    <div key={i} className={`flex flex-col p-2 rounded border ${
                      log.type === 'error' ? 'bg-burgundy/5 border-burgundy/20 text-burgundy' :
                      log.type === 'success' ? 'bg-olive/5 border-olive/20 text-olive' :
                      log.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      'bg-white border-ink/10 text-ink/80'
                    }`}>
                      <div className="flex space-x-3">
                        <span className="opacity-50 shrink-0">[{formatTimestamp(log.timestamp)}]</span>
                        <span>{log.message}</span>
                      </div>
                      {log.data && (
                        <div className="mt-2 ml-16 p-2 bg-black/5 rounded overflow-x-auto whitespace-pre-wrap break-all text-[10px] opacity-80">
                          {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!task.logs || task.logs.length === 0) && (
                    <div className="text-ink/40 text-center py-8">No logs available yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'payload' && (
                <div className="bg-ink text-paper p-4 rounded-lg overflow-x-auto font-mono text-xs shadow-inner">
                  {task.payload ? (
                    <pre>{JSON.stringify(task.payload, null, 2)}</pre>
                  ) : (
                    <div className="text-paper/40 text-center py-8">Payload not generated yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'response' && (
                <div className="bg-ink text-paper p-4 rounded-lg overflow-x-auto font-mono text-xs shadow-inner">
                  {task.rawResponse ? (
                    <pre>{task.rawResponse}</pre>
                  ) : (
                    <div className="text-paper/40 text-center py-8">No response received yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'metrics' && (
                <div className="space-y-6">
                  {task.apiMetrics ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-ink/10 shadow-sm">
                          <div className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-1">Input Tokens</div>
                          <div className="text-2xl font-serif text-ink">{task.apiMetrics.inputTokens.toLocaleString()}</div>
                          <div className="text-xs text-ink/40 mt-1">Prompt + Image</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-ink/10 shadow-sm">
                          <div className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-1">Output Tokens</div>
                          <div className="text-2xl font-serif text-ink">{task.apiMetrics.outputTokens.toLocaleString()}</div>
                          <div className="text-xs text-ink/40 mt-1">Generated JSON</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-ink/10 shadow-sm">
                          <div className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-1">Latency</div>
                          <div className="text-2xl font-serif text-ink">{formatTime(task.apiMetrics.latencyMs)}</div>
                          <div className="text-xs text-ink/40 mt-1">Total API Time</div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-ink/10 shadow-sm">
                        <div className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-2">Total Usage</div>
                        <div className="flex items-end space-x-2">
                          <span className="text-3xl font-serif text-olive">{task.apiMetrics.totalTokens.toLocaleString()}</span>
                          <span className="text-sm text-ink/60 mb-1">tokens</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-ink/40 text-center py-8">Metrics will be available after the task completes.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
