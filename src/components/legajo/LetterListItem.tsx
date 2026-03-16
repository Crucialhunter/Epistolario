"use client";

import { CartaSummary } from '@/lib/types';

interface LetterListItemProps {
  letter: CartaSummary;
  active: boolean;
  onSelect: (letterId: string) => void;
}

export default function LetterListItem({ letter, active, onSelect }: LetterListItemProps) {
  const themes = letter.temas.split(',').map((theme) => theme.trim()).filter(Boolean).slice(0, 2);

  return (
    <button
      type="button"
      onClick={() => onSelect(letter.id_carta)}
      className={`w-full rounded-[1.25rem] border px-4 py-4 text-left transition-all ${active ? 'border-[#c5a028] bg-[#f7f1e6] shadow-sm' : 'border-[#ece4d5] bg-[#fcfbf8] hover:border-[#d8c89e] hover:bg-white'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a38420]">Carta {letter.id_carta}</p>
          <p className="reader-display mt-2 text-lg font-semibold text-[#221c13]">{letter.remitente || 'Remitente no identificado'}</p>
          <p className="mt-1 text-sm text-[#6a5d47]">a {letter.destinatario || 'Destinatario no identificado'}</p>
        </div>
        {letter.hasImages ? <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8f7742]">Ms.</span> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#6a5d47]">
        <span>{letter.fecha || 'Sin fecha'}</span>
        {letter.lugar ? <span className="text-[#c9b996]">/ {letter.lugar}</span> : null}
      </div>
      {themes.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {themes.map((theme) => (
            <span key={theme} className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6a5d47]">{theme}</span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
