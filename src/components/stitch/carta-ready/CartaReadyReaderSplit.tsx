"use client";

import { useMemo, useState } from 'react';
import ManuscriptViewer from '@/components/reader/ManuscriptViewer';
import CartaReadyTranscriptPanel from '@/components/stitch/carta-ready/CartaReadyTranscriptPanel';
import CartaReadyWorkbenchDrawer, {
  CartaWorkbenchPanel,
} from '@/components/stitch/carta-ready/CartaReadyWorkbenchDrawer';
import { StitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';

export interface CartaReadyReaderSplitProps {
  readonly data: Readonly<StitchCartaReadyViewData>;
}

const PANEL_ITEMS: readonly { id: CartaWorkbenchPanel; label: string }[] = [
  { id: 'ficha', label: 'Ficha' },
  { id: 'contexto', label: 'Contexto' },
  { id: 'relacionados', label: 'Relacionados' },
];

export default function CartaReadyReaderSplit({ data }: Readonly<CartaReadyReaderSplitProps>) {
  const [activePanel, setActivePanel] = useState<CartaWorkbenchPanel | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const manuscriptImages = useMemo(() => data.manuscriptImages, [data.manuscriptImages]);
  const activeImage = manuscriptImages[activeImageIndex]?.src ?? data.manuscriptImage ?? '';
  const splitHeightClass = activePanel
    ? 'lg:min-h-[calc(100vh-30rem)]'
    : 'lg:min-h-[calc(100vh-22rem)]';
  const viewerHeightClass = activePanel
    ? 'h-[340px] sm:h-[430px] lg:h-[calc(100vh-32rem)]'
    : 'h-[360px] sm:h-[470px] lg:h-[calc(100vh-24rem)]';
  const transcriptHeightClass = activePanel
    ? 'lg:max-h-[calc(100vh-32rem)]'
    : 'lg:max-h-[calc(100vh-24rem)]';

  const togglePanel = (panel: CartaWorkbenchPanel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6 lg:px-12 lg:py-6">
      <div className="rounded-[1.2rem] border border-[#dccfb6]/75 bg-[#f7f2e8]/92 shadow-[0_22px_44px_rgba(91,75,42,0.08)]">
        <div className="border-b border-[#dccfb6]/65 px-4 py-3 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8f7b53]">Modo consulta</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6b5a44]">
                <span className="font-semibold text-[#2c2c2a]">{data.breadcrumbs[3]}</span>
                <span className="hidden text-[#c5a059] sm:inline">·</span>
                <span className="truncate">{data.documentIdentityLine}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PANEL_ITEMS.map((panel) => (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => togglePanel(panel.id)}
                  className={`rounded-full border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    activePanel === panel.id
                      ? 'border-[#c5a059] bg-[#f0e4c6] text-[#7b6331]'
                      : 'border-[#d8ccb3]/75 bg-white/65 text-[#6f6453] hover:border-[#c5a059] hover:text-[#a38420]'
                  }`}
                >
                  {panel.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`grid gap-6 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] lg:gap-8 lg:px-6 lg:py-6 ${splitHeightClass}`}>
          <article className="order-2 lg:order-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-[#2c2c2a] sm:text-[1.35rem]">Manuscrito</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
                {data.manuscriptImage ? 'ImageEnhanced' : 'Modo textual'}
              </span>
            </div>

            <div className="rounded-[1rem] border border-[#d8ccb3]/70 bg-[#2a241e] p-2.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.32),0_8px_16px_rgba(0,0,0,0.08)] sm:p-3">
              <div className={`overflow-hidden rounded-[0.8rem] bg-[#1c1915] ${viewerHeightClass}`}>
                <ManuscriptViewer src={activeImage} alt={data.manuscriptTitle} />
              </div>
            </div>

            <div className="mt-3 rounded-[0.95rem] border border-[#d8ccb3]/70 bg-white/55 p-3">
              {manuscriptImages.length > 1 ? (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Folios disponibles</p>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
                      {activeImageIndex + 1} / {manuscriptImages.length}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {manuscriptImages.map((image, index) => (
                      <button
                        key={`${image.src}-${index}`}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`shrink-0 overflow-hidden rounded-[0.75rem] border p-0.5 transition-colors ${
                          activeImageIndex === index
                            ? 'border-[#c5a059] bg-[#f3ecd7]'
                            : 'border-[#d8ccb3]/70 bg-[#fbf7ef]'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.src} alt={image.label} className="h-16 w-12 rounded-[0.55rem] object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
                    {data.manuscriptImageCount > 0 ? `Imagen disponible ${String(data.manuscriptImageCount).padStart(2, '0')}` : 'Sin manuscrito local adicional'}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Visor preparado</span>
                </div>
              )}
            </div>
          </article>

          <CartaReadyTranscriptPanel data={data} maxHeightClass={transcriptHeightClass} />
        </div>

        <div className="border-t border-[#dccfb6]/65 px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
          <CartaReadyWorkbenchDrawer data={data} activePanel={activePanel} />
        </div>
      </div>
    </section>
  );
}
