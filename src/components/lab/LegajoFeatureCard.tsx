'use client';

import { ArrowRight } from 'lucide-react';
import DarkInfoPill from '@/components/lab/DarkInfoPill';

export type LegajoFeatureCardVariant = 'baseline' | 'hover-reveal' | 'refined' | 'signature';

export interface LegajoFeatureCardProps {
  title: string;
  summary: string;
  imageUrl: string;
  dateRange: string;
  letterCount: number;
  imageCount: number;
  principalActors: string[];
  keyPlaces: string[];
  hasVisualLayer: boolean;
  onOpen?: () => void;
  className?: string;
  variant?: LegajoFeatureCardVariant;
}

function StatBandItem({ label, value, align = 'left' }: { label: string; value: string; align?: 'left' | 'center' }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${align === 'center' ? 'items-center text-center' : ''}`}>
      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8f7742]">{label}</span>
      <span className="reader-display text-[1.1rem] font-semibold leading-none text-[#241d14] sm:text-[1.2rem]">{value}</span>
    </div>
  );
}

function CompactEntityPill({ item, tone = 'light' }: { item: string; tone?: 'light' | 'dark' }) {
  const toneClass =
    tone === 'dark'
      ? 'border-[#6a5a46] bg-[linear-gradient(180deg,rgba(45,37,30,0.98),rgba(31,26,22,0.98))] text-[#efe1c3]'
      : 'border-[#d9cfbf] bg-[linear-gradient(180deg,rgba(255,252,246,0.92),rgba(244,237,225,0.92))] text-[#665946]';

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${toneClass}`}
    >
      {item}
    </span>
  );
}

function CompactEntityRow({
  label,
  items,
  tone = 'light',
}: {
  label: string;
  items: readonly string[];
  tone?: 'light' | 'dark';
}) {
  const labelClass = tone === 'dark' ? 'text-[#cbb47a]' : 'text-[#8f7742]';

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
      <p className={`w-full shrink-0 text-[9px] font-bold uppercase tracking-[0.18em] sm:w-[6.2rem] sm:pt-1 ${labelClass}`}>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <CompactEntityPill key={item} item={item} tone={tone} />
        ))}
      </div>
    </div>
  );
}

function BaselineMetrics({
  dateRange,
  letterCount,
  imageCount,
  actorCount,
}: {
  dateRange: string;
  letterCount: number;
  imageCount: number;
  actorCount: number;
}) {
  return (
    <div className="rounded-[1.1rem] border border-[#ddd4c4] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,243,234,0.92))] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBandItem label="Rango" value={dateRange} />
        <StatBandItem label="Cartas" value={`${letterCount}`} align="center" />
        <StatBandItem label="Imagenes" value={`${imageCount}`} align="center" />
        <StatBandItem label="Actores" value={`${actorCount}`} align="center" />
      </div>
    </div>
  );
}

