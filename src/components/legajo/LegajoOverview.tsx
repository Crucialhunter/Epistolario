import { LegajoMeta } from '@/lib/types';
import { BookOpen, Map, Users, Tag, Image as ImageIcon } from 'lucide-react';

interface LegajoOverviewProps {
  legajo: LegajoMeta;
}

export default function LegajoOverview({ legajo }: LegajoOverviewProps) {
  return (
    <section className="bg-[#2d2a26] text-[#fcfbf8] rounded-2xl overflow-hidden shadow-2xl mb-12 border border-[#5a5545] relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#c5a028]/10 to-transparent pointer-events-none"></div>
      
      <div className="p-8 md:p-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          
          <div className="flex-1 max-w-3xl">
            <span className="inline-block px-3 py-1 bg-[#c5a028] text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              Legajo {legajo.legajoId}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
              {legajo.title}
            </h1>
            <p className="text-xl text-[#c5a028] font-serif italic mb-8">
              {legajo.dateRange}
            </p>
            <p className="text-[#e7e1cf] leading-relaxed text-lg mb-8">
              {legajo.summary}
            </p>

            <div className="bg-[#1b180d]/50 border border-white/10 rounded-xl p-6 mb-8 max-w-2xl">
              <h4 className="text-[#c5a028] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <BookOpen size={14} /> Foco Curatorial
              </h4>
              <p className="text-[#e7e1cf]/90 text-sm leading-relaxed">
                Este volumen concentra la correspondencia crítica del año 1668, un periodo marcado por intensas gestiones económicas, nombramientos y decisiones logísticas desde Zaragoza y Madrid. Las cartas revelan la red de influencia de Don Pedro de Santacilia y las tensiones del momento. Orientación: recomendamos revisar las cartas destacadas para capturar el núcleo financiero y político del legajo.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#c5a028]" />
                <span className="font-semibold">{legajo.letterCount} Cartas</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#c5a028]" />
                <span className="font-semibold">{legajo.imageCount} Imágenes procesadas</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 shrink-0 bg-[#1b180d] rounded-xl p-6 border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#5a5545] mb-4">Contexto Clave</h3>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 text-[#c5a028] mb-2">
                <Map size={14} /> <span className="text-xs font-bold uppercase tracking-wider">Lugares</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {legajo.keyPlaces.map(place => (
                  <span key={place} className="text-xs bg-white/5 px-2 py-1 rounded text-[#e7e1cf]">{place}</span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-[#c5a028] mb-2">
                <Users size={14} /> <span className="text-xs font-bold uppercase tracking-wider">Personas</span>
              </div>
              <div className="flex flex-col gap-1">
                {legajo.keyPeople.map(person => (
                  <span key={person} className="text-xs text-[#e7e1cf]">• {person}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[#c5a028] mb-2">
                <Tag size={14} /> <span className="text-xs font-bold uppercase tracking-wider">Temáticas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {legajo.keyThemes.map(theme => (
                  <span key={theme} className="text-xs bg-white/5 px-2 py-1 rounded text-[#e7e1cf]">{theme}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
