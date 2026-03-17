import { notFound } from 'next/navigation';
import { getLegajos } from '@/lib/data/api';
import { getLegajoArchiveVM } from '@/lib/view-models';
import { buildLegajoCuratorialPageData } from '@/lib/curatorial/legajoCuratorial';
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

  return <CuratorialTimelineVivaModule data={content.timelineViva} legajoId={archive.legajo.id} />;
}
