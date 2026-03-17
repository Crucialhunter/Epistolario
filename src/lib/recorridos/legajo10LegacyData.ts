import path from 'path';
import { readFile } from 'fs/promises';
import type { LegacyMapData, LegacyMapEvent, LegacyMapPoint, LegacyMapRoute, LegacyMapTourStep } from '@/lib/recorridos/legacyMapTypes';

type RawCoord = {
  lat: number;
  lng: number;
  label?: string;
};

type RawEdge = {
  id_carta: string;
  date_iso?: string;
  from_person?: string;
  to_person?: string;
  from_place_key?: string;
  from_place_label?: string;
  to_place_key?: string;
  to_place_label?: string;
  themes?: string[];
  event_ids?: string[];
  evidence_quote?: string;
};

type RawEvent = {
  event_id?: string;
  id?: string;
  date_iso?: string;
  title?: string;
  summary?: string;
  theme?: string;
  place_keys?: string[];
  letters_source?: string[];
  evidence_quotes?: Array<{ quote?: string }>;
};

type RawTourAction = {
  type?: string;
  date?: string;
  from?: string;
  place_key?: string;
  quote?: string;
  from_place_key?: string;
  to_place_key?: string;
};

type RawTourStep = {
  step_id?: string;
  title?: string;
  primary_event_id?: string;
  primary_letter_id?: string;
  ui_actions?: RawTourAction[];
};

type RawTour = {
  title?: string;
  audio_script?: string;
  steps?: RawTourStep[];
};

type RawLetterIndexItem = {
  id_carta: string;
  nombre_carta?: string;
  fecha_original?: string;
  primary_image_url?: string | null;
};

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
});

const MOJIBAKE_PATTERN = /(?:Ã.|Â.|â.|ð.|Ð.|�)/;
const utf8Decoder = new TextDecoder('utf-8', { fatal: false });

async function readJson<T>(...segments: string[]): Promise<T> {
  const filePath = path.join(process.cwd(), ...segments);
  const content = await readFile(filePath, 'utf8');
  return sanitizeJsonValue(JSON.parse(content)) as T;
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

function buildMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const label = MONTH_LABEL_FORMATTER.format(new Date(year, month - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function resolveMonthKey(dateIso?: string) {
  if (!dateIso || dateIso.length < 7) return null;
  return dateIso.slice(0, 7);
}

function buildPoint(
  key: string | undefined,
  label: string | undefined,
  coords: Record<string, RawCoord>
): LegacyMapPoint | null {
  if (!key) return null;
  const entry = coords[key];
  if (!entry) return null;

  return {
    key,
    label: label || entry.label || key,
    lat: entry.lat,
    lng: entry.lng,
  };
}

export async function getLegajo10LegacyMapData(): Promise<LegacyMapData> {
  const [coords, edges, events, tour, lettersIndex] = await Promise.all([
    readJson<Record<string, RawCoord>>('dataset_demo', 'derived', 'coords.json'),
    readJson<RawEdge[]>('dataset_demo', 'derived', 'letter_edges.json'),
    readJson<RawEvent[]>('dataset_demo', 'derived', 'event_markers.json'),
    readJson<RawTour>('dataset_demo', 'derived', 'tour_legajo10.json'),
    readJson<RawLetterIndexItem[]>('public', 'CorpusBase', 'legajos', 'legajo-10', 'letters_index.json'),
  ]);

  const letterMeta = new Map(lettersIndex.map((item) => [item.id_carta, item]));
  const monthLabels: Record<string, string> = {};
  const monthKeys = new Set<string>();

  const routes: LegacyMapRoute[] = edges
    .map((edge) => {
      const from = buildPoint(edge.from_place_key, edge.from_place_label, coords);
      const to = buildPoint(edge.to_place_key, edge.to_place_label, coords);
      const monthKey = resolveMonthKey(edge.date_iso);
      if (!from || !to || !monthKey) {
        return null;
      }

      monthKeys.add(monthKey);
      monthLabels[monthKey] = buildMonthLabel(monthKey);

      const letter = letterMeta.get(edge.id_carta);
      return {
        id: `route-${edge.id_carta}`,
        letterId: edge.id_carta,
        title: letter?.nombre_carta || `Carta ${edge.id_carta}`,
        displayDate: letter?.fecha_original || edge.date_iso || '',
        dateIso: edge.date_iso || '',
        monthKey,
        routeLabel: `${from.label} -> ${to.label}`,
        fromPerson: edge.from_person || 'Remitente sin identificar',
        toPerson: edge.to_person || 'Destinatario sin identificar',
        from,
        to,
        themes: edge.themes ?? [],
        eventIds: edge.event_ids ?? [],
        evidenceQuote: edge.evidence_quote || '',
        imageUrl: letter?.primary_image_url || null,
      } satisfies LegacyMapRoute;
    })
    .filter((route): route is LegacyMapRoute => Boolean(route))
    .sort((left, right) => left.dateIso.localeCompare(right.dateIso));

  const mappedEvents: LegacyMapEvent[] = events
    .map((event) => {
      const id = event.event_id || event.id;
      const monthKey = resolveMonthKey(event.date_iso);
      if (!id || !monthKey) {
        return null;
      }

      monthKeys.add(monthKey);
      monthLabels[monthKey] = buildMonthLabel(monthKey);

      const places = (event.place_keys ?? [])
        .map((placeKey) => buildPoint(placeKey, coords[placeKey]?.label, coords))
        .filter((place): place is LegacyMapPoint => Boolean(place));

      return {
        id,
        title: event.title || 'Evento histórico',
        summary: event.summary || '',
        dateIso: event.date_iso || '',
        monthKey,
        theme: event.theme || 'Contexto',
        placeKeys: event.place_keys ?? [],
        places,
        letterIds: event.letters_source ?? [],
        evidenceQuotes: (event.evidence_quotes ?? []).map((quote) => quote.quote || '').filter(Boolean),
      } satisfies LegacyMapEvent;
    })
    .filter((event): event is LegacyMapEvent => Boolean(event))
    .sort((left, right) => left.dateIso.localeCompare(right.dateIso));

  const tourSteps: LegacyMapTourStep[] = (tour.steps ?? []).map((step, index) => {
    const actions = step.ui_actions ?? [];
    const focusAction = actions.find((action) => action.type === 'timeline_focus');
    const pulseAction = actions.find((action) => action.type === 'map_pulse_location');
    const quoteAction = actions.find((action) => action.type === 'highlight_quote');
    const highlightAction = actions.find((action) => action.type === 'map_highlight_route');
    const focusMonthKey = resolveMonthKey(focusAction?.from || focusAction?.date);

    return {
      id: step.step_id || `tour-step-${index + 1}`,
      title: step.title || `Paso ${index + 1}`,
      primaryEventId: step.primary_event_id || null,
      primaryLetterId: step.primary_letter_id || null,
      focusMonthKey,
      pulsePlaceKey: pulseAction?.place_key || null,
      highlightRoute:
        highlightAction?.from_place_key && highlightAction?.to_place_key
          ? {
              fromKey: highlightAction.from_place_key,
              toKey: highlightAction.to_place_key,
            }
          : null,
      quote: quoteAction?.quote || null,
    };
  });

  const months = Array.from(monthKeys).sort();

  return {
    tourTitle: tour.title || 'Tour del Legajo 10',
    tourIntro: tour.audio_script || 'Secuencia mínima rescatada del mapa histórico.',
    months,
    monthLabels,
    routes,
    events: mappedEvents,
    tourSteps,
  };
}
