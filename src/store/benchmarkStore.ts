import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProviderAdapter } from '../services/providers';
import { PromptSnapshot } from '../types';

export interface TaskLog {
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  data?: any;
}

export interface BenchmarkTask {
  id: string;
  docId: string;
  docTitle: string;
  provider: ProviderAdapter;
  mode: 'literal' | 'modernizada' | 'unified';
  prompt: PromptSnapshot;
  promptTemplateId?: string;
  engine?: 'split' | 'unified';
  cacheKey: string;
  variantIds?: Record<number, string>;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
  startTime?: number;
  endTime?: number;
  logs?: TaskLog[];
  payload?: any;
  rawResponse?: string;
  apiMetrics?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    latencyMs: number;
  };
}

interface BenchmarkState {
  tasks: BenchmarkTask[];
  isRunning: boolean;
  isDrawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
  setTasks: (tasks: BenchmarkTask[]) => void;
  updateTask: (id: string, updates: Partial<BenchmarkTask>) => void;
  addLog: (id: string, log: Omit<TaskLog, 'timestamp'>) => void;
  setIsRunning: (isRunning: boolean) => void;
  clearTasks: () => void;
}

export const useBenchmarkStore = create<BenchmarkState>()(
  persist(
    (set) => ({
      tasks: [],
      isRunning: false,
      isDrawerOpen: false,
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      setTasks: (tasks) => set({ tasks }),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),
      addLog: (id, log) => set((state) => ({
        tasks: state.tasks.map((t) => {
          if (t.id === id) {
            const newLog = { ...log, timestamp: Date.now() };
            return { ...t, logs: [...(t.logs || []), newLog] };
          }
          return t;
        })
      })),
      setIsRunning: (isRunning) => set({ isRunning }),
      clearTasks: () => set({ tasks: [], isRunning: false })
    }),
    {
      name: 'paleobench-task-queue',
      partialize: (state) => ({ 
        // Only persist tasks, and reset any 'running' tasks to 'pending' on load
        tasks: state.tasks.map(t => t.status === 'running' ? { ...t, status: 'pending' } : t) 
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        isRunning: false,
      }),
    }
  )
);
