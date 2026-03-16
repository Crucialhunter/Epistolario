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
    <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_minmax(360px,1.15fr)] lg:px-8 lg:py-10">
      <aside className="space-y-8">
        <div>
          <h3 className="border-b border-[#E5E1D8] pb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Filtrar por</h3>
          <div className="mt-8 space-y-8">
            <div>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#B48E4B]">Busqueda</p>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Carta, remitente o lugar"
                className="w-full border border-[#E5E1D8] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[#B48E4B]"
              />
            </div>
            <div>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#B48E4B]">Lugares</p>
              <select value={place} onChange={(event) => setPlace(event.target.value)} className="w-full border border-[#E5E1D8] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[#B48E4B]">
                <option value="">Todos los lugares</option>
                {places.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#B48E4B]">Remitentes</p>
              <select value={sender} onChange={(event) => setSender(event.target.value)} className="w-full border border-[#E5E1D8] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[#B48E4B]">
                <option value="">Todos los remitentes</option>
                {senders.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#B48E4B]">Temas</p>
              <select value={theme} onChange={(event) => setTheme(event.target.value)} className="w-full border border-[#E5E1D8] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[#B48E4B]">
                <option value="">Todos los temas</option>
                {themes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
                className="w-full border border-[#d6c7a9] bg-[#F9F7F2] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a6642]"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 border border-[#E5E1D8] bg-white px-3 py-2 text-sm text-[#7e7568]">{filteredLetters.length} cartas visibles en el archivo del legajo</div>
          <button className="border border-[#E5E1D8] bg-white px-3 py-2 text-sm text-[#1A1A1A]">Archivo</button>
        </div>

        <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1">
          {filteredLetters.map((letter) => {
            const active = letter.id_carta === selectedLetterId;
            const title =
              letter.remitente || letter.destinatario
                ? `${letter.remitente || 'Remitente no identificado'} a ${letter.destinatario || 'destinatario no identificado'}`
                : `Carta ${letter.id_carta}`;

            return (
              <button
                key={letter.id_carta}
                type="button"
                onClick={() => handleSelect(letter.id_carta)}
                className={`w-full rounded-sm border p-4 text-left transition-colors ${
                  active
                    ? 'border-[#B48E4B]/30 bg-orange-50/60 shadow-[inset_0_0_0_1px_rgba(180,142,75,0.2)]'
                    : 'border-[#E5E1D8] bg-white hover:border-gray-400'
                }`}
              >
                <h4 className={`font-serif ${active ? 'text-[15px] font-bold text-[#1A1A1A]' : 'text-sm font-bold text-[#1A1A1A]/85'}`}>{title}</h4>
                <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${active ? 'text-[#B48E4B]' : 'text-gray-400'}`}>
                  {letter.fecha || 'Sin fecha'}
                  {letter.lugar ? ` · ${letter.lugar}` : ''}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border border-[#E5E1D8] bg-white p-5 sm:p-6 lg:sticky lg:top-[120px] lg:h-fit lg:p-8">
        {isPending ? <div className="mb-4 border border-[#E5E1D8] bg-[#F9F7F2] px-3 py-2 text-sm text-[#8f7742]">Actualizando preview documental...</div> : null}
        {hasVisual ? (
          <div className="border border-zinc-100 bg-neutral-50 p-4 shadow-sm sm:p-6">
            <img src={preview?.primaryImage ?? ''} alt={preview?.nombre_carta || `Carta ${preview?.id_carta}`} className="h-[280px] w-full border border-gray-100 object-contain shadow-inner sm:h-[360px] lg:h-[400px]" />
            <div className="mt-4 flex justify-center">
              <button className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ampliar manuscrito</button>
            </div>
          </div>
        ) : (
          <div className="border border-[#E5E1D8] bg-[linear-gradient(160deg,#faf7ef,#eee5d3)] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B48E4B]">Modo textual</p>
            <p className="mt-3 font-serif text-2xl leading-tight text-[#2D2D2D]">El preview sigue operativo sin imagen local y prioriza la lectura documental del CorpusBase.</p>
          </div>
        )}

        <div className="mt-6 space-y-6">
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#B48E4B]">Transcripcion</h5>
            <p className="mt-2 font-serif text-sm italic leading-relaxed text-[#2D2D2D]">
              {preview?.transcripcion.modernizada.split('\n').find(Boolean) || preview?.transcripcion.literal.split('\n').find(Boolean) || 'Selecciona una carta para cargar una lectura de entrada.'}
            </p>
          </div>

          <div className="border-l-2 border-[#B48E4B] bg-[#F9F7F2] p-4">
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Fragmento destacado</h5>
            <p className="mt-2 text-xs leading-relaxed text-[#2D2D2D]/80">{excerpt}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E1D8] pt-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#7f7364]">{preview?.signatura || `Carta ${preview?.id_carta || 'sin seleccionar'}`}</div>
            {preview ? (
              <Link href={`/legajos/${data.legajoId}/cartas/${preview.id_carta}`} className="text-[10px] font-bold uppercase tracking-widest underline decoration-[#B48E4B] underline-offset-4">
                Abrir lector
              </Link>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7f7364]">Selecciona una carta</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
