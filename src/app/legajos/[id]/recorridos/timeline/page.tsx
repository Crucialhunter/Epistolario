import { notFound } from 'next/navigation';
import { getLegajos } from '@/lib/data/api';
import { getLegajoArchiveVM } from '@/lib/view-models';
import { buildLegajoCuratorialPageData } from '@/lib/curatorial/legajoCuratorial';
import AppHeader from '@/components/navigation/AppHeader';
import { buildAppHeaderNav } from '@/components/navigation/appHeaderNav';
import CuratorialTimelineVivaModule from '@/components/legajo/curatorial/CuratorialTimelineVivaModule';

export async function generateStaticParams() {
  const legajos = await getLegajos();
  return legajos.map((legajo) => ({ id: legajo.legajoId }));
}

export default async function LegajoRecorridosTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const archive = await getLegajoArchiveVM(id);

  if (!archive) {
    notFound();
  }

  const content = await buildLegajoCuratorialPageData(archive, 'recorridos');

  if (!content.timelineViva) {
    notFound();
  }

  return (
    <div className="app-page flex min-h-screen flex-col">
      <AppHeader brand="ARCA" navItems={buildAppHeaderNav('recorridos')} badge="Archivo digital" contextMode="none" />
      <div className="h-[calc(100dvh-var(--app-header-height,72px))] min-h-[38rem]">
        <CuratorialTimelineVivaModule data={content.timelineViva} legajoId={archive.legajo.id} />
      </div>
    </div>
  );
}
