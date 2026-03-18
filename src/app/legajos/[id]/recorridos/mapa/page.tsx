import { notFound } from 'next/navigation';
import { getLegajos } from '@/lib/data/api';
import { getLegajoArchiveVM } from '@/lib/view-models';
import AppHeader from '@/components/navigation/AppHeader';
import { buildAppHeaderNav } from '@/components/navigation/appHeaderNav';
import Legajo10RecorridosScreen from '@/components/legajo/recorridos/Legajo10RecorridosScreen';
import { getLegajo10LegacyMapData } from '@/lib/recorridos/legajo10LegacyData';

export async function generateStaticParams() {
  const legajos = await getLegajos();
  return legajos.map((legajo) => ({ id: legajo.legajoId }));
}

export default async function LegajoRecorridosMapaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const archive = await getLegajoArchiveVM(id);

  if (!archive) {
    notFound();
  }

  if (id !== '10') {
    notFound();
  }

  const mapData = await getLegajo10LegacyMapData();
  return (
    <div className="app-page flex min-h-screen flex-col">
      <AppHeader brand="ARCA" navItems={buildAppHeaderNav('recorridos')} badge="Archivo digital" contextMode="none" />
      <div className="h-[calc(100dvh-var(--app-header-height,72px))] min-h-[38rem]">
        <Legajo10RecorridosScreen legajo={archive.legajo} mapData={mapData} />
      </div>
    </div>
  );
}
