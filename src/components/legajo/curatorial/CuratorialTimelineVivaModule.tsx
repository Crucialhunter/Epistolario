'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CuratorialTimelineData, CuratorialTimelineItem } from '@/lib/curatorial/legajoCuratorial';

const VISIBLE_RADIUS = 3;

function dwellForItem(type: 'evento' | 'carta') {
  return type === 'evento' ? 6200 : 4300;
}

function itemTone(type: 'evento' | 'carta', active: boolean) {
  if (type === 'evento') {
    return active ? 'border-[#c5a059]/60 bg-[#fcfbf8]' : 'border-[#d1cebd]/75 bg-white/72';
  }

  return active ? 'border-[#b7ac96] bg-[#fcfbf8]' : 'border-[#d1cebd]/72 bg-white/64';
}

function shortLabel(text: string, maxLength = 42) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function normalizeTimelineDate(iso?: string | null) {
  if (!iso) return '9999-99-99';
  if (iso.length === 7) return `${iso}-15`;
  if (iso.length === 4) return `${iso}-06-15`;
  return iso;
}

function timelineStamp(item: CuratorialTimelineItem, fallbackIndex: number) {
  const parsed = Number(new Date(`${normalizeTimelineDate(item.dateIso)}T12:00:00Z`));
  return Number.isFinite(parsed) ? parsed : fallbackIndex;
}

function buildTimelineLayout(items: CuratorialTimelineItem[]) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      itemCount: number;
      eventCount: number;
      letterCount: number;
      items: Array<{
        id: string;
        index: number;
        type: 'evento' | 'carta';
        title: string;
        dateLabel: string;
        stamp: number;
      }>;
    }
  >();

  const stamps = items.map((item, index) => timelineStamp(item, index));

  for (const [index, item] of items.entries()) {
    const key = item.dateIso.slice(0, 7) || `${item.monthLabel}-${item.yearLabel}`;
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        key,
        label: `${item.monthLabel} ${item.yearLabel}`,
        itemCount: 1,
        eventCount: item.type === 'evento' ? 1 : 0,
        letterCount: item.type === 'carta' ? 1 : 0,
        items: [
          {
            id: item.id,
            index,
            type: item.type,
            title: item.title,
            dateLabel: item.dateLabel,
            stamp: stamps[index],
          },
        ],
      });
      continue;
    }

    existing.itemCount += 1;
    existing.eventCount += item.type === 'evento' ? 1 : 0;
    existing.letterCount += item.type === 'carta' ? 1 : 0;
    existing.items.push({
      id: item.id,
      index,
      type: item.type,
      title: item.title,
      dateLabel: item.dateLabel,
      stamp: stamps[index],
    });
  }

  const moments = [...groups.values()];
  const maxCount = Math.max(...moments.map((moment) => moment.itemCount), 1);
  const monthCount = Math.max(moments.length, 1);
  const sidePadding = 2;
  const gapPct = monthCount > 1 ? 2.4 : 0;
  const availablePct = 100 - sidePadding * 2 - gapPct * Math.max(monthCount - 1, 0);
  const weights = moments.map((moment) => 1 + Math.min(moment.itemCount - 1, 4) * 0.24);
  const totalWeight = Math.max(weights.reduce((sum, weight) => sum + weight, 0), 1);

  let cursor = sidePadding;
  const pointsByIndex = new Map<number, { pct: number; monthKey: string }>();

  const layoutMoments = moments.map((moment, index) => {
    const widthPct = (availablePct * weights[index]) / totalWeight;
    const monthItems = [...moment.items].sort((left, right) => left.stamp - right.stamp || left.index - right.index);
    const minStamp = Math.min(...monthItems.map((item) => item.stamp));
    const maxStamp = Math.max(...monthItems.map((item) => item.stamp));
    const span = Math.max(maxStamp - minStamp, 1);
    const innerPadding = widthPct > 16 ? 0.12 : 0.16;

    const itemsWithPct = monthItems.map((item, itemIndex) => {
      const basePct =
        monthItems.length === 1
          ? 0.5
          : maxStamp === minStamp
            ? itemIndex / Math.max(monthItems.length - 1, 1)
            : (item.stamp - minStamp) / span;

      const pct = cursor + widthPct * (innerPadding + basePct * (1 - innerPadding * 2));
      pointsByIndex.set(item.index, { pct, monthKey: moment.key });

      return {
        ...item,
        pct,
      };
    });

    const centerPct = cursor + widthPct / 2;
    const startPct = itemsWithPct[0]?.pct ?? centerPct;
    const endPct = itemsWithPct[itemsWithPct.length - 1]?.pct ?? centerPct;

    const layoutMoment = {
      ...moment,
      density: moment.itemCount / maxCount,
      widthPct,
      startPct,
      endPct,
      centerPct,
      items: itemsWithPct,
    };

    cursor += widthPct + gapPct;
    return layoutMoment;
  });

  return {
    moments: layoutMoments,
    pointsByIndex,
  };
}

