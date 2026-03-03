import * as Diff from 'diff';

export function calculateCER(gt: string, pred: string): number {
  if (!gt) return 100;
  if (!pred) return 100;
  
  const diffs = Diff.diffChars(gt, pred);
  let errors = 0;
  let totalChars = gt.length;
  
  diffs.forEach(part => {
    if (part.added || part.removed) {
      errors += part.value.length;
    }
  });
  
  // Levenshtein distance based CER
  const cer = (errors / totalChars) * 100;
  return Math.min(Math.max(cer, 0), 100);
}

export function calculateWER(gt: string, pred: string): number {
  if (!gt) return 100;
  if (!pred) return 100;
  
  const gtWords = gt.split(/\s+/);
  const predWords = pred.split(/\s+/);
  const diffs = Diff.diffWords(gt, pred);
  
  let errors = 0;
  let totalWords = gtWords.length;
  
  diffs.forEach(part => {
    if (part.added || part.removed) {
      errors += part.value.split(/\s+/).filter(w => w.length > 0).length;
    }
  });
  
  const wer = (errors / totalWords) * 100;
  return Math.min(Math.max(wer, 0), 100);
}

export function computeScore(cer: number, wer: number, mode: 'literal' | 'modernizada'): number {
  if (mode === 'literal') {
    // 60% CER, 40% WER
    const score = 100 - (cer * 0.6 + wer * 0.4);
    return Math.max(score, 0);
  } else {
    // Modernizada: Mostly WER
    const score = 100 - wer;
    return Math.max(score, 0);
  }
}
