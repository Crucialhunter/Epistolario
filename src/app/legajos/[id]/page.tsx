import Link from 'next/link';
import { getLegajos, getLegajo, getLegajoLetters } from '@/lib/data/api';
import LegajoOverview from '@/components/legajo/LegajoOverview';
import LetterExplorer from '@/components/legajo/LetterExplorer';
import { Suspense } from 'react';

export async function generateStaticParams() {
  const legajos = await getLegajos();
  return legajos.map((legajo) => ({
    id: legajo.legajoId,
  }));
}

export default async function LegajoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const legajoId = resolvedParams.id;
  
  const legajo = await getLegajo(legajoId);
  const letters = await getLegajoLetters(legajoId);

  if (!legajo) {
    return (
      <div className="min-h-screen p-12 flex items-center justify-center bg-[#fcfbf8]">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#c5a028] mb-4">Legajo no encontrado</h2>
          <Link href="/legajos" className="text-[#5a5545] hover:underline">Volver al Explorador</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#1b180d] p-6 py-12 md:p-12 lg:p-16 max-w-7xl mx-auto">
      <Link href="/legajos" className="inline-flex items-center gap-2 text-[#5a5545] font-bold text-xs uppercase tracking-widest hover:text-[#c5a028] mb-8 transition-colors">
        <span className="text-lg leading-none mb-0.5">←</span> Volver a todos los Legajos
      </Link>
      
      <LegajoOverview legajo={legajo} />

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif font-bold text-[#2d2a26]">Cartas del Legajo</h2>
      </div>

      <Suspense fallback={
        <div className="text-center p-12 text-[#5a5545] font-serif animate-pulse">
          Cargando explorador de cartas...
        </div>
      }>
        <LetterExplorer legajoId={legajoId} initialLetters={letters} />
      </Suspense>
    </div>
  );
}
