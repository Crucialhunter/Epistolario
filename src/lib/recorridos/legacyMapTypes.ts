export interface LegacyMapPoint {
  key: string;
  label: string;
  lat: number;
  lng: number;
}

export interface LegacyMapRoute {
  id: string;
  letterId: string;
  title: string;
  displayDate: string;
  dateIso: string;
  monthKey: string;
  routeLabel: string;
  fromPerson: string;
  toPerson: string;
  from: LegacyMapPoint;
  to: LegacyMapPoint;
  themes: string[];
  eventIds: string[];
  evidenceQuote: string;
  imageUrl: string | null;
}

export interface LegacyMapEvent {
  id: string;
  title: string;
  summary: string;
  dateIso: string;
  monthKey: string;
  theme: string;
  placeKeys: string[];
  places: LegacyMapPoint[];
  letterIds: string[];
  evidenceQuotes: string[];
}

export interface LegacyMapTourRouteHighlight {
  fromKey: string;
  toKey: string;
}

export interface LegacyMapTourStep {
  id: string;
  title: string;
  primaryEventId: string | null;
  primaryLetterId: string | null;
  focusMonthKey: string | null;
  pulsePlaceKey: string | null;
  highlightRoute: LegacyMapTourRouteHighlight | null;
  quote: string | null;
}

export interface LegacyMapData {
  tourTitle: string;
  tourIntro: string;
  months: string[];
  monthLabels: Record<string, string>;
  routes: LegacyMapRoute[];
  events: LegacyMapEvent[];
  tourSteps: LegacyMapTourStep[];
}
