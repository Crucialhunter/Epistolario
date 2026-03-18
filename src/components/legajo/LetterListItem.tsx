"use client";

import { CartaSummary } from '@/lib/types';
import { useState } from 'react';

interface LetterListItemProps {
  letter: CartaSummary;
  active: boolean;
  onSelect: (letterId: string) => void;
}

export default function LetterListItem({ letter, active, onSelect }: LetterListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const themes = letter.temas.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 2);

  const baseClasses = "group relative w-full rounded-2xl border-2 px-5 py-5 text-left transition-all duration-300 ease-out cursor-pointer";
  const activeClasses = "border-[#c9a030] bg-[#fdfbf7] shadow-xl ring-2 ring-[#c9a030]/30";
  const inactiveClasses = "border-[#e8dfd0] bg-[#fdfbf7] hover:border-[#d4c4a8] hover:shadow-2xl hover:-translate-y-0.5";
  const shadowClass = !active && !isHovered ? 'shadow-sm' : '';

  const labelClasses = active
    ? "text-[#b8922a]"
    : "text-[#a8956a] group-hover:text-[#c9a030]";

  const badgeClasses = active
    ? "border-[#c9a030] bg-[#c9a030]/10 text-[#8a6d20]"
    : "border-[#d4c4a8] bg-white text-[#8a7a5a] group-hover:border-[#c9a030] group-hover:text-[#8a6d20]";

  const themeClasses = active
    ? "bg-[#f5efe3] text-[#7a6a50]"
    : "bg-[#f8f5ef] text-[#8a7a60] group-hover:bg-[#f0e9dc]";

  const arrowVisible = !active && isHovered;

  return (
    <button
      type="button"
      onClick={() => onSelect(letter.id_carta)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${shadowClass}`}
    >
      {/* Decorative corner - top left */}
      <div className={`absolute left-3 top-3 h-3 w-3 border-l-2 border-t-2 transition-colors duration-300 ${active ? 'border-[#c9a030]' : 'border-[#d4c4a8] group-hover:border-[#c9a030]'}`} />

      {/* Decorative corner - bottom right */}
      <div className={`absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 transition-colors duration-300 ${active ? 'border-[#c9a030]' : 'border-[#d4c4a8] group-hover:border-[#c9a030]'}`} />

      <div className="flex items-start justify-between gap-4 pl-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-[0.28em] transition-colors duration-300 ${labelClasses}`}>
              Carta {letter.id_carta}
            </span>
            {letter.hasImages && (
              <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${badgeClasses}`}>
                Ms.
              </span>
            )}
          </div>
          <p className="reader-display mt-3 text-lg font-semibold leading-tight text-[#1a1610]">{letter.remitente || 'Remitente no identificado'}</p>
          <p className="mt-1.5 text-sm text-[#6b5d4d]">a {letter.destinatario || 'Destinatario no identificado'}</p>
        </div>

        {/* Separator line */}
        <div className={`hidden sm:block h-14 w-px transition-colors duration-300 ${active ? 'bg-[#c9a030]/40' : 'bg-[#e0d6c4] group-hover:bg-[#d4c4a8]'}`} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 pl-4 text-sm text-[#6b5d4d]">
        <span className={`font-medium transition-colors duration-300 ${active ? 'text-[#1a1610]' : 'group-hover:text-[#4a4235]'}`}>
          {letter.fecha || 'Sin fecha'}
        </span>
        {letter.lugar && (
          <>
            <span className="text-[#d4c4a8]">•</span>
            <span className="transition-colors duration-300 group-hover:text-[#4a4235]">{letter.lugar}</span>
          </>
        )}
      </div>

      {themes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 pl-4">
          {themes.map((theme) => (
            <span
              key={theme}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${themeClasses}`}
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Hover arrow */}
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${arrowVisible ? 'opacity-100 translate-x-0' : 'opacity-0'} ${active ? 'hidden' : ''}`}>
        <svg className="h-5 w-5 text-[#c9a030]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
