'use client';

import { Lora, Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Download, Eye, Maximize2, Minimize2, Minus, Plus, Quote, ScanSearch, Share2, ZoomIn, ZoomOut } from 'lucide-react';
import { TransformComponent, TransformWrapper, useControls } from 'react-zoom-pan-pinch';
import ArcaTopBar from '@/components/navigation/ArcaTopBar';
import type { StitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';

const cartaDisplayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-carta-display',
});

const cartaBodyFont = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-carta-body',
});

export interface CartaViewV2Props {
  readonly data: Readonly<StitchCartaReadyViewData>;
  readonly backHref?: string;
  readonly alternateHref?: string;
  readonly alternateLabel?: string;
}

type TranscriptMode = 'modernizada' | 'literal';
type AccordionPanel = 'ficha' | 'contexto' | 'relacionados';

type TranscriptParagraph = {
  readonly marker?: string;
  readonly text: string;
};

function normalizeLookupKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[ÃÂ]/g, '')
    .toLowerCase();
}

function findMetadataValue(
  columns: readonly StitchCartaReadyViewData['metadataColumns'][number][],
  title: string,
  label: string,
) {
  const normalizedTitle = normalizeLookupKey(title);
  const normalizedLabel = normalizeLookupKey(label);

  return columns
    .find((column) => normalizeLookupKey(column.title) === normalizedTitle)
    ?.items.find((item) => normalizeLookupKey(item.label) === normalizedLabel)?.value;
}

function renderHighlightedTitle(title: string, highlights: readonly string[]) {
  let segments: ReactNode[] = [title];

  highlights
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .forEach((highlight) => {
      segments = segments.flatMap((segment, index) => {
        if (typeof segment !== 'string') {
          return [segment];
        }

        const parts = segment.split(highlight);
        if (parts.length === 1) {
          return [segment];
        }

        return parts.flatMap((part, partIndex) => {
          const nodes: ReactNode[] = [];
          if (part) {
            nodes.push(<Fragment key={`${highlight}-${index}-text-${partIndex}`}>{part}</Fragment>);
          }
          if (partIndex < parts.length - 1) {
            nodes.push(
              <span
                key={`${highlight}-${index}-mark-${partIndex}`}
                className="font-semibold italic text-[#241911]"
              >
                {highlight}
              </span>,
            );
          }
          return nodes;
        });
      });
    });

  return segments;
}

function normalizeInlineText(value: string) {
  return value
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/Transcripci[oó]n\s+(literal|modernizada)\s*$/gim, '')
    .replace(/[ÃÂ]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

function buildTranscriptParagraphs(paragraphs: readonly string[]) {
  const joined = paragraphs
    .join('\n\n')
    .replace(/\r/g, '')
    .replace(/Transcripci[oó]n\s+(literal|modernizada)\s*$/gim, '')
    .replace(/\[\s*(\d+)\s*[§Â§]\s*\]/g, '\n\n[[marker:$1]] ')
    .replace(/\n{3,}/g, '\n\n');

  return joined
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const match = chunk.match(/^\[\[marker:(\d+)\]\]\s*([\s\S]*)$/);
      const marker = match?.[1];
      const text = normalizeInlineText(match?.[2] ?? chunk);
      return text ? ({ marker, text } as TranscriptParagraph) : null;
    })
    .filter(Boolean) as TranscriptParagraph[];
}

function buildRegesto({
  subtitle,
  sender,
  recipient,
  place,
  date,
  thematicTags,
}: {
  subtitle: string;
  sender: string;
  recipient: string;
  place: string;
  date: string;
  thematicTags: readonly { label: string }[];
}) {
  if (subtitle && !/consulta documental/i.test(subtitle)) {
    return subtitle;
  }

  const topic = thematicTags[0]?.label ? ` en torno a ${thematicTags[0].label.toLowerCase()}` : '';
  const placePart = place ? ` desde ${place}` : '';
  const datePart = date ? `, fechada el ${date}` : '';
  const senderPart = sender || 'Carta de remitente no identificado';
  const recipientPart = recipient ? ` a ${recipient}` : '';

  return `${senderPart}${recipientPart}${placePart}${datePart}${topic}.`;
}

