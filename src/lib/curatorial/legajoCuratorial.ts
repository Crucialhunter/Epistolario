import fs from 'fs/promises';
import path from 'path';
import { getCarta } from '@/lib/data/api';
import { CartaDetail, CartaSummary } from '@/lib/types';
import { LegajoArchiveVM } from '@/lib/view-models';

interface DemoEventQuote {
  id_carta: string;
  quote: string;
}

interface DemoEvent {
  event_id: string;
  date_iso: string;
  title: string;
  summary: string;
  theme: string;
  people?: string[];
  place_labels?: string[];
  letters_source?: string[];
  evidence_quotes?: DemoEventQuote[];
}

interface DemoTourAction {
  type: string;
  quote?: string;
}

interface DemoTourStep {
  step_id: string;
  title: string;
  primary_event_id?: string;
  primary_letter_id?: string;
  ui_actions?: DemoTourAction[];
}

interface DemoTour {
  title: string;
  audio_script?: string;
  steps: DemoTourStep[];
}

interface DemoLetterEdge {
  id_carta: string;
  date_iso: string;
  granularity?: string;
  from_person?: string;
  to_person?: string;
  from_place_key?: string;
  from_place_label?: string;
  to_place_key?: string;
  to_place_label?: string;
  themes?: string[];
  event_ids?: string[];
  evidence_quote?: string;
}

interface LensPanel {
  type: string;
  title: string;
  items: Array<Record<string, unknown>>;
}

interface LensSummary {
  title: string;
  one_liner: string;
  summary_bullets?: string[];
  kpis?: Record<string, unknown>;
  panels?: LensPanel[];
}

interface DemoLensPanels {
  dataset?: {
    num_letters?: number;
    num_events?: number;
    date_range?: {
      from?: string;
      to?: string;
    };
  };
  lenses?: Record<string, LensSummary>;
}

export interface CuratorialStat {
  label: string;
  value: string;
  detail: string;
}

export interface CuratorialStep {
  id: string;
  label: string;
  title: string;
  summary: string;
  meta: string;
  quote: string;
  quoteMeta: string;
  letterHref: string;
  letterLabel: string;
}

export interface CuratorialLetterCard {
  id: string;
  title: string;
  meta: string;
  reason: string;
  quote: string;
  href: string;
}

export interface CuratorialTagItem {
  label: string;
  detail: string;
  tone: 'persona' | 'lugar' | 'tema';
}

export interface CuratorialChronicleItem {
  id: string;
  dateLabel: string;
  title: string;
  summary: string;
  meta: string;
  quote: string;
  href: string;
  letterLabel: string;
}

export interface CuratorialPeriodicalData {
  issueLabel: string;
  title: string;
  subtitle: string;
  editorNote: string;
  lead: CuratorialChronicleItem;
  secondary: CuratorialChronicleItem[];
  routeSignals: string[];
  peopleSignals: string[];
  mapNote: string;
}

export interface CuratorialTimelineItem {
  id: string;
  type: 'evento' | 'carta';
  dateIso: string;
  dateLabel: string;
  monthLabel: string;
  yearLabel: string;
  eyebrow: string;
  title: string;
  summary: string;
  quote: string;
  meta: string;
  href: string;
  hrefLabel: string;
  stepLabel?: string;
  chapterLabel?: string;
  mapLabel?: string;
  related: Array<{
    id: string;
    type: 'evento' | 'carta';
    label: string;
    meta: string;
    targetId: string;
    href?: string;
  }>;
}

export interface CuratorialTimelineData {
  title: string;
  description: string;
  rangeLabel?: string;
  narrationHint: string;
  topNote: string;
  audioNote: string;
  mapBridge: string;
  chapters: Array<{
    id: string;
    label: string;
    targetId: string;
  }>;
  items: CuratorialTimelineItem[];
}

export interface CuratorialStoryLetter {
  label: string;
  href: string;
  meta: string;
}

export interface CuratorialStory {
  id: string;
  title: string;
  thesis: string;
  evidence: string;
  quote: string;
  quoteMeta: string;
  relatedLetters: CuratorialStoryLetter[];
  readingLine: string[];
}

export interface LegajoCuratorialPageData {
  kind: 'recorridos' | 'relatos';
  title: string;
  description: string;
  intro: string;
  highlight: string;
  sourceLabel: string;
  fallbackNote?: string;
  stats: CuratorialStat[];
  periodical?: CuratorialPeriodicalData;
  timelineViva?: CuratorialTimelineData;
  route?: {
    title: string;
    description: string;
    steps: CuratorialStep[];
  };
  keyLetters: CuratorialLetterCard[];
  contextTags: CuratorialTagItem[];
  chronicle: {
    title: string;
    description: string;
    items: CuratorialChronicleItem[];
  };
  stories: CuratorialStory[];
  readingLines: string[];
}

const LEGACY_DEMO_ROOT = path.join(process.cwd(), 'dataset_demo', 'derived');

