"use client";

import { useMemo, useState } from 'react';
import { StitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';

export interface CartaReadyTranscriptPanelProps {
  readonly data: Readonly<StitchCartaReadyViewData>;
  readonly maxHeightClass?: string;
}

export default function CartaReadyTranscriptPanel({
  data,
  maxHeightClass = 'lg:max-h-[calc(100vh-24rem)]',
}: Readonly<CartaReadyTranscriptPanelProps>) {
  const [mode, setMode] = useState<'modernizada' | 'literal'>('modernizada');

  const paragraphs = useMemo(() => {
    return mode === 'modernizada' ? data.modernizadaParagraphs : data.literalParagraphs;
  }, [data.literalParagraphs, data.modernizadaParagraphs, mode]);

  return (
    <article className="order-1 lg:order-2 lg:border-l lg:border-[#d1cebd]/35 lg:pl-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8f7b53]">Transcripción de trabajo</p>
          <h2 className="mt-2 font-serif text-[1.6rem] font-semibold leading-[1.02] text-[#2c2c2a] sm:text-[1.85rem]">
            Transcripción
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6f6453]">
            Lectura continua del documento con cambio inmediato entre versión modernizada y literal, sin perder el manuscrito de vista.
          </p>
        </div>
        <div className="flex w-full items-center rounded-full border border-[#d1cebd]/70 bg-white/75 p-1 text-[10px] font-bold uppercase tracking-[0.16em] sm:w-auto">
          {(['modernizada', 'literal'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`flex-1 rounded-full px-4 py-2 transition-colors sm:flex-none ${
                mode === option ? 'bg-[#c5a059] text-white shadow-sm' : 'text-[#6f6453]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className={`overflow-hidden rounded-[1rem] border border-[#dcc8a6]/75 bg-[#f5efe0] shadow-[0_8px_18px_rgba(0,0,0,0.04)]`}>
        <div className="border-b border-[#dcc8a6]/70 bg-[#f3ecd7]/92 px-5 py-3 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Lectura activa</p>
              <p className="mt-1 text-xs text-[#6b5a44]">{data.documentIdentityLine}</p>
            </div>
            <span className="rounded-full border border-[#d9ccb4]/80 bg-white/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f7b53]">
              Scroll interno
            </span>
          </div>
        </div>

        <div className={`px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 ${maxHeightClass} lg:overflow-y-auto`}>
          <div className="font-serif text-[1rem] leading-[2rem] text-[#2c2c2a] sm:text-[1.04rem] sm:leading-[2.12rem] lg:text-[1.07rem] lg:leading-[2.24rem]">
            <h3 className="mb-5 border-b border-[#c5a059]/14 pb-3 text-[1.08rem] font-semibold italic leading-relaxed sm:text-[1.15rem]">
              {data.transcriptHeading}
            </h3>
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p
                  key={`${mode}-${index}`}
                  className={`text-left ${index === 0 ? 'mb-7 text-[1.12em] leading-[1.75] text-[#3a3127]' : 'mb-6'}`}
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <div className="rounded border border-dashed border-[#d1cebd] bg-white/40 px-5 py-5 text-sm text-[#6f6453]">
                No hay contenido disponible en este modo de lectura para esta carta.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#dcc8a6]/70 bg-white/45 px-5 py-3 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
            {mode === 'literal' ? 'Transcripción literal del CorpusBase' : 'Lectura modernizada del CorpusBase'}
          </p>
        </div>
      </div>
    </article>
  );
}
