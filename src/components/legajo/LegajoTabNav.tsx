import Link from 'next/link';

const TABS = [
  { id: 'archivo', label: 'Archivo' },
  { id: 'recorridos', label: 'Recorridos' },
  { id: 'relatos', label: 'Relatos' },
] as const;

export default function LegajoTabNav({ legajoId, currentTab }: { legajoId: string; currentTab: 'archivo' | 'recorridos' | 'relatos' }) {
  return (
    <nav className="flex flex-wrap gap-3 rounded-[1.5rem] border border-[#e7dcc6] bg-white p-2 shadow-sm">
      {TABS.map((tab) => {
        const href = tab.id === 'archivo' ? `/legajos/${legajoId}` : `/legajos/${legajoId}/${tab.id}`;
        const active = currentTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={href}
            className={`rounded-[1.1rem] px-4 py-3 text-sm font-bold uppercase tracking-[0.22em] transition-colors ${active ? 'bg-[#2d2a26] text-[#fcfbf8]' : 'text-[#6a5d47] hover:bg-[#f7f1e6] hover:text-[#a38420]'}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
