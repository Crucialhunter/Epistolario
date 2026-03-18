import CartaViewV2 from '@/components/lab/v2/CartaViewV2';
import { getCarta, getLegajoLetters } from '@/lib/data/api';
import { buildStitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';
import { buildReaderRelatedDocuments, getLegajoArchiveVM } from '@/lib/view-models';

export default async function UiLabCartaPage() {
  const legajoId = '10';
  const cartaId = '1135';

  const [archive, carta, letters] = await Promise.all([
    getLegajoArchiveVM(legajoId),
    getCarta(legajoId, cartaId),
    getLegajoLetters(legajoId),
  ]);

  if (!archive || !carta) {
    return null;
  }

  const relatedDocuments = buildReaderRelatedDocuments(carta, letters);
  const data = buildStitchCartaReadyViewData(archive.legajo, carta, relatedDocuments);

  return <CartaViewV2 data={data} backHref="/ui-lab" />;
}
