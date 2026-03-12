import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#fcfbf8] text-[#1b180d]">
      <h1 className="text-4xl font-bold font-serif text-[#c5a028] mb-4">Epistolario Demo</h1>
      <p className="mb-8 text-[#5a5545]">Bienvenido al archivo digital de Don Pedro de Santacilia y Pax.</p>
      
      <Link 
        href="/legajos"
        className="px-6 py-3 bg-[#c5a028] text-white rounded-lg font-medium hover:bg-[#a38420] transition-colors"
      >
        Explorar Legajos
      </Link>
    </main>
  );
}
