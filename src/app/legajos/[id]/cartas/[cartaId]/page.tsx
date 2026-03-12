import Link from 'next/link';
import { getLegajos, getLegajoLetters, getCarta } from '@/lib/data/api';
import ManuscriptViewer from '@/components/reader/ManuscriptViewer';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Tag, ImageIcon } from 'lucide-react';
import { Suspense } from 'react';
import BackButtonWithState from '@/components/reader/BackButtonWithState';
import ScrollToTopButton from '@/components/reader/ScrollToTopButton';

export async function generateStaticParams() {
  const legajos = await getLegajos();
  const params: { id: string; cartaId: string }[] = [];

  for (const legajo of legajos) {
    const letters = await getLegajoLetters(legajo.legajoId);
    for (const letter of letters) {
      params.push({
        id: legajo.legajoId,
        cartaId: letter.id_carta,
      });
    }
  }

  return params;
}

export default async function CartaPage({ params }: { params: Promise<{ id: string; cartaId: string }> }) {
  const resolvedParams = await params;
  const legajoId = resolvedParams.id;
  const cartaId = resolvedParams.cartaId;

  const carta = await getCarta(legajoId, cartaId);

  if (!carta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8]">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#c5a028] mb-4">Carta no encontrada</h2>
          <Link href={`/legajos/${legajoId}`} className="text-[#5a5545] hover:underline">
            Volver al legajo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row min-h-screen xl:h-screen bg-[#fcfbf8] text-[#1b180d] xl:overflow-hidden">
      <div id="manuscript-panel" className="w-full h-[24svh] sm:h-[28svh] md:h-[45vh] xl:h-full xl:w-[55%] bg-[#2d2a26] relative border-b xl:border-b-0 xl:border-r border-[#e7e1cf] shrink-0 scroll-mt-20">
        <ManuscriptViewer
          src={carta.hasImages && carta.primaryImage ? carta.primaryImage : ''}
          alt={`Manuscrito original Carta ${cartaId}`}
        />
      </div>

      <div className="w-full xl:h-full xl:w-[45%] flex flex-col bg-[#fcfbf8] flex-1 relative">
        <div className="sticky top-0 z-30 xl:hidden bg-[#fcfbf8]/95 backdrop-blur-sm border-b border-[#e7e1cf] px-4 py-3 flex justify-between items-center gap-2 shadow-sm -mt-0.5">
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-[#a38420]">Legajo {legajoId}</span>
            <span className="font-serif font-bold text-[#2d2a26] text-sm">Carta {cartaId}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#manuscript-panel"
              className="inline-flex items-center gap-1 rounded-full border border-[#e7e1cf] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a5545]"
            >
              <ImageIcon size={12} />
              Ver manuscrito
            </a>
            <ScrollToTopButton />
          </div>
        </div>

        <header className="shrink-0 px-5 py-5 md:p-10 xl:p-14 xl:pb-10 border-b border-[#e7e1cf] bg-[#fcfbf8]">
          <Suspense fallback={<div className="h-6 mb-6" />}>
            <BackButtonWithState legajoId={legajoId} />
          </Suspense>

          <div className="mb-4 md:mb-6">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.24em] text-[#a38420] mb-2">Legajo {legajoId}</p>
            <h1 className="text-2xl md:text-5xl font-serif font-bold text-[#2d2a26]">Carta {cartaId}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:hidden">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e7e1cf] px-3 py-1.5 text-[11px] font-medium text-[#5a5545]">
              <Calendar size={12} className="text-[#c5a028]" />
              {carta.fecha || 'Sin fecha'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e7e1cf] px-3 py-1.5 text-[11px] font-medium text-[#5a5545]">
              <MapPin size={12} className="text-[#c5a028]" />
              {carta.lugar || 'Sin ubicación'}
            </span>
            {carta.temas && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f0e7] border border-[#e7e1cf] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a5545]">
                <Tag size={12} className="text-[#c5a028]" />
                {carta.temas.split(',')[0]?.trim()}
              </span>
            )}
          </div>

          <details className="mt-4 rounded-2xl border border-[#e7e1cf] bg-white md:hidden">
            <summary className="cursor-pointer list-none px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#5a5545]">
              Metadatos de la carta
            </summary>
            <div className="border-t border-[#e7e1cf] px-4 py-4 text-xs text-[#5a5545] space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a38420] mb-1">De</p>
                <p className="font-semibold text-[#1b180d] text-sm leading-tight">{carta.remitente || 'Desconocido'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a38420] mb-1">Para</p>
                <p className="font-semibold text-[#1b180d] text-sm leading-tight">{carta.destinatario || 'Desconocido'}</p>
              </div>
              {carta.temas && (
                <div className="flex items-start gap-2">
                  <Tag size={12} className="text-[#c5a028] mt-0.5 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {carta.temas.split(',').map((tema) => (
                      <span key={tema.trim()} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a5545] bg-[#e7e1cf]/40 px-2 py-1 rounded-full">
                        {tema.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>

          <div className="hidden md:flex flex-col gap-3 xl:gap-4 text-xs xl:text-sm text-[#5a5545] border-t border-[#e7e1cf] pt-4 xl:pt-6 mt-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <span className="w-8 shrink-0 font-bold uppercase tracking-widest text-[#a38420] text-[9px] xl:text-[10px] pt-0.5">De:</span>
                <span className="font-semibold text-[#1b180d] text-sm xl:text-base leading-tight">{carta.remitente || 'Desconocido'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-8 shrink-0 font-bold uppercase tracking-widest text-[#a38420] text-[9px] xl:text-[10px] pt-0.5">Para:</span>
                <span className="font-semibold text-[#1b180d] text-sm xl:text-base leading-tight">{carta.destinatario || 'Desconocido'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 xl:gap-x-6 gap-y-2 pt-1 border-[#e7e1cf]">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-[#c5a028] xl:w-3.5 xl:h-3.5" />
                <span>{carta.fecha || 'Sin fecha'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#c5a028] xl:w-3.5 xl:h-3.5" />
                <span>{carta.lugar || 'Sin ubicación'}</span>
              </div>
            </div>

            {carta.temas && (
              <div className="flex items-start xl:items-center gap-2 pt-1">
                <Tag size={12} className="text-[#c5a028] mt-0.5 shrink-0 xl:w-3.5 xl:h-3.5" />
                <div className="flex flex-wrap gap-1 md:gap-1.5">
                  {carta.temas.split(',').map((tema) => (
                    <span key={tema.trim()} className="text-[9px] xl:text-[10px] font-bold uppercase tracking-widest text-[#5a5545] bg-[#e7e1cf]/30 px-1.5 py-0.5 rounded">
                      {tema.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <article id="reading-panel" className="flex-1 xl:overflow-y-auto px-5 py-6 md:p-10 xl:p-14 xl:px-20 pb-24 bg-white xl:shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)] scroll-mt-20">
          <div className="max-w-prose mx-auto">
            <div className="font-serif text-[1.02rem] md:text-[1.15rem] leading-[1.9] text-[#2d2a26] space-y-5 md:space-y-6">
              {carta.transcripcion?.modernizada ? (
                carta.transcripcion.modernizada.split('\n').map((paragraph, index) => (
                  <p key={index} className={index === 0 ? 'first-letter:text-4xl first-letter:font-bold first-letter:text-[#c5a028] first-line:tracking-wide' : ''}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="italic text-[#8c8571] text-center p-12 border border-dashed border-[#e7e1cf] rounded-2xl">
                  La transcripción de lectura de esta carta está en proceso de digitalización.
                </p>
              )}
            </div>

            {carta.transcripcion?.literal && (
              <details className="mt-12 group">
                <summary className="cursor-pointer text-sm font-bold uppercase tracking-widest text-[#c5a028] select-none">
                  Ver transcripción literal
                </summary>
                <div className="mt-6 font-mono text-sm leading-8 text-[#5a5545] bg-[#f3f0e7] p-6 rounded-lg whitespace-pre-wrap">
                  {carta.transcripcion.literal}
                </div>
              </details>
            )}
          </div>
        </article>

        <footer className="shrink-0 bg-white border-t border-[#e7e1cf] p-4 px-6 md:px-10 flex justify-between items-center z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="w-1/2 pr-2">
            {carta.previousCartaId ? (
              <Link
                href={`/legajos/${legajoId}/cartas/${carta.previousCartaId}`}
                className="group flex flex-col items-start hover:bg-[#f3f0e7] p-2 -ml-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#5a5545] group-hover:text-[#c5a028] transition-colors mb-1">
                  <ChevronLeft size={14} className="-ml-1" /> Anterior
                </div>
                <div className="text-sm font-semibold truncate w-full text-[#1b180d]">Carta {carta.previousCartaId}</div>
              </Link>
            ) : (
              <div className="text-xs text-[#e7e1cf] font-medium p-2 cursor-default">Fin del legajo</div>
            )}
          </div>

          <div className="w-px h-8 bg-[#e7e1cf]" />

          <div className="w-1/2 pl-2 flex flex-col items-end">
            {carta.nextCartaId ? (
              <Link
                href={`/legajos/${legajoId}/cartas/${carta.nextCartaId}`}
                className="group flex flex-col items-end hover:bg-[#f3f0e7] p-2 -mr-2 rounded-lg transition-colors text-right"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#5a5545] group-hover:text-[#c5a028] transition-colors mb-1">
                  Siguiente <ChevronRight size={14} className="-mr-1" />
                </div>
                <div className="text-sm font-semibold truncate w-full text-[#1b180d]">Carta {carta.nextCartaId}</div>
              </Link>
            ) : (
              <div className="text-xs text-[#e7e1cf] font-medium p-2 cursor-default">Fin del legajo</div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

