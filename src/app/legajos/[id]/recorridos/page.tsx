import { getLegajos } from '@/lib/data/api';
import { getLegajoArchiveVM, getLegajoCuratorialVM } from '@/lib/view-models';
import LegajoCuratorialScreen from '@/components/legajo/LegajoCuratorialScreen';

export async function generateStaticParams() {
  const legajos = await getLegajos();
  return legajos.map((legajo) => ({ id: legajo.legajoId }));
}

export default async function LegajoRecorridosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const archive = await getLegajoArchiveVM(id);

  if (!archive) {
    return null;
  }

  return <LegajoCuratorialScreen legajo={archive.legajo} content={getLegajoCuratorialVM(id, 'recorridos')} />;
}
