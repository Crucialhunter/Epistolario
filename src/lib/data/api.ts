import { LegajoMeta, CartaSummary, CartaDetail } from '../types';

export type RawMetaEntry = {
  name: string;
  count: number;
};

export type RawArchiveStats = {
  total_legajos: number;
  total_cartas: number;
  rango_temporal_global?: [number, number] | number[];
  entidades_top?: {
    remitentes?: RawMetaEntry[];
    destinatarios?: RawMetaEntry[];
    lugares?: RawMetaEntry[];
    temas?: RawMetaEntry[];
  };
};

export type RawLegajoIndexEntry = {
  legajo_id: string;
  num_cartas: number;
  rango_temporal?: [number, number] | number[];
  densidad_narrativa?: string;
  actores_principales?: string[];
};

export type RawLegajoMeta = {
  legajo_id: string;
  num_cartas: number;
  num_imagenes: number;
  rango_temporal?: [number, number] | number[];
  remitentes_frecuentes?: RawMetaEntry[];
  destinatarios_frecuentes?: RawMetaEntry[];
  lugares_frecuentes?: RawMetaEntry[];
  temas_frecuentes?: RawMetaEntry[];
  warnings_count?: number;
  densidad_narrativa_estimada?: string;
};

export type RawLetterIndexItem = {
  id_carta: string;
  signatura?: string;
  nombre_carta?: string;
  fecha_original?: string;
  lugar?: string;
  remitente?: string;
  destinatario?: string;
  temas?: string[];
  idioma?: string;
  has_modernizada?: boolean;
  has_literal?: boolean;
  image_count?: number;
  primary_image?: string | null;
  primary_image_url?: string | null;
};

export type RawLetterImage = {
  filename: string;
  original_url?: string;
  url: string;
};

export type RawLetterDetail = RawLetterIndexItem & {
  legajo_id: string;
  order_in_legajo?: number;
  resumen?: string;
  modernizada?: string[];
  literal?: string[];
  imagenes?: RawLetterImage[];
  has_images?: boolean;
  warnings?: unknown[];
  raw_source?: string;
};

const CORPUS_BASE_ROOT = 'CorpusBase';
const IMAGE_ENHANCED_IDS = new Set(['06', '10', '19']);
const MOJIBAKE_PATTERN = /(?:Ã.|Â.|â.|ð.|Ð.|�)/;
const utf8Decoder = new TextDecoder('utf-8', { fatal: false });

function normalizeLegajoId(id: string) {
  return id.padStart(2, '0');
}

function compactLegajoId(id: string) {
  const numeric = Number.parseInt(id, 10);
  return Number.isFinite(numeric) ? String(numeric) : id;
}

export function hasImageEnhanced(id: string) {
  return IMAGE_ENHANCED_IDS.has(normalizeLegajoId(id));
}

function getCorpusLegajoFolder(id: string) {
  return `${CORPUS_BASE_ROOT}/legajos/legajo-${normalizeLegajoId(id)}`;
}

function mojibakeScore(value: string) {
  const matches = value.match(/(?:Ã.|Â.|â.|ð.|Ð.|�)/g);
  return matches ? matches.length : 0;
}

function fixPossibleMojibake(value: string) {
  if (!MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(Array.from(value), (character) => character.charCodeAt(0) & 0xff);
    const decoded = utf8Decoder.decode(bytes);

    if (!decoded || decoded.includes('\u0000')) {
      return value;
    }

    return mojibakeScore(decoded) < mojibakeScore(value) ? decoded : value;
  } catch {
    return value;
  }
}

function sanitizeJsonValue<T>(value: T): T {
  if (typeof value === 'string') {
    return fixPossibleMojibake(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonValue(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, sanitizeJsonValue(entryValue)])
    ) as T;
  }

  return value;
}

async function fetchJson<T>(relativePath: string): Promise<T | null> {
  const normalizedPath = relativePath.replace(/^\/+/, '');
  const urlPath = `/${normalizedPath}`;

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(urlPath);
      if (!res.ok) return null;
      const content = await res.json();
      return sanitizeJsonValue(content) as T;
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }

  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', normalizedPath);
    const content = await fs.readFile(filePath, 'utf8');
    return sanitizeJsonValue(JSON.parse(content)) as T;
  } catch (error) {
    console.error('FS error reading JSON:', urlPath, error);
    return null;
  }
}

async function fetchFirstJson<T>(relativePaths: string[]): Promise<T | null> {
  for (const relativePath of relativePaths) {
    const data = await fetchJson<T>(relativePath);
    if (data) return data;
  }
  return null;
}

function formatDateRange(range?: number[]) {
  if (!range || range.length === 0) return 'Fechas por determinar';
  if (range.length === 1 || range[0] === range[1]) return String(range[0]);
  return `${range[0]}-${range[1]}`;
}

function pickNames(entries?: RawMetaEntry[], limit = 5) {
  return (entries ?? [])
    .map((entry) => entry.name)
    .filter(Boolean)
    .slice(0, limit);
}

function buildLegajoSummary(id: string, raw: RawLegajoMeta) {
  const places = pickNames(raw.lugares_frecuentes, 2);
  const senders = pickNames(raw.remitentes_frecuentes, 2);
  const dateRange = formatDateRange(raw.rango_temporal);

  const fragments = [
    `Conjunto de ${raw.num_cartas} cartas y ${raw.num_imagenes} referencias de imagen del Legajo ${id}.`,
    dateRange ? `Arco temporal: ${dateRange}.` : null,
    places.length > 0 ? `Lugares destacados: ${places.join(', ')}.` : null,
    senders.length > 0 ? `Correspondencia frecuente de ${senders.join(' y ')}.` : null,
  ];

  return fragments.filter(Boolean).join(' ');
}

