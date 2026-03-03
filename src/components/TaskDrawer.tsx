import { useBenchmarkStore, BenchmarkTask } from '../store/benchmarkStore';
import { X, CheckCircle2, CircleDashed, AlertCircle, Loader2, FileText, RotateCcw, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { runPrecomputeQueue } from '../services/precompute';
import { motion } from 'motion/react';
import TaskInspectorModal from './TaskInspectorModal';

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '--/--/-- --:--:--';
  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' }) + ' ' + 
         d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDuration = (start?: number, end?: number) => {
  if (!start) return '-';
  const diff = (end || Date.now()) - start;
  if (diff < 1000) return `${diff}ms`;
  return `${(diff / 1000).toFixed(1)}s`;
};

const TaskItem = ({ task, isExpanded, onToggleExpand, onInspect }: { task: BenchmarkTask, isExpanded: boolean, onToggleExpand: () => void, onInspect: () => void }) => {
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    if (task.status === 'running') {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [task.status]);

  const lastUpdate = task.endTime || (task.logs && task.logs.length > 0 ? task.logs[task.logs.length - 1].timestamp : task.startTime);

  return (
    <div className="border-b border-ink/5 last:border-0 p-4 hover:bg-stone/5 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">
            {task.status === 'running' && <Loader2 className="w-4 h-4 text-olive animate-spin" />}
            {task.status === 'pending' && <CircleDashed className="w-4 h-4 text-ink/30" />}
            {task.status === 'success' && <CheckCircle2 className="w-4 h-4 text-olive" />}
            {task.status === 'error' && <AlertCircle className="w-4 h-4 text-burgundy" />}
          </div>
          
          <div>
            <div className="text-sm font-medium text-ink flex items-center space-x-2 flex-wrap gap-y-1">
              <span>{task.docTitle}</span>
              <span className="text-xs px-1.5 py-0.5 bg-stone rounded text-ink/70">{task.provider.name}</span>
              <span className="text-xs px-1.5 py-0.5 bg-stone rounded text-ink/70">{task.mode}</span>
            </div>
            
            <div className="text-[10px] text-ink/50 mt-1.5 flex items-center space-x-3 font-mono">
              {task.startTime && (
                <span title="Start time">
                  Start: {formatTime(task.startTime)}
                </span>
              )}
              {lastUpdate && task.status !== 'pending' && (
                <span title="Last update">
                  Upd: {formatTime(lastUpdate)}
                </span>
              )}
              {task.startTime && (
                <span title="Duration" className={task.status === 'running' ? 'text-olive font-medium' : ''}>
                  Dur: {formatDuration(task.startTime, task.endTime)}
                </span>
              )}
            </div>

            {task.status === 'error' && (
              <div className="text-xs text-burgundy mt-1.5">{task.error}</div>
            )}
            {task.apiMetrics && (
              <div className="text-[10px] text-ink/50 mt-1 flex items-center space-x-2">
                <span>Tokens: {task.apiMetrics.totalTokens}</span>
                <span>({task.apiMetrics.inputTokens} in / {task.apiMetrics.outputTokens} out)</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 items-end ml-2">
          <button 
            onClick={onInspect}
            className="text-xs text-ink/50 hover:text-ink flex items-center space-x-1 bg-stone/50 px-2 py-1 rounded transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>Inspect</span>
          </button>
          <button 
            onClick={onToggleExpand}
            className="text-xs text-ink/50 hover:text-ink flex items-center space-x-1"
          >
            <FileText className="w-3 h-3" />
            <span>Prompt</span>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 p-3 bg-stone/20 rounded border border-ink/5 text-xs font-mono text-ink/80 whitespace-pre-wrap">
          {task.prompt.content}
        </div>
      )}
    </div>
  );
};

export default function TaskDrawer() {
  const store = useBenchmarkStore();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [inspectedTask, setInspectedTask] = useState<BenchmarkTask | null>(null);

  if (!store.isDrawerOpen) return null;

  const activeTasks = store.tasks.filter(t => t.status === 'running');
  const pendingTasks = store.tasks.filter(t => t.status === 'pending');
  const completedTasks = store.tasks.filter(t => t.status === 'success' || t.status === 'error');
  const failedTasks = store.tasks.filter(t => t.status === 'error');

  const handleRetryFailed = () => {
    const savedKeys = localStorage.getItem('paleobench_api_keys');
    const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
    
    failedTasks.forEach(task => {
      store.updateTask(task.id, { status: 'pending', error: undefined });
    });
    
    runPrecomputeQueue(apiKeys);
  };

  const renderTask = (task: BenchmarkTask) => {
    return (
      <TaskItem 
        key={task.id}
        task={task}
        isExpanded={expandedTaskId === task.id}
        onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
        onInspect={() => setInspectedTask(task)}
      />
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-paper shadow-2xl border-l border-ink/10 flex flex-col z-50 transform transition-transform duration-300">
      <div className="h-14 border-b border-ink/10 flex items-center justify-between px-4 bg-white">
        <h2 className="font-medium text-ink flex items-center space-x-2">
          <span>Benchmark Queue</span>
          {store.isRunning && (
            <span className="flex items-center space-x-1 text-xs bg-olive/10 text-olive px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-olive rounded-full animate-pulse" />
              <span>Running</span>
            </span>
          )}
        </h2>
        <button onClick={() => store.setDrawerOpen(false)} className="text-ink/50 hover:text-ink p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {store.tasks.length === 0 ? (
          <div className="p-8 text-center text-ink/40 text-sm">
            No tasks in queue.
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {activeTasks.length > 0 && (
              <div className="bg-olive/5">
                <div className="px-4 py-2 text-xs font-semibold text-olive uppercase tracking-wider border-b border-olive/10">
                  Active ({activeTasks.length})
                </div>
                {activeTasks.map(renderTask)}
              </div>
            )}
            
            {pendingTasks.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-ink/50 uppercase tracking-wider border-b border-ink/5 bg-stone/10">
                  Pending ({pendingTasks.length})
                </div>
                {pendingTasks.map(renderTask)}
              </div>
            )}
            
            {completedTasks.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-ink/50 uppercase tracking-wider border-b border-ink/5 bg-stone/10">
                  Completed ({completedTasks.length})
                </div>
                {completedTasks.map(renderTask)}
              </div>
            )}
          </div>
        )}
      </div>
      
      {store.tasks.length > 0 && !store.isRunning && (
        <div className="p-4 border-t border-ink/10 bg-stone/10 flex flex-col space-y-2">
          {failedTasks.length > 0 && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetryFailed}
              className="w-full py-2 flex items-center justify-center space-x-2 bg-burgundy text-white rounded-md text-sm font-medium hover:bg-burgundy/90 transition-all shadow-sm hover:shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry {failedTasks.length} Failed Tasks</span>
            </motion.button>
          )}
          <button 
            onClick={() => store.clearTasks()}
            className="w-full py-2 text-sm font-medium text-ink/60 hover:text-ink transition-colors"
          >
            Clear Queue
          </button>
        </div>
      )}
      
      <TaskInspectorModal 
        task={inspectedTask} 
        isOpen={!!inspectedTask} 
        onClose={() => setInspectedTask(null)} 
      />
    </div>
  );
}
