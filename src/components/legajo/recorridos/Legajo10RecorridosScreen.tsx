import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import Legajo10LegacyMap from '@/components/legajo/recorridos/Legajo10LegacyMap';
import type { LegajoCorpusVM } from '@/lib/view-models';
import type { LegacyMapData } from '@/lib/recorridos/legacyMapTypes';

export default function Legajo10RecorridosScreen({
  legajo,
  mapData,
}: {
  legajo: LegajoCorpusVM;
  mapData: LegacyMapData;
}) {
  return (
    <div className="flex h-full min-h-[38rem] w-full flex-col overflow-hidden px-2 py-2 md:px-3 md:py-3 xl:px-4">
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Inicio' },
            { href: '/legajos', label: 'Legajos' },
            { href: `/legajos/${legajo.id}`, label: `Legajo ${legajo.id}` },
            { href: `/legajos/${legajo.id}/recorridos`, label: 'Recorridos' },
            { label: 'Mapa' },
          ]}
        />

        <div className="min-h-0 flex-1 overflow-hidden">
          <Legajo10LegacyMap data={mapData} />
        </div>
      </div>
    </div>
  );
}
