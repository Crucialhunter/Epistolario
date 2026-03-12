"use client";

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import queryString from 'query-string';
import { CartaSummary } from '@/lib/types';
import { Search, MapPin, Calendar, Tag, User, ImageIcon, LayoutGrid, List as ListIcon, Star } from 'lucide-react';

interface LetterExplorerProps {
  legajoId: string;
  initialLetters: CartaSummary[];
  featuredIds?: string[];
}

export default function LetterExplorer({ legajoId, initialLetters, featuredIds = [] }: LetterExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filterLugar, setFilterLugar] = useState(searchParams.get('lugar') || '');
  const [filterRemitente, setFilterRemitente] = useState(searchParams.get('remitente') || '');
  const [filterTema, setFilterTema] = useState(searchParams.get('tema') || '');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const query = {
      q: search || undefined,
      lugar: filterLugar || undefined,
      remitente: filterRemitente || undefined,
      tema: filterTema || undefined
    };
    const qs = queryString.stringify(query);
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [search, filterLugar, filterRemitente, filterTema, pathname, router]);

  const lugares = useMemo(() => Array.from(new Set(initialLetters.map(l => l.lugar).filter(Boolean))).sort(), [initialLetters]);
  const remitentes = useMemo(() => Array.from(new Set(initialLetters.map(l => l.remitente).filter(Boolean))).sort(), [initialLetters]);
  const temas = useMemo(() => {
    const set = new Set<string>();
    initialLetters.forEach(l => {
      if (l.temas) {
        l.temas.split(',').forEach(t => set.add(t.trim()));
      }
    });
    return Array.from(set).sort();
  }, [initialLetters]);

  const filteredLetters = useMemo(() => {
    return initialLetters.filter(l => {
      const matchSearch = search === '' || 
        l.id_carta.includes(search) ||
        (l.remitente && l.remitente.toLowerCase().includes(search.toLowerCase())) ||
        (l.destinatario && l.destinatario.toLowerCase().includes(search.toLowerCase())) ||
        (l.lugar && l.lugar.toLowerCase().includes(search.toLowerCase()));

      const matchLugar = filterLugar === '' || l.lugar === filterLugar;
      const matchRemitente = filterRemitente === '' || l.remitente === filterRemitente;
      const matchTema = filterTema === '' || (l.temas && l.temas.includes(filterTema));

      return matchSearch && matchLugar && matchRemitente && matchTema;
    });
  }, [initialLetters, search, filterLugar, filterRemitente, filterTema]);

  // Extract featured letters when NO filters are active
  const isFiltering = search || filterLugar || filterRemitente || filterTema;
  
  const { featured, grouped } = useMemo(() => {
    let featuredList: CartaSummary[] = [];
    if (!isFiltering && featuredIds.length > 0) {
      featuredList = initialLetters.filter(l => featuredIds.includes(l.id_carta));
    }

    const groups: Record<string, CartaSummary[]> = {};
    filteredLetters.forEach(l => {
      // Don't duplicate featured letters in the main list if we are not filtering
      if (!isFiltering && featuredIds.includes(l.id_carta)) return;

      const match = l.fecha?.match(/(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i);
      const key = match ? `${match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()} ${match[2]}` : 'Otras Fechas';
      if (!groups[key]) groups[key] = [];
      groups[key].push(l);
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => {
      if (a === 'Otras Fechas') return 1;
      if (b === 'Otras Fechas') return -1;
      // Very basic chronological sort assuming "Month Year". 
      // For a real app we'd map months to numbers, but string localeCompare might be enough if year varies heavily.
      // Better: Map month names to indices for sorting if they share a year.
      const months: Record<string, number> = { 'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12 };
      const [mA, yA] = a.split(' ');
      const [mB, yB] = b.split(' ');
      if (yA !== yB) return (yA || '').localeCompare(yB || '');
      return (months[mA] || 0) - (months[mB] || 0);
    }).map(k => ({ name: k, items: groups[k] }));

    return { featured: featuredList, grouped: sortedGroups };
  }, [filteredLetters, initialLetters, featuredIds, isFiltering]);

  const LetterCard = ({ letter, isFeatured = false }: { letter: CartaSummary, isFeatured?: boolean }) => {
    if (viewMode === 'list' && !isFeatured) {
      // LIST MODE UI
      return (
        <Link 
          href={`/legajos/${legajoId}/cartas/${letter.id_carta}?from=explorer`}
          className="group flex flex-col md:flex-row md:items-center justify-between bg-white border-b border-[#e7e1cf] p-4 md:px-6 md:py-5 hover:bg-[#fcfbf8] transition-colors gap-2 md:gap-4"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 min-w-0 flex-1 w-full">
            <div className="flex items-center justify-between md:shrink-0 md:w-24 mb-2 md:mb-0">
              <span className="text-lg font-bold font-serif text-[#c5a028] group-hover:text-[#a38420] transition-colors">
                Carta {letter.id_carta}
              </span>
              <div className="md:hidden flex items-center gap-4">
                 {letter.hasImages && <span className="text-[#5a5545]"><ImageIcon size={14} /></span>}
                 <span className="text-[#c5a028] font-serif text-lg leading-none">→</span>
              </div>
            </div>
            
            <div className="min-w-0 flex-1 flex flex-col md:grid md:grid-cols-12 gap-1 md:gap-4 md:items-center">
              <div className="md:col-span-4">
                <span className="font-semibold text-[#1b180d] text-sm md:text-base block truncate">{letter.remitente || 'Desconocido'}</span>
                <span className="text-[#5a5545] text-xs truncate block">a {letter.destinatario}</span>
              </div>
              <div className="md:col-span-3 text-xs md:text-sm text-[#5a5545] flex items-center gap-1.5 md:block">
                <Calendar size={12} className="md:hidden shrink-0 text-[#c5a028]" />
                <span className="truncate">{letter.fecha || 'Sin fecha'}</span>
              </div>
              <div className="md:col-span-2 text-xs md:text-sm text-[#5a5545] font-medium flex items-center gap-1.5 md:block">
                <MapPin size={12} className="md:hidden shrink-0 text-[#c5a028]" />
                <span className="truncate">{letter.lugar || '---'}</span>
              </div>
              <div className="md:col-span-3 mt-2 md:mt-0 flex gap-1 overflow-x-auto no-scrollbar">
                {letter.temas && letter.temas.split(',').slice(0, 2).map((tema) => (
                  <span key={tema.trim()} className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#f3f0e7] text-[#5a5545] text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate max-w-[120px] whitespace-nowrap">
                    {tema.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex shrink-0 items-center gap-4">
             {letter.hasImages && (
              <span className="text-[#5a5545]" title="Contiene manuscrito">
                <ImageIcon size={16} />
              </span>
            )}
            <span className="text-[#c5a028] font-serif text-lg leading-none transform group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
      );
    }

    // GRID MODE / FEATURED UI
    return (
      <Link 
        href={`/legajos/${legajoId}/cartas/${letter.id_carta}?from=explorer`}
        className={`group flex flex-col bg-white border ${isFeatured ? 'border-[#c5a028] shadow-md ring-1 ring-[#c5a028]/20' : 'border-[#e7e1cf] shadow-sm'} rounded-xl overflow-hidden hover:shadow-xl hover:border-[#c5a028] transition-all duration-300 relative h-full`}
      >
        <div className="p-5 flex-1 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xl font-bold font-serif text-[#c5a028] group-hover:text-[#a38420] transition-colors">
              Carta {letter.id_carta}
            </span>
            {letter.hasImages && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#5a5545] bg-[#fcfbf8] border border-[#e7e1cf] px-2 py-1 rounded">
                <ImageIcon size={12} /> Ms.
              </span>
            )}
          </div>
          
          <div className="space-y-3 text-sm mb-6">
            <div className="flex items-start gap-2">
              <User size={16} className="text-[#c5a028] mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-[#1b180d] block leading-tight">{letter.remitente || 'Desconocido'}</span>
                <span className="text-[#5a5545] text-xs">a {letter.destinatario || 'Desconocido'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[#5a5545]">
              <Calendar size={16} className="text-[#c5a028] shrink-0" />
              <span className="font-medium truncate">{letter.fecha || 'Sin fecha'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-[#5a5545]">
              <MapPin size={16} className="text-[#c5a028] shrink-0" />
              <span className="font-medium truncate">{letter.lugar || 'Ubicación desconocida'}</span>
            </div>
          </div>
          
          {letter.temas && (
            <div className="pt-4 border-t border-[#e7e1cf] mt-auto">
              <div className="flex gap-1.5 flex-wrap">
                {letter.temas.split(',').slice(0, 3).map((tema) => (
                  <span key={tema.trim()} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f3f0e7] text-[#5a5545] text-[10px] font-bold uppercase tracking-wider">
                    {tema.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`bg-[#fcfbf8] border-t border-[#e7e1cf] px-5 py-3 flex items-center justify-between group-hover:bg-[#c5a028]/10 transition-colors ${isFeatured ? 'bg-[#c5a028]/5' : ''}`}>
          <span className="text-xs font-bold uppercase tracking-widest text-[#5a5545] group-hover:text-[#c5a028] transition-colors">
            {isFeatured ? 'Explorar Destacada' : 'Abrir Carta'}
          </span>
          <span className="text-[#c5a028] font-serif text-lg leading-none transform group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </Link>
    );
  };


  return (
    <div id="explorer-section">
      {/* FILTER BAR & CONTROLS */}
      <div className="bg-white border border-[#e7e1cf] p-3 md:p-4 rounded-xl shadow-sm mb-8 md:mb-12 sticky top-4 z-40">
        <div className="flex flex-col xl:flex-row gap-3 md:gap-4 justify-between items-start xl:items-center">
          
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1 w-full xl:w-auto">
            <div className="flex gap-2 w-full md:flex-1 relative">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5545]" />
                <input 
                  type="text" 
                  placeholder="Buscar (ej. Santacilia)..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg focus:outline-none focus:border-[#c5a028] focus:ring-1 focus:ring-[#c5a028] transition-all text-[#1b180d] text-sm"
                />
              </div>
              {isFiltering && (
                <button 
                  onClick={() => { setSearch(''); setFilterLugar(''); setFilterRemitente(''); setFilterTema(''); }}
                  className="shrink-0 bg-[#fcfbf8] border border-[#e7e1cf] text-[#c5a028] px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#f3f0e7] transition-colors flex items-center"
                >
                  Limpiar
                </button>
              )}
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full md:w-auto">
              <select value={filterLugar} onChange={(e) => setFilterLugar(e.target.value)} className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg px-3 py-2 text-[#2d2a26] text-sm focus:outline-none focus:border-[#c5a028] min-w-[120px]">
                <option value="">Lugar (Todos)</option>
                {lugares.map(l => <option key={l} value={l}>{l}</option>)}
              </select>

              <select value={filterRemitente} onChange={(e) => setFilterRemitente(e.target.value)} className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg px-3 py-2 text-[#2d2a26] text-sm focus:outline-none focus:border-[#c5a028] max-w-[160px]">
                <option value="">Remitente (Todos)</option>
                {remitentes.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <select value={filterTema} onChange={(e) => setFilterTema(e.target.value)} className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg px-3 py-2 text-[#2d2a26] text-sm focus:outline-none focus:border-[#c5a028] min-w-[120px]">
                <option value="">Tema (Todos)</option>
                {temas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 border-t xl:border-t-0 border-[#e7e1cf] pt-3 md:pt-4 xl:pt-0 w-full xl:w-auto justify-between xl:justify-end">
            <div className="text-xs font-bold text-[#5a5545] uppercase tracking-wider">
              {filteredLetters.length} Cartas
            </div>
            
            <div className="hidden md:flex items-center bg-[#fcfbf8] border border-[#e7e1cf] rounded-lg p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#c5a028]' : 'text-[#5a5545] hover:bg-white/50'}`}
                title="Vista Lista"
              >
                <ListIcon size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#c5a028]' : 'text-[#5a5545] hover:bg-white/50'}`}
                title="Vista Mosaico"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* FEATURED SECTION (Only visible when no filters are applied) */}
      {featured.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-[#c5a028] fill-[#c5a028]/10" size={24} />
            <h3 className="text-2xl font-serif font-bold text-[#2d2a26]">Cartas Destacadas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map(letter => (
              <LetterCard key={letter.id_carta} letter={letter} isFeatured={true} />
            ))}
          </div>
        </div>
      )}

      {/* TILE GROUPS */}
      {filteredLetters.length === 0 ? (
        <div className="text-center p-16 bg-white border border-dashed border-[#e7e1cf] rounded-xl">
          <p className="font-serif text-[#5a5545] text-lg mb-4">No se encontraron cartas con esos criterios.</p>
          <button onClick={() => { setSearch(''); setFilterLugar(''); setFilterRemitente(''); setFilterTema(''); }} className="px-4 py-2 bg-[#f3f0e7] rounded-lg text-sm font-bold text-[#c5a028] hover:bg-[#e7e1cf] transition-colors">
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map((group) => {
            if (group.items.length === 0) return null;
            
            return (
              <div key={group.name} className="relative">
                <div className="sticky top-24 z-30 bg-[#fcfbf8]/95 backdrop-blur py-4 border-b-2 border-[#1b180d] mb-6 shadow-[0_10px_10px_-10px_rgba(252,251,248,1)]">
                  <h4 className="text-xl font-serif font-bold text-[#1b180d] flex items-baseline gap-4">
                    {group.name}
                    <span className="text-xs font-sans text-[#5a5545] tracking-widest uppercase">{group.items.length} Cartas</span>
                  </h4>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {group.items.map((letter) => (
                      <LetterCard key={letter.id_carta} letter={letter} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-[#e7e1cf] rounded-xl overflow-hidden shadow-sm">
                    {/* Editorial List Guide Header */}
                    <div className="hidden md:flex items-center gap-6 px-6 py-3 bg-[#fcfbf8] border-b border-[#e7e1cf] text-[10px] font-bold uppercase tracking-widest text-[#a38420]">
                      <div className="w-24 shrink-0">Referencia</div>
                      <div className="flex-1 grid grid-cols-12 gap-4">
                        <div className="col-span-4">Correspondencia</div>
                        <div className="col-span-3">Fecha</div>
                        <div className="col-span-2">Lugar</div>
                        <div className="col-span-3 pl-1">Temas</div>
                      </div>
                      <div className="w-12 shrink-0"></div>
                    </div>

                    {group.items.map((letter) => (
                      <LetterCard key={letter.id_carta} letter={letter} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
