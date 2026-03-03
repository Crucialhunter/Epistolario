import { useMemo } from 'react';
import * as Diff from 'diff';
import clsx from 'clsx';

interface DiffViewerProps {
  groundTruth: string;
  prediction: string;
  mode: 'literal' | 'modernizada';
}

export default function DiffViewer({ groundTruth, prediction, mode }: DiffViewerProps) {
  const diffs = useMemo(() => {
    if (!groundTruth || !prediction) return [];
    
    // For literal, character diff is better to see exact spelling errors
    // For modernizada, word diff might be better, but character diff is safer for now
    return Diff.diffChars(groundTruth, prediction);
  }, [groundTruth, prediction, mode]);

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-4 text-xs text-ink/60 bg-stone/5 p-2 rounded border border-ink/5">
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-olive/20 border border-olive/30 rounded-sm inline-block"></span>
          <span>Added by AI (Not in original)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-burgundy/20 border border-burgundy/30 rounded-sm inline-block"></span>
          <span className="line-through">Missed by AI (In original)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-transparent border border-ink/10 rounded-sm inline-block"></span>
          <span>Match</span>
        </div>
      </div>
      <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words p-4 bg-stone/10 rounded-lg border border-ink/5">
        {diffs.map((part, index) => {
          const colorClass = part.added
            ? 'bg-olive/20 text-olive-800' // Prediction added something not in GT
            : part.removed
            ? 'bg-burgundy/20 text-burgundy-800 line-through' // Prediction missed something from GT
            : 'text-ink/80'; // Match

          return (
            <span key={index} className={clsx("px-0.5 rounded-sm", colorClass)}>
              {part.value}
            </span>
          );
        })}
      </div>
    </div>
  );
}