function RefinedMetrics({
  dateRange,
  letterCount,
  imageCount,
  actorCount,
}: {
  dateRange: string;
  letterCount: number;
  imageCount: number;
  actorCount: number;
}) {
  const items = [
    { label: 'Cartas', value: `${letterCount}` },
    { label: 'Imagenes', value: `${imageCount}` },
    { label: 'Actores', value: `${actorCount}` },
  ];

  return (
    <div className="overflow-hidden rounded-[1.12rem] border border-[#d8cebc] bg-[linear-gradient(180deg,rgba(252,248,240,0.98),rgba(241,233,219,0.96))] shadow-[0_10px_24px_rgba(50,38,24,0.06),inset_0_1px_0_rgba(255,255,255,0.72)]">
      <div className="grid min-h-[4.9rem] grid-cols-[1.3fr_2fr]">
        <div className="flex flex-col justify-center border-r border-[#ded3c1] bg-[linear-gradient(180deg,rgba(246,238,224,0.9),rgba(237,228,211,0.92))] px-3.5 py-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8f7742]">Rango documental</span>
          <span className="reader-display mt-1 text-[1.28rem] font-semibold leading-none text-[#241d14]">{dateRange}</span>
        </div>
        <div className="grid grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.label}
              className={`flex flex-col justify-center px-3 py-3 text-center ${index < items.length - 1 ? 'border-r border-[#e2d8c7]' : ''}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8f7742]">{item.label}</span>
              <span className="reader-display mt-1 text-[1.16rem] font-semibold leading-none text-[#241d14]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SignatureMetrics({
  dateRange,
  letterCount,
  imageCount,
  actorCount,
}: {
  dateRange: string;
  letterCount: number;
  imageCount: number;
  actorCount: number;
}) {
  const items = [
    { label: 'Cartas', value: `${letterCount}` },
    { label: 'Imagenes', value: `${imageCount}` },
    { label: 'Actores', value: `${actorCount}` },
  ];

  return (
    <div className="overflow-hidden rounded-[1.14rem] border border-[#d6cab8] bg-[linear-gradient(180deg,rgba(255,252,245,0.96),rgba(240,233,221,0.94))] shadow-[0_12px_30px_rgba(48,36,22,0.08),inset_0_1px_0_rgba(255,255,255,0.78)]">
      <div className="border-b border-[#ddd2c0] px-3.5 py-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8f7742]">Rango documental</span>
        <div className="mt-1 flex items-end justify-between gap-3">
          <span className="reader-display text-[1.34rem] font-semibold leading-none text-[#201910]">{dateRange}</span>
          <span className="text-[10px] leading-none text-[#86765c]">Lectura concentrada del fondo</span>
        </div>
      </div>
      <div className="grid grid-cols-3 bg-[linear-gradient(180deg,rgba(249,243,232,0.72),rgba(255,255,255,0.38))]">
        {items.map((item, index) => (
          <div key={item.label} className={`px-3 py-2.5 text-center ${index < items.length - 1 ? 'border-r border-[#e3d9c8]' : ''}`}>
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8f7742]">{item.label}</span>
            <div className="reader-display mt-1 text-[1.08rem] font-semibold leading-none text-[#241d14]">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoverRevealEntities({
  principalActors,
  keyPlaces,
}: {
  principalActors: readonly string[];
  keyPlaces: readonly string[];
}) {
  return (
    <div className="rounded-[1.1rem] border border-[#d9cfbf] bg-[linear-gradient(180deg,rgba(248,242,232,0.96),rgba(241,233,218,0.94))] px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8f7742]">Actores y lugares</p>
          <p className="mt-1 text-[11px] leading-[1.35] text-[#6c5e49]">Se despliega al pasar el raton.</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8f7742]">{principalActors.length} actores</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#8f7742]">{keyPlaces.length} lugares</p>
        </div>
      </div>

      <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:max-h-40 group-hover:opacity-100">
        <div className="grid gap-2.5 border-t border-[#dfd5c5] pt-3">
          <CompactEntityRow label="Actores clave" items={principalActors.slice(0, 3)} />
          <CompactEntityRow label="Lugares clave" items={keyPlaces.slice(0, 3)} />
        </div>
      </div>
    </div>
  );
}

function RefinedEntities({
  principalActors,
  keyPlaces,
}: {
  principalActors: readonly string[];
  keyPlaces: readonly string[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.12rem] border border-[#d8cebc] bg-[linear-gradient(180deg,rgba(249,243,232,0.96),rgba(240,232,216,0.94))] shadow-[0_10px_24px_rgba(50,38,24,0.05),inset_0_1px_0_rgba(255,255,255,0.68)]">
      <div className="grid gap-px bg-[#e1d7c7] lg:grid-cols-2">
        <div className="bg-[linear-gradient(180deg,rgba(252,248,240,0.98),rgba(244,237,225,0.94))] px-3.5 py-3">
          <CompactEntityRow label="Actores clave" items={principalActors.slice(0, 3)} />
        </div>
        <div className="bg-[linear-gradient(180deg,rgba(247,240,228,0.98),rgba(239,230,214,0.94))] px-3.5 py-3">
          <CompactEntityRow label="Lugares clave" items={keyPlaces.slice(0, 3)} />
        </div>
      </div>
    </div>
  );
}

function SignatureEntities({
  principalActors,
  keyPlaces,
}: {
  principalActors: readonly string[];
  keyPlaces: readonly string[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.14rem] border border-[#51463a] bg-[linear-gradient(180deg,rgba(36,30,25,0.98),rgba(28,24,20,0.98))] text-[#f2e9d8] shadow-[0_14px_30px_rgba(21,17,13,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d4b56d]">Nodos del legajo</p>
        <p className="text-[10px] leading-none text-[#cec3af]">Actores y lugares clave</p>
      </div>
      <div className="grid gap-3 px-3.5 py-3">
        <CompactEntityRow label="Actores" items={principalActors.slice(0, 3)} tone="dark" />
        <div className="h-px bg-white/10" />
        <CompactEntityRow label="Lugares" items={keyPlaces.slice(0, 3)} tone="dark" />
      </div>
    </div>
  );
}

function BaselineEntities({
  principalActors,
  keyPlaces,
}: {
  principalActors: readonly string[];
  keyPlaces: readonly string[];
}) {
  return (
    <div className="rounded-[1.1rem] border border-[#ddd4c4] bg-[linear-gradient(180deg,rgba(251,247,239,0.92),rgba(245,238,227,0.92))] px-3.5 py-3">
      <div className="grid gap-2.5">
        <CompactEntityRow label="Actores clave" items={principalActors.slice(0, 3)} />
        <div className="h-px bg-[#e1d8ca]" />
        <CompactEntityRow label="Lugares clave" items={keyPlaces.slice(0, 3)} />
      </div>
    </div>
  );
}

export default function LegajoFeatureCard({
  title,
  summary,
  imageUrl,
  dateRange,
  letterCount,
  imageCount,
  principalActors,
  keyPlaces,
  hasVisualLayer,
  onOpen,
  className = '',
  variant = 'baseline',
}: Readonly<LegajoFeatureCardProps>) {
  const visualStatus = hasVisualLayer ? 'Visual activa' : 'Texto completo';
  const accessStatus = hasVisualLayer ? 'Manuscrito local' : 'Solo corpus base';

  const cardChromeClass =
    variant === 'signature'
      ? 'border-[#d1c5b1] bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(242,235,222,0.96))] shadow-[0_20px_44px_rgba(33,26,18,0.14),inset_0_1px_0_rgba(255,255,255,0.56)] hover:border-[#c8aa73] hover:shadow-[0_28px_48px_rgba(33,26,18,0.18),inset_0_1px_0_rgba(255,255,255,0.62)]'
      : variant === 'refined'
        ? 'border-[#d4cab9] bg-[linear-gradient(180deg,rgba(255,252,246,0.97),rgba(244,238,226,0.96))] shadow-[0_18px_38px_rgba(33,26,18,0.12),inset_0_1px_0_rgba(255,255,255,0.54)] hover:border-[#c8af84] hover:shadow-[0_24px_44px_rgba(33,26,18,0.16),inset_0_1px_0_rgba(255,255,255,0.6)]'
        : 'border-[#d5cdbd] bg-[linear-gradient(180deg,rgba(255,252,246,0.97),rgba(245,239,228,0.95))] shadow-[0_14px_30px_rgba(33,26,18,0.11),inset_0_1px_0_rgba(255,255,255,0.5)] hover:border-[#ccb183] hover:shadow-[0_22px_42px_rgba(33,26,18,0.16),inset_0_1px_0_rgba(255,255,255,0.56)]';

  const heroAspectClass = variant === 'signature' ? 'aspect-[16/8.5]' : variant === 'refined' ? 'aspect-[16/8.65]' : 'aspect-[16/8.8]';

  return (
    <article
      className={`group h-fit w-full max-w-[428px] self-start overflow-hidden rounded-[1.55rem] border text-[#241d14] transition-all duration-300 hover:-translate-y-1 ${cardChromeClass} ${className}`}
    >
      <div className={`relative overflow-hidden border-b border-[#ddd4c6] ${heroAspectClass}`}>
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-[transform,filter] duration-500 group-hover:scale-[1.035] group-hover:blur-[2px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(21,18,15,0.82),rgba(21,18,15,0.18)_56%,rgba(21,18,15,0.02))]" />

        <div className="absolute left-3.5 top-3.5 flex max-w-[80%] flex-wrap gap-1.5">
          <DarkInfoPill
            leftLabel="Capa"
            rightLabel={visualStatus}
            tone={hasVisualLayer ? 'accent' : 'muted'}
            className="px-2.5 py-1 text-[9px]"
          />
          <DarkInfoPill leftLabel="Acceso" rightLabel={accessStatus} tone="default" className="px-2.5 py-1 text-[9px]" />
        </div>

        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between gap-3">
          <div className="max-w-[14rem]">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d8be66]">Rango documental</p>
            <p className="reader-display mt-1 text-[1.18rem] font-semibold leading-none text-[#f5f1e6] sm:text-[1.26rem]">{dateRange}</p>
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#efd79a] bg-[#ead9ae] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#2f2312] shadow-[0_12px_26px_rgba(24,20,16,0.18)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 motion-safe:translate-x-1"
          >
            Abrir legajo
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 p-4">
        <div className="space-y-1.5">
          <h3 className="reader-display text-[1.58rem] font-semibold leading-[0.96] text-[#201910] transition-colors group-hover:text-[#8a651c] sm:text-[1.68rem]">
            {title}
          </h3>
          <p className="line-clamp-2 text-[13px] leading-[1.45] text-[#6b5d46]">{summary}</p>
        </div>

        {variant === 'baseline' || variant === 'hover-reveal' ? (
          <BaselineMetrics
            dateRange={dateRange}
            letterCount={letterCount}
            imageCount={imageCount}
            actorCount={principalActors.length}
          />
        ) : null}
        {variant === 'refined' ? (
          <RefinedMetrics
            dateRange={dateRange}
            letterCount={letterCount}
            imageCount={imageCount}
            actorCount={principalActors.length}
          />
        ) : null}
        {variant === 'signature' ? (
          <SignatureMetrics
            dateRange={dateRange}
            letterCount={letterCount}
            imageCount={imageCount}
            actorCount={principalActors.length}
          />
        ) : null}

        {variant === 'baseline' ? <BaselineEntities principalActors={principalActors} keyPlaces={keyPlaces} /> : null}
        {variant === 'hover-reveal' ? <HoverRevealEntities principalActors={principalActors} keyPlaces={keyPlaces} /> : null}
        {variant === 'refined' ? <RefinedEntities principalActors={principalActors} keyPlaces={keyPlaces} /> : null}
        {variant === 'signature' ? <SignatureEntities principalActors={principalActors} keyPlaces={keyPlaces} /> : null}

        <div className="flex items-center justify-between gap-3 border-t border-[#ddd4c4] pt-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8f7742]">Lectura sugerida</p>
            <p className="mt-1 text-[12px] leading-[1.45] text-[#564937]">Empieza por overview y archivo.</p>
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 rounded-full border border-[#d6c4a0] bg-[#fbf6ea] px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#7c632b] transition-colors hover:border-[#c5a059] hover:text-[#8b651c]"
          >
            Ver ficha
          </button>
        </div>
      </div>
    </article>
  );
}
