"use client";

import { useMemo, useState, useTransition } from 'react';
import { CartaDetail, CartaSummary } from '@/lib/types';
import { LegajoCorpusVM } from '@/lib/view-models';
import FilterPanel from '@/components/legajo/FilterPanel';
import LetterList from '@/components/legajo/LetterList';
import LetterPreviewPane from '@/components/legajo/LetterPreviewPane';

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

const CORPUS_BASE_ROOT = '/CorpusBase';
const MOJIBAKE_PATTERN = /(?:Ã.|Â.|â.|ð.|Ð.|�)/;
const utf8Decoder = new TextDecoder('utf-8', { fatal: false });

function mojibakeScore(value: string) {
  const matches = value.match(/(?:Ã.|Â.|â.|ð.|Ð.|�)/g);
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

function adaptCarta(legajo: LegajoCorpusVM, rawLetter: RawLetterDetail, letters: CartaSummary[]): CartaDetail {
  const currentIndex = letters.findIndex((candidate) => candidate.id_carta === rawLetter.id_carta);
  const previousCartaId = currentIndex > 0 ? letters[currentIndex - 1]?.id_carta ?? null : null;
  const nextCartaId = currentIndex >= 0 && currentIndex < letters.length - 1 ? letters[currentIndex + 1]?.id_carta ?? null : null;
  const primaryImage = legajo.availability.imageEnhanced ? rawLetter.primary_image_url || null : null;

  return {
    id_carta: rawLetter.id_carta,
    fecha: rawLetter.fecha_original || '',
    remitente: rawLetter.remitente || '',
    destinatario: rawLetter.destinatario || '',
    lugar: rawLetter.lugar || '',
    temas: (rawLetter.temas ?? []).join(', '),
    hasImages: Boolean(rawLetter.image_count && rawLetter.image_count > 0),
    primaryImage,
    resumen: rawLetter.resumen || '',
    url_origen: rawLetter.raw_source || '',
    signatura: rawLetter.signatura || '',
    nombre_carta: rawLetter.nombre_carta || '',
    idioma: rawLetter.idioma || '',
    transcripcion: {
      modernizada: (rawLetter.modernizada ?? []).join('\n\n'),
      literal: (rawLetter.literal ?? []).join('\n\n'),
    },
    imagenes: legajo.availability.imageEnhanced
      ? (rawLetter.imagenes ?? []).map((image, index) => ({
          src: image.url,
          order: index + 1,
          originalFilename: image.filename,
        }))
      : [],
    previousCartaId,
    nextCartaId,
  };
}

async function fetchCartaPreview(legajo: LegajoCorpusVM, cartaId: string, letters: CartaSummary[]) {
  const response = await fetch(`${CORPUS_BASE_ROOT}/legajos/legajo-${legajo.id.padStart(2, '0')}/letters/${cartaId.padStart(6, '0')}.json`);
  if (!response.ok) {
    return null;
  }

  const raw = sanitizeValue(await response.json()) as RawLetterDetail;
  return adaptCarta(legajo, raw, letters);
}

export default function LegajoArchiveWorkspace({ legajo, letters, initialPreview }: { legajo: LegajoCorpusVM; letters: CartaSummary[]; initialPreview: CartaDetail | null }) {
  const [search, setSearch] = useState('');
  const [place, setPlace] = useState('');
  const [sender, setSender] = useState('');
  const [theme, setTheme] = useState('');
  const [selectedLetterId, setSelectedLetterId] = useState(initialPreview?.id_carta ?? letters[0]?.id_carta ?? null);
  const [preview, setPreview] = useState<CartaDetail | null>(initialPreview);
  const [isPending, startTransition] = useTransition();

  const places = useMemo(() => Array.from(new Set(letters.map((letter) => letter.lugar).filter(Boolean))).sort(), [letters]);
  const senders = useMemo(() => Array.from(new Set(letters.map((letter) => letter.remitente).filter(Boolean))).sort(), [letters]);
  const themes = useMemo(() => Array.from(new Set(letters.flatMap((letter) => letter.temas.split(',').map((theme) => theme.trim()).filter(Boolean)))).sort(), [letters]);

  const filteredLetters = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return letters.filter((letter) => {
      const matchesSearch = !normalizedSearch || [letter.id_carta, letter.remitente, letter.destinatario, letter.lugar, letter.temas].some((value) => value?.toLowerCase().includes(normalizedSearch));
      const matchesPlace = !place || letter.lugar === place;
      const matchesSender = !sender || letter.remitente === sender;
      const matchesTheme = !theme || letter.temas.includes(theme);
      return matchesSearch && matchesPlace && matchesSender && matchesTheme;
    });
  }, [letters, place, search, sender, theme]);

  const handleSelect = (letterId: string) => {
    setSelectedLetterId(letterId);
    startTransition(async () => {
      const nextPreview = await fetchCartaPreview(legajo, letterId, letters);
      if (nextPreview) {
        setPreview(nextPreview);
      }
    });
  };

  const handleClear = () => {
    setSearch('');
    setPlace('');
    setSender('');
    setTheme('');
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_400px] 2xl:grid-cols-[minmax(0,1.4fr)_440px]">
      {/* Main content column */}
      <div className="grid gap-6">
        {/* Sticky filter panel */}
        <div className="sticky top-20 z-10">
          <FilterPanel
            search={search}
            onSearchChange={setSearch}
            place={place}
            onPlaceChange={setPlace}
            sender={sender}
            onSenderChange={setSender}
            theme={theme}
            onThemeChange={setTheme}
            places={places}
            senders={senders}
            themes={themes}
            resultsCount={filteredLetters.length}
            onClear={handleClear}
          />
        </div>

        {/* Letter list with custom scrollbar */}
        <div className="custom-scrollbar max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
          <LetterList letters={filteredLetters} selectedLetterId={selectedLetterId} onSelect={handleSelect} />
        </div>
      </div>

      {/* Preview sidebar */}
      <div className="grid gap-4 xl:sticky xl:top-24 xl:h-fit xl:self-start">
        {isPending ? (
          <div className="flex items-center gap-3 rounded-xl border border-[#e8dfd0] bg-white px-4 py-3 shadow-lg">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#c9a030] border-t-transparent" />
            <span className="text-sm text-[#6b5d4d]">Actualizando preview documental…</span>
          </div>
        ) : null}
        <LetterPreviewPane legajo={legajo} preview={preview} />
      </div>
    </div>
  );
}