function resolvePrimaryImage(legajoId: string, raw: RawLetterIndexItem | RawLetterDetail) {
  if (!hasImageEnhanced(legajoId)) {
    return null;
  }

  return raw.primary_image_url || null;
}

function resolveImages(legajoId: string, images?: RawLetterImage[]) {
  if (!hasImageEnhanced(legajoId)) {
    return [];
  }

  return (images ?? []).map((image, indexPosition) => ({
    src: image.url,
    order: indexPosition + 1,
    originalFilename: image.filename,
  }));
}

function mapLegajoMeta(raw: RawLegajoMeta): LegajoMeta {
  const legajoId = compactLegajoId(raw.legajo_id);

  return {
    legajoId,
    title: `Legajo ${legajoId}`,
    dateRange: formatDateRange(raw.rango_temporal),
    letterCount: raw.num_cartas,
    imageCount: raw.num_imagenes,
    summary: buildLegajoSummary(legajoId, raw),
    keyPlaces: pickNames(raw.lugares_frecuentes, 5),
    keyPeople: [...pickNames(raw.remitentes_frecuentes, 3), ...pickNames(raw.destinatarios_frecuentes, 2)].slice(0, 5),
    keyThemes: pickNames(raw.temas_frecuentes, 5),
    featuredLetterIds: [],
    featuredEventIds: [],
  };
}

function mapCartaSummary(legajoId: string, raw: RawLetterIndexItem): CartaSummary {
  return {
    id_carta: raw.id_carta,
    fecha: raw.fecha_original || '',
    remitente: raw.remitente || '',
    destinatario: raw.destinatario || '',
    lugar: raw.lugar || '',
    temas: (raw.temas ?? []).join(', '),
    hasImages: Boolean(raw.image_count && raw.image_count > 0),
    primaryImage: resolvePrimaryImage(legajoId, raw),
  };
}

function joinParagraphs(paragraphs?: string[]) {
  return (paragraphs ?? [])
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join('\n\n');
}

function mapCartaDetail(legajoId: string, raw: RawLetterDetail, index: RawLetterIndexItem[]): CartaDetail {
  const currentIndex = index.findIndex((item) => item.id_carta === raw.id_carta);
  const previousCartaId = currentIndex > 0 ? index[currentIndex - 1]?.id_carta ?? null : null;
  const nextCartaId = currentIndex >= 0 && currentIndex < index.length - 1 ? index[currentIndex + 1]?.id_carta ?? null : null;

  return {
    ...mapCartaSummary(legajoId, raw),
    resumen: raw.resumen || '',
    url_origen: raw.raw_source || '',
    signatura: raw.signatura || '',
    nombre_carta: raw.nombre_carta || '',
    idioma: raw.idioma || '',
    transcripcion: {
      modernizada: joinParagraphs(raw.modernizada),
      literal: joinParagraphs(raw.literal),
    },
    imagenes: resolveImages(legajoId, raw.imagenes),
    previousCartaId,
    nextCartaId,
  };
}

async function getRawLegajoMeta(id: string) {
  return fetchJson<RawLegajoMeta>(`${getCorpusLegajoFolder(id)}/meta.json`);
}

async function getRawLegajoLetters(id: string) {
  return fetchJson<RawLetterIndexItem[]>(`${getCorpusLegajoFolder(id)}/letters_index.json`);
}

export async function getArchiveStats(): Promise<RawArchiveStats | null> {
  return fetchJson<RawArchiveStats>(`${CORPUS_BASE_ROOT}/global_stats.json`);
}

export async function getLegajoIndexEntries(): Promise<RawLegajoIndexEntry[]> {
  return (await fetchJson<RawLegajoIndexEntry[]>(`${CORPUS_BASE_ROOT}/legajos_index.json`)) ?? [];
}

export async function getLegajos(): Promise<LegajoMeta[]> {
  const entries = await getLegajoIndexEntries();
  const results = await Promise.all(entries.map((entry) => getRawLegajoMeta(entry.legajo_id)));

  return results
    .filter((item): item is RawLegajoMeta => Boolean(item))
    .map(mapLegajoMeta)
    .sort((left, right) => Number.parseInt(left.legajoId, 10) - Number.parseInt(right.legajoId, 10));
}

export async function getLegajo(id: string): Promise<LegajoMeta | null> {
  const legajo = await getRawLegajoMeta(id);
  return legajo ? mapLegajoMeta(legajo) : null;
}

export async function getLegajoLetters(id: string): Promise<CartaSummary[]> {
  const letters = await getRawLegajoLetters(id);
  return (letters ?? []).map((letter) => mapCartaSummary(id, letter));
}

export async function getCarta(legajoId: string, cartaId: string): Promise<CartaDetail | null> {
  const [rawIndex, rawLetter] = await Promise.all([
    getRawLegajoLetters(legajoId),
    fetchFirstJson<RawLetterDetail>([
      `${getCorpusLegajoFolder(legajoId)}/letters/${cartaId.padStart(6, '0')}.json`,
      `${getCorpusLegajoFolder(legajoId)}/letters/${cartaId}.json`,
    ]),
  ]);

  if (!rawIndex || !rawLetter) return null;

  return mapCartaDetail(legajoId, rawLetter, rawIndex);
}
