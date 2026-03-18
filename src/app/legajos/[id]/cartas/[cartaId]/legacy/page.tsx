import StitchCartaReadyPage from '@/components/stitch/carta-ready/StitchCartaReadyPage';
import { getCarta, getLegajos, getLegajoLetters } from '@/lib/data/api';
import { buildStitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';
import { buildReaderRelatedDocuments, getLegajoArchiveVM } from '@/lib/view-models';

export async function generateStaticParams() {
  const legajos = await getLegajos();
  const params: { id: string; cartaId: string }[] = [];

  for (const legajo of legajos) {
    const letters = await getLegajoLetters(legajo.legajoId);
    for (const letter of letters) {
      params.push({ id: legajo.legajoId, cartaId: letter.id_carta });
    }
  }

  return params;
}

export default async function LegacyCartaPage({ params }: { params: Promise<{ id: string; cartaId: string }> }) {
  const { id, cartaId } = await params;
  const [archive, carta, letters] = await Promise.all([
    getLegajoArchiveVM(id),
    getCarta(id, cartaId),
    getLegajoLetters(id),
  ]);

  if (!archive || !carta) {
    return null;
  }

  const relatedDocuments = buildReaderRelatedDocuments(carta, letters);
  const data = buildStitchCartaReadyViewData(archive.legajo, carta, relatedDocuments);

  return (
    <StitchCartaReadyPage
      data={data}
      alternateViewHref={`/legajos/${id}/cartas/${cartaId}`}
      alternateViewLabel="Ver UI Lab"
    />
  );
}
