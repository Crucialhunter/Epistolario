import {
  RawArchiveStats,
  RawLegajoIndexEntry,
  getArchiveStats,
  getCarta,
  getLegajo,
  getLegajoIndexEntries,
  getLegajoLetters,
  getLegajos,
  hasImageEnhanced,
} from '@/lib/data/api';
import { CartaDetail, CartaSummary, LegajoMeta } from '@/lib/types';

const FEATURED_LEGAJO_IDS = ['6', '10', '19'];

export interface LayerAvailability {
  corpusBase: boolean;
  imageEnhanced: boolean;
  curatorial: boolean;
}

export interface LegajoCorpusVM {
  id: string;
  slug: string;
  title: string;
  dateRange: string;
  summary: string;
  letterCount: number;
  imageCount: number;
  keyPlaces: string[];
  keyPeople: string[];
  keyThemes: string[];
  teaserText: string;
  teaserVisual: string | null;
  emphasis: 'visual' | 'textual';
  narrativeDensity: string | null;
  principalActors: string[];
  availability: LayerAvailability;
}

export interface ArchiveMetricVM {
  label: string;
  value: string;
  hint: string;
}

export interface CuratedSectionVM {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  status: 'placeholder' | 'planned';
}

export interface ArchiveDiscoveryBlockVM {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
}

export interface ArchiveOverviewVM {
  title: string;
  subtitle: string;
  intro: string;
  metrics: ArchiveMetricVM[];
  featuredLegajos: LegajoCorpusVM[];
  discoveryBlocks: ArchiveDiscoveryBlockVM[];
  curatedSections: CuratedSectionVM[];
}

export interface LegajoArchiveVM {
  legajo: LegajoCorpusVM;
  letters: CartaSummary[];
  initialPreview: CartaDetail | null;
  curatorialSections: CuratedSectionVM[];
}

export interface LegajoCuratorialVM {
  kind: 'recorridos' | 'relatos';
  title: string;
  description: string;
  modules: Array<{
    title: string;
    description: string;
  }>;
}

function formatDateRange(range?: number[]) {
  if (!range || range.length === 0) return 'Fechas por determinar';
  if (range.length === 1 || range[0] === range[1]) return String(range[0]);
  return `${range[0]}-${range[1]}`;
}

function buildCuratedSections(legajoId?: string): CuratedSectionVM[] {
  return [
    {
      id: `${legajoId ?? 'archive'}-recorridos`,
      eyebrow: 'Curatorial',
      title: 'Recorridos documentales',
      description: 'Estructura preparada para recorridos guiados, hitos y conexiones editoriales a partir del corpus.',
      status: 'planned',
    },
    {
      id: `${legajoId ?? 'archive'}-relatos`,
      eyebrow: 'Narrativa',
      title: 'Relatos de archivo',
      description: 'Region reservada para relatos curatoriales, citas destacadas y evidencia documental encadenada.',
      status: 'placeholder',
    },
  ];
}

function toLegajoCorpusVM(legajo: LegajoMeta, catalogEntry?: RawLegajoIndexEntry): LegajoCorpusVM {
  const imageEnhanced = hasImageEnhanced(legajo.legajoId);
  const narrativeDensity = catalogEntry?.densidad_narrativa ?? null;
  const principalActors = catalogEntry?.actores_principales?.slice(0, 4) ?? legajo.keyPeople.slice(0, 4);
  const narrativeHint = narrativeDensity ? `Densidad narrativa ${narrativeDensity.toLowerCase()}.` : null;
  const actorHint = principalActors.length ? `Actores principales: ${principalActors.slice(0, 3).join(', ')}.` : null;

  return {
    id: legajo.legajoId,
    slug: `legajo-${legajo.legajoId.padStart(2, '0')}`,
    title: legajo.title,
    dateRange: legajo.dateRange,
    summary: legajo.summary,
    letterCount: legajo.letterCount,
    imageCount: legajo.imageCount,
    keyPlaces: legajo.keyPlaces,
    keyPeople: legajo.keyPeople,
    keyThemes: legajo.keyThemes,
    teaserText: [legajo.summary, narrativeHint, actorHint].filter(Boolean).join(' '),
    teaserVisual: imageEnhanced ? `/legajos/legajo-${legajo.legajoId.padStart(2, '0')}/images/` : null,
    emphasis: imageEnhanced ? 'visual' : 'textual',
    narrativeDensity,
    principalActors,
    availability: {
      corpusBase: true,
      imageEnhanced,
      curatorial: false,
    },
  };
}