export default function CuratorialTimelineVivaModule({
  data,
  legajoId,
}: {
  data: CuratorialTimelineData;
  legajoId: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playProgress, setPlayProgress] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!isPlaying || data.items.length <= 1) {
      setPlayProgress(0);
      setRemainingMs(0);
      return undefined;
    }

    const currentItem = data.items[currentIndex];
    const duration = dwellForItem(currentItem?.type ?? 'carta');
    const startedAt = window.performance.now();

    setPlayProgress(0);
    setRemainingMs(duration);

    const intervalId = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt;
      const clampedElapsed = Math.min(elapsed, duration);
      setPlayProgress(clampedElapsed / duration);
      setRemainingMs(Math.max(duration - clampedElapsed, 0));
    }, 80);

    const timeoutId = window.setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % data.items.length);
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [currentIndex, data.items, isPlaying]);

  const currentItem = data.items[currentIndex];
  const timelineLayout = useMemo(() => buildTimelineLayout(data.items), [data.items]);
  const moments = timelineLayout.moments;

  if (!currentItem) {
    return null;
  }

  const currentMoment = moments.find((moment) => currentItem.dateIso.startsWith(moment.key)) || moments[0];
  const currentPointPct = timelineLayout.pointsByIndex.get(currentIndex)?.pct ?? 0;
  const nextIndex = currentIndex === data.items.length - 1 ? currentIndex : currentIndex + 1;
  const nextPointPct = timelineLayout.pointsByIndex.get(nextIndex)?.pct ?? currentPointPct;
  const activeChapter =
    currentItem.chapterLabel ||
    data.chapters.find((chapter) => chapter.targetId === currentItem.id)?.label ||
    'Lectura continua';

  const jumpToIndex = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const jumpToTarget = (targetId: string) => {
    const nextIndex = data.items.findIndex((item) => item.id === targetId);
    if (nextIndex >= 0) {
      jumpToIndex(nextIndex);
    }
  };

  const cursorPct = isPlaying ? currentPointPct + (nextPointPct - currentPointPct) * playProgress : currentPointPct;
  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
  const playbackLabel = isPlaying ? `Siguiente momento en ${remainingSeconds}s` : 'Exploracion manual';
  const playbackRing = isPlaying
    ? `conic-gradient(#c5a059 ${Math.max(playProgress, 0.02) * 360}deg, rgba(197,160,89,0.18) 0deg)`
    : 'conic-gradient(rgba(209,206,189,0.85) 360deg, rgba(209,206,189,0.85) 0deg)';

  return (
    <section className="h-full min-h-[38rem] overflow-hidden bg-[radial-gradient(circle_at_top,#f5f0e5_0%,#efe6cf_45%,#e1dacc_100%)] text-[#2c2c2a]">
      <div className="grid h-full grid-rows-[64px_minmax(0,1fr)]">
        <header className="border-b border-[#d1cebd]/85 bg-[#1a1a18] px-3 text-[#f5f2e8] md:px-5">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href={`/legajos/${legajoId}`}
                className="rounded-full border border-[#c5a059]/32 bg-[#2a241e] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#efe5cc] transition-colors hover:border-[#c5a059] hover:text-white"
              >
                Volver al legajo
              </Link>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c5a059]">Legajo {legajoId}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate font-serif text-[1.45rem] font-semibold leading-none text-[#f5f2e8] md:text-[1.7rem]">
                    {data.title}
                  </h1>
                  <span className="rounded-full border border-[#d1cebd]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d9d2c4]">
                    {data.rangeLabel || 'Arco activo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden max-w-2xl items-center gap-4 xl:flex">
              <p className="text-sm leading-relaxed text-[#d9d2c4]">{data.topNote}</p>
            </div>
          </div>
        </header>

        <div className="min-h-0 overflow-hidden">
          <section className="relative h-full overflow-hidden bg-[linear-gradient(to_bottom,rgba(245,242,232,0.98),rgba(241,233,208,0.94))]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.36),rgba(255,255,255,0))]" />

            <div className="absolute left-4 top-4 z-30 flex max-w-[30rem] flex-wrap items-center gap-3 md:left-6 md:top-5">
              <span className="rounded-full border border-[#c5a059]/38 bg-[#1a1a18] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8]">
                {currentItem.type === 'evento' ? 'Acontecimiento' : 'Carta'}
              </span>
              <span className="rounded-full border border-[#d1cebd] bg-white/78 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453]">
                {activeChapter}
              </span>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-10 z-0 flex justify-center">
              <div className="text-center">
                <p className="text-[12px] font-bold uppercase tracking-[0.32em] text-[#9a7a3d]">{currentItem.monthLabel}</p>
                <p className="font-serif text-[4.5rem] font-semibold leading-none tracking-[-0.05em] text-[#201c18] md:text-[7.2rem]">
                  {currentItem.yearLabel}
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-5 left-1/2 z-10 -translate-x-1/2">
              <div className="flex h-full flex-col items-center">
                <div className="mt-[9.1rem] h-4 w-4 rounded-full border-2 border-[#c5a059] bg-[#1a1a18]" />
                <div className="mt-3 h-full w-px bg-[linear-gradient(to_bottom,rgba(197,160,89,0.78),rgba(197,160,89,0.09),rgba(197,160,89,0))]" />
              </div>
            </div>

            <div className="absolute inset-x-0 top-0 bottom-[11.75rem] overflow-hidden px-2 pb-4 pt-[9.2rem] md:px-4 md:pb-5">
              <div className="relative h-full overflow-hidden">
                {data.items.map((item, index) => {
                  const offset = index - currentIndex;
                  const distance = Math.abs(offset);

                  if (distance > VISIBLE_RADIUS) {
                    return null;
                  }

                  const translateX = offset * 305;
                  const scale = distance === 0 ? 1 : distance === 1 ? 0.84 : distance === 2 ? 0.66 : 0.52;
                  const opacity = distance === 0 ? 1 : distance === 1 ? 0.56 : distance === 2 ? 0.16 : 0.08;
                  const zIndex = 30 - distance;
                  const active = distance === 0;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => jumpToIndex(index)}
                      className={`absolute left-1/2 top-[12%] w-[86vw] max-w-[30rem] overflow-hidden rounded-[1.2rem] border text-left shadow-[0_24px_60px_rgba(32,28,24,0.14)] transition-all duration-500 ease-out md:w-[30rem] ${itemTone(
                        item.type,
                        active,
                      )}`}
                      style={{
                        zIndex,
                        opacity,
                        transform: `translateX(calc(-50% + ${translateX}px)) scale(${scale})`,
                        filter: active ? 'blur(0px)' : distance >= 2 ? 'blur(1.2px)' : 'blur(0.45px)',
                      }}
                    >
                      <div className={`h-1.5 w-full ${item.type === 'evento' ? 'bg-[#c5a059]' : 'bg-[#817053]/46'}`} />
                      <div className="p-4 md:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                item.type === 'evento' ? 'bg-[#1a1a18] text-[#f5f2e8]' : 'bg-[#ede9de] text-[#6f6453]'
                              }`}
                            >
                              {item.eyebrow}
                            </span>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">{item.dateLabel}</p>
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a7a3d]">
                            {index + 1} / {data.items.length}
                          </p>
                        </div>

                        <h2 className="mt-4 font-serif text-[1.75rem] font-semibold leading-[1.03] text-[#201c18] md:text-[2rem]">{item.title}</h2>
                        <p className="mt-3 text-[15px] leading-relaxed text-[#6b5a44]">{item.summary}</p>

                        {active ? (
                          <>
                            <blockquote className="mt-4 rounded-r-[0.95rem] border-l-2 border-[#c5a059] bg-[#f5f2e8]/84 px-4 py-3 text-sm italic leading-relaxed text-[#2c2c2a]">
                              "{item.quote}"
                            </blockquote>

                            <div className="mt-4 grid gap-2">
                              <p className="text-[11px] leading-relaxed text-[#6f6453]">{item.meta}</p>
                              {item.mapLabel ? <p className="text-[11px] text-[#7a6b4f]">{item.mapLabel}</p> : null}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#d1cebd]/70 pt-4">
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
                                {item.type === 'evento' ? 'Acontecimiento seleccionado' : 'Carta seleccionada'}
                              </p>
                              <Link
                                href={item.href}
                                className="rounded-full border border-[#d1cebd] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
                              >
                                {item.hrefLabel}
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="mt-4 border-t border-[#d1cebd]/60 pt-3">
                            <p className="text-[11px] text-[#7a6b4f]">{item.chapterLabel || item.mapLabel || item.meta}</p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {currentItem.related.length ? (
                  <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center">
                    <div className="flex w-[94vw] max-w-[54rem] flex-wrap justify-center gap-3">
                      {currentItem.related.slice(0, 3).map((related) => (
                        <button
                          key={related.id}
                          type="button"
                          onClick={() => jumpToTarget(related.targetId)}
                          className={`w-[15rem] rounded-[1rem] border px-4 py-3 text-left shadow-[0_14px_30px_rgba(32,28,24,0.08)] transition-colors ${
                            related.type === 'evento'
                              ? 'border-[#c5a059]/42 bg-[#f1e9d0]/96 text-[#2c2c2a] hover:border-[#c5a059]'
                              : 'border-[#d1cebd] bg-white/90 text-[#6b5a44] hover:border-[#c5a059]/45'
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                            {related.type === 'evento' ? 'Acontecimiento conectado' : 'Carta conectada'}
                          </p>
                          <p className="mt-2 font-serif text-[1.02rem] font-semibold leading-tight">{shortLabel(related.label, 36)}</p>
                          <p className="mt-1 text-[11px] leading-relaxed">{shortLabel(related.meta, 52)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[11.35rem] left-4 z-30 flex max-w-[calc(100%-2rem)] flex-col items-start gap-2 md:left-6">
              <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-[#d1cebd]/78 bg-white/62 px-4 py-2 shadow-[0_18px_38px_rgba(32,28,24,0.1)] backdrop-blur-[8px]">
                <button
                  type="button"
                  onClick={() => jumpToIndex(currentIndex === 0 ? data.items.length - 1 : currentIndex - 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d1cebd] bg-[#fcfbf8] text-[#6f6453] shadow-[0_8px_18px_rgba(32,28,24,0.08)] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
                  aria-label="Ir al momento anterior"
                  title="Anterior"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M11.5 4L6 9L11.5 14" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div
                  className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full p-[3px] shadow-[0_14px_30px_rgba(26,26,24,0.16)]"
                  style={{ background: playbackRing }}
                >
                  <button
                    type="button"
                    onClick={() => setIsPlaying((value) => !value)}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-[#c5a059]/55 bg-[#1a1a18] text-[#f5f2e8] transition-colors hover:border-[#c5a059]"
                    aria-label={isPlaying ? 'Pausar timeline' : 'Reproducir timeline'}
                    title={isPlaying ? 'Pausar' : 'Reproducir'}
                  >
                    {isPlaying ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <rect x="4.5" y="4" width="3.5" height="12" rx="1.1" fill="currentColor" />
                        <rect x="12" y="4" width="3.5" height="12" rx="1.1" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M6 4.75L15 10L6 15.25V4.75Z" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => jumpToIndex((currentIndex + 1) % data.items.length)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d1cebd] bg-[#fcfbf8] text-[#6f6453] shadow-[0_8px_18px_rgba(32,28,24,0.08)] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
                  aria-label="Ir al siguiente momento"
                  title="Siguiente"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M6.5 4L12 9L6.5 14" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="pointer-events-none flex max-w-full flex-wrap items-center gap-2 pr-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
                <span className="rounded-full border border-[#d1cebd]/78 bg-white/58 px-3 py-1 backdrop-blur-[6px]">
                  {currentMoment?.label || currentItem.dateLabel}
                </span>
                <span className="rounded-full border border-[#d1cebd]/78 bg-white/58 px-3 py-1 text-[#9a7a3d] backdrop-blur-[6px]">
                  {playbackLabel}
                </span>
              </div>
            </div>

            <div className="absolute inset-x-4 bottom-4 z-20 md:inset-x-6">
              <div className="rounded-[1.1rem] border border-[#d1cebd]/70 bg-white/46 px-4 py-3 shadow-[0_18px_34px_rgba(32,28,24,0.08)] backdrop-blur-[8px]">
                <div>
                  <div className="relative rounded-[1rem] border border-[#d1cebd]/75 bg-[#f5f2e8] px-3 py-3">
                    <div className="pointer-events-none absolute inset-x-3 top-[1.15rem] h-[3.9rem]">
                      {moments.map((moment) => (
                        <div
                          key={`band-${moment.key}`}
                          className={`absolute rounded-[0.9rem] border ${
                            currentItem.dateIso.startsWith(moment.key)
                              ? 'border-[#c5a059]/34 bg-[linear-gradient(to_bottom,rgba(197,160,89,0.12),rgba(197,160,89,0.04))]'
                              : 'border-[#d1cebd]/55 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.24),rgba(255,255,255,0.02))]'
                          }`}
                          style={{
                            left: `${moment.startPct}%`,
                            width: `${Math.max(moment.endPct - moment.startPct, 4.8)}%`,
                            top: 0,
                            bottom: 0,
                          }}
                        />
                      ))}
                    </div>
                    <div className="pointer-events-none absolute inset-x-3 top-[1.65rem] h-px bg-[#d8cfbd]/85" />
                    <div className="pointer-events-none absolute inset-x-3 top-[3.35rem] h-px bg-[#d8cfbd]/85" />
                    <div className="pointer-events-none absolute left-3 top-[1.28rem] text-[9px] font-bold uppercase tracking-[0.22em] text-[#b49a68]">
                      Eventos
                    </div>
                    <div className="pointer-events-none absolute left-3 top-[2.98rem] text-[9px] font-bold uppercase tracking-[0.22em] text-[#98876a]">
                      Cartas
                    </div>
                    <div
                      className="pointer-events-none absolute bottom-[2.35rem] top-[10px] z-20 w-[2px] rounded-full bg-[#1a1a18] transition-all"
                      style={{ left: `calc(${cursorPct}% - 1px)` }}
                    />

                    <div className="relative h-[6.3rem]">
                      {moments.map((moment) => (
                        <div key={moment.key}>
                          {moment.items.map((point) => {
                            const active = point.index === currentIndex;
                            const pointBottom = point.type === 'evento' ? '3.1rem' : '2.75rem';
                            const pointHeight =
                              point.type === 'evento'
                                ? 18 + Math.round(moment.density * 18)
                                : 11 + Math.round(moment.density * 9);
                            return (
                              <button
                                key={point.id}
                                type="button"
                                onClick={() => jumpToIndex(point.index)}
                                className={`absolute bottom-[2.7rem] rounded-full transition-all hover:scale-105 ${
                                  active
                                    ? 'bg-[#1a1a18] ring-2 ring-[#1a1a18] ring-offset-2 ring-offset-[#f5f2e8]'
                                    : point.type === 'evento'
                                      ? 'bg-[#c5a059]'
                                      : 'bg-[#8d7a58]'
                                }`}
                                style={{
                                  bottom: pointBottom,
                                  left: `calc(${point.pct}% - ${point.type === 'evento' ? 6 : 4}px)`,
                                  width: point.type === 'evento' ? '12px' : '8px',
                                  height: `${pointHeight}px`,
                                  opacity: active ? 1 : 0.85,
                                }}
                                aria-label={`Ir a ${point.title}`}
                                title={`${point.dateLabel} - ${point.title}`}
                              />
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => jumpToIndex(moment.items[0]?.index ?? 0)}
                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full px-2 py-1 text-center text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
                              currentItem.dateIso.startsWith(moment.key)
                                ? 'bg-[#1a1a18] text-[#f5f2e8]'
                                : 'text-[#7a6b4f] hover:bg-white/70'
                            }`}
                            style={{ left: `${moment.centerPct}%` }}
                          >
                            {moment.label}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
