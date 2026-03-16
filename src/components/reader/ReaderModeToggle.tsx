"use client";

import { useMemo, useState } from 'react';
import { CartaDetail } from '@/lib/types';

export default function ReaderModeToggle({ carta }: { carta: CartaDetail }) {
  const [mode, setMode] = useState<'modernizada' | 'literal'>('modernizada');
  const currentText = useMemo(() => {
    return mode === 'modernizada' ? carta.transcripcion.modernizada : carta.transcripcion.literal;
  }, [carta.transcripcion.literal, carta.transcripcion.modernizada, mode]);

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#e2d6bf] bg-white/75 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[#efe5d3] px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Lectura textual completa</p>
          <p className="mt-2 text-sm text-[#6a5d47]">CorpusBase garantiza lectura, navegacion y comparacion entre transcripcion modernizada y literal.</p>
        </div>
        <div className="flex rounded-full border border-[#e7dcc6] bg-[#fcfbf8] p-1">
          {(['modernizada', 'literal'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${mode === option ? 'bg-[#2d2a26] text-[#fcfbf8]' : 'text-[#6a5d47] hover:text-[#a38420]'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="reader-article-surface px-6 py-6 md:px-8 md:py-8">
        <div className="reader-body space-y-6 text-[1.05rem] leading-[1.95] text-[#2d271d]">
          {currentText ? currentText.split('\n').map((paragraph, index) => (
            <p key={`${mode}-${index}`} className={index === 0 ? 'first-letter:text-[2.2rem] first-letter:font-medium first-letter:text-[#b5942e] first-letter:mr-1.5' : ''}>{paragraph}</p>
          )) : (
            <p className="rounded-[1.25rem] border border-dashed border-[#d8c89e] p-8 text-sm italic text-[#8c8571]">La carta aun no tiene contenido disponible para este modo de lectura.</p>
          )}
        </div>
      </div>
    </section>
  );
}