async function readDerivedJson<T>(filename: string) {
  const filePath = path.join(LEGACY_DEMO_ROOT, filename);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

async function readDerivedText(filename: string) {
  const filePath = path.join(LEGACY_DEMO_ROOT, filename);
  return fs.readFile(filePath, 'utf8');
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function compactText(value?: string | null, maxLength = 160) {
  const normalized = (value ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function titleForLetter(letter?: CartaDetail | null, fallbackId?: string) {
  if (!letter) return fallbackId ? `Carta ${fallbackId}` : 'Carta destacada';
  return letter.nombre_carta || `Carta ${letter.id_carta}`;
}

function summaryForLetter(letter?: CartaDetail | null) {
  return compactText(
    letter?.resumen ||
      letter?.transcripcion.modernizada.split(/[\n.]+/).find((fragment) => fragment.trim().length > 40) ||
      letter?.transcripcion.literal.split(/[\n.]+/).find((fragment) => fragment.trim().length > 40) ||
      '',
  );
}

function quoteForLetter(letter?: CartaDetail | null) {
  return compactText(
    letter?.transcripcion.modernizada.split(/[\n.]+/).find((fragment) => fragment.trim().length > 30) ||
      letter?.transcripcion.literal.split(/[\n.]+/).find((fragment) => fragment.trim().length > 30) ||
      letter?.resumen ||
      '',
    150,
  );
}

function metaForLetter(letter?: CartaDetail | null) {
  return [letter?.fecha, letter?.lugar].filter(Boolean).join(' · ') || 'Sin fecha ni lugar confirmados';
}

function makeLetterHref(legajoId: string, letterId: string) {
  return `/legajos/${legajoId}/cartas/${letterId}`;
}

async function loadLetterMap(legajoId: string, ids: Array<string | undefined>) {
  const uniqueIds = unique(ids.filter((id): id is string => Boolean(id)));
  const entries = await Promise.all(uniqueIds.map(async (id) => [id, await getCarta(legajoId, id)] as const));
  return new Map(entries.filter((entry) => entry[1]).map(([id, detail]) => [id, detail as CartaDetail]));
}

function countValues(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
}

function startCase(value?: string | null) {
  const text = (value ?? '').trim();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function normalizeTimelineSortDate(iso?: string | null) {
  if (!iso) return '9999-99-99';
  if (iso.length === 7) return `${iso}-15`;
  if (iso.length === 4) return `${iso}-06-15`;
  return iso;
}

function timelineItemTypeRank(type: 'evento' | 'carta') {
  return type === 'evento' ? 0 : 1;
}

function formatTimelineMonthParts(dateIso?: string | null) {
  const rawText = (dateIso ?? '').trim();
  const normalized = normalizeTimelineSortDate(dateIso);
  const parsed = new Date(`${normalized}T12:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    const monthMatch = rawText
      .toLowerCase()
      .match(/enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/);
    const yearMatch = rawText.match(/\b(1[5-9]\d{2}|20\d{2})\b/);

    return {
      monthLabel: startCase(monthMatch?.[0] || 'Periodo'),
      yearLabel: yearMatch?.[0] || 's.f.',
    };
  }

  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(parsed);
  const yearLabel = new Intl.DateTimeFormat('es-ES', { year: 'numeric' }).format(parsed);

  return {
    monthLabel: startCase(monthLabel),
    yearLabel,
  };
}

function formatTimelineDateLabel(dateIso?: string | null) {
  if (!dateIso) return 'Sin fecha';

  if (dateIso.length === 7) {
    const parts = formatTimelineMonthParts(dateIso);
    return `${parts.monthLabel} ${parts.yearLabel}`;
  }

  if (dateIso.length === 4) {
    return dateIso;
  }

  const parsed = new Date(`${dateIso}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return dateIso;

  const day = new Intl.DateTimeFormat('es-ES', { day: 'numeric' }).format(parsed);
  const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(parsed).replace('.', '');
  const year = new Intl.DateTimeFormat('es-ES', { year: 'numeric' }).format(parsed);
  return `${day} ${startCase(month)} ${year}`;
}

function buildChronicleItemFromEvent(event: DemoEvent, letterMap: Map<string, CartaDetail>, legajoId: string, fallbackLetterId: string): CuratorialChronicleItem {
  const sourceLetterId = event.letters_source?.[0] || event.evidence_quotes?.[0]?.id_carta || fallbackLetterId;
  const sourceLetter = sourceLetterId ? letterMap.get(sourceLetterId) : null;

  return {
    id: event.event_id,
    dateLabel: event.date_iso,
    title: event.title,
    summary: compactText(event.summary, 180),
    meta: [event.theme, event.place_labels?.[0], event.people?.slice(0, 2).join(', ')].filter(Boolean).join(' · '),
    quote: compactText(event.evidence_quotes?.[0]?.quote || quoteForLetter(sourceLetter), 150),
    href: makeLetterHref(legajoId, sourceLetterId || fallbackLetterId),
    letterLabel: sourceLetterId ? `Carta ${sourceLetterId}` : 'Carta asociada',
  };
}

function buildTimelineItemFromEvent(
  event: DemoEvent,
  letterMap: Map<string, CartaDetail>,
  legajoId: string,
  stepTitle?: string,
): CuratorialTimelineItem {
  const sourceLetterId = event.letters_source?.[0] || event.evidence_quotes?.[0]?.id_carta || '';
  const sourceLetter = sourceLetterId ? letterMap.get(sourceLetterId) : null;
  const monthParts = formatTimelineMonthParts(event.date_iso);

  return {
    id: event.event_id,
    type: 'evento',
    dateIso: event.date_iso,
    dateLabel: formatTimelineDateLabel(event.date_iso),
    monthLabel: monthParts.monthLabel,
    yearLabel: monthParts.yearLabel,
    eyebrow: 'Evento clave',
    title: event.title,
    summary: compactText(event.summary, 200),
    quote: compactText(event.evidence_quotes?.[0]?.quote || quoteForLetter(sourceLetter), 170),
    meta: [event.theme, event.place_labels?.slice(0, 2).join(' -> '), event.people?.slice(0, 2).join(', ')].filter(Boolean).join(' · '),
    href: makeLetterHref(legajoId, sourceLetterId || sourceLetter?.id_carta || ''),
    hrefLabel: sourceLetterId ? `Abrir carta ${sourceLetterId}` : 'Abrir carta soporte',
    stepLabel: stepTitle ? `Recorrido: ${stepTitle}` : undefined,
    chapterLabel: stepTitle || undefined,
    mapLabel: event.place_labels?.length ? `Ruta conceptual: ${event.place_labels.join(' -> ')}` : undefined,
    related: (event.letters_source ?? []).slice(0, 4).map((letterId) => {
      const letter = letterMap.get(letterId);
      return {
        id: `related-letter-${letterId}`,
        type: 'carta' as const,
        label: titleForLetter(letter, letterId),
        meta: metaForLetter(letter),
        targetId: `letter-${letterId}`,
        href: makeLetterHref(legajoId, letterId),
      };
    }),
  };
}

function buildTimelineItemFromLetterEdge(
  letter: DemoLetterEdge,
  letterMap: Map<string, CartaDetail>,
  legajoId: string,
  linkedEvent?: DemoEvent,
  stepTitle?: string,
): CuratorialTimelineItem {
  const detail = letterMap.get(letter.id_carta);
  const monthParts = formatTimelineMonthParts(letter.date_iso);
  const places = [letter.from_place_label, letter.to_place_label].filter(Boolean).join(' -> ');

  return {
    id: `letter-${letter.id_carta}`,
    type: 'carta',
    dateIso: letter.date_iso,
    dateLabel: formatTimelineDateLabel(letter.date_iso),
    monthLabel: monthParts.monthLabel,
    yearLabel: monthParts.yearLabel,
    eyebrow: 'Carta en circulacion',
    title: titleForLetter(detail, letter.id_carta) || `Carta ${letter.id_carta}`,
    summary:
      summaryForLetter(detail) ||
      compactText(
        linkedEvent?.summary ||
          `${letter.from_person || 'Remitente no fijado'} escribe a ${letter.to_person || 'destinatario no fijado'} desde ${letter.from_place_label || 'origen pendiente'}.`,
        200,
      ),
    quote: compactText(letter.evidence_quote || quoteForLetter(detail), 170),
    meta: [places, letter.themes?.slice(0, 2).join(', '), linkedEvent?.title].filter(Boolean).join(' · '),
    href: makeLetterHref(legajoId, letter.id_carta),
    hrefLabel: `Abrir carta ${letter.id_carta}`,
    stepLabel: stepTitle ? `Paso asociado: ${stepTitle}` : undefined,
    chapterLabel: stepTitle || undefined,
    mapLabel: places ? `Trayecto documental: ${places}` : undefined,
    related: linkedEvent
      ? [
          {
            id: `related-event-${linkedEvent.event_id}`,
            type: 'evento' as const,
            label: linkedEvent.title,
            meta: [linkedEvent.date_iso, linkedEvent.theme].filter(Boolean).join(' · '),
            targetId: linkedEvent.event_id,
          },
          ...(linkedEvent.letters_source ?? [])
            .filter((id) => id !== letter.id_carta)
            .slice(0, 3)
            .map((letterId) => {
              const relatedLetter = letterMap.get(letterId);
              return {
                id: `related-letter-${letterId}`,
                type: 'carta' as const,
                label: titleForLetter(relatedLetter, letterId),
                meta: metaForLetter(relatedLetter),
                targetId: `letter-${letterId}`,
                href: makeLetterHref(legajoId, letterId),
              };
            }),
        ]
      : [],
  };
}

function pickFallbackLetters(letters: CartaSummary[]) {
  if (letters.length <= 3) return letters;
  const midpoint = Math.floor(letters.length / 2);
  return unique([letters[0], letters[midpoint], letters[letters.length - 1]].filter(Boolean));
}

function buildFallbackStats(archive: LegajoArchiveVM) {
  return [
    {
      label: 'Cartas',
      value: String(archive.legajo.letterCount),
      detail: 'Volumen ya navegable dentro del corpus consolidado.',
    },
    {
      label: 'Arco temporal',
      value: archive.legajo.dateRange,
      detail: 'Rango cronológico disponible hoy para montar lecturas editoriales.',
    },
    {
      label: 'Lugares clave',
      value: String(archive.legajo.keyPlaces.length || 0),
      detail: archive.legajo.keyPlaces.slice(0, 3).join(', ') || 'Pendiente de densificar con curaduría específica.',
    },
  ];
}

function buildFallbackContextTags(archive: LegajoArchiveVM, letters: CartaSummary[]): CuratorialTagItem[] {
  const topPlaces = countValues(letters.map((letter) => letter.lugar)).slice(0, 3);
  const topPeople = countValues(letters.map((letter) => letter.remitente)).slice(0, 3);
  const themes = unique(
    letters
      .flatMap((letter) => letter.temas.split(','))
      .map((theme) => theme.trim())
      .filter(Boolean),
  ).slice(0, 3);

  return [
    ...topPeople.map(([label, count]) => ({ label, detail: `${count} cartas emitidas en este legajo.`, tone: 'persona' as const })),
    ...topPlaces.map(([label, count]) => ({ label, detail: `${count} apariciones como origen documental.`, tone: 'lugar' as const })),
    ...themes.map((label) => ({ label, detail: 'Tema visible en la indexación actual del corpus.', tone: 'tema' as const })),
  ].slice(0, 9);
}

function buildFallbackReadingLines(archive: LegajoArchiveVM, letters: CartaSummary[]) {
  const topSender = countValues(letters.map((letter) => letter.remitente))[0]?.[0];
  const topPlace = countValues(letters.map((letter) => letter.lugar))[0]?.[0];

  return [
    archive.legajo.narrativeDensity ? `Leer el legajo como corpus de densidad ${archive.legajo.narrativeDensity.toLowerCase()}.` : 'Leer el legajo como secuencia documental en construcción.',
    topSender ? `Seguir la voz dominante de ${topSender} para detectar continuidad y rupturas.` : 'Seguir remitentes y destinatarios para fijar el eje principal del intercambio.',
    topPlace ? `Usar ${topPlace} como anclaje geográfico para reconstruir la circulación.` : 'Usar los lugares de origen para ordenar la circulación del legajo.',
  ];
}

function buildFallbackTimelineData(
  archive: LegajoArchiveVM,
  chronicleItems: CuratorialChronicleItem[],
  routeSteps: CuratorialStep[],
  readingLines: string[],
): CuratorialTimelineData | undefined {
  const items = chronicleItems
    .flatMap((item, index) => {
      const monthParts = formatTimelineMonthParts(item.dateLabel);
      const routeStep = routeSteps[index];

      const eventItem: CuratorialTimelineItem = {
        id: `fallback-event-${item.id}`,
        type: 'evento',
        dateIso: item.dateLabel,
        dateLabel: item.dateLabel,
        monthLabel: monthParts.monthLabel,
        yearLabel: monthParts.yearLabel,
        eyebrow: 'Cronica',
        title: item.title,
        summary: item.summary,
        quote: item.quote,
        meta: item.meta,
        href: item.href,
        hrefLabel: item.letterLabel,
        stepLabel: routeStep ? `Recorrido: ${routeStep.title}` : undefined,
        mapLabel: item.meta || undefined,
        related: routeStep
          ? [
              {
                id: `fallback-related-letter-${routeStep.id}`,
                type: 'carta',
                label: routeStep.title,
                meta: routeStep.meta,
                targetId: `fallback-letter-${routeStep.id}`,
                href: routeStep.letterHref,
              },
            ]
          : [],
      };

      const letterItem = routeStep
        ? {
            id: `fallback-letter-${routeStep.id}`,
            type: 'carta' as const,
            dateIso: routeStep.meta,
            dateLabel: routeStep.meta,
            monthLabel: monthParts.monthLabel,
            yearLabel: monthParts.yearLabel,
            eyebrow: 'Carta',
            title: routeStep.title,
            summary: routeStep.summary,
            quote: routeStep.quote,
            meta: routeStep.meta,
            href: routeStep.letterHref,
            hrefLabel: routeStep.letterLabel,
            stepLabel: `Paso ${index + 1}`,
            mapLabel: routeStep.meta,
            related: [
              {
                id: `fallback-related-event-${item.id}`,
                type: 'evento',
                label: item.title,
                meta: item.meta,
                targetId: `fallback-event-${item.id}`,
              },
            ],
          }
        : null;

      return [eventItem, letterItem].filter(Boolean) as CuratorialTimelineItem[];
    })
    .slice(0, 10);

  if (!items.length) return undefined;

  const sortedTimelineItems = items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const dateComparison = normalizeTimelineSortDate(left.item.dateIso).localeCompare(normalizeTimelineSortDate(right.item.dateIso));
      if (dateComparison !== 0) return dateComparison;

      const typeComparison = timelineItemTypeRank(left.item.type) - timelineItemTypeRank(right.item.type);
      if (typeComparison !== 0) return typeComparison;

      return left.index - right.index;
    })
    .map(({ item }) => item);

  return {
    title: 'Timeline Viva',
    description: 'Primera lectura temporal del legajo: cronica, cartas y recorrido se ordenan sobre un mismo eje narrativo.',
    rangeLabel: archive.legajo.dateRange,
    narrationHint: readingLines[0] || 'Capa preparada para narracion futura.',
    topNote: 'Modo temporal full-screen para entrar en el legajo sin salir de la linea de tiempo.',
    audioNote: 'La interfaz queda preparada para activar locucion en hitos concretos.',
    mapBridge: 'Esta version prepara la lectura espacial a partir de fechas, remitentes y lugares ya visibles.',
    chapters: routeSteps.map((step) => ({
      id: `chapter-${step.id}`,
      label: step.title,
      targetId: `fallback-letter-${step.id}`,
    })),
    items: sortedTimelineItems,
  };
}

function buildTimelineVivaDataForLegajo10(args: {
  archive: LegajoArchiveVM;
  tour: DemoTour;
  events: DemoEvent[];
  letterEdges: DemoLetterEdge[];
  letterMap: Map<string, CartaDetail>;
}): CuratorialTimelineData | undefined {
  const { archive, tour, events, letterEdges, letterMap } = args;
  const eventMap = new Map(events.map((event) => [event.event_id, event]));
  const stepByEventId = new Map(
    tour.steps.filter((step) => step.primary_event_id).map((step) => [step.primary_event_id as string, step.title]),
  );
  const stepByLetterId = new Map(
    tour.steps.filter((step) => step.primary_letter_id).map((step) => [step.primary_letter_id as string, step.title]),
  );
  const monthMap = new Map<string, { events: DemoEvent[]; letters: DemoLetterEdge[] }>();

  for (const event of events) {
    const key = event.date_iso.slice(0, 7);
    if (!monthMap.has(key)) {
      monthMap.set(key, { events: [], letters: [] });
    }
    monthMap.get(key)?.events.push(event);
  }

  for (const letter of letterEdges) {
    const key = letter.date_iso.slice(0, 7);
    if (!monthMap.has(key)) {
      monthMap.set(key, { events: [], letters: [] });
    }
    monthMap.get(key)?.letters.push(letter);
  }

  const timelineItems: CuratorialTimelineItem[] = [];
  const sortedMonths = [...monthMap.keys()].sort((left, right) => left.localeCompare(right));

  for (const monthKey of sortedMonths) {
    const month = monthMap.get(monthKey);
    if (!month) continue;

    const monthEvents = [...month.events].sort((left, right) => normalizeTimelineSortDate(left.date_iso).localeCompare(normalizeTimelineSortDate(right.date_iso)));
    const remainingLetters = [...month.letters].sort((left, right) => normalizeTimelineSortDate(left.date_iso).localeCompare(normalizeTimelineSortDate(right.date_iso)));

    if (monthEvents.length) {
      for (const event of monthEvents) {
        timelineItems.push(buildTimelineItemFromEvent(event, letterMap, archive.legajo.id, stepByEventId.get(event.event_id)));

        const linkedLetters = unique([
          ...(event.letters_source ?? []),
          ...remainingLetters.filter((letter) => letter.event_ids?.includes(event.event_id)).map((letter) => letter.id_carta),
        ])
          .map((letterId) => remainingLetters.find((letter) => letter.id_carta === letterId))
          .filter((letter): letter is DemoLetterEdge => Boolean(letter))
          .slice(0, 1);

        for (const linkedLetter of linkedLetters) {
          const removeIndex = remainingLetters.findIndex((item) => item.id_carta === linkedLetter.id_carta);
          if (removeIndex >= 0) {
            remainingLetters.splice(removeIndex, 1);
          }

          timelineItems.push(
            buildTimelineItemFromLetterEdge(
              linkedLetter,
              letterMap,
              archive.legajo.id,
              eventMap.get(linkedLetter.event_ids?.[0] || ''),
              stepByLetterId.get(linkedLetter.id_carta),
            ),
          );
        }
      }

      const monthlyPulseLetter = remainingLetters.find((letter) => Boolean(letter.evidence_quote));
      if (monthlyPulseLetter) {
        timelineItems.push(
          buildTimelineItemFromLetterEdge(
            monthlyPulseLetter,
            letterMap,
            archive.legajo.id,
            eventMap.get(monthlyPulseLetter.event_ids?.[0] || ''),
            stepByLetterId.get(monthlyPulseLetter.id_carta),
          ),
        );
      }
    } else if (remainingLetters.length) {
      const representativeLetter = remainingLetters.find((letter) => Boolean(letter.evidence_quote)) || remainingLetters[0];
      timelineItems.push(
        buildTimelineItemFromLetterEdge(
          representativeLetter,
          letterMap,
          archive.legajo.id,
          eventMap.get(representativeLetter.event_ids?.[0] || ''),
          stepByLetterId.get(representativeLetter.id_carta),
        ),
      );
    }
  }

  if (!timelineItems.length) return undefined;

  const sortedTimelineItems = timelineItems
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const dateComparison = normalizeTimelineSortDate(left.item.dateIso).localeCompare(normalizeTimelineSortDate(right.item.dateIso));
      if (dateComparison !== 0) return dateComparison;

      const typeComparison = timelineItemTypeRank(left.item.type) - timelineItemTypeRank(right.item.type);
      if (typeComparison !== 0) return typeComparison;

      return left.index - right.index;
    })
    .map(({ item }) => item);

  return {
    title: 'Timeline Viva',
    description: 'Recuperacion inmersiva del eje temporal del legajo 10: eventos y cartas cruzan el tiempo mientras un protagonista ocupa el centro.',
    rangeLabel: archive.legajo.dateRange || '1668-1669',
    narrationHint: tour.audio_script || 'La pieza queda preparada para activar narracion y locucion en una segunda fase.',
    topNote: 'Modo inmersivo para recorrer el legajo entero desde el paso del tiempo y la relacion entre eventos y cartas.',
    audioNote: 'Los acontecimientos con locucion podran activar audio sincronizado sin cambiar la estructura de esta vista.',
    mapBridge: 'Los lugares y trayectos ya se anuncian en cada pieza para conectar despues esta lectura temporal con la capa mapa.',
    chapters: tour.steps.map((step) => ({
      id: step.step_id,
      label: step.title,
      targetId: step.primary_event_id || `letter-${step.primary_letter_id}`,
    })),
    items: sortedTimelineItems.slice(0, 18),
  };
}

async function buildFallbackPageData(archive: LegajoArchiveVM, kind: 'recorridos' | 'relatos'): Promise<LegajoCuratorialPageData> {
  const fallbackLetters = pickFallbackLetters(archive.letters);
  const keyLetterIds = unique([
    ...fallbackLetters.map((letter) => letter.id_carta),
    ...archive.letters.filter((letter) => letter.hasImages).slice(0, 2).map((letter) => letter.id_carta),
  ]).slice(0, 5);
  const letterMap = await loadLetterMap(archive.legajo.id, keyLetterIds);

  const routeSteps = fallbackLetters.map((letter, index) => {
    const detail = letterMap.get(letter.id_carta);
    return {
      id: letter.id_carta,
      label: `Paso ${index + 1}`,
      title: titleForLetter(detail, letter.id_carta),
      summary: summaryForLetter(detail) || `Entrada documental desde ${letter.lugar || 'un lugar pendiente de fijar'} para reconstruir la secuencia del legajo.`,
      meta: [letter.fecha, letter.lugar, letter.remitente].filter(Boolean).join(' · ') || 'Lectura documental base',
      quote: quoteForLetter(detail) || `Carta ${letter.id_carta} preparada para incorporar evidencia editorial más específica.`,
      quoteMeta: [letter.remitente, `Carta ${letter.id_carta}`].filter(Boolean).join(' · '),
      letterHref: makeLetterHref(archive.legajo.id, letter.id_carta),
      letterLabel: `Abrir carta ${letter.id_carta}`,
    };
  });

  const keyLetters = keyLetterIds.map((id) => {
    const detail = letterMap.get(id);
    return {
      id,
      title: titleForLetter(detail, id),
      meta: metaForLetter(detail),
      reason: 'Carta útil para empezar a fijar hitos, voces y materias del legajo.',
      quote: quoteForLetter(detail) || `Carta ${id} seleccionada por su capacidad de abrir lectura documental.`,
      href: makeLetterHref(archive.legajo.id, id),
    };
  });

  const chronicleItems = archive.letters.slice(0, 5).map((letter) => {
    const detail = letterMap.get(letter.id_carta);
    return {
      id: letter.id_carta,
      dateLabel: letter.fecha || `Carta ${letter.id_carta}`,
      title: titleForLetter(detail, letter.id_carta),
      summary:
        summaryForLetter(detail) ||
        `${letter.remitente || 'Remitente no identificado'} escribe desde ${letter.lugar || 'lugar no identificado'} a ${letter.destinatario || 'destinatario no identificado'}.`,
      meta: [letter.temas, letter.lugar].filter(Boolean).join(' · ') || 'Crónica documental base',
      quote: quoteForLetter(detail) || `Carta ${letter.id_carta} disponible para fijar una crónica más precisa.`,
      href: makeLetterHref(archive.legajo.id, letter.id_carta),
      letterLabel: `Carta ${letter.id_carta}`,
    };
  });

  const stories: CuratorialStory[] = [
    {
      id: 'fallback-red',
      title: 'La red epistolar como estructura del legajo',
      thesis: 'Aunque aún no tenga edición curatorial específica, este legajo ya deja ver una red de corresponsales, ritmos y prioridades que puede leerse como relato de circulación.',
      evidence: routeSteps[0]?.summary || 'El corpus actual ya permite aislar una primera secuencia de voces y movimientos.',
      quote: routeSteps[0]?.quote || 'La evidencia literal se ampliará cuando este legajo reciba edición propia.',
      quoteMeta: routeSteps[0]?.quoteMeta || `Legajo ${archive.legajo.id}`,
      relatedLetters: keyLetters.slice(0, 3).map((letter) => ({
        label: `Carta ${letter.id}`,
        href: letter.href,
        meta: letter.meta,
      })),
      readingLine: [
        'Cruzar remitentes, destinatarios y lugares para fijar el núcleo de la red.',
        'Atender las cartas que ya contienen resumen fuerte o densidad temática.',
      ],
    },
    {
      id: 'fallback-geografia',
      title: 'Geografía documental del intercambio',
      thesis: 'La geografía del legajo ya ofrece una segunda lectura: no solo quién escribe, sino desde dónde y hacia qué circuito circula la información.',
      evidence: archive.legajo.keyPlaces.length
        ? `Los lugares más visibles ahora mismo son ${archive.legajo.keyPlaces.slice(0, 3).join(', ')}.`
        : 'El legajo ya tiene suficientes lugares indexados para comenzar una lectura espacial.',
      quote: routeSteps[1]?.quote || routeSteps[0]?.quote || 'La evidencia espacial crecerá al curar más cartas en detalle.',
      quoteMeta: routeSteps[1]?.quoteMeta || routeSteps[0]?.quoteMeta || `Legajo ${archive.legajo.id}`,
      relatedLetters: keyLetters.slice(1, 4).map((letter) => ({
        label: `Carta ${letter.id}`,
        href: letter.href,
        meta: letter.meta,
      })),
      readingLine: [
        'Usar los lugares repetidos como nodos de entrada al legajo.',
        'Distinguir cartas de tránsito, cartas de decisión y cartas de mantenimiento del vínculo.',
      ],
    },
  ];

  const fallbackPeople = countValues(archive.letters.map((letter) => letter.remitente))
    .slice(0, 3)
    .map(([label, count]) => `${label} · ${count} cartas`);
  const fallbackRoutes = archive.legajo.keyPlaces.slice(0, 3).map((place, index, places) => {
    const nextPlace = places[index + 1];
    return nextPlace ? `${place} -> ${nextPlace}` : `Nodo: ${place}`;
  });
  const fallbackReadingLines = buildFallbackReadingLines(archive, archive.letters);
  const fallbackTimeline = kind === 'recorridos' ? buildFallbackTimelineData(archive, chronicleItems, routeSteps, fallbackReadingLines) : undefined;

  return {
    kind,
    title: kind === 'recorridos' ? `Recorridos del legajo ${archive.legajo.id}` : `Relatos del legajo ${archive.legajo.id}`,
    description:
      kind === 'recorridos'
        ? 'Lectura curatorial inicial construida desde el corpus actual, preparada para convertirse después en recorrido editoriado.'
        : 'Primer conjunto de relatos editoriales ensamblados desde metadatos, resúmenes y cartas ya disponibles en la app.',
    intro:
      kind === 'recorridos'
        ? 'Este legajo todavía no reutiliza la demo histórica, pero ya tiene una estructura seria para orientar la lectura: pasos, cartas clave, contexto y crónica documental.'
        : 'Este legajo entra en modo relato con una primera edición honesta: tesis breves, evidencia de apoyo y cartas relacionadas a partir del corpus actual.',
    highlight: archive.legajo.summary,
    sourceLabel: 'Generado desde corpus consolidado',
    fallbackNote: 'La edición demo recuperada vive hoy en el legajo 10. El resto usa una estructura reusable basada en metadatos y cartas ya navegables.',
    stats: buildFallbackStats(archive),
    timelineViva: fallbackTimeline,
    periodical: chronicleItems[0]
      ? {
          issueLabel: archive.legajo.dateRange,
          title: 'Boletin del legajo',
          subtitle: 'Primera version editorial del periodo a partir del corpus ya consolidado.',
          editorNote: fallbackReadingLines[0],
          lead: chronicleItems[0],
          secondary: chronicleItems.slice(1, 4),
          routeSignals: fallbackRoutes.length ? fallbackRoutes : ['Rutas en preparacion desde los lugares del legajo'],
          peopleSignals: fallbackPeople.length ? fallbackPeople : ['Corresponsales en preparacion'],
          mapNote: 'Esta capa funciona como anticipo del mapa: lugares, remitentes y cronologia ya permiten leer desplazamientos y concentraciones.',
        }
      : undefined,
    route: {
      title: 'Recorrido inicial del legajo',
      description: 'Secuencia básica para entrar en el legajo sin depender todavía de mapa, animación ni capa editorial final.',
      steps: routeSteps,
    },
    keyLetters,
    contextTags: buildFallbackContextTags(archive, archive.letters),
    chronicle: {
      title: 'Crónica documental',
      description: 'Versión text-first del modo periódico/crónica: una secuencia de cartas útiles para reconstruir el pulso del legajo.',
      items: chronicleItems,
    },
    stories: kind === 'relatos' ? stories : stories.slice(0, 1),
    readingLines: fallbackReadingLines,
  };
}

function buildLegajo10Stories(
  archive: LegajoArchiveVM,
  letterMap: Map<string, CartaDetail>,
  eventMap: Map<string, DemoEvent>,
): CuratorialStory[] {
  const toRelatedLetters = (ids: string[]) =>
    ids
      .map((id) => letterMap.get(id))
      .filter((letter): letter is CartaDetail => Boolean(letter))
      .map((letter) => ({
        label: `Carta ${letter.id_carta}`,
        href: makeLetterHref(archive.legajo.id, letter.id_carta),
        meta: metaForLetter(letter),
      }));

  const newsEvent = eventMap.get('evt_paces_francia');
  const sardiniaEvent = eventMap.get('evt_asesinatos_cerdena');
  const healthEvent = eventMap.get('evt_enfermedad_juan_santacilia');

  return [
    {
      id: 'noticia-poder',
      title: 'La noticia como forma de gobierno',
      thesis: 'En el legajo 10 la noticia no aparece como ruido de fondo: ordena prioridades, redistribuye atención y define cómo la familia lee la Corte y Europa.',
      evidence:
        compactText(newsEvent?.summary, 180) ||
        'La publicación de paces, ejecuciones rápidas y movimientos cortesanos convierten la correspondencia en un sistema de alerta y validación.',
      quote:
        newsEvent?.evidence_quotes?.[0]?.quote ||
        quoteForLetter(letterMap.get('1149')) ||
        'Ya se publicaron las paces con Francia a 25 del corriente.',
      quoteMeta: 'Carta 1149 · Madrid · Política',
      relatedLetters: toRelatedLetters(['1139', '1149', '1158']),
      readingLine: [
        'Seguir cómo la carta transforma hecho político en conocimiento accionable.',
        'Contrastar justicia expeditiva, paz diplomática y llegada a la Corte como una misma secuencia.',
      ],
    },
    {
      id: 'cerdena-crisis',
      title: 'Cerdeña como escena de crisis',
      thesis: 'La isla no funciona sólo como lugar periférico: en este legajo emerge como un foco de violencia, rumor y negociación política conectado con el centro del poder.',
      evidence:
        compactText(sardiniaEvent?.summary, 180) ||
        'Los asesinatos y la mala recepción de las paces convierten Cerdeña en un capítulo de inestabilidad persistente.',
      quote:
        sardiniaEvent?.evidence_quotes?.[0]?.quote ||
        quoteForLetter(letterMap.get('1173')) ||
        'Después de la muerte del marques de Laconi se publicasen las paces, tan mal admitidas.',
      quoteMeta: 'Carta 1173 · Cerdeña · Thriller político',
      relatedLetters: toRelatedLetters(['1138', '1173', '1177']),
      readingLine: [
        'Leer Cerdeña como termómetro político del Mediterráneo, no como margen.',
        'Cruzar violencia, gobierno y correspondencia para reconstruir la escena de crisis.',
      ],
    },
    {
      id: 'cuerpo-politico',
      title: 'El cuerpo enfermo también es archivo político',
      thesis: 'La enfermedad de Don Juan introduce un relato donde medicina, cuidado y prestigio social se vuelven inseparables; el cuerpo aparece como otra superficie del gobierno.',
      evidence:
        compactText(healthEvent?.summary, 180) ||
        'El Agua de Aspa, la convalecencia y el seguimiento epistolar convierten la salud en materia narrativa central.',
      quote:
        healthEvent?.evidence_quotes?.[0]?.quote ||
        quoteForLetter(letterMap.get('1174')) ||
        'a casa de mi Señor como de la enfermedad de mi Señor Don Juan',
      quoteMeta: 'Carta 1174 · Madrid · Salud',
      relatedLetters: toRelatedLetters(['1174', '1177', '1186']),
      readingLine: [
        'Usar enfermedad, tratamiento y recuperación como un único arco.',
        'Observar cómo la correspondencia administra incertidumbre corporal y autoridad familiar.',
      ],
    },
  ];
}

async function buildLegajo10PageData(archive: LegajoArchiveVM, kind: 'recorridos' | 'relatos'): Promise<LegajoCuratorialPageData> {
  const [tour, events, letterEdges, lensPanels, overview] = await Promise.all([
    readDerivedJson<DemoTour>('tour_legajo10.json'),
    readDerivedJson<DemoEvent[]>('event_markers.json'),
    readDerivedJson<DemoLetterEdge[]>('letter_edges.json'),
    readDerivedJson<DemoLensPanels>('lens_panels.json'),
    readDerivedText('demo_overview.md'),
  ]);

  const eventMap = new Map(events.map((event) => [event.event_id, event]));
  const routeLetterIds = tour.steps.map((step) => step.primary_letter_id);
  const chronicleLetterIds = events.flatMap((event) => event.letters_source ?? []).slice(0, 8);
  const storyLetterIds = ['1139', '1149', '1158', '1173', '1174', '1177', '1186'];
  const letterMap = await loadLetterMap(archive.legajo.id, [...routeLetterIds, ...chronicleLetterIds, ...storyLetterIds]);

  const keyLetters = unique(['1139', '1149', '1158', '1173', '1174'])
    .map((id) => {
      const detail = letterMap.get(id);
      const reasonByLetter: Record<string, string> = {
        '1139': 'Abre el arco de justicia expeditiva y marca el tono de la noticia política.',
        '1149': 'Fija la publicación de las paces y la velocidad de circulación de la información.',
        '1158': 'Ancla la instalación de los Santacilia en la Corte como cambio de escala.',
        '1173': 'Concentra la trama sarda y la dimensión de crisis mediterránea.',
        '1174': 'Hace visible el relato corporal: enfermedad, cuidado y evidencia.',
      };

      return {
        id,
        title: titleForLetter(detail, id),
        meta: metaForLetter(detail),
        reason: reasonByLetter[id] || 'Carta clave para la lectura curatorial del legajo.',
        quote: quoteForLetter(detail),
        href: makeLetterHref(archive.legajo.id, id),
      };
    })
    .filter((letter) => Boolean(letter.quote));

  const routeSteps = tour.steps.map((step, index) => {
    const event = step.primary_event_id ? eventMap.get(step.primary_event_id) : null;
    const detail = step.primary_letter_id ? letterMap.get(step.primary_letter_id) : null;
    const highlightQuote =
      step.ui_actions?.find((action) => action.type === 'highlight_quote')?.quote ||
      event?.evidence_quotes?.find((quote) => quote.id_carta === step.primary_letter_id)?.quote ||
      quoteForLetter(detail);

    return {
      id: step.step_id,
      label: `Paso ${index + 1}`,
      title: step.title,
      summary: compactText(event?.summary, 180) || summaryForLetter(detail),
      meta: [event?.date_iso, event?.theme, event?.place_labels?.[0]].filter(Boolean).join(' · '),
      quote: compactText(highlightQuote, 150),
      quoteMeta: [detail ? `Carta ${detail.id_carta}` : null, detail?.lugar].filter(Boolean).join(' · '),
      letterHref: makeLetterHref(archive.legajo.id, step.primary_letter_id || detail?.id_carta || archive.letters[0]?.id_carta || ''),
      letterLabel: step.primary_letter_id ? `Abrir carta ${step.primary_letter_id}` : 'Abrir carta asociada',
    };
  });

  const normalLens = lensPanels.lenses?.normal;
  const healthLens = lensPanels.lenses?.salud;
  const newsLens = lensPanels.lenses?.noticias;

  const contextTags: CuratorialTagItem[] = [
    ...(normalLens?.panels?.find((panel) => panel.type === 'top_people')?.items ?? [])
      .slice(0, 4)
      .map((item) => ({
        label: String(item.name ?? 'Persona central'),
        detail: `${item.count_letters ?? 0} cartas · ${item.count_events_linked ?? 0} eventos ligados`,
        tone: 'persona' as const,
      })),
    ...unique(events.flatMap((event) => event.place_labels ?? [])).slice(0, 4).map((label) => ({
      label,
      detail: 'Lugar activo en la secuencia política y familiar del legajo 10.',
      tone: 'lugar' as const,
    })),
    ...['Noticias', 'Salud', 'Objetos'].map((label) => ({
      label,
      detail: 'Lente curatorial recuperada desde la demo original.',
      tone: 'tema' as const,
    })),
  ].slice(0, 9);

  const chronicleSourceIds = unique(tour.steps.map((step) => step.primary_event_id).filter(Boolean) as string[]);
  const chronicleItems = chronicleSourceIds
    .map((eventId) => eventMap.get(eventId))
    .filter((event): event is DemoEvent => Boolean(event))
    .map((event) => buildChronicleItemFromEvent(event, letterMap, archive.legajo.id, archive.letters[0]?.id_carta || ''));

  const peakMonth = String(newsLens?.kpis?.peak_month ?? normalLens?.kpis?.peak_month ?? '1668-07');
  const peakMonthLabel = String(newsLens?.kpis?.peak_month_label ?? normalLens?.kpis?.peak_month_label ?? 'Jul 1668');
  const monthlyEvents = events
    .filter((event) => event.date_iso.startsWith(peakMonth))
    .map((event) => buildChronicleItemFromEvent(event, letterMap, archive.legajo.id, archive.letters[0]?.id_carta || ''));
  const leadPeriodicalEvent =
    monthlyEvents.find((item) => item.id === 'evt_asesinatos_cerdena') ||
    monthlyEvents.find((item) => item.id === 'evt_viaje_santacilia') ||
    monthlyEvents[0] ||
    chronicleItems[0];

  const routeSignals = (normalLens?.panels?.find((panel) => panel.type === 'top_routes')?.items ?? [])
    .slice(0, 4)
    .map((item) => `${startCase(String(item.from_place_key ?? item.place_key ?? ''))} -> ${startCase(String(item.to_place_key ?? ''))} · ${item.count_letters ?? 0} cartas`);
  const peopleSignals = (newsLens?.panels?.find((panel) => panel.type === 'top_people')?.items ??
    normalLens?.panels?.find((panel) => panel.type === 'top_people')?.items ??
    [])
    .slice(0, 4)
    .map((item) => `${String(item.name ?? 'Figura central')} · ${item.count_events_linked ?? item.count_letters ?? 0}`);
  const periodicalRoutes = routeSignals.length ? routeSignals : ['Madrid -> Mallorca · ruta dominante', 'Valencia -> Mallorca · continuidad cortesana'];
  const periodicalPeople = peopleSignals.length ? peopleSignals : ['Jeronimo Pelegrin de Aragues · figura central', 'Pedro Santacilia y Pax · nodo familiar'];
  const timelineViva =
    kind === 'recorridos'
      ? buildTimelineVivaDataForLegajo10({
          archive,
          tour,
          events,
          letterEdges,
          letterMap,
        })
      : undefined;

  const stats: CuratorialStat[] = [
    {
      label: 'Cartas activas',
      value: String(lensPanels.dataset?.num_letters ?? archive.legajo.letterCount),
      detail: 'Cartas legibles ya dentro del recorrido recuperado de la demo.',
    },
    {
      label: 'Eventos',
      value: String(lensPanels.dataset?.num_events ?? chronicleItems.length),
      detail: 'Eventos con título, tema, evidencia y carta asociada.',
    },
    {
      label: 'Arco',
      value: `${lensPanels.dataset?.date_range?.from ?? '1668-02'} → ${lensPanels.dataset?.date_range?.to ?? '1669-03'}`,
      detail: newsLens?.one_liner || 'Un Mediterráneo convulso leído desde la correspondencia.',
    },
  ];

  const stories = buildLegajo10Stories(archive, letterMap, eventMap);
  const readingLines = [
    compactText(newsLens?.one_liner, 160) || 'Leer el legajo como corredor de noticias y decisiones.',
    compactText(healthLens?.one_liner, 160) || 'Leer salud y tratamiento como parte del relato político.',
    compactText(normalLens?.summary_bullets?.[1], 160) || 'Cruzar Corte, islas y rutas mediterráneas sin separar lo familiar de lo político.',
  ];

  const intro = compactText(
    overview
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#')),
    240,
  );

  return {
    kind,
    title: kind === 'recorridos' ? 'Recorridos del legajo 10' : 'Relatos del legajo 10',
    description:
      kind === 'recorridos'
        ? 'Recuperación directa de la lógica curatorial de la demo: tour guiado, cartas clave, nodos y un periódico textual del legajo.'
        : 'Tres relatos editoriales ensamblados desde la demo histórica: tesis, evidencia, cartas relacionadas y líneas de lectura.',
    intro:
      intro ||
      'El legajo 10 captura un año turbulento en el que paces, asesinatos, destierros y enfermedad viajan por el Mediterráneo en forma de carta.',
    highlight:
      kind === 'recorridos'
        ? tour.audio_script || 'Siete paradas para leer entre líneas la historia política y familiar del legajo 10.'
        : 'El modo relato entra por tres frentes: noticia política, crisis sarda y cuerpo enfermo como materia documental.',
    sourceLabel: 'Demo histórica recuperada',
    stats,
    timelineViva,
    periodical: leadPeriodicalEvent
      ? {
          issueLabel: peakMonthLabel,
          title: 'Periodico del mes',
          subtitle: 'Edicion editorial del momento de mayor intensidad narrativa del legajo 10.',
          editorNote:
            compactText(newsLens?.summary_bullets?.[1], 180) ||
            compactText(normalLens?.summary_bullets?.[1], 180) ||
            'La correspondencia del mes concentra noticia politica, desplazamiento y crisis mediterranea.',
          lead: leadPeriodicalEvent,
          secondary: monthlyEvents.filter((item) => item.id !== leadPeriodicalEvent.id).slice(0, 3),
          routeSignals: periodicalRoutes,
          peopleSignals: periodicalPeople,
          mapNote: `Este numero puede leerse espacialmente como una trama de rutas entre ${periodicalRoutes.slice(0, 2).join(' y ')}. La capa mapa queda preparada para intensificar esta lectura sin cambiar el relato.`,
        }
      : undefined,
    route: {
      title: tour.title,
      description: 'Versión text-first del recorrido guiado original. Cada paso conserva su carta eje, su evento y su frase de evidencia.',
      steps: routeSteps,
    },
    keyLetters,
    contextTags,
    chronicle: {
      title: 'Periódico y crónica del legajo 10',
      description: 'Primera recuperación visible del modo periódico/eventos/crónica: hechos fechados, síntesis editorial y acceso a la carta soporte.',
      items: chronicleItems,
    },
    stories: kind === 'relatos' ? stories : stories.slice(0, 1),
    readingLines,
  };
}

export async function buildLegajoCuratorialPageData(archive: LegajoArchiveVM, kind: 'recorridos' | 'relatos') {
  if (archive.legajo.id === '10') {
    return buildLegajo10PageData(archive, kind);
  }

  return buildFallbackPageData(archive, kind);
}
