import Link from 'next/link';
import { CartaDetail } from '@/lib/types';
import { LegajoCorpusVM } from '@/lib/view-models';

interface LetterPreviewPaneProps {
  legajo: LegajoCorpusVM;
  preview: CartaDetail | null;
}

export default function LetterPreviewPane({ legajo, preview }: LetterPreviewPaneProps) {
  if (!preview) {
    return (
      <aside className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#d4c4a8] bg-[#fdfbf7]/80 p-7 shadow-lg">
        {/* Decorative corner accents */}
        <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[#c9a030]/30" />
        <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[#c9a030]/30" />

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5efe3]">
            <svg className="h-5 w-5 text-[#a8956a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#a8956a]">Preview documental</p>
            <h3 className="reader-display mt-3 text-xl font-semibold text-[#1a1610]">Sin carta seleccionada</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6b5d4d]">Selecciona una carta del archivo para ver su contenido, metadatos y acceder al lector completo.</p>
          </div>
        </div>
      </aside>
    );
  }

  const hasVisualLayer = legajo.availability.imageEnhanced && preview.hasImages && preview.primaryImage;
  const teaserText = preview.transcripcion.modernizada.split('\n').filter(Boolean).slice(0, 1).join(' ');

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-[#e0d6c4] bg-white shadow-2xl">
      {/* Top decorative bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#c9a030] via-[#d4b848] to-[#c9a030]" />

      {/* Header section with subtle gradient background */}
      <div className="border-b border-[#efe5d3] bg-gradient-to-b from-[#fdfbf7] to-white px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#c9a030]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#a8956a]">Preview lateral</p>
        </div>
        <h3 className="reader-display mt-4 text-xl font-semibold leading-tight text-[#1a1610]">{preview.nombre_carta || `Carta ${preview.id_carta}`}</h3>
        <p className="mt-3 text-sm text-[#6b5d4d]">
          <span className="font-medium text-[#1a1610]">{preview.remitente || 'Remitente no identificado'}</span>
          <span className="mx-2 text-[#d4c4a8]">→</span>
          <span className="font-medium text-[#1a1610]">{preview.destinatario || 'Destinatario no identificado'}</span>
        </p>
      </div>

      {/* Manuscript image with ornate frame */}
      {hasVisualLayer ? (
        <div className="relative border-b border-[#efe5d3] bg-[#1a1610] p-5">
          {/* Inner frame decoration */}
          <div className="absolute inset-3 border border-[#c9a030]/20 pointer-events-none" />
          <div className="absolute inset-4 border border-[#c9a030]/10 pointer-events-none" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.primaryImage ?? ''}
            alt={`Preview de ${preview.id_carta}`}
            className="h-[260px] w-full rounded-lg object-contain shadow-2xl"
          />

          {/* Image label */}
          <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between">
            <span className="rounded bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9a030] backdrop-blur-sm">
              Manuscrito
            </span>
            {preview.imagenes && preview.imagenes.length > 1 && (
              <span className="rounded bg-black/60 px-2 py-1 text-[9px] font-medium text-white/80 backdrop-blur-sm">
                {preview.imagenes.length} páginas
              </span>
            )}
          </div>
        </div>
      ) : null}

      {/* Content section */}
      <div className="grid gap-5 px-6 py-6">
        {/* Date and place */}
        <div className="rounded-xl bg-[#f8f5ef] p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-4 w-4 text-[#a8956a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a8956a]">Fecha y lugar</span>
          </div>
          <p className="text-base font-medium text-[#1a1610]">
            {preview.fecha || 'Sin fecha'}
            {preview.lugar && <span className="text-[#6b5d4d]"> · {preview.lugar}</span>}
          </p>
        </div>

        {/* Teaser text */}
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#a8956a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a8956a]">Lectura de entrada</span>
          </div>
          <p className="line-clamp-4 leading-relaxed text-[#4a4235] italic font-serif">
            {teaserText || 'El corpus base ya permite lectura textual completa y navegación entre cartas.'}
          </p>
        </div>

        {/* CTA Button - Premium style */}
        <Link
          href={`/legajos/${legajo.id}/cartas/${preview.id_carta}`}
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#c9a030] bg-gradient-to-r from-[#c9a030] to-[#d4b848] px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:from-[#d4b848] hover:to-[#c9a030]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Abrir lector completo
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </Link>
      </div>

      {/* Bottom decorative corner */}
      <div className="absolute bottom-0 left-0 h-4 w-4 border-l-2 border-b-2 border-[#e0d6c4]" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-r-2 border-b-2 border-[#e0d6c4]" />
    </aside>
  );
}
