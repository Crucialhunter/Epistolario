export default function ArchiveFooter() {
  return (
    <footer className="border-t border-[#e7dcc6] bg-[#fbf7ef]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-[#6a5d47] md:flex-row md:items-center md:justify-between md:px-10 lg:px-16">
        <div>
          <p className="reader-display text-base text-[#221c13]">Infraestructura de demo para archivo epistolar</p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#8f7742]">CorpusBase activo · ImageEnhanced opcional · Curatorial futuro</p>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-[#6a5d47]">
          Estructura preparada para catalogo, archivo profundo y capas narrativas sin rehacer la plataforma.
        </p>
      </div>
    </footer>
  );
}
