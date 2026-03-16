"use client";

interface FilterPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  place: string;
  onPlaceChange: (value: string) => void;
  sender: string;
  onSenderChange: (value: string) => void;
  theme: string;
  onThemeChange: (value: string) => void;
  places: string[];
  senders: string[];
  themes: string[];
  resultsCount: number;
  onClear: () => void;
}

export default function FilterPanel(props: FilterPanelProps) {
  const hasActiveFilters = Boolean(props.search || props.place || props.sender || props.theme);

  return (
    <section className="rounded-[1.5rem] border border-[#e7dcc6] bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a38420]">Exploracion textual</p>
            <h2 className="reader-display mt-2 text-2xl font-semibold text-[#221c13]">Archivo del legajo</h2>
            <p className="mt-2 text-sm text-[#6a5d47]">{props.resultsCount} cartas visibles con filtros documentales activos.</p>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={props.onClear}
              className="rounded-full border border-[#d8c89e] bg-[#f7f1e6] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f7742] transition-colors hover:border-[#c5a028] hover:text-[#a38420]"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            type="search"
            value={props.search}
            onChange={(event) => props.onSearchChange(event.target.value)}
            placeholder="Buscar carta, remitente o lugar"
            className="rounded-xl border border-[#e7dcc6] bg-[#fcfbf8] px-4 py-3 text-sm text-[#221c13] outline-none transition-colors focus:border-[#c5a028]"
          />
          <select value={props.place} onChange={(event) => props.onPlaceChange(event.target.value)} className="rounded-xl border border-[#e7dcc6] bg-[#fcfbf8] px-4 py-3 text-sm text-[#221c13] outline-none transition-colors focus:border-[#c5a028]">
            <option value="">Lugar (todos)</option>
            {props.places.map((place) => (
              <option key={place} value={place}>{place}</option>
            ))}
          </select>
          <select value={props.sender} onChange={(event) => props.onSenderChange(event.target.value)} className="rounded-xl border border-[#e7dcc6] bg-[#fcfbf8] px-4 py-3 text-sm text-[#221c13] outline-none transition-colors focus:border-[#c5a028]">
            <option value="">Remitente (todos)</option>
            {props.senders.map((sender) => (
              <option key={sender} value={sender}>{sender}</option>
            ))}
          </select>
          <select value={props.theme} onChange={(event) => props.onThemeChange(event.target.value)} className="rounded-xl border border-[#e7dcc6] bg-[#fcfbf8] px-4 py-3 text-sm text-[#221c13] outline-none transition-colors focus:border-[#c5a028]">
            <option value="">Tema (todos)</option>
            {props.themes.map((theme) => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
