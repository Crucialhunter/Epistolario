import { getLegajos } from '@/lib/data/api';
import { getLegajoArchiveVM } from '@/lib/view-models';
import LegajoCuratorialScreen from '@/components/legajo/LegajoCuratorialScreen';
import { buildLegajoCuratorialPageData } from '@/lib/curatorial/legajoCuratorial';

export async function generateStaticParams() {
  const legajos = await getLegajos();
  return legajos.map((legajo) => ({ id: legajo.legajoId }));
}

export default async function LegajoRelatosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const archive = await getLegajoArchiveVM(id);

  if (!archive) {
    return null;
  }

  const content = await buildLegajoCuratorialPageData(archive, 'relatos');
  return <LegajoCuratorialScreen legajo={archive.legajo} content={content} />;
}