function ViewerHud({
  transcriptHidden,
  onToggleTranscript,
  zoomPercent,
}: {
  transcriptHidden: boolean;
  onToggleTranscript: () => void;
  zoomPercent: number;
}) {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const isFullscreen = typeof document !== 'undefined' && Boolean(document.fullscreenElement);

  return (
    <div className="manuscript-hud absolute bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-max -translate-x-1/2">
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/12 bg-[rgba(22,18,15,0.6)] px-2 py-1.5 text-[#f6efdf] shadow-[0_20px_42px_rgba(13,10,8,0.22)] backdrop-blur-lg">
        <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#dcc28a]">
          {zoomPercent}%
        </span>
        <button type="button" onClick={() => zoomOut(0.2)} className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/8 hover:text-[#e3c681]" aria-label="Alejar manuscrito">
          <ZoomOut size={14} />
        </button>
        <button type="button" onClick={() => resetTransform()} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-white/8 hover:text-[#e3c681]">
          <ScanSearch size={13} />
          Ajustar
        </button>
        <button type="button" onClick={() => zoomIn(0.2)} className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/8 hover:text-[#e3c681]" aria-label="Acercar manuscrito">
          <ZoomIn size={14} />
        </button>
        <div className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />
        <button type="button" onClick={onToggleTranscript} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] transition-colors ${transcriptHidden ? 'bg-[#e1c582] text-[#2a1e12]' : 'hover:bg-white/8 hover:text-[#e3c681]'}`}>
          <Eye size={13} />
          {transcriptHidden ? 'Ver lectura' : 'Solo manuscrito'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (document.fullscreenElement) {
              void document.exitFullscreen();
            } else {
              void document.documentElement.requestFullscreen();
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-white/8 hover:text-[#e3c681]"
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          Pantalla
        </button>
      </div>
    </div>
  );
}

function AccordionItem({ id, title, open, onToggle, children }: { id: AccordionPanel; title: string; open: boolean; onToggle: (id: AccordionPanel) => void; children: ReactNode; }) {
  return (
    <section className="border-t border-[#17120d]/14 first:border-t">
      <button type="button" onClick={() => onToggle(id)} className="group flex w-full items-center justify-between gap-6 px-0 py-3 text-left transition-colors hover:bg-[rgba(172,149,100,0.04)]">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#3f372f]">{title}</p>
        </div>
        <span className="inline-flex h-6 w-6 items-center justify-center text-[#756954] transition-colors group-hover:text-[#8f6b2a]">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows,padding] duration-300 ease-in-out ${open ? 'grid-rows-[1fr] pb-3 pt-1' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

export default function CartaViewV2({
  data,
  backHref = '/ui-lab',
  alternateHref,
  alternateLabel = 'Versión clásica',
}: Readonly<CartaViewV2Props>) {
  const navRef = useRef<HTMLDivElement | null>(null);
  const readingPanelRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<TranscriptMode>('modernizada');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [transcriptHidden, setTranscriptHidden] = useState(false);
  const [openPanel, setOpenPanel] = useState<AccordionPanel | null>(null);
  const [zoomPercent, setZoomPercent] = useState(94);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  const transcriptParagraphs = useMemo(
    () => buildTranscriptParagraphs(mode === 'modernizada' ? data.modernizadaParagraphs : data.literalParagraphs),
    [data.literalParagraphs, data.modernizadaParagraphs, mode],
  );

  const manuscriptImages = data.manuscriptImages.length > 0 ? data.manuscriptImages : data.manuscriptImage ? [{ src: data.manuscriptImage, label: 'Imagen principal' }] : [];
  const activeImage = manuscriptImages[activeImageIndex]?.src ?? data.manuscriptImage ?? '';

  const sender = findMetadataValue(data.metadataColumns, 'Correspondencia', 'Remitente') ?? '';
  const recipient = findMetadataValue(data.metadataColumns, 'Correspondencia', 'Destinatario') ?? '';
  const signatura = findMetadataValue(data.metadataColumns, 'Identificación documental', 'Signatura') ?? '';
  const date = findMetadataValue(data.metadataColumns, 'Identificación documental', 'Fecha de emisión') ?? '';
  const place = findMetadataValue(data.metadataColumns, 'Localización y contexto archivístico', 'Lugar de origen') ?? '';
  const support = findMetadataValue(data.metadataColumns, 'Identificación documental', 'Soporte') ?? '';
  const language = data.documentaryContext.find((item) => normalizeLookupKey(item.label) === 'idioma')?.value ?? '';
  const hasDisplayLanguage = Boolean(language) && normalizeLookupKey(language) !== 'sin idioma especificado';

  const displayMetadata = [
    signatura ? { label: 'Signatura', value: signatura } : null,
    date ? { label: 'Fecha', value: date } : null,
    place ? { label: 'Origen', value: place } : null,
    hasDisplayLanguage ? { label: 'Idioma', value: language } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const regesto = useMemo(() => buildRegesto({ subtitle: data.subtitle, sender, recipient, place, date, thematicTags: data.thematicTags }), [data.subtitle, date, place, recipient, sender, data.thematicTags]);

  const fichaRows = [
    sender ? { label: 'Remitente', value: sender } : null,
    recipient ? { label: 'Destinatario', value: recipient } : null,
    support ? { label: 'Soporte', value: support } : null,
    ...data.documentaryContext.filter((item) => normalizeLookupKey(item.label) !== 'idioma' || hasDisplayLanguage).map((item) => ({ label: item.label, value: item.value })),
    { label: 'Dimensiones', value: 'Folio vertical, aprox. 21 × 31 cm' },
    { label: 'Conservación', value: 'Papel manuscrito con desgaste y roturas menores en bordes' },
  ].filter(Boolean) as { label: string; value: string }[];

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof window === 'undefined') {
      return undefined;
    }
    const updateHeight = () => {
      document.documentElement.style.setProperty('--carta-v2-nav-height', `${nav.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(nav);
    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  useEffect(() => {
    const panel = readingPanelRef.current;
    if (!panel) {
      return undefined;
    }
    const updateProgress = () => {
      const maxScroll = panel.scrollHeight - panel.clientHeight;
      setReadingProgress(maxScroll > 0 ? Math.min(100, (panel.scrollTop / maxScroll) * 100) : 0);
    };
    updateProgress();
    panel.addEventListener('scroll', updateProgress, { passive: true });
    return () => {
      panel.removeEventListener('scroll', updateProgress);
    };
  }, [transcriptHidden, mode]);

  return (
    <div className={`${cartaDisplayFont.variable} ${cartaBodyFont.variable} carta-v2-shell h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(248,245,239,1)_0%,rgba(241,236,229,1)_52%,rgba(232,225,214,1)_100%)] text-[#1f1812]`}>
      <div ref={navRef} className="w-full">
        <ArcaTopBar defaultOpenId={null} surface="flush" />
      </div>

      <div className="mx-auto h-[calc(100dvh-var(--carta-v2-nav-height,168px))] max-w-[1880px] px-2 pb-2 pt-2 sm:px-3 lg:px-4">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.7rem] border border-[#d7ccbb]/70 bg-[#f7f4ee] shadow-[0_26px_64px_rgba(44,33,19,0.14)]">
          <div className={`${transcriptHidden ? 'block h-full' : 'grid h-full min-h-0 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]'}`}>
            <aside className="relative min-h-0 overflow-hidden bg-[linear-gradient(180deg,#f4f0e8_0%,#ece5da_100%)]">
              <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(97,74,43,0.09)_1px,transparent_0)] [background-size:18px_18px]" />
              <div className="relative z-10 flex h-full min-h-0 flex-col px-4 py-3 sm:px-5 lg:px-6">
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <div className={`relative flex h-full w-full min-h-0 items-center justify-center ${activeParagraph !== null ? 'scale-[1.003]' : ''} transition-transform duration-300`}>
                    <div className="absolute right-0 top-2 z-30 hidden xl:flex xl:flex-col xl:items-end xl:gap-1.5">
                      <div className="flex flex-col rounded-full bg-[rgba(255,252,246,0.62)] p-1 shadow-[0_12px_28px_rgba(36,28,19,0.08)] ring-1 ring-[#d7ccbb]/70 backdrop-blur-sm">
                        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#514638] transition-all hover:bg-white/80 hover:text-[#8d6728]" aria-label="Citar"><Quote size={14} /></button>
                        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#514638] transition-all hover:bg-white/80 hover:text-[#8d6728]" aria-label="Descargar"><Download size={14} /></button>
                        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#514638] transition-all hover:bg-white/80 hover:text-[#8d6728]" aria-label="Compartir"><Share2 size={14} /></button>
                      </div>
                    </div>
                    <TransformWrapper initialScale={0.94} minScale={0.55} maxScale={4} centerOnInit centerZoomedOut wheel={{ step: 0.1 }} onTransformed={(_, state) => setZoomPercent(Math.round(state.scale * 100))}>
                      {() => (
                        <>
                          <TransformComponent wrapperClass="!h-full !w-full manuscript-viewer" contentClass="!h-full !w-full flex items-center justify-center">
                            {activeImage ? (
                              <img src={activeImage} alt={data.manuscriptTitle} className={`academic-manuscript max-h-full w-auto max-w-full object-contain transition-[filter,transform,box-shadow] duration-300 ${activeParagraph !== null ? 'ring-1 ring-[#b6924d]/18' : ''}`} style={{ filter: 'contrast(1.02) brightness(1.01) saturate(0.94) sepia(0.03)' }} />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-center text-[#8b7d69]"><p className="italic [font-family:var(--font-carta-body),serif]">Manuscrito no disponible</p></div>
                            )}
                          </TransformComponent>
                          <ViewerHud transcriptHidden={transcriptHidden} onToggleTranscript={() => setTranscriptHidden((current) => !current)} zoomPercent={zoomPercent} />
                        </>
                      )}
                    </TransformWrapper>
                  </div>
                </div>
                {manuscriptImages.length > 1 ? (
                  <div className="mt-2 flex shrink-0 gap-3 overflow-x-auto pb-1">
                    {manuscriptImages.map((image, index) => (
                      <button key={`${image.src}-${index}`} type="button" onClick={() => setActiveImageIndex(index)} className={`group shrink-0 rounded-[0.85rem] border p-0.5 transition-all duration-200 ${activeImageIndex === index ? 'border-[#1a140e] bg-[linear-gradient(180deg,#efe2bb_0%,#dcc180_100%)] shadow-[0_10px_24px_rgba(45,33,19,0.12)] opacity-100' : 'border-[#d8cdbe] bg-white/66 opacity-65 hover:border-[#c8a45d]/45 hover:bg-white/88 hover:opacity-100'}`}>
                        <img src={image.src} alt={image.label} className="h-16 w-12 rounded-[0.65rem] object-cover transition-transform duration-200 group-hover:scale-[1.04]" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </aside>
            {!transcriptHidden ? (
              <section className="relative flex min-h-0 flex-col border-l border-[#17120d]/8 bg-[#fffdf9] shadow-[-10px_0_20px_rgba(0,0,0,0.03)]">
                <div className="absolute left-0 top-0 z-20 h-[2px] w-full bg-transparent">
                  <div className="h-full bg-[linear-gradient(90deg,#c9a25c_0%,#e1c582_100%)] transition-[width] duration-150" style={{ width: `${readingProgress}%` }} />
                </div>
                <article className="mx-auto flex h-full min-h-0 max-w-[72ch] flex-1 flex-col overflow-hidden px-5 py-4 sm:px-7 lg:px-9 xl:pl-16 xl:pr-10">
                  <header className="shrink-0">
                    <div className="flex items-center justify-between gap-4 border-b border-transparent pb-1">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#6a6157]">
                        <span className="inline-flex items-center gap-1.5"><span>Legajo 10</span><span className="opacity-45">›</span></span>
                        <span>Carta 1135</span>
                      </div>
                      <div className="hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6a6157] lg:flex">
                        <Link href={backHref} className="inline-flex items-center gap-1.5 transition-colors hover:text-[#8d6728] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6a25d]/35"><ArrowLeft size={13} />Volver</Link>
                        {alternateHref ? (
                          <Link
                            href={alternateHref}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#d9c9ae] bg-white/72 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
                          >
                            {alternateLabel}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 max-w-[64ch]">
                      <h1 className="text-[1.85rem] font-semibold leading-[0.92] tracking-[-0.045em] text-[#16110d] sm:text-[2.15rem] lg:text-[2.45rem] [font-family:var(--font-carta-display),serif]">{renderHighlightedTitle(data.title, [sender, recipient])}</h1>
                      <p className="mt-3 max-w-[52ch] text-[0.95rem] italic leading-[1.62] text-[#5b4e40] sm:text-[1rem] [font-family:var(--font-carta-body),serif]">{regesto}</p>
                    </div>
                    <div className="mt-5 border-y border-[#17120d]/8">
                      <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                        {displayMetadata.map((item, index) => (
                          <div key={item.label} className={`px-3 py-2.5 ${index < displayMetadata.length - 1 ? 'border-r border-[#17120d]/8' : ''}`}>
                            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#6a6054]">{item.label}</p>
                            <p className="mt-1 text-[0.97rem] leading-[1.22] text-[#17120e] [font-family:var(--font-carta-body),serif]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </header>
                  <div className="mt-5 flex shrink-0 items-end justify-between gap-3">
                    <div className="flex min-w-0 items-end gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-[#80735f]">Lectura</p>
                        <h2 className="mt-1 text-[1.55rem] font-semibold leading-[0.94] tracking-[-0.03em] text-[#15110d] sm:text-[1.75rem] [font-family:var(--font-carta-display),serif]">Transcripción</h2>
                      </div>
                      <span className="mb-1 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[#8e8374] md:inline-flex">{mode === 'modernizada' ? 'Lectura actualizada' : 'Transcripción fiel'}</span>
                    </div>
                    <div className="inline-flex rounded-[0.8rem] bg-[#f2efe9] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      {(['modernizada', 'literal'] as const).map((option) => (
                        <button key={option} type="button" onClick={() => setMode(option)} className={`rounded-[0.62rem] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] transition-all duration-200 ${mode === option ? 'bg-white text-[#1c1611] shadow-[0_6px_14px_rgba(27,20,12,0.1)]' : 'text-[#736758] hover:text-[#231b14]'}`}>{option}</button>
                      ))}
                    </div>
                  </div>
                  <div ref={readingPanelRef} className="mt-4 min-h-0 flex-1 overflow-y-auto pr-3 pb-16 carta-v2-scroll">
                    <div key={mode} className="space-y-5 text-[1rem] leading-[1.78] text-[#2b231b] animate-[cartaFade_180ms_ease-out] sm:text-[1.04rem] [font-family:var(--font-carta-body),serif]">
                      {transcriptParagraphs.length > 0 ? (
                        transcriptParagraphs.map((paragraph, index) => (
                          <div key={`${mode}-${index}`} className="relative pl-10" onMouseEnter={() => setActiveParagraph(index)} onMouseLeave={() => setActiveParagraph((current) => (current === index ? null : current))}>
                            {paragraph.marker ? <span className="absolute left-0 top-[0.38rem] text-[11px] font-medium uppercase tracking-[0.12em] text-[#9f9486]">§{paragraph.marker}</span> : null}
                            <p className={`max-w-[65ch] text-left transition-colors duration-200 ${index === 0 ? 'drop-cap' : ''} ${activeParagraph === index ? 'text-[#16120e]' : ''}`} style={{ hyphens: 'auto', orphans: 2, widows: 2 }}>
                              {paragraph.text}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[#6d604c]">No hay contenido disponible en este modo de lectura.</p>
                      )}
                    </div>
                  </div>
                  <div className="relative z-10 shrink-0 bg-[#fffdf9] pt-4 shadow-[0_-20px_30px_rgba(255,255,255,0.95)]">
                    <AccordionItem id="ficha" title="Ficha" open={openPanel === 'ficha'} onToggle={(id) => setOpenPanel((current) => (current === id ? null : id))}>
                      <div className="grid gap-y-2 md:grid-cols-[130px_minmax(0,1fr)] md:gap-x-6">
                        {fichaRows.map((item) => (
                          <Fragment key={item.label}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#716555]">{item.label}</p>
                            <p className="text-[13px] leading-relaxed text-[#2c241c] [font-family:var(--font-carta-body),serif]">{item.value}</p>
                          </Fragment>
                        ))}
                      </div>
                    </AccordionItem>
                    <AccordionItem id="contexto" title="Contexto" open={openPanel === 'contexto'} onToggle={(id) => setOpenPanel((current) => (current === id ? null : id))}>
                      <div className="space-y-4">
                        {data.thematicTags.length > 0 ? (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#716555]">Temas</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {data.thematicTags.slice(0, 6).map((tag) => (
                                <span key={tag.label} className="rounded-full border border-[#ddd2c2] bg-[rgba(245,241,234,0.72)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#675c4c]">{tag.label}</span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        <div className="grid gap-y-2 md:grid-cols-[130px_minmax(0,1fr)] md:gap-x-6">
                          {data.peopleAndPlaces.map((entry) => (
                            <Fragment key={`${entry.name}-${entry.role}`}>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#716555]">{entry.role}</p>
                              <p className="text-[13px] leading-relaxed text-[#2c241c] decoration-[#c2a66d] decoration-dotted decoration-1 underline-offset-4 transition-colors hover:text-[#8c6727] [font-family:var(--font-carta-body),serif]">{entry.name}</p>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </AccordionItem>
                    <AccordionItem id="relacionados" title="Relacionados" open={openPanel === 'relacionados'} onToggle={(id) => setOpenPanel((current) => (current === id ? null : id))}>
                      <div className="grid gap-2 pt-2">
                        {data.relatedDocuments.slice(0, 3).map((document) => (
                          <Link key={document.href} href={document.href} className="group flex items-start justify-between gap-4 rounded-[0.8rem] px-1.5 py-2 transition-colors hover:bg-[rgba(171,149,100,0.05)]">
                            <div className="min-w-0 pt-1">
                              <p className="text-[13px] leading-relaxed text-[#2d241b] underline decoration-[#cfb57a]/55 decoration-1 underline-offset-4 transition-colors group-hover:text-[#8c6727] [font-family:var(--font-carta-body),serif]">{document.title}</p>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-[#766958] [font-family:var(--font-carta-body),serif]">{document.meta}</p>
                            </div>
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#9b8257] transition-transform duration-200 group-hover:translate-x-1" />
                          </Link>
                        ))}
                      </div>
                    </AccordionItem>
                  </div>
                </article>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .carta-v2-shell {
          --ease-academic: cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes landOnDesk {
          0% {
            opacity: 0;
            transform: scale(1.03) translateY(-15px);
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.08);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.05);
          }
        }

        @keyframes hudAppear {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes cartaFade {
          0% {
            opacity: 0.35;
          }
          100% {
            opacity: 1;
          }
        }

        .academic-manuscript {
          cursor: grab;
          animation: landOnDesk 1.2s var(--ease-academic) forwards;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .academic-manuscript:active {
          cursor: grabbing;
        }

        .academic-manuscript:hover {
          transform: translateY(-2px) scale(1.008);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.14), 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .manuscript-hud {
          opacity: 0;
          animation: hudAppear 0.5s var(--ease-academic) forwards;
          animation-delay: 1s;
        }

        .carta-v2-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(141,103,40,0.35) transparent;
        }

        .carta-v2-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .carta-v2-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .carta-v2-scroll::-webkit-scrollbar-thumb {
          background: rgba(141,103,40,0.35);
          border-radius: 999px;
        }

        .drop-cap:first-letter {
          float: left;
          font-size: 4.2rem;
          line-height: 0.75;
          padding-top: 0.15rem;
          margin-right: 0.4rem;
          font-family: var(--font-carta-display), serif;
          color: #000;
        }
      `}</style>
    </div>
  );
}
