"use client";

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { CartaDetail, CartaSummary } from '@/lib/types';
import type { StitchLegajoNavCViewData } from '@/lib/stitch/legajoNavCAdapter';

const CORPUS_BASE_ROOT = '/CorpusBase';
const MOJIBAKE_PATTERN = /(?:Ãƒ.|Ã‚.|Ã¢.|Ã°.|Ã.|ï¿½)/;
const utf8Decoder = new TextDecoder('utf-8', { fatal: false });

interface RawLetterImage {
  filename: string;
  url: string;
}

interface RawLetterDetail {
  id_carta: string;
  signatura?: string;
  nombre_carta?: string;
  fecha_original?: string;
  lugar?: string;
  remitente?: string;
  destinatario?: string;
  temas?: string[];
  idioma?: string;
  resumen?: string;
  modernizada?: string[];
  literal?: string[];
  imagenes?: RawLetterImage[];
  image_count?: number;
  primary_image_url?: string | null;
  raw_source?: string;
}

export interface LegajoNavCWorkspaceProps {
  readonly data: Readonly<StitchLegajoNavCViewData>;
}

function mojibakeScore(value: string) {
  const matches = value.match(/(?:Ãƒ.|Ã‚.|Ã¢.|Ã°.|Ã.|ï¿½)/g);
  return matches ? matches.length : 0;
}

function sanitizeValue<T>(value: T): T {
  if (typeof value === 'string') {
    if (!MOJIBAKE_PATTERN.test(value)) return value;
    const bytes = Uint8Array.from(Array.from(value), (character) => character.charCodeAt(0) & 0xff);
    const decoded = utf8Decoder.decode(bytes);
    return (mojibakeScore(decoded) < mojibakeScore(value) ? decoded : value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [key, sanitizeValue(entryValue)])) as T;
  }

  return value;
}

function adaptCarta(legajoId: string, rawLetter: RawLetterDetail, letters: readonly CartaSummary[]): CartaDetail {
  const currentIndex = letters.findIndex((candidate) => candidate.id_carta === rawLetter.id_carta);
  const previousCartaId = currentIndex > 0 ? letters[currentIndex - 1]?.id_carta ?? null : null;
  const nextCartaId = currentIndex >= 0 && currentIndex < letters.length - 1 ? letters[currentIndex + 1]?.id_carta ?? null : null;

  return {
    id_carta: rawLetter.id_carta,
    fecha: rawLetter.fecha_original || '',
    remitente: rawLetter.remitente || '',
    destinatario: rawLetter.destinatario || '',
    lugar: rawLetter.lugar || '',
    temas: (rawLetter.temas ?? []).join(', '),
    hasImages: Boolean(rawLetter.image_count && rawLetter.image_count > 0),
    primaryImage: rawLetter.primary_image_url || null,
    resumen: rawLetter.resumen || '',
    url_origen: rawLetter.raw_source || '',
    signatura: rawLetter.signatura || '',
    nombre_carta: rawLetter.nombre_carta || '',
    idioma: rawLetter.idioma || '',
    transcripcion: {
      modernizada: (rawLetter.modernizada ?? []).join('\n\n'),
      literal: (rawLetter.literal ?? []).join('\n\n'),
    },
    imagenes: (rawLetter.imagenes ?? []).map((image, index) => ({
      src: image.url,
      order: index + 1,
      originalFilename: image.filename,
    })),
    previousCartaId,
    nextCartaId,
  };
}

async function fetchCartaPreview(legajoId: string, cartaId: string, letters: readonly CartaSummary[]) {
  const response = await fetch(`${CORPUS_BASE_ROOT}/legajos/legajo-${legajoId.padStart(2, '0')}/letters/${cartaId.padStart(6, '0')}.json`);
  if (!response.ok) {
    return null;
  }

  const raw = sanitizeValue(await response.json()) as RawLetterDetail;
  return adaptCarta(legajoId, raw, letters);
}

function buildExcerpt(preview: CartaDetail | null) {
  if (!preview) {
    return 'Selecciona una carta para ver un fragmento documental y abrir el lector completo.';
  }

  return (
    preview.resumen ||
    preview.transcripcion.modernizada.split('\n').find(Boolean) ||
    preview.transcripcion.literal.split('\n').find(Boolean) ||
    'La carta seleccionada ya esta disponible en el lector textual completo.'
  );
}