function buildArchiveHomeMetrics(stats: RawArchiveStats): ArchiveMetricVM[] {
  const topSender = stats.entidades_top?.remitentes?.[0];
  const topPlace = stats.entidades_top?.lugares?.[0];

  return [
    {
      label: 'Arco cronologico',
      value: formatDateRange(stats.rango_temporal_global),
      hint: '',
    },
    {
      label: 'Lugar mas frecuente',
      value: topPlace?.name ?? 'Madrid',
      hint: '',
    },
    {
      label: 'Remitente principal',
      value: topSender?.name ?? 'Sin dato',
      hint: '',
    },
  ];
}

function buildArchiveMetrics(stats: RawArchiveStats, legajos: LegajoCorpusVM[]): ArchiveMetricVM[] {
  const topSender = stats.entidades_top?.remitentes?.[0];
  const topPlace = stats.entidades_top?.lugares?.[0];
  const visualCount = legajos.filter((legajo) => legajo.availability.imageEnhanced).length;

  return [
    {
      label: 'Legajos en corpus',
      value: String(stats.total_legajos),
      hint: 'Archivo textual completo ya disponible para exploracion y lectura.',
    },
    {
      label: 'Cartas navegables',
      value: String(stats.total_cartas),
      hint: 'Cada carta puede abrirse como lector textual completo.',
    },
    {
      label: 'Arco cronologico',
      value: formatDateRange(stats.rango_temporal_global),
      hint: 'Panorama historico global del fondo epistolar.',
    },
    {
      label: 'Capas visuales activas',
      value: String(visualCount),
      hint: 'Legajos con manuscrito local y preview enriquecido hoy.',
    },
    {
      label: 'Remitente mas frecuente',
      value: topSender?.name ?? 'Sin dato',
      hint: topSender ? `${topSender.count} cartas registradas en el corpus actual.` : 'Se completara con la siguiente capa de datos.',
    },
    {
      label: 'Lugar mas frecuente',
      value: topPlace?.name ?? 'Sin dato',
      hint: topPlace ? `${topPlace.count} menciones documentales en el corpus actual.` : 'Se completara con la siguiente capa de datos.',
    },
  ];
}

function buildDiscoveryBlocks(stats: RawArchiveStats, legajos: LegajoCorpusVM[]): ArchiveDiscoveryBlockVM[] {
  const visualLegajos = legajos.filter((legajo) => legajo.availability.imageEnhanced).map((legajo) => `Legajo ${legajo.id}`);
  const densestLegajos = [...legajos]
    .sort((left, right) => right.letterCount - left.letterCount)
    .slice(0, 4)
    .map((legajo) => `Legajo ${legajo.id} · ${legajo.letterCount} cartas`);

  return [
    {
      id: 'top-people',
      eyebrow: 'Personas',
      title: 'Correspondencias recurrentes',
      description: 'Nombres y figuras que ya permiten orientar la exploracion del archivo sin esperar a capas curatoriales.',
      items: (stats.entidades_top?.remitentes ?? []).slice(0, 4).map((entry) => `${entry.name} · ${entry.count}`),
    },
    {
      id: 'top-places',
      eyebrow: 'Lugares',
      title: 'Geografias del fondo',
      description: 'Ciudades y territorios que organizan buena parte de la lectura transversal del corpus.',
      items: (stats.entidades_top?.lugares ?? []).slice(0, 4).map((entry) => `${entry.name} · ${entry.count}`),
    },
    {
      id: 'visual-corpus',
      eyebrow: 'Capas visuales',
      title: 'Legajos con manuscrito local',
      description: 'Entradas donde el corpus textual ya se acompana de una experiencia manuscrita mas rica.',
      items: visualLegajos,
    },
    {
      id: 'largest-corpora',
      eyebrow: 'Escala',
      title: 'Legajos con mayor densidad actual',
      description: 'Un primer mapa de volumen para navegar el archivo con criterio, no solo por orden numerico.',
      items: densestLegajos,
    },
  ];
}

