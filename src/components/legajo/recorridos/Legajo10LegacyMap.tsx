"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LegacyMapData, LegacyMapRoute, LegacyMapTourStep } from '@/lib/recorridos/legacyMapTypes';

declare global {
  interface Window {
    L?: any;
    __legacyLeafletPromise?: Promise<any>;
  }
}

function ensureLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Leaflet requires a browser environment.'));
  if (window.L) return Promise.resolve(window.L);
  if (window.__legacyLeafletPromise) return window.__legacyLeafletPromise;

  window.__legacyLeafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById('legacy-leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'legacy-leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById('legacy-leaflet-js') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', () => reject(new Error('Leaflet failed to load.')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'legacy-leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Leaflet failed to load.'));
    document.head.appendChild(script);
  });

  return window.__legacyLeafletPromise;
}

function monthSort(left: string, right: string) {
  return left.localeCompare(right);
}

function getCurvePoints(route: LegacyMapRoute, density = 30) {
  const a: [number, number] = [route.from.lat, route.from.lng];
  const b: [number, number] = [route.to.lat, route.to.lng];
  const dx = b[1] - a[1];
  const dy = b[0] - a[0];
  const r = Math.sqrt(dx * dx + dy * dy);
  const theta = Math.atan2(dy, dx);
  const thetaOffset = Math.PI / 10;
  const r2 = r / 2 / Math.cos(thetaOffset);
  const centerLat = a[0] + r2 * Math.sin(theta + thetaOffset);
  const centerLng = a[1] + r2 * Math.cos(theta + thetaOffset);
  const points: Array<[number, number]> = [];

  for (let i = 0; i <= density; i += 1) {
    const t = i / density;
    points.push([
      (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * centerLat + t * t * b[0],
      (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * centerLng + t * t * b[1],
    ]);
  }

  return points;
}

function findMonthIndex(months: string[], monthKey: string | null) {
  if (!monthKey) return -1;
  return months.findIndex((month) => month === monthKey);
}

function findRouteForStep(step: LegacyMapTourStep, routes: LegacyMapRoute[]) {
  if (step.primaryLetterId) {
    const byLetter = routes.find((route) => route.letterId === step.primaryLetterId);
    if (byLetter) return byLetter;
  }
  if (step.highlightRoute) {
    return routes.find(
      (route) => route.from.key === step.highlightRoute?.fromKey && route.to.key === step.highlightRoute?.toKey
    );
  }
  return null;
}

const PANEL =
  'rounded-[1rem] border border-[#d8ccb7]/75 bg-[rgba(247,242,230,0.95)] shadow-[0_12px_28px_rgba(0,0,0,0.14)] backdrop-blur-sm';
const CHIP =
  'rounded-full border border-[#d1cebd]/80 bg-[#fbf7ef]/92 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f7b53]';
const GHOST =
  'rounded-full border border-[#d8ccb7]/80 bg-[#fbf7ef]/94 text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]';
const MOVE_DURATION = 3200;
const HOLD_DURATION = 1400;

function setMarkerPosition(marker: any, curve: Array<[number, number]>, progress: number) {
  const index = progress * (curve.length - 1);
  const lower = Math.floor(index);
  const fraction = index - lower;
  const current = curve[lower];
  const next = curve[Math.min(lower + 1, curve.length - 1)];
  marker.setLatLng([current[0] + (next[0] - current[0]) * fraction, current[1] + (next[1] - current[1]) * fraction]);
  const markerElement = marker.getElement();
  if (markerElement) {
    const angle = Math.atan2(next[0] - current[0], next[1] - current[1]) * (180 / Math.PI) + 90;
    markerElement.style.setProperty('--legacy-letter-rotation', `${angle}deg`);
  }
}

function buildMonthShortLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', { month: 'short' })
    .format(new Date(year, month - 1, 1))
    .replace('.', '')
    .slice(0, 3)
    .toUpperCase();
}

export default function Legajo10LegacyMap({ data }: { data: LegacyMapData }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const movingMarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pulseTimeoutRef = useRef<number | null>(null);
  const routeCurveRef = useRef<Array<[number, number]>>([]);
  const routeProgressRef = useRef(0);
  const moveElapsedRef = useRef(0);
  const holdElapsedRef = useRef(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const [leafletError, setLeafletError] = useState<string | null>(null);
  const [monthIndex, setMonthIndex] = useState(0);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(data.routes[0]?.id ?? null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(data.events[0]?.id ?? null);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [showRoutesPanel, setShowRoutesPanel] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [routeProgress, setRouteProgress] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [routePhase, setRoutePhase] = useState<'moving' | 'paused' | 'holding'>('moving');
  const monthIndexRef = useRef(0);
  const tourIndexRef = useRef<number | null>(null);

  const months = data.months;
  const currentMonthKey = months[Math.max(monthIndex, 0)] ?? months[0];
  const currentMonthLabel = data.monthLabels[currentMonthKey] ?? currentMonthKey;
  const sortedRoutes = useMemo(
    () => [...data.routes].sort((left, right) => left.dateIso.localeCompare(right.dateIso)),
    [data.routes]
  );
  const routesBeforeMonth = useMemo(
    () => sortedRoutes.filter((route) => monthSort(route.monthKey, currentMonthKey) < 0),
    [currentMonthKey, sortedRoutes]
  );
  const routesInMonth = useMemo(
    () => sortedRoutes.filter((route) => route.monthKey === currentMonthKey),
    [currentMonthKey, sortedRoutes]
  );
  const eventsInMonth = useMemo(
    () => data.events.filter((event) => event.monthKey === currentMonthKey),
    [currentMonthKey, data.events]
  );
  const monthSignals = useMemo(
    () =>
      months.map((monthKey) => ({
        key: monthKey,
        label: data.monthLabels[monthKey] ?? monthKey,
        shortLabel: buildMonthShortLabel(monthKey),
        routes: sortedRoutes.filter((route) => route.monthKey === monthKey).length,
        events: data.events.filter((event) => event.monthKey === monthKey).length,
      })),
    [data.events, data.monthLabels, months, sortedRoutes]
  );
  const selectedRoute = useMemo(
    () => sortedRoutes.find((route) => route.id === selectedRouteId) ?? routesInMonth[0] ?? sortedRoutes[0] ?? null,
    [routesInMonth, selectedRouteId, sortedRoutes]
  );
  const selectedEvent = useMemo(
    () => data.events.find((event) => event.id === selectedEventId) ?? eventsInMonth[0] ?? null,
    [data.events, eventsInMonth, selectedEventId]
  );
  const activeTourStep = tourIndex == null ? null : data.tourSteps[tourIndex] ?? null;
  const activeQuote = activeTourStep?.quote || selectedRoute?.evidenceQuote || selectedEvent?.evidenceQuotes[0] || null;
  const currentEvent = activeTourStep && selectedEvent ? selectedEvent : null;
  const modeLabel = activeTourStep ? `Paso ${tourIndex! + 1} de ${data.tourSteps.length}` : 'Exploración libre';
  const transportLabel =
    routePhase === 'paused' ? 'En pausa' : routePhase === 'holding' ? 'En espera' : 'Carta en tránsito';
  const transportProgress = routePhase === 'holding' ? holdProgress : routeProgress;
  const tourActive = tourIndex != null;
  const canMoveBackward = tourActive ? tourIndex > 0 : monthIndex > 0;
  const canMoveForward = tourActive ? tourIndex < data.tourSteps.length - 1 : monthIndex < months.length - 1;

  useEffect(() => {
    monthIndexRef.current = monthIndex;
  }, [monthIndex]);

  useEffect(() => {
    tourIndexRef.current = tourIndex;
  }, [tourIndex]);

  const advancePlayback = () => {
    const currentTourIndex = tourIndexRef.current;
    if (currentTourIndex != null) {
      if (currentTourIndex >= data.tourSteps.length - 1) {
        setIsPlaying(false);
        return;
      }
      const nextIndex = currentTourIndex + 1;
      setTourIndex(nextIndex);
      const monthForStep = findMonthIndex(months, data.tourSteps[nextIndex]?.focusMonthKey ?? null);
      if (monthForStep >= 0) setMonthIndex(monthForStep);
      return;
    }

    if (monthIndexRef.current >= months.length - 1) {
      setIsPlaying(false);
      return;
    }

    setMonthIndex((current) => Math.min(months.length - 1, current + 1));
  };

  const startPlaybackLoop = (phase: 'moving' | 'holding') => {
    if (!movingMarkerRef.current || routeCurveRef.current.length < 2) return;
    if (animationFrameRef.current) window.clearInterval(animationFrameRef.current);
    setRoutePhase(phase);
    const step = () => {
      if (!movingMarkerRef.current || routeCurveRef.current.length < 2) return;
      const delta = 16;

      if (phase === 'moving') {
        moveElapsedRef.current = Math.min(MOVE_DURATION, moveElapsedRef.current + delta);
        const progress = moveElapsedRef.current / MOVE_DURATION;
        routeProgressRef.current = progress;
        setRouteProgress(progress);
        setMarkerPosition(movingMarkerRef.current, routeCurveRef.current, progress);

        if (progress >= 1) {
          if (animationFrameRef.current) window.clearInterval(animationFrameRef.current);
          animationFrameRef.current = null;
          holdElapsedRef.current = 0;
          setHoldProgress(0);
          startPlaybackLoop('holding');
          return;
        }
      } else {
        holdElapsedRef.current = Math.min(HOLD_DURATION, holdElapsedRef.current + delta);
        const progress = holdElapsedRef.current / HOLD_DURATION;
        setHoldProgress(progress);

        if (progress >= 1) {
          if (animationFrameRef.current) window.clearInterval(animationFrameRef.current);
          animationFrameRef.current = null;
          advancePlayback();
          return;
        }
      }
    };

    animationFrameRef.current = window.setInterval(step, 16);
  };

  const restartCurrentRoute = () => {
    if (animationFrameRef.current) window.clearInterval(animationFrameRef.current);
    animationFrameRef.current = null;
    moveElapsedRef.current = 0;
    holdElapsedRef.current = 0;
    routeProgressRef.current = 0;
    setRouteProgress(0);
    setHoldProgress(0);
    setRoutePhase('moving');
    setIsPlaying(true);
    if (movingMarkerRef.current && routeCurveRef.current.length > 1) {
      setMarkerPosition(movingMarkerRef.current, routeCurveRef.current, 0);
    }
  };

  useEffect(() => {
    if (!currentMonthKey) return;
    if (!selectedRoute || selectedRoute.monthKey !== currentMonthKey) setSelectedRouteId(routesInMonth[0]?.id ?? null);
    if (!selectedEvent || selectedEvent.monthKey !== currentMonthKey) setSelectedEventId(eventsInMonth[0]?.id ?? null);
  }, [currentMonthKey, eventsInMonth, routesInMonth, selectedEvent, selectedRoute]);

  useEffect(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;
    ensureLeaflet()
      .then((L) => {
        if (disposed || !mapContainerRef.current || mapRef.current) return;
        const map = L.map(mapContainerRef.current, { preferCanvas: true, zoomControl: false, attributionControl: true }).setView([39.5, 2.5], 6);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);
        window.setTimeout(() => map.invalidateSize(), 0);
        resizeObserver = new ResizeObserver(() => map.invalidateSize());
        resizeObserver.observe(mapContainerRef.current);
        setIsMapReady(true);
      })
      .catch((error) => setLeafletError(error instanceof Error ? error.message : 'No se pudo cargar Leaflet.'));

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      if (animationFrameRef.current) window.clearInterval(animationFrameRef.current);
      if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !layerGroupRef.current || !window.L) return;
    const L = window.L;
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    const bounds: Array<[number, number]> = [];

    layerGroup.clearLayers();
    movingMarkerRef.current = null;
    routeCurveRef.current = [];

    routesBeforeMonth.forEach((route) => {
      const curve = getCurvePoints(route, 24);
      bounds.push([route.from.lat, route.from.lng], [route.to.lat, route.to.lng]);
      L.polyline(curve, { color: '#b7aa8d', weight: 1.5, opacity: 0.28 }).addTo(layerGroup);
      L.circleMarker([route.from.lat, route.from.lng], {
        radius: 3,
        color: '#fff',
        weight: 1,
        fillColor: '#7c7464',
        fillOpacity: 0.55,
        opacity: 0.55,
      }).addTo(layerGroup);
      L.circleMarker([route.to.lat, route.to.lng], {
        radius: 3,
        color: '#fff',
        weight: 1,
        fillColor: '#b7aa8d',
        fillOpacity: 0.55,
        opacity: 0.55,
      }).addTo(layerGroup);
    });

    routesInMonth.forEach((route) => {
      const isSelected = route.id === selectedRoute?.id;
      const curve = getCurvePoints(route);
      bounds.push([route.from.lat, route.from.lng], [route.to.lat, route.to.lng]);
      const line = L.polyline(curve, {
        color: isSelected ? '#c5a028' : '#8f7742',
        weight: isSelected ? 4 : 2.4,
        opacity: isSelected ? 0.92 : 0.6,
        className: isSelected ? 'legacy-map-arc' : '',
      }).addTo(layerGroup);
      line.on('click', () => {
        setTourIndex(null);
        setSelectedRouteId(route.id);
      });
      const originMarker = L.circleMarker([route.from.lat, route.from.lng], {
        radius: isSelected ? 6 : 5,
        color: '#fff',
        weight: 2,
        fillColor: '#2d2a26',
        fillOpacity: 1,
      }).addTo(layerGroup);
      originMarker.on('click', () => {
        setTourIndex(null);
        setSelectedRouteId(route.id);
      });

      const destinationMarker = L.circleMarker([route.to.lat, route.to.lng], {
        radius: isSelected ? 7 : 6,
        color: '#fff',
        weight: 2,
        fillColor: '#c5a028',
        fillOpacity: 0.95,
      }).addTo(layerGroup);
      destinationMarker.on('click', () => {
        setTourIndex(null);
        setSelectedRouteId(route.id);
      });
    });

    eventsInMonth.forEach((event) => {
      event.places.forEach((place) => {
        bounds.push([place.lat, place.lng]);
        const marker = L.marker([place.lat, place.lng], {
          icon: L.divIcon({
            className: 'legacy-event-marker',
            html: '<div class="legacy-event-marker__dot"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
          zIndexOffset: 1600,
        }).addTo(layerGroup);
        marker.on('click', () => setSelectedEventId(event.id));
      });
    });

    if (selectedRoute) {
      const curve = getCurvePoints(selectedRoute, 42);
      const movingMarker = L.marker(curve[0], {
        icon: L.divIcon({
          className: 'legacy-moving-marker',
          html: '<div class="legacy-letter-marker"><div class="legacy-letter-marker__sheet"></div><div class="legacy-letter-marker__fold"></div><div class="legacy-letter-marker__seal"></div></div>',
          iconSize: [28, 22],
          iconAnchor: [14, 11],
        }),
        zIndexOffset: 2200,
      }).addTo(layerGroup);
      movingMarkerRef.current = movingMarker;
      routeCurveRef.current = curve;
      setMarkerPosition(movingMarker, curve, routeProgressRef.current);
      if (isPlaying && routePhase !== 'paused') {
        window.setTimeout(() => startPlaybackLoop(routeProgressRef.current >= 1 ? 'holding' : 'moving'), 0);
      }
      bounds.push([selectedRoute.from.lat, selectedRoute.from.lng], [selectedRoute.to.lat, selectedRoute.to.lng]);
    }

    if (bounds.length > 1) {
      map.flyToBounds(L.latLngBounds(bounds), { padding: [32, 32], duration: 0.8, maxZoom: activeTourStep ? 7 : 6 });
    }
  }, [activeTourStep, currentMonthKey, eventsInMonth, isMapReady, routesBeforeMonth, routesInMonth, selectedRoute]);

  useEffect(() => {
    if (!selectedRoute) {
      routeCurveRef.current = [];
      moveElapsedRef.current = 0;
      holdElapsedRef.current = 0;
      routeProgressRef.current = 0;
      setRouteProgress(0);
      setHoldProgress(0);
      setRoutePhase('paused');
      setIsPlaying(false);
      return;
    }
    restartCurrentRoute();
  }, [selectedRoute?.id]);

  useEffect(() => {
    if (!activeTourStep || !isMapReady || !mapRef.current || !layerGroupRef.current || !window.L) return;
    const L = window.L;
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current);
    pulseTimeoutRef.current = null;

    const routeForStep = findRouteForStep(activeTourStep, sortedRoutes);
    if (routeForStep) setSelectedRouteId(routeForStep.id);
    if (activeTourStep.primaryEventId) setSelectedEventId(activeTourStep.primaryEventId);

    const pulsePlaceKey = activeTourStep.pulsePlaceKey;
    if (!pulsePlaceKey) return;
    const routePoint =
      routeForStep?.from.key === pulsePlaceKey
        ? routeForStep.from
        : routeForStep?.to.key === pulsePlaceKey
          ? routeForStep.to
          : data.events.flatMap((event) => event.places).find((place) => place.key === pulsePlaceKey);
    if (!routePoint) return;

    const pulseMarker = L.marker([routePoint.lat, routePoint.lng], {
      icon: L.divIcon({
        className: 'legacy-map-pulse',
        html: '<div class="legacy-map-pulse__outer"></div><div class="legacy-map-pulse__inner"></div>',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      }),
      zIndexOffset: 2600,
    }).addTo(layerGroup);

    map.flyTo([routePoint.lat, routePoint.lng], 7, { duration: 0.8 });
    pulseTimeoutRef.current = window.setTimeout(() => layerGroup.removeLayer(pulseMarker), 2200);
  }, [activeTourStep, data.events, isMapReady, sortedRoutes]);

  const handleTourToggle = () => {
    setShowRoutesPanel(false);
    if (tourIndex == null) {
      if (data.tourSteps.length === 0) return;
      setTourIndex(0);
      const monthForStep = findMonthIndex(months, data.tourSteps[0]?.focusMonthKey ?? null);
      if (monthForStep >= 0) setMonthIndex(monthForStep);
      setIsPlaying(true);
      return;
    }

    setTourIndex(null);
    restartCurrentRoute();
  };

  const handleStepper = (direction: -1 | 1) => {
    setShowRoutesPanel(false);
    if (tourIndex != null) {
      const nextIndex = Math.max(0, Math.min(data.tourSteps.length - 1, tourIndex + direction));
      setTourIndex(nextIndex);
      const monthForStep = findMonthIndex(months, data.tourSteps[nextIndex]?.focusMonthKey ?? null);
      if (monthForStep >= 0) setMonthIndex(monthForStep);
      setIsPlaying(true);
      return;
    }

    setMonthIndex((current) => Math.max(0, Math.min(months.length - 1, current + direction)));
    setIsPlaying(true);
  };

  const handlePlaybackToggle = () => {
    if (tourActive && data.tourSteps.length < 2) return;
    if (!tourActive && months.length < 2 && routeProgressRef.current >= 1) return;

    if (isPlaying) {
      if (animationFrameRef.current) window.clearInterval(animationFrameRef.current);
      animationFrameRef.current = null;
      setIsPlaying(false);
      setRoutePhase('paused');
      return;
    }

    setIsPlaying(true);
    startPlaybackLoop(routeProgressRef.current >= 1 ? 'holding' : 'moving');
  };

  const handleMonthSelect = (index: number) => {
    setTourIndex(null);
    setShowRoutesPanel(false);
    setMonthIndex(index);
    setIsPlaying(true);
  };

  const handleMonthSlider = (value: number) => {
    handleMonthSelect(value);
  };

  const handleRouteSelection = (routeId: string) => {
    const route = sortedRoutes.find((entry) => entry.id === routeId);
    if (!route) return;
    setTourIndex(null);
    setShowRoutesPanel(false);
    setSelectedRouteId(routeId);
    setMonthIndex(findMonthIndex(months, route.monthKey));
    setIsPlaying(true);
  };

  const playbackRingStyle = {
    background: `conic-gradient(#c5a059 ${Math.max(2, transportProgress * 360)}deg, rgba(209,206,189,0.54) 0deg)`,
  };

  const icon = (active = false) =>
    `flex h-10 w-10 items-center justify-center rounded-full border text-base font-semibold transition-colors ${
      active
        ? 'border-[#c5a059] bg-[#c5a059] text-white shadow-[0_10px_24px_rgba(197,160,89,0.28)]'
        : 'border-[#d8ccb7]/80 bg-[#fbf7ef]/94 text-[#6f6453] hover:border-[#c5a059] hover:text-[#a38420]'
    } disabled:cursor-not-allowed disabled:opacity-45`;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <style jsx global>{`
        .leaflet-container { font-family: Inter, sans-serif; background: #e2ddd0; }
        .leaflet-control-zoom { overflow: hidden; border: 1px solid #d1cebd !important; border-radius: 14px !important; box-shadow: 0 12px 24px rgba(26,26,24,0.1); }
        .leaflet-bar a, .leaflet-bar a:hover { width: 34px; height: 34px; line-height: 34px; border-bottom: 1px solid #d1cebd !important; background: rgba(245,242,232,0.96); color: #2c2c2a; }
        .leaflet-bar a:hover { background: #f1e9d0; color: #a38420; }
        .leaflet-control-attribution { border-radius: 10px 0 0 0; border: 1px solid rgba(209,206,189,0.8); background: rgba(245,242,232,0.9) !important; color: #6f6453 !important; }
        .legacy-map-arc { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: legacy-map-dash 2.8s linear forwards; }
        .legacy-event-marker__dot { width: 18px; height: 18px; border-radius: 999px; border: 2px solid #c5a028; background: #221c13; box-shadow: 0 8px 24px rgba(34,28,19,0.25); }
        .legacy-moving-marker { background: transparent; }
        .legacy-letter-marker { position: relative; width: 28px; height: 22px; transform: rotate(var(--legacy-letter-rotation, 0deg)); transform-origin: 50% 50%; filter: drop-shadow(0 8px 14px rgba(26,26,24,0.18)); animation: legacy-letter-drift 1.1s ease-in-out infinite alternate; }
        .legacy-letter-marker__sheet { position: absolute; inset: 4px 2px 2px; border-radius: 4px; border: 1.5px solid rgba(90,72,40,0.55); background: linear-gradient(180deg, #f6f0df 0%, #ead9b2 100%); }
        .legacy-letter-marker__fold { position: absolute; left: 2px; right: 2px; top: 4px; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 10px solid rgba(228, 205, 153, 0.95); }
        .legacy-letter-marker__seal { position: absolute; left: 50%; top: 12px; width: 7px; height: 7px; margin-left: -3.5px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.85); background: #c5a028; box-shadow: 0 0 0 4px rgba(197,160,40,0.14); }
        .legacy-map-pulse__outer { position: absolute; inset: 0; border-radius: 999px; background: rgba(197,160,40,0.2); animation: legacy-map-pulse 1.6s ease-out infinite; }
        .legacy-map-pulse__inner { position: absolute; inset: 11px; border-radius: 999px; background: #c5a028; border: 2px solid #fff; }
        @keyframes legacy-map-dash { to { stroke-dashoffset: 0; } }
        @keyframes legacy-letter-drift { from { transform: rotate(var(--legacy-letter-rotation, 0deg)) translateY(0); } to { transform: rotate(var(--legacy-letter-rotation, 0deg)) translateY(-2px); } }
        @keyframes legacy-map-pulse { 0% { transform: scale(0.4); opacity: 0.9; } 100% { transform: scale(1); opacity: 0; } }
      `}</style>
      <section className="relative min-h-0 flex-1 overflow-hidden rounded-[1.35rem] border border-[#1f1a16]/85 bg-[#2a241e] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_36px_rgba(26,26,24,0.18)]">
        <div className="h-full overflow-hidden rounded-[1.05rem] border border-[#4b4036] bg-[#dcd3c3]">
          <div ref={mapContainerRef} className="h-full w-full bg-[#e6dbc4]" />
        </div>

        <div className="pointer-events-none absolute inset-x-5 top-5 z-[500] flex items-start justify-between gap-3 lg:inset-x-6 lg:top-6">
          <div className="pointer-events-auto rounded-[1.05rem] border border-[#4b4036]/90 bg-[rgba(34,28,19,0.88)] px-4 py-3 text-[#f6f1e5] shadow-[0_14px_32px_rgba(0,0,0,0.24)] backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d7c08d]">Cartografía viva</p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-serif text-[1.7rem] font-semibold leading-none sm:text-[2rem]">{currentMonthLabel}</h3>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#d2c4aa]">
                {routesInMonth.length} rutas · {eventsInMonth.length} hitos
              </p>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {tourActive ? <span className={CHIP}>{modeLabel}</span> : null}
            <button
              type="button"
              onClick={handleTourToggle}
              className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-colors ${
                tourActive ? 'border-[#c5a059] bg-[#c5a059] text-white' : `${GHOST}`
              }`}
            >
              {tourActive ? 'Salir tour' : 'Tour'}
            </button>
            <button
              type="button"
              onClick={() => setShowRoutesPanel((current) => !current)}
              className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-colors ${
                showRoutesPanel ? 'border-[#c5a059] bg-[#f3ecd7] text-[#a38420]' : `${GHOST}`
              }`}
            >
              Rutas
            </button>
          </div>
        </div>

        {currentEvent || showRoutesPanel ? (
          <aside className="pointer-events-none absolute right-5 top-[5.75rem] bottom-24 z-[500] hidden w-[18rem] lg:flex xl:right-6">
            <div className="flex min-h-0 w-full flex-col gap-3">
              {currentEvent ? (
                <section className={`pointer-events-auto p-4 ${PANEL}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Momento activo</p>
                    <span className={CHIP}>{currentEvent.places.length} lugares</span>
                  </div>
                  <h4 className="mt-2 font-serif text-[1.05rem] font-semibold leading-tight text-[#2c2c2a]">{currentEvent.title}</h4>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f7b53]">{currentEvent.theme}</p>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-[#6f6453]">{currentEvent.summary}</p>
                </section>
              ) : null}

              {showRoutesPanel ? (
                <section className={`pointer-events-auto flex min-h-0 flex-1 flex-col p-4 ${PANEL}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Rutas del mes</p>
                      <h4 className="mt-1.5 font-serif text-[1.1rem] font-semibold text-[#2c2c2a]">{currentMonthLabel}</h4>
                    </div>
                    <span className={CHIP}>{routesInMonth.length}</span>
                  </div>
                  <div className="mt-3 grid min-h-0 gap-2 overflow-y-auto pr-1">
                    {routesInMonth.map((route) => (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => handleRouteSelection(route.id)}
                        className={`rounded-[1rem] border p-3 text-left transition-colors ${
                          route.id === selectedRoute?.id
                            ? 'border-[#c5a059] bg-[#f3ecd7] shadow-[0_8px_18px_rgba(0,0,0,0.04)]'
                            : 'border-[#d1cebd]/70 bg-[#fbf7ef]/90 hover:border-[#c5a059]'
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">{route.displayDate}</p>
                        <p className="mt-1.5 text-sm font-semibold text-[#221c13]">{route.routeLabel}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#6f6453]">
                          {route.fromPerson} {'->'} {route.toPerson}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </aside>
        ) : null}

        <div className="pointer-events-none absolute bottom-28 left-5 z-[500] hidden w-[min(24rem,calc(100vw-4rem))] lg:block xl:left-6">
          <section className={`pointer-events-auto p-3 ${PANEL}`}>
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
              {selectedRoute?.imageUrl ? (
                <div className="flex h-[118px] items-center justify-center overflow-hidden rounded-[0.9rem] border border-[#d8ccb7]/80 bg-[#efe6d3] p-1.5">
                  <img src={selectedRoute.imageUrl} alt={selectedRoute.title} className="h-full w-full object-contain" />
                </div>
              ) : null}

              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Ruta activa</p>
                    <h4 className="mt-1 line-clamp-3 font-serif text-[0.95rem] font-semibold leading-snug text-[#2c2c2a]">
                      {selectedRoute?.title || 'Sin ruta activa'}
                    </h4>
                  </div>
                  {selectedRoute ? (
                    <Link
                      href={`/legajos/10/cartas/${selectedRoute.letterId}`}
                      className={`shrink-0 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${GHOST}`}
                    >
                      Abrir carta
                    </Link>
                  ) : null}
                </div>

                {selectedRoute ? (
                  <>
                    <div className="mt-2 grid gap-1 text-sm text-[#6f6453]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">{selectedRoute.displayDate}</p>
                      <p className="font-semibold text-[#221c13]">
                        {selectedRoute.fromPerson} {'->'} {selectedRoute.toPerson}
                      </p>
                      <p>{selectedRoute.routeLabel}</p>
                      {activeQuote ? (
                        <blockquote className="line-clamp-2 border-l-2 border-[#c5a059] pl-3 text-sm italic leading-relaxed text-[#6f6453]">
                          {activeQuote}
                        </blockquote>
                      ) : null}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#d8ccb7]/80 pt-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                            routePhase === 'paused'
                              ? 'bg-[#efe4cf] text-[#8f7b53]'
                              : routePhase === 'holding'
                                ? 'bg-[#f1e9d0] text-[#a38420]'
                                : 'bg-[#eee5d0] text-[#8f6b17]'
                          }`}
                        >
                          {transportLabel}
                        </span>
                        {tourActive ? <span className={CHIP}>{modeLabel}</span> : null}
                      </div>

                      {!tourActive ? (
                        <button
                          type="button"
                          onClick={handleTourToggle}
                          className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${GHOST}`}
                        >
                          Activar tour
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-[#6a5d47]">El mes activo no tiene rutas con coordenadas utilizables.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="pointer-events-none absolute bottom-[5.5rem] left-1/2 z-[520] hidden -translate-x-1/2 lg:block">
          <div className={`pointer-events-auto flex items-center gap-3 px-3 py-2 ${PANEL}`}>
            <button type="button" onClick={() => handleStepper(-1)} disabled={!canMoveBackward} className={icon()} aria-label="Anterior">
              {'<'}
            </button>

            <div className="flex min-w-[9rem] items-center gap-3 rounded-full border border-[#dfd3bc]/90 bg-[#fbf7ef]/96 px-3 py-2">
              <div className="rounded-full p-[2px]" style={playbackRingStyle}>
                <button
                  type="button"
                  onClick={handlePlaybackToggle}
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f2e2] text-lg font-semibold text-[#5c5140] transition-colors hover:text-[#a38420]"
                >
                  {isPlaying ? (routePhase === 'paused' ? '>' : '||') : '>'}
                </button>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
                  {tourActive ? 'Tour guiado' : 'Cronología'}
                </p>
                <p className="truncate text-sm font-semibold text-[#221c13]">{transportLabel}</p>
              </div>
            </div>

            <button type="button" onClick={() => handleStepper(1)} disabled={!canMoveForward} className={icon()} aria-label="Siguiente">
              {'>'}
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-5 z-[500] lg:inset-x-6">
          <div className={`pointer-events-auto px-4 py-3 ${PANEL}`}>
            <div className="-mx-1 overflow-x-auto pb-2">
              <div className="flex min-w-max gap-2 px-1">
                {monthSignals.map((month, index) => {
                  const active = index === monthIndex;
                  return (
                    <button
                      key={month.key}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      className={`group relative flex min-w-[4.25rem] flex-col items-center rounded-[0.9rem] border px-3 py-2 transition-colors ${
                        active
                          ? 'border-[#c5a059] bg-[#f3ecd7] text-[#a38420]'
                          : 'border-[#ddd2bd]/80 bg-[#fbf7ef]/88 text-[#766a59] hover:border-[#c5a059] hover:text-[#a38420]'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em]">{month.shortLabel}</span>
                      <span className="mt-1 h-px w-full bg-[#ddd2bd]/80" />
                      <span className="mt-1 flex items-center gap-1">
                        <span className={`h-2.5 w-2.5 rounded-full border border-white/90 ${month.routes > 0 ? 'bg-[#c5a059]' : 'bg-[#ddd2bd]'}`} />
                        <span className={`h-2 w-2 rounded-full ${month.events > 0 ? 'bg-[#221c13]' : 'bg-[#ddd2bd]'}`} />
                      </span>
                      <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em]">
                        {month.routes}/{month.events}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <span className={CHIP}>{tourActive ? modeLabel : currentMonthLabel}</span>
              <input
                type="range"
                min={0}
                max={Math.max(months.length - 1, 0)}
                value={monthIndex}
                onChange={(event) => handleMonthSlider(Number(event.target.value))}
                className="min-w-[180px] flex-1 accent-[#a38420]"
              />
              <span className={CHIP}>{routesInMonth.length} rutas</span>
            </div>
          </div>
        </div>
      </section>

      {leafletError ? (
        <p className="rounded-[1rem] border border-[#d9b7a6] bg-[#fff4ee] px-4 py-3 text-sm text-[#8a4b2f]">{leafletError}</p>
      ) : null}
    </div>
  );
}
