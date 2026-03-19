import { Suspense } from 'react';
import ArchiveShell from '@/components/shells/ArchiveShell';
import HomeHero from '@/components/archive/HomeHero';
import HomeAbout from '@/components/archive/HomeAbout';

export default function Home() {
  return (
    <ArchiveShell headerProps={{ activeSection: 'home', contextMode: 'none' }}>
      <Suspense fallback={<HeroFallback />}>
        <HomeHero />
      </Suspense>
      <HomeAbout />
    </ArchiveShell>
  );
}

/** Minimal fallback while useSearchParams resolves */
function HeroFallback() {
  return (
    <section
      className="flex items-center justify-center"
      style={{ height: '100vh' }}
    >
      <div className="text-center">
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#c5a059',
          }}
        >
          Archivo Epistolar Digital
        </p>
      </div>
    </section>
  );
}
