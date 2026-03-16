import StitchLegajoNavCPage from '@/components/stitch/legajo-nav-c/StitchLegajoNavCPage';
import { getLegajos } from '@/lib/data/api';
import { buildStitchLegajoNavCViewData } from '@/lib/stitch/legajoNavCAdapter';
import { getLegajoArchiveVM } from '@/lib/view-models';

export async function generateStaticParams() {
  const legajos = await getLegajos();
  return legajos.map((legajo) => ({ id: legajo.legajoId }));
}

export default async function LegajoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const archive = await getLegajoArchiveVM(id);

  if (!archive) {
    return null;
  }

  const data = buildStitchLegajoNavCViewData(archive);
  return <StitchLegajoNavCPage data={data} />;
}
