'use client';

import { ArrowRight } from 'lucide-react';
import { LabV2Button, LabV2Pill } from '@/components/lab/v2/UiLabV2Primitives';

export interface UiLabV2LegajoCardProps {
  title: string;
  summary: string;
  imageUrl: string;
  dateRange: string;
  letterCount: number;
  imageCount: number;
  keyActors: readonly string[];
  keyPlaces: readonly string[];
  tone?: 'paper' | 'ink';
}

export default function UiLabV2LegajoCard({
  title,
  summary,
  imageUrl,
  dateRange,
  letterCount,
  imageCount,
  keyActors,
  keyPlaces,
  tone = 'paper',
}: Readonly<UiLabV2LegajoCardProps>) {
  const cardClass =
    tone === 'ink'
      ? 'border-[#474034] bg-[linear-gradient(180deg,rgba(31,27,23,0.99),rgba(24,21,18,0.98))] text-[#f4ebdc] shadow-[0_24px_46px_rgba(16,13,10,0.24),inset_0_1px_0_rgba(255,255,255,0.03)]'
      : 'border-[#d8cebe] bg-[linear-gradient(180deg,rgba(255,252,247,0.99),rgba(243,236,224,0.97))] text-[#241d14] shadow-[0_22px_42px_rgba(37,29,19,0.11),inset_0_1px_0_rgba(255,255,255,0.7)]';
  const subTextClass = tone === 'ink' ? 'text-[#dfd3c0]' : 'text-[#675a46]';
  const lineClass = tone === 'ink' ? 'border-white/10' : 'border-[#ddd4c5]';
  const labelClass = tone === 'ink' ? 'text-[#d6b86f]' : 'text-[#8f7742]';
  const chipClass =
    tone === 'ink'
      ? 'border-[#665747] bg-[rgba(255,255,255,0.05)] text-[#f0e1c3]'
      : 'border-[#d8cfbf] bg-[linear-gradient(180deg,rgba(255,251,245,0.96),rgba(243,236,224,0.94))] text-[#675947]';

  return (
    <article
      className={`group h-fit overflow-hidden rounded-[1.7rem] border transition-all duration-300 hover:-translate-y-1 ${cardClass}`}
    >
      <div className="relative aspect-[16/8.3] overflow-hidden border-b border-black/10">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-[transform,filter] duration-500 group-hover:scale-[1.04] group-hover:blur-[1.6px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,15,13,0.8),rgba(17,15,13,0.2)_54%,rgba(17,15,13,0))]" />
        <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
          <LabV2Pill leftLabel="Capa" rightLabel="Visual activa" tone="accent" className="px-2.5 py-1 text-[9px]" />
          <LabV2Pill leftLabel="Acceso" rightLabel="Manuscrito local" tone="default" className="px-2.5 py-1 text-[9px]" />
        </div>
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d8be66]">Rango documental</p>
            <p className="reader-display mt-1 text-[1.34rem] font-semibold leading-none text-[#f6efe2]">{dateRange}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#efd79a] bg-[#ead8aa] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#2f2312] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 motion-safe:translate-x-1"
          >
            Abrir legajo
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div>
          <h3 className="reader-display text-[1.72rem] font-semibold leading-[0.95]">{title}</h3>
          <p className={`mt-2 line-clamp-2 text-[13px] leading-[1.45] ${subTextClass}`}>{summary}</p>
        </div>

        <div className={`overflow-hidden rounded-[1.2rem] border ${lineClass} bg-white/6`}>
          <div className={`grid grid-cols-[1.2fr_1fr_1fr] border-b px-3.5 py-2.5 ${lineClass}`}>
            <div>
              <p className={`text-[9px] font-bold uppercase tracking-[0.18em] ${labelClass}`}>Rango</p>
              <p className="reader-display mt-1 text-[1.18rem] font-semibold leading-none">{dateRange}</p>
            </div>
            <div className="text-center">
              <p className={`text-[9px] font-bold uppercase tracking-[0.18em] ${labelClass}`}>Cartas</p>
              <p className="reader-display mt-1 text-[1.12rem] font-semibold leading-none">{letterCount}</p>
            </div>
            <div className="text-center">
              <p className={`text-[9px] font-bold uppercase tracking-[0.18em] ${labelClass}`}>Imagenes</p>
              <p className="reader-display mt-1 text-[1.12rem] font-semibold leading-none">{imageCount}</p>
            </div>
          </div>
          <div className="grid gap-3 px-3.5 py-3">
            <div className="flex flex-col gap-2">
              <p className={`text-[9px] font-bold uppercase tracking-[0.18em] ${labelClass}`}>Actores clave</p>
              <div className="flex flex-wrap gap-1.5">
                {keyActors.map((item) => (
                  <span
                    key={item}
                    className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${chipClass}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className={`h-px ${tone === 'ink' ? 'bg-white/10' : 'bg-[#e0d7c7]'}`} />
            <div className="flex flex-col gap-2">
              <p className={`text-[9px] font-bold uppercase tracking-[0.18em] ${labelClass}`}>Lugares clave</p>
              <div className="flex flex-wrap gap-1.5">
                {keyPlaces.map((item) => (
                  <span
                    key={item}
                    className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${chipClass}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between gap-3 border-t pt-3 ${lineClass}`}>
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-[0.18em] ${labelClass}`}>Lectura sugerida</p>
            <p className={`mt-1 text-[12px] leading-[1.45] ${subTextClass}`}>Empieza por overview y archivo.</p>
          </div>
          <LabV2Button label="Ver ficha" tone={tone === 'ink' ? 'primary' : 'secondary'} className="shrink-0" />
        </div>
      </div>
    </article>
  );
}
