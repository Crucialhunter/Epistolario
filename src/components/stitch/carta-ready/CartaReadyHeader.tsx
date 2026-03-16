import { StitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';

export interface CartaReadyHeaderProps {
  readonly data: Readonly<StitchCartaReadyViewData>;
}

export default function CartaReadyHeader({ data }: Readonly<CartaReadyHeaderProps>) {
  return (
    <header className="border-b border-[#2f2a24] bg-[#1a1a18] px-8 py-4 text-white">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c9b996]">
          <span className="font-bold text-[#d6b26d]">Archivo digital</span>
          <span>Legajos</span>
          <span>Recorridos</span>
          <span>Cronologia</span>
          <span>Relatos</span>
          <span>Sobre el proyecto</span>
        </div>
        <div className="rounded border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#d4cab7]">
          Stitch source · {data.projectId}
        </div>
      </div>
    </header>
  );
}