export default function LegajoNavCWorkspace({ data }: Readonly<LegajoNavCWorkspaceProps>) {
  const [search, setSearch] = useState('');
  const [place, setPlace] = useState('');
  const [sender, setSender] = useState('');
  const [theme, setTheme] = useState('');
  const [selectedLetterId, setSelectedLetterId] = useState(data.initialPreview?.id_carta ?? data.letters[0]?.id_carta ?? null);
  const [preview, setPreview] = useState<CartaDetail | null>(data.initialPreview);
  const [isPending, startTransition] = useTransition();

  const places = useMemo(() => Array.from(new Set(data.letters.map((letter) => letter.lugar).filter(Boolean))).sort(), [data.letters]);
  const senders = useMemo(() => Array.from(new Set(data.letters.map((letter) => letter.remitente).filter(Boolean))).sort(), [data.letters]);
  const themes = useMemo(
    () => Array.from(new Set(data.letters.flatMap((letter) => letter.temas.split(',').map((value) => value.trim()).filter(Boolean)))).sort(),
    [data.letters]
  );

  const filteredLetters = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return data.letters.filter((letter) => {
      const matchesSearch =
        !normalizedSearch ||
        [letter.id_carta, letter.remitente, letter.destinatario, letter.lugar, letter.temas].some((value) => value?.toLowerCase().includes(normalizedSearch));
      const matchesPlace = !place || letter.lugar === place;
      const matchesSender = !sender || letter.remitente === sender;
      const matchesTheme = !theme || letter.temas.includes(theme);
      return matchesSearch && matchesPlace && matchesSender && matchesTheme;
    });
  }, [data.letters, place, search, sender, theme]);

  const handleSelect = (letterId: string) => {
    setSelectedLetterId(letterId);
    startTransition(async () => {
      const nextPreview = await fetchCartaPreview(data.legajoId, letterId, data.letters);
      if (nextPreview) {
        setPreview(nextPreview);
      }
    });
  };

  const excerpt = buildExcerpt(preview);
  const hasVisual = Boolean(preview?.primaryImage);

  return (
    <section className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_minmax(400px,1.2fr)] lg:px-8 lg:py-10">
      {/* Filter sidebar - Premium design */}
      <aside className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white p-5 shadow-xl shadow-[#1a1610]/5">
          {/* Decorative top bar */}
          <div className="absolute left-0 top-0 right-0 h-1 bg-gradient-to-r from-[#c9a030] via-[#d4b848] to-[#c9a030]" />

          {/* Corner decorations */}
          <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#c9a030]/20" />
          <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#c9a030]/20" />

          <div>
            <h3 className="flex items-center gap-2 border-b border-[#efe5d3] pb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#a8956a]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtrar por
            </h3>
            <div className="mt-6 space-y-6">
              {/* Search input - Premium */}
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8956a]">Busqueda</p>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8956a]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Carta, remitente o lugar"
                    className="w-full rounded-xl border-2 border-[#e8dfd0] bg-[#fdfbf7] py-3 pl-10 pr-4 text-sm text-[#1a1610] outline-none transition-all duration-300 placeholder:text-[#a8956a]/60 focus:border-[#c9a030] focus:shadow-lg focus:shadow-[#c9a030]/10"
                  />
                </div>
              </div>

              {/* Place filter - Premium */}
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8956a]">Lugares</p>
                <div className="relative">
                  <select value={place} onChange={(event) => setPlace(event.target.value)} className="w-full appearance-none rounded-xl border-2 border-[#e8dfd0] bg-[#fdfbf7] py-3 pl-4 pr-10 text-sm text-[#1a1610] outline-none transition-all duration-300 focus:border-[#c9a030] focus:shadow-lg focus:shadow-[#c9a030]/10">
                    <option value="">Todos los lugares</option>
                    {places.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8956a]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sender filter - Premium */}
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8956a]">Remitentes</p>
                <div className="relative">
                  <select value={sender} onChange={(event) => setSender(event.target.value)} className="w-full appearance-none rounded-xl border-2 border-[#e8dfd0] bg-[#fdfbf7] py-3 pl-4 pr-10 text-sm text-[#1a1610] outline-none transition-all duration-300 focus:border-[#c9a030] focus:shadow-lg focus:shadow-[#c9a030]/10">
                    <option value="">Todos los remitentes</option>
                    {senders.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8956a]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Theme filter - Premium */}
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8956a]">Temas</p>
                <div className="relative">
                  <select value={theme} onChange={(event) => setTheme(event.target.value)} className="w-full appearance-none rounded-xl border-2 border-[#e8dfd0] bg-[#fdfbf7] py-3 pl-4 pr-10 text-sm text-[#1a1610] outline-none transition-all duration-300 focus:border-[#c9a030] focus:shadow-lg focus:shadow-[#c9a030]/10">
                    <option value="">Todos los temas</option>
                    {themes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8956a]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {(search || place || sender || theme) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPlace('');
                    setSender('');
                    setTheme('');
                  }}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#d4c4a8] bg-[#fdfbf7] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6b5d4d] transition-all duration-300 hover:border-[#c9a030] hover:bg-[#f5efe3] hover:text-[#1a1610]"
                >
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar filtros
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      {/* Letter list - Premium design */}
      <div className="flex flex-col gap-4">
        {/* Header with count */}
        <div className="flex items-center gap-3 rounded-xl border border-[#e8dfd0] bg-white p-1 shadow-sm">
          <div className="flex-1 rounded-lg bg-[#fdfbf7] px-4 py-3 text-sm font-medium text-[#1a1610]">
            <span className="text-[#c9a030] font-bold">{filteredLetters.length}</span>
            <span className="text-[#6b5d4d]"> {filteredLetters.length === 1 ? 'carta visible' : 'cartas visibles'} en el archivo</span>
          </div>
          <button className="rounded-lg border border-[#c9a030] bg-gradient-to-r from-[#c9a030] to-[#d4b848] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]">
            Archivo
          </button>
        </div>

        {/* Letter cards */}
        <div className="custom-scrollbar max-h-[680px] space-y-3 overflow-y-auto pr-2">
          {filteredLetters.map((letter) => {
            const active = letter.id_carta === selectedLetterId;
            const themes = letter.temas.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 2);

            return (
              <button
                key={letter.id_carta}
                type="button"
                onClick={() => handleSelect(letter.id_carta)}
                className={`group relative w-full rounded-2xl border-2 px-5 py-5 text-left transition-all duration-300 ease-out ${
                  active
                    ? 'border-[#c9a030] bg-[#fdfbf7] shadow-xl ring-2 ring-[#c9a030]/30'
                    : 'border-[#e8dfd0] bg-[#fdfbf7] hover:border-[#d4c4a8] hover:shadow-2xl hover:-translate-y-0.5'
                }`}
              >
                {/* Decorative corners */}
                <div className={`absolute left-3 top-3 h-3 w-3 border-l-2 border-t-2 transition-colors duration-300 ${active ? 'border-[#c9a030]' : 'border-[#d4c4a8] group-hover:border-[#c9a030]'}`} />
                <div className={`absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 transition-colors duration-300 ${active ? 'border-[#c9a030]' : 'border-[#d4c4a8] group-hover:border-[#c9a030]'}`} />

                <div className="flex items-start justify-between gap-4 pl-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.28em] transition-colors duration-300 ${active ? 'text-[#b8922a]' : 'text-[#a8956a] group-hover:text-[#c9a030]'}`}>
                        Carta {letter.id_carta}
                      </span>
                      {letter.hasImages && (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                          active
                            ? 'border-[#c9a030] bg-[#c9a030]/10 text-[#8a6d20]'
                            : 'border-[#d4c4a8] bg-white text-[#8a7a5a] group-hover:border-[#c9a030] group-hover:text-[#8a6d20]'
                        }`}>
                          Ms.
                        </span>
                      )}
                    </div>
                    <p className={`reader-display mt-3 text-lg font-semibold leading-tight ${active ? 'text-[#1a1610]' : 'text-[#1a1610]/85 group-hover:text-[#1a1610]'}`}>
                      {letter.remitente || 'Remitente no identificado'}
                    </p>
                    <p className="mt-1.5 text-sm text-[#6b5d4d]">a {letter.destinatario || 'Destinatario no identificado'}</p>
                  </div>

                  {/* Separator */}
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
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${
                          active
                            ? 'bg-[#f5efe3] text-[#7a6a50]'
                            : 'bg-[#f8f5ef] text-[#8a7a60] group-hover:bg-[#f0e9dc]'
                        }`}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hover arrow */}
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${!active ? 'opacity-0 group-hover:opacity-100' : 'hidden'}`}>
                  <svg className="h-5 w-5 text-[#c9a030]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview sidebar - Premium design */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e0d6c4] bg-white shadow-2xl lg:sticky lg:top-24 lg:h-fit">
        {/* Top decorative bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#c9a030] via-[#d4b848] to-[#c9a030]" />

        {/* Header section */}
        <div className="border-b border-[#efe5d3] bg-gradient-to-b from-[#fdfbf7] to-white px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c9a030]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#a8956a]">Preview lateral</p>
          </div>
          <h3 className="reader-display mt-4 text-xl font-semibold leading-tight text-[#1a1610]">
            {preview?.nombre_carta || `Carta ${preview?.id_carta || '—'}`}
          </h3>
          {preview && (
            <p className="mt-3 text-sm text-[#6b5d4d]">
              <span className="font-medium text-[#1a1610]">{preview.remitente || 'Remitente no identificado'}</span>
              <span className="mx-2 text-[#d4c4a8]">→</span>
              <span className="font-medium text-[#1a1610]">{preview.destinatario || 'Destinatario no identificado'}</span>
            </p>
          )}
        </div>

        {isPending ? (
          <div className="flex items-center gap-3 rounded-xl border border-[#e8dfd0] bg-white px-4 py-3 shadow-lg mx-4 mt-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#c9a030] border-t-transparent" />
            <span className="text-sm text-[#6b5d4d]">Actualizando preview documental…</span>
          </div>
        ) : null}

        {/* Manuscript image with ornate frame */}
        {hasVisual ? (
          <div className="relative border-b border-[#efe5d3] bg-[#1a1610] p-5">
            {/* Inner frame decoration */}
            <div className="absolute inset-3 border border-[#c9a030]/20 pointer-events-none" />
            <div className="absolute inset-4 border border-[#c9a030]/10 pointer-events-none" />

            <img
              src={preview?.primaryImage ?? ''}
              alt={preview?.nombre_carta || `Carta ${preview?.id_carta}`}
              className="h-[260px] w-full rounded-lg object-contain shadow-2xl sm:h-[320px] lg:h-[360px]"
            />

            {/* Image label */}
            <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between">
              <span className="rounded bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9a030] backdrop-blur-sm">
                Manuscrito
              </span>
              {preview?.imagenes && preview.imagenes.length > 1 && (
                <span className="rounded bg-black/60 px-2 py-1 text-[9px] font-medium text-white/80 backdrop-blur-sm">
                  {preview.imagenes.length} páginas
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#d4c4a8] bg-[#fdfbf7]/80 p-7 m-4 shadow-lg">
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
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#a8956a]">Modo textual</p>
                <p className="mt-3 font-serif text-lg leading-tight text-[#4a4235]">Selecciona una carta para ver su contenido y acceder al lector completo.</p>
              </div>
            </div>
          </div>
        )}

        {/* Content section */}
        <div className="grid gap-5 px-6 py-6">
          {/* Date and place */}
          {preview && (
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
          )}

          {/* Teaser text */}
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#a8956a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a8956a]">Lectura de entrada</span>
            </div>
            <p className="line-clamp-4 leading-relaxed text-[#4a4235] italic font-serif">
              {preview?.transcripcion.modernizada.split('\n').find(Boolean) || preview?.transcripcion.literal.split('\n').find(Boolean) || 'Selecciona una carta para cargar una lectura de entrada.'}
            </p>
          </div>

          {/* Fragmento destacado */}
          <div className="rounded-xl border-l-4 border-[#c9a030] bg-[#f5efe3] p-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8956a]">Fragmento destacado</span>
            <p className="mt-2 text-sm leading-relaxed text-[#4a4235]">{excerpt}</p>
          </div>

          {/* CTA Button - Premium style */}
          {preview ? (
            <Link
              href={`/legajos/${data.legajoId}/cartas/${preview.id_carta}`}
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
          ) : (
            <div className="rounded-xl border border-[#e8dfd0] bg-[#fdfbf7] p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8956a]">Selecciona una carta</span>
            </div>
          )}

          {/* Signatura */}
          <div className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8956a]">
            {preview?.signatura || `Carta ${preview?.id_carta || '—'}`}
          </div>
        </div>

        {/* Bottom decorative corner */}
        <div className="absolute bottom-0 left-0 h-4 w-4 border-l-2 border-b-2 border-[#e0d6c4]" />
        <div className="absolute bottom-0 right-0 h-4 w-4 border-r-2 border-b-2 border-[#e0d6c4]" />
      </div>
    </section>
  );
}
