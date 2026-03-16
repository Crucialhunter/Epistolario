import { CartaDetail, CartaSummary } from '@/lib/types';
import { LegajoCorpusVM } from '@/lib/view-models';

export interface CartaReadyMetadataItem {
  readonly label: string;
  readonly value: string;
}

export interface CartaReadyMetadataColumn {
  readonly title: string;
  readonly items: readonly CartaReadyMetadataItem[];
}

export interface CartaReadyTag {
  readonly label: string;
}

export interface CartaReadyPerson {
  readonly name: string;
  readonly role: string;
  readonly imageUrl?: string;
  readonly type: 'person' | 'place';
}

export interface CartaReadyRelatedDocument {
  readonly title: string;
  readonly meta: string;
  readonly imageUrl: string | null;
  readonly href: string;
}

export interface StitchCartaReadyViewData {
  readonly projectId: string;
  readonly screenId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly breadcrumbs: readonly string[];
  readonly documentIdentityLine: string;
  readonly metadataColumns: readonly CartaReadyMetadataColumn[];
  readonly manuscriptTitle: string;
  readonly manuscriptImage: string | null;
  readonly manuscriptImageCount: number;
  readonly manuscriptImages: readonly {
    src: string;
    label: string;
  }[];
  readonly transcriptHeading: string;
  readonly modernizadaParagraphs: readonly string[];
  readonly literalParagraphs: readonly string[];
  readonly documentaryContext: readonly CartaReadyMetadataItem[];
  readonly thematicTags: readonly CartaReadyTag[];
  readonly peopleAndPlaces: readonly CartaReadyPerson[];
  readonly featuredQuote: string;
  readonly featuredQuoteMeta: string;
  readonly relatedDocuments: readonly CartaReadyRelatedDocument[];
  readonly sourceHref: string | null;
}

function splitParagraphs(text: string) {
  return text
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function compactThemeList(themes: string) {
  return themes
    .split(',')
    .map((theme) => theme.trim())
    .filter(Boolean);
}

function buildMetadataColumns(carta: CartaDetail): readonly CartaReadyMetadataColumn[] {
  return [
    {
      title: 'Identificación documental',
      items: [
        { label: 'Fecha de emisión', value: carta.fecha || 'Sin fecha identificada' },
        { label: 'Signatura', value: carta.signatura || 'Sin signatura disponible' },
        { label: 'Soporte', value: carta.hasImages ? 'Manuscrito con imagen local' : 'Lectura textual sin imagen local' },
      ],
    },
    {
      title: 'Correspondencia',
      items: [
        { label: 'Remitente', value: carta.remitente || 'Remitente no identificado' },
        { label: 'Destinatario', value: carta.destinatario || 'Destinatario no identificado' },
      ],
    },
    {
      title: 'Localización y contexto archivístico',
      items: [
        { label: 'Lugar de origen', value: carta.lugar || 'Lugar no identificado' },
        { label: 'Estado de acceso', value: carta.hasImages ? 'Con manuscrito local disponible' : 'Lectura textual sin manuscrito local' },
        { label: 'Repositorio', value: `Legajo ${legajoIdFromCarta(carta)} del CorpusBase` },
      ],
    },
  ];
}

function legajoIdFromCarta(carta: CartaDetail) {
  return carta.url_origen?.match(/legajo-(\d+)/)?.[1] ?? 'sin referencia';
}

function buildPeopleAndPlaces(legajo: LegajoCorpusVM, carta: CartaDetail): readonly CartaReadyPerson[] {
  const entities: CartaReadyPerson[] = [];

  if (carta.remitente) {
    entities.push({ name: carta.remitente, role: 'Remitente', type: 'person' });
  }
  if (carta.destinatario && carta.destinatario !== carta.remitente) {
    entities.push({ name: carta.destinatario, role: 'Destinatario', type: 'person' });
  }
  if (carta.lugar) {
    entities.push({ name: carta.lugar, role: 'Lugar mencionado', type: 'place' });
  }

  for (const person of legajo.keyPeople.slice(0, 2)) {
    if (!entities.some((entity) => entity.name === person)) {
      entities.push({ name: person, role: 'Actor del legajo', type: 'person' });
    }
  }

  return entities.slice(0, 4);
}

function buildRelatedDocuments(legajoId: string, relatedDocuments: CartaSummary[]): readonly CartaReadyRelatedDocument[] {
  return relatedDocuments.map((document) => ({
    title: document.id_carta ? `Carta ${document.id_carta}` : 'Documento relacionado',
    meta: [document.fecha, document.remitente || document.destinatario || 'Sin corresponsal']
      .filter(Boolean)
      .join(' · '),
    imageUrl: document.primaryImage,
    href: `/legajos/${legajoId}/cartas/${document.id_carta}`,
  }));
}

export function buildStitchCartaReadyViewData(
  legajo: LegajoCorpusVM,
  carta: CartaDetail,
  relatedDocuments: CartaSummary[]
): StitchCartaReadyViewData {
  const modernizadaParagraphs = splitParagraphs(carta.transcripcion.modernizada);
  const literalParagraphs = splitParagraphs(carta.transcripcion.literal);
  const themes = compactThemeList(carta.temas);
  const title = carta.nombre_carta || `Carta ${carta.id_carta}`;
  const documentIdentityLine = [carta.signatura, carta.fecha, carta.lugar].filter(Boolean).join(' · ');

  return {
    projectId: '14451550773222330795',
    screenId: '449fd281a02640b388fc6fbe51ed61b6',
    title,
    subtitle: carta.resumen || `Consulta documental del legajo ${legajo.id} con lectura textual completa y manuscrito local cuando existe.`,
    breadcrumbs: ['Inicio', 'Legajos', `Legajo ${legajo.id}`, `Carta ${carta.id_carta}`, 'Consulta'],
    documentIdentityLine,
    metadataColumns: buildMetadataColumns(carta),
    manuscriptTitle: title,
    manuscriptImage: carta.primaryImage,
    manuscriptImageCount: carta.imagenes.length,
    manuscriptImages:
      carta.imagenes.length > 0
        ? carta.imagenes.map((image, index) => ({
            src: image.src,
            label: `Imagen ${index + 1}`,
          }))
        : carta.primaryImage
          ? [{ src: carta.primaryImage, label: 'Imagen principal' }]
          : [],
    transcriptHeading:
      modernizadaParagraphs[0]?.slice(0, 80) || literalParagraphs[0]?.slice(0, 80) || 'Transcripción disponible',
    modernizadaParagraphs,
    literalParagraphs,
    documentaryContext: [
      { label: 'Idioma', value: carta.idioma || 'Sin idioma especificado' },
      {
        label: 'Modo de lectura',
        value: carta.hasImages && legajo.availability.imageEnhanced ? 'Textual + manuscrito local' : 'Textual / documental',
      },
      { label: 'Fuente', value: 'CorpusBase real de la aplicación' },
    ],
    thematicTags: themes.map((theme) => ({ label: theme })),
    peopleAndPlaces: buildPeopleAndPlaces(legajo, carta),
    featuredQuote:
      modernizadaParagraphs.find(Boolean) ||
      literalParagraphs.find(Boolean) ||
      'La carta aún no tiene un pasaje suficientemente limpio para destacar.',
    featuredQuoteMeta: carta.signatura || `Carta ${carta.id_carta}`,
    relatedDocuments: buildRelatedDocuments(legajo.id, relatedDocuments),
    sourceHref: carta.url_origen || null,
  };
}
