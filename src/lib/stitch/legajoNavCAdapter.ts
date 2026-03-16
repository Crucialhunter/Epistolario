import { CartaDetail, CartaSummary } from '@/lib/types';
import { CuratedSectionVM, LegajoArchiveVM } from '@/lib/view-models';

export interface StitchLegajoNavCMetric {
  readonly label: string;
  readonly value: string;
}

export interface StitchLegajoNavCTab {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
}

export interface StitchLegajoNavCHeaderLink {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
}

export interface StitchLegajoNavCNarrativeData {
  readonly title: string;
  readonly description: string;
  readonly cta: string;
}

export interface StitchLegajoNavCViewData {
  readonly projectId: string;
  readonly screenId: string;
  readonly projectName: string;
  readonly headerLinks: readonly StitchLegajoNavCHeaderLink[];
  readonly heroEyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly metrics: readonly StitchLegajoNavCMetric[];
  readonly heroImageSrc: string | null;
  readonly heroImageAlt: string;
  readonly tabs: readonly StitchLegajoNavCTab[];
  readonly narrative: Readonly<StitchLegajoNavCNarrativeData>;
  readonly backToCurrentHref: string;
  readonly sourceHref: string | null;
  readonly legajoId: string;
  readonly letters: readonly CartaSummary[];
  readonly initialPreview: CartaDetail | null;
}

function toMetricValue(value: number | string, suffix?: string) {
  return suffix ? `${value} ${suffix}` : String(value);
}

function pickHeroImage(archive: LegajoArchiveVM) {
  if (archive.initialPreview?.primaryImage) {
    return archive.initialPreview.primaryImage;
  }

  const firstVisualLetter = archive.letters.find((letter) => letter.primaryImage);
  return firstVisualLetter?.primaryImage ?? null;
}

function buildDescription(archive: LegajoArchiveVM) {
  return [
    archive.legajo.summary,
    archive.legajo.keyPlaces.length ? `Lugares clave: ${archive.legajo.keyPlaces.slice(0, 3).join(', ')}.` : null,
    archive.legajo.principalActors.length ? `Actores principales: ${archive.legajo.principalActors.slice(0, 3).join(', ')}.` : null,
  ]
    .filter(Boolean)
    .join(' ');
}

function buildMetrics(archive: LegajoArchiveVM): readonly StitchLegajoNavCMetric[] {
  return [
    { label: 'Fechas', value: archive.legajo.dateRange },
    { label: 'Cartas', value: toMetricValue(archive.legajo.letterCount, 'unidades') },
    { label: 'Manuscritos', value: toMetricValue(archive.legajo.imageCount, 'folios') },
    {
      label: 'Lugares clave',
      value: archive.legajo.keyPlaces.slice(0, 3).join(', ') || 'Sin lugares destacados',
    },
  ];
}

function buildNarrative(section?: CuratedSectionVM): StitchLegajoNavCNarrativeData {
  return {
    title: section?.title || 'Recorridos',
    description:
      section?.description ||
      'Modulo narrativo previsto para contextualizar itinerarios, nodos y lecturas curatoriales del legajo.',
    cta: 'Explorar recorridos',
  };
}

export function buildStitchLegajoNavCViewData(archive: LegajoArchiveVM): StitchLegajoNavCViewData {
  const legajoId = archive.legajo.id;
  const heroImageSrc = pickHeroImage(archive);

  return {
    projectId: '18111140058027548168',
    screenId: 'a839986bf54b4470b4d296166b018205',
    projectName: 'ARCA',
    headerLinks: [
      { label: 'Archivo', href: '/legajos', active: true },
      { label: 'Legajos', href: '/legajos' },
      { label: 'Recorridos', href: `/legajos/${legajoId}/recorridos` },
      { label: 'Relatos', href: `/legajos/${legajoId}/relatos` },
      { label: 'Sobre el proyecto', href: '/' },
    ],
    heroEyebrow: 'Archivo del legajo',
    title: archive.legajo.title,
    description: buildDescription(archive),
    metrics: buildMetrics(archive),
    heroImageSrc,
    heroImageAlt: heroImageSrc ? `Composicion documental del legajo ${legajoId}` : `Legajo ${legajoId} sin imagen local principal`,
    tabs: [
      { id: 'archivo', label: 'Archivo', href: `/legajos/${legajoId}/archivo`, active: true },
      { id: 'recorridos', label: 'Recorridos', href: `/legajos/${legajoId}/recorridos` },
      { id: 'relatos', label: 'Relatos', href: `/legajos/${legajoId}/relatos` },
    ],
    narrative: buildNarrative(archive.curatorialSections[0]),
    backToCurrentHref: `/legajos/${legajoId}`,
    sourceHref: heroImageSrc,
    legajoId,
    letters: archive.letters,
    initialPreview: archive.initialPreview,
  };
}
