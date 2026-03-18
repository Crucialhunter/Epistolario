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

export interface StitchLegajoNavCOverviewHighlight {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
}

export interface StitchLegajoNavCFeaturedLetter {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly badges: readonly string[];
}

export interface StitchLegajoNavCAccessCard {
  readonly title: string;
  readonly description: string;
  readonly href: string;
}

export interface StitchLegajoNavCNodeGroup {
  readonly title: string;
  readonly items: readonly string[];
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
  readonly mode: 'overview' | 'archivo';
  readonly primaryCtaLabel: string;
  readonly overviewIntro: string;
  readonly overviewHighlights: readonly StitchLegajoNavCOverviewHighlight[];
  readonly featuredLetters: readonly StitchLegajoNavCFeaturedLetter[];
  readonly accessCards: readonly StitchLegajoNavCAccessCard[];
  readonly nodeGroups: readonly StitchLegajoNavCNodeGroup[];
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

function buildOverviewHighlights(archive: LegajoArchiveVM): readonly StitchLegajoNavCOverviewHighlight[] {
  return [
    {
      eyebrow: 'Promesa',
      title: 'Que activa este legajo',
      description: archive.legajo.teaserText,
    },
    {
      eyebrow: 'Escala',
      title: `${archive.legajo.letterCount} cartas para recorrer`,
      description: 'La overview resume el volumen y prepara la entrada al workspace documental sin sustituirlo.',
    },
    {
      eyebrow: 'Acceso',
      title: archive.legajo.emphasis === 'visual' ? 'Textual + visual consolidado' : 'Lectura textual consolidada',
      description: archive.legajo.availability.imageEnhanced
        ? 'El manuscrito local ya refuerza algunas cartas dentro del mismo runtime consolidado.'
        : 'El corpus puede explorarse con la misma UI consolidada aunque no haya manuscrito local destacado.',
    },
    {
      eyebrow: 'Uso',
      title: 'Overview antes del archivo',
      description: 'Primero contexto y nodos. Despues filtros, preview y lector en la superficie de archivo.',
    },
  ];
}

function buildFeaturedLetters(archive: LegajoArchiveVM): readonly StitchLegajoNavCFeaturedLetter[] {
  return archive.letters.slice(0, 4).map((letter) => ({
    id: letter.id_carta,
    title:
      letter.remitente || letter.destinatario
        ? `${letter.remitente || 'Remitente no identificado'} a ${letter.destinatario || 'destinatario no identificado'}`
        : `Carta ${letter.id_carta}`,
    summary: [letter.fecha || 'Sin fecha', letter.lugar || null, letter.temas || null].filter(Boolean).join(' · '),
    badges: [letter.hasImages ? 'Manuscrito' : null, letter.lugar || null].filter(Boolean) as string[],
  }));
}

function buildAccessCards(legajoId: string): readonly StitchLegajoNavCAccessCard[] {
  return [
    {
      title: 'Archivo documental',
      description: 'Workspace de filtros, lista, preview y salto al lector completo.',
      href: `/legajos/${legajoId}/archivo`,
    },
    {
      title: 'Recorridos',
      description: 'Entrada preparada para secuencias curatoriales futuras sin salir del runtime consolidado.',
      href: `/legajos/${legajoId}/recorridos`,
    },
    {
      title: 'Relatos',
      description: 'Capa preparada para lectura editorial futura, sin desplazar la navegacion documental.',
      href: `/legajos/${legajoId}/relatos`,
    },
  ];
}

function buildNodeGroups(archive: LegajoArchiveVM): readonly StitchLegajoNavCNodeGroup[] {
  return [
    { title: 'Personas', items: archive.legajo.keyPeople.slice(0, 6) },
    { title: 'Lugares', items: archive.legajo.keyPlaces.slice(0, 6) },
    { title: 'Temas', items: archive.legajo.keyThemes.slice(0, 6) },
  ];
}

export function buildStitchLegajoNavCViewData(
  archive: LegajoArchiveVM,
  mode: 'overview' | 'archivo' = 'archivo'
): StitchLegajoNavCViewData {
  const legajoId = archive.legajo.id;
  const heroImageSrc = pickHeroImage(archive);

  return {
    projectId: '18111140058027548168',
    screenId: 'a839986bf54b4470b4d296166b018205',
    projectName: 'ARCA',
    headerLinks: [
      { label: 'Inicio', href: '/' },
      { label: 'Archivo', href: '/legajos', active: true },
      { label: 'Recorridos', href: `/legajos/${legajoId}/recorridos` },
      { label: 'Relatos', href: `/legajos/${legajoId}/relatos` },
    ],
    heroEyebrow: mode === 'overview' ? 'Overview del legajo' : 'Archivo del legajo',
    title: archive.legajo.title,
    description: buildDescription(archive),
    metrics: buildMetrics(archive),
    heroImageSrc,
    heroImageAlt: heroImageSrc ? `Composicion documental del legajo ${legajoId}` : `Legajo ${legajoId} sin imagen local principal`,
    tabs: [
      { id: 'overview', label: 'Legajo', href: `/legajos/${legajoId}`, active: mode === 'overview' },
      { id: 'archivo', label: 'Archivo', href: `/legajos/${legajoId}/archivo`, active: mode === 'archivo' },
      { id: 'recorridos', label: 'Recorridos', href: `/legajos/${legajoId}/recorridos` },
      { id: 'relatos', label: 'Relatos', href: `/legajos/${legajoId}/relatos` },
    ],
    narrative: buildNarrative(archive.curatorialSections[0]),
    backToCurrentHref: mode === 'overview' ? `/legajos/${legajoId}/archivo` : `/legajos/${legajoId}`,
    sourceHref: heroImageSrc,
    legajoId,
    letters: archive.letters,
    initialPreview: archive.initialPreview,
    mode,
    primaryCtaLabel: mode === 'overview' ? 'Abrir archivo documental' : 'Volver al overview del legajo',
    overviewIntro:
      'Esta superficie sintetiza el legajo como portada documental. Sirve para entender contexto, nodos y cartas de entrada antes de abrir el archivo de trabajo.',
    overviewHighlights: buildOverviewHighlights(archive),
    featuredLetters: buildFeaturedLetters(archive),
    accessCards: buildAccessCards(legajoId),
    nodeGroups: buildNodeGroups(archive),
  };
}
