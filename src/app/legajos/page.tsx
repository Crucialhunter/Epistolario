import Link from 'next/link';
import { getLegajos } from '@/lib/data/api';

export default async function LegajosPage() {
  const legajos = await getLegajos();

  return (
    <div className="min-h-screen p-12 bg-[#fcfbf8] text-[#1b180d]">
      <h1 className="text-3xl font-serif font-bold text-[#c5a028] mb-8">Explorador de Legajos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {legajos.map((legajo) => (
          <Link 
            key={legajo.legajoId} 
            href={`/legajos/${legajo.legajoId}`}
            className="block p-6 bg-white border border-[#e7e1cf] rounded-xl shadow-sm hover:border-[#c5a028] transition-colors"
          >
            <h2 className="text-xl font-bold mb-2">Legajo {legajo.legajoId}</h2>
            <p className="text-sm text-[#5a5545] font-medium mb-3">{legajo.dateRange}</p>
            <p className="text-sm line-clamp-3">{legajo.summary}</p>
            
            <div className="mt-4 flex gap-4 text-xs font-bold uppercase tracking-wider text-[#5a5545]">
              <span>{legajo.letterCount} Cartas</span>
              <span>{legajo.imageCount} Imágenes</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