async function getCatalogViewModels() {
  const [catalogEntries, legajos] = await Promise.all([getLegajoIndexEntries(), getLegajos()]);
  const entryMap = new Map(catalogEntries.map((entry) => [entry.legajo_id, entry]));

  return legajos.map((legajo) => toLegajoCorpusVM(legajo, entryMap.get(legajo.legajoId)));
}

export async function getArchiveOverviewVM(): Promise<ArchiveOverviewVM> {
  const [stats, legajos] = await Promise.all([getArchiveStats(), getCatalogViewModels()]);

  const featuredLegajos = FEATURED_LEGAJO_IDS
    .map((id) => legajos.find((legajo) => legajo.id === id))
    .filter((legajo): legajo is LegajoCorpusVM => Boolean(legajo));

  const fallbackStats: RawArchiveStats = {
    total_legajos: legajos.length,
    total_cartas: legajos.reduce((total, legajo) => total + legajo.letterCount, 0),
    rango_temporal_global: undefined,
    entidades_top: {},
  };

  const effectiveStats = stats ?? fallbackStats;

  const homeMetrics = buildArchiveHomeMetrics(effectiveStats);

  return {
    title: 'Correspondencia de Pedro de Santacilia y Pax',
    subtitle: `Siglo XVII \u00B7 ${effectiveStats.total_legajos} legajos \u00B7 ${effectiveStats.total_cartas.toLocaleString('es-ES')} cartas`,
    intro: 'Un archivo epistolar transcrito y anotado para su lectura digital. Cada pieza puede recorrerse como texto completo; tres legajos ofrecen ya la imagen del manuscrito original.',
    metrics: homeMetrics,
    featuredLegajos: featuredLegajos.length > 0 ? featuredLegajos : legajos.slice(0, 3),
    discoveryBlocks: buildDiscoveryBlocks(effectiveStats, legajos),
    curatedSections: buildCuratedSections(),
  };
}

export async function getLegajoCatalogVM(): Promise<LegajoCorpusVM[]> {
  return getCatalogViewModels();
}

export async function getLegajoArchiveVM(id: string): Promise<LegajoArchiveVM | null> {
  const [catalogEntries, legajo, letters] = await Promise.all([getLegajoIndexEntries(), getLegajo(id), getLegajoLetters(id)]);

  if (!legajo) {
    return null;
  }

  const initialCartaId = letters[0]?.id_carta ?? null;
  const initialPreview = initialCartaId ? await getCarta(id, initialCartaId) : null;
  const catalogEntry = catalogEntries.find((entry) => entry.legajo_id === legajo.legajoId);

  return {
    legajo: toLegajoCorpusVM(legajo, catalogEntry),
    letters,
    initialPreview,
    curatorialSections: buildCuratedSections(id),
  };
}

export function getLegajoCuratorialVM(id: string, kind: 'recorridos' | 'relatos'): LegajoCuratorialVM {
  if (kind === 'recorridos') {
    return {
      kind,
      title: `Recorridos del legajo ${id}`,
      description: 'Pantalla estructural preparada para itinerarios curatoriales, hitos y lecturas guiadas del corpus.',
      modules: [
        {
          title: 'Mapa de recorrido',
          description: 'Region reservada para secuencias curatoriales y puntos de entrada al archivo.',
        },
        {
          title: 'Hitos documentales',
          description: 'Resumen de cartas, eventos y piezas que daran forma al recorrido narrativo.',
        },
      ],
    };
  }

  return {
    kind,
    title: `Relatos del legajo ${id}`,
    description: 'Pantalla estructural preparada para relatos editoriales, tesis curatoriales y bloques de evidencia.',
    modules: [
      {
        title: 'Linea narrativa',
        description: 'Espacio reservado para ensamblar contexto, evidencia y citas destacadas.',
      },
      {
        title: 'Documentos relacionados',
        description: 'Region prevista para vinculos documentales, personas, lugares y conexiones narrativas.',
      },
    ],
  };
}

export function buildReaderRelatedDocuments(letter: CartaDetail, letters: CartaSummary[]) {
  return letters
    .filter((candidate) => candidate.id_carta !== letter.id_carta)
    .filter((candidate) => {
      const sameSender = candidate.remitente && candidate.remitente === letter.remitente;
      const samePlace = candidate.lugar && candidate.lugar === letter.lugar;
      return sameSender || samePlace;
    })
    .slice(0, 3);
}
