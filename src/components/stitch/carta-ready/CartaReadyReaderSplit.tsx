"use client";

import { useEffect, useMemo, useState } from 'react';
import { FileText, Network, ScanSearch } from 'lucide-react';
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

const PANEL_META: Record<CartaWorkbenchPanel, { icon: typeof FileText; title: string; description: string }> = {
  ficha: {
    icon: FileText,
    title: 'Ficha documental',
    description: 'Metadatos, referencia y localizacion archivistica.',
  },
  contexto: {
    icon: Network,
    title: 'Contexto',
    description: 'Entidades, claves y lectura contextual.',
  },
  relacionados: {
    icon: ScanSearch,
    title: 'Relacionados',
    description: 'Cartas del mismo entorno epistolar.',
  },
};

export default function CartaReadyReaderSplit({ data }: Readonly<CartaReadyReaderSplitProps>) {
  const [activePanel, setActivePanel] = useState<CartaWorkbenchPanel | null>(null);
  const [renderedPanel, setRenderedPanel] = useState<CartaWorkbenchPanel | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [transcriptHidden, setTranscriptHidden] = useState(false);

  const manuscriptImages = useMemo(() => data.manuscriptImages, [data.manuscriptImages]);
  const activeImage = manuscriptImages[activeImageIndex]?.src ?? data.manuscriptImage ?? '';
  const hasTranscriptOverflow =
    data.modernizadaParagraphs.length > 3 ||
    data.literalParagraphs.length > 3 ||
    (data.modernizadaParagraphs.join(' ').length > 1200 || data.literalParagraphs.join(' ').length > 1200);
  const useInlinePanel = !hasTranscriptOverflow && !transcriptHidden;

  useEffect(() => {
    if (activePanel && !useInlinePanel) {
      setRenderedPanel(activePanel);
      const frame = window.requestAnimationFrame(() => {
        setIsPanelVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    setIsPanelVisible(false);
    const timeout = window.setTimeout(() => {
      setRenderedPanel(null);
    }, 220);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [activePanel, useInlinePanel]);

  const togglePanel = (panel: CartaWorkbenchPanel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <section className="flex h-full min-h-0 flex-col px-2.5 py-2 sm:px-3 lg:px-3.5 lg:py-2.5">
      <div className="relative min-h-0 flex-1 py-2">
        <div
          className={`grid h-full min-h-0 gap-3 ${
            transcriptHidden
              ? 'grid-cols-1'
              : 'lg:grid-cols-[minmax(0,0.84fr)_minmax(640px,1.16fr)]'
          } lg:gap-3`}
        >
          <article className="order-2 flex min-h-0 flex-col lg:order-1">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[0.95rem] bg-[linear-gradient(180deg,#241d17_0%,#18120e_100%)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(94,72,34,0.18),0_18px_34px_rgba(0,0,0,0.07)] sm:p-2">
              <div
                className={`mx-auto h-full w-full overflow-hidden rounded-[0.72rem] bg-[#171410] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] ${
                  transcriptHidden ? 'max-w-[1080px]' : 'max-w-[620px] xl:max-w-[640px]'
                }`}
              >
                <ManuscriptViewer
                  src={activeImage}
                  alt={data.manuscriptTitle}
                  transcriptHidden={transcriptHidden}
                  onToggleTranscript={() => setTranscriptHidden((current) => !current)}
                />
              </div>

              {manuscriptImages.length > 1 ? (
                <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 sm:inset-x-2 sm:bottom-2">
                  <div className="rounded-[0.9rem] bg-[linear-gradient(180deg,rgba(23,20,16,0.08),rgba(23,20,16,0.8))] p-2 backdrop-blur-[2px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_8px_18px_rgba(0,0,0,0.16)]">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e6d8b7]">Folios</p>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e6d8b7]">
                        {activeImageIndex + 1} / {manuscriptImages.length}
                      </span>
                    </div>
                    <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1">
                      {manuscriptImages.map((image, index) => (
                        <button
                          key={`${image.src}-${index}`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`group shrink-0 overflow-hidden rounded-[0.85rem] border p-0.5 transition-all duration-200 ${
                            activeImageIndex === index
                              ? 'border-[#e3c06b] bg-[#f3ecd7] shadow-[0_0_0_1px_rgba(227,192,107,0.3)]'
                              : 'border-white/10 bg-[#fbf7ef]'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.src}
                            alt={image.label}
                            className="h-14 w-10 rounded-[0.65rem] object-cover transition-transform duration-200 group-hover:scale-[1.12] sm:h-16 sm:w-11"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </article>

          {!transcriptHidden ? (
            <CartaReadyTranscriptPanel
              data={data}
              maxHeightClass="h-full lg:h-full"
              utilityDock={
                <div className="space-y-3">
                  <div
                    className={`grid gap-3 ${
                      hasTranscriptOverflow ? 'lg:sticky lg:bottom-0 lg:bg-[linear-gradient(180deg,rgba(239,229,208,0),#f0e5d1_28%)] lg:pt-10' : ''
                    } sm:grid-cols-3`}
                  >
                    {PANEL_ITEMS.map((panel) => {
                      const meta = PANEL_META[panel.id];
                      const Icon = meta.icon;

                      return (
                        <button
                          key={panel.id}
                          type="button"
                          onClick={() => togglePanel(panel.id)}
                          className={`group rounded-[1rem] border px-4 py-4 text-left transition-all ${
                            activePanel === panel.id
                              ? 'border-[#c5a059]/80 bg-[linear-gradient(180deg,#f3e7c9_0%,#ead7ab_100%)] text-[#5d4518] shadow-[inset_0_0_0_1px_rgba(197,160,89,0.42),0_16px_28px_rgba(86,64,24,0.1)]'
                              : 'border-[#e1d3b9]/92 bg-[linear-gradient(180deg,#fffaf1_0%,#f8efdd_100%)] text-[#4f4333] shadow-[0_10px_18px_rgba(112,82,27,0.05)] hover:-translate-y-0.5 hover:border-[#c5a059]/55 hover:shadow-[0_16px_28px_rgba(112,82,27,0.09)]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.85rem] ${
                                  activePanel === panel.id
                                    ? 'bg-[#fff7e4] text-[#7c5c1a] shadow-[inset_0_0_0_1px_rgba(197,160,89,0.26)]'
                                    : 'bg-[#f4ead4] text-[#8c6a2c] shadow-[inset_0_0_0_1px_rgba(216,204,183,0.56)]'
                                }`}
                              >
                                <Icon size={18} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a754b]">{panel.label}</p>
                                <p className="mt-1 text-[0.97rem] font-semibold leading-none">{meta.title}</p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                activePanel === panel.id
                                  ? 'bg-white/62 text-[#8c6b28]'
                                  : 'bg-[#f4ecda] text-[#9b8252] group-hover:bg-[#f5ead1]'
                              }`}
                            >
                              {activePanel === panel.id ? 'abierto' : 'abrir'}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-[#5d5243]">{meta.description}</p>
                        </button>
                      );
                    })}
                  </div>
                  {activePanel && useInlinePanel ? (
                    <div className="rounded-[1.05rem] bg-[linear-gradient(180deg,#fbf5e8_0%,#f4ead4_100%)] p-3 shadow-[inset_0_0_0_1px_rgba(217,198,155,0.78),0_18px_30px_rgba(95,71,24,0.08)]">
                      <CartaReadyWorkbenchDrawer data={data} activePanel={activePanel} embedded />
                    </div>
                  ) : null}
                </div>
              }
            />
          ) : null}
        </div>

        {renderedPanel && !useInlinePanel ? (
          <div
            className={`absolute inset-0 z-[80] transition-all duration-200 ${
              isPanelVisible ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <button
              type="button"
              aria-label="Cerrar panel contextual"
              onClick={() => setActivePanel(null)}
              className={`absolute inset-0 w-full transition-[opacity,backdrop-filter] duration-200 ${
                isPanelVisible ? 'bg-[rgba(33,25,15,0.18)] opacity-100 backdrop-blur-[1.5px]' : 'opacity-0'
              }`}
            />

            <div
              className={`absolute inset-x-2 bottom-2 top-10 flex items-end justify-center transition-all duration-200 sm:inset-x-3 sm:bottom-3 sm:top-12 ${
                isPanelVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              <div className="pointer-events-auto flex max-h-full w-full max-w-[1380px] flex-col">
                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-[#d7c8a8]/80 bg-[#f6efdf]/96 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a6435] shadow-[0_8px_24px_rgba(54,41,22,0.14)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <span aria-hidden="true" className="block h-1 w-8 rounded-full bg-[#c5a059]/80" />
                  Cerrar panel
                </button>

                <CartaReadyWorkbenchDrawer data={data} activePanel={renderedPanel} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
