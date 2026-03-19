'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

type HeroVariant = 'editorial' | 'video';

export default function HomeHero() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialVariant: HeroVariant =
    searchParams.get('hero') === 'video' ? 'video' : 'editorial';

  const [variant, setVariant] = useState<HeroVariant>(initialVariant);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const videoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fallback: if video doesn't load within 3s, revert to editorial
  useEffect(() => {
    if (variant === 'video' && !videoLoaded) {
      videoTimeoutRef.current = setTimeout(() => {
        if (!videoLoaded) {
          setVariant('editorial');
          router.replace('/', { scroll: false });
        }
      }, 3000);
    }
    return () => {
      if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
    };
  }, [variant, videoLoaded, router]);

  const toggleVariant = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      const next = variant === 'editorial' ? 'video' : 'editorial';
      setVariant(next);
      router.replace(next === 'video' ? '/?hero=video' : '/', { scroll: false });
      setTimeout(() => setTransitioning(false), 50);
    }, 300);
  }, [variant, router]);

  const handleCanPlay = useCallback(() => {
    setVideoLoaded(true);
    if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
  }, []);

  const isVideo = variant === 'video' && videoLoaded;
  const animDuration = isVideo ? '800ms' : '600ms';

  // Background image tuning (hardcoded)
  const bgOpacity = 1;
  const bgSaturation = 2;

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* ── VARIANT A BACKGROUND: texture noise + atmospheric painting ── */}
      {!isVideo && (
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(circle at top, rgba(255,250,241,0.9) 0%, rgba(242,234,219,0.88) 36%, rgba(226,221,208,0.96) 100%), var(--archive-canvas)',
          }}
        >
          {/* Atmospheric painting background */}
          <div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{
              height: '65vh',
              backgroundImage: 'url("/images/hero-pintura.jpg/hero-pintura.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              opacity: bgOpacity,
              filter: `saturate(${bgSaturation}) contrast(0.9)`,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
              transition: 'opacity 0.3s ease, filter 0.3s ease',
            }}
          />
          {/* Paper grain noise via inline SVG */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
          />
        </div>
      )}

      {/* ── VARIANT B BACKGROUND: video ── */}
      {variant === 'video' && (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onCanPlay={handleCanPlay}
            className="absolute inset-0 z-0 h-full w-full object-cover"
            style={{
              animation: 'heroZoom 10s ease-out forwards',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          >
            <source src="/video/hero-arca-mp4/Epistolario.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay */}
          {videoLoaded && (
            <div
              className="absolute inset-0 z-[1]"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%)',
              }}
            />
          )}
        </>
      )}

      {/* ── CONTENT ── */}
      <div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        style={{
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 300ms ease',
        }}
      >
        {/* Label */}
        <p
          className="hero-fadein"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            color: isVideo ? 'rgba(255,255,255,0.7)' : '#c5a059',
            animationDuration: animDuration,
            animationDelay: '0ms',
          }}
        >
          Archivo Epistolar Digital
        </p>

        {/* Title */}
        <h1
          className="reader-display hero-fadein"
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
            fontWeight: 600,
            lineHeight: 1.05,
            marginTop: '1.5rem',
            color: isVideo ? '#ffffff' : '#1a1a18',
            textShadow: isVideo ? '0 2px 20px rgba(0,0,0,0.3)' : 'none',
            animationDuration: animDuration,
            animationDelay: '100ms',
          }}
        >
          Epistolario de Pedro
          <br />
          de Santacilia y Pax
        </h1>

        {/* Subtitle */}
        <p
          className="hero-fadein"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.94rem, 1.5vw, 1.125rem)',
            lineHeight: 1.65,
            marginTop: '1.25rem',
            maxWidth: '600px',
            color: isVideo ? 'rgba(255,255,255,0.75)' : '#6b6560',
            animationDuration: animDuration,
            animationDelay: '200ms',
          }}
        >
          Correspondencia privada de una red familiar y comercial
          en el Mediterr&aacute;neo occidental, siglos XVI&ndash;XVIII.
        </p>

        {/* Gold rule */}
        <div
          className="hero-fadein"
          style={{
            width: '80px',
            height: '1px',
            marginTop: '1.5rem',
            background: isVideo ? 'rgba(255,255,255,0.4)' : '#c5a059',
            animationDuration: animDuration,
            animationDelay: '300ms',
          }}
        />

        {/* Stats */}
        <p
          className="hero-fadein"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.875rem, 1.3vw, 1.25rem)',
            letterSpacing: '0.05em',
            marginTop: '1.25rem',
            color: isVideo ? 'rgba(255,255,255,0.85)' : '#6b6560',
            animationDuration: animDuration,
            animationDelay: '300ms',
          }}
        >
          <span style={{ fontWeight: 600, color: isVideo ? '#fff' : '#1a1a18' }}>41</span>
          {' legajos '}
          <span style={{ color: isVideo ? 'rgba(255,255,255,0.4)' : '#c5a05966' }}>&middot;</span>
          {' '}
          <span style={{ fontWeight: 600, color: isVideo ? '#fff' : '#1a1a18' }}>6.701</span>
          {' cartas '}
          <span style={{ color: isVideo ? 'rgba(255,255,255,0.4)' : '#c5a05966' }}>&middot;</span>
          {' 1510\u20131779'}
        </p>

        {/* Entry cards */}
        <div
          className="hero-fadein hero-fadein-cards mt-8 flex w-full max-w-[840px] flex-col gap-6 sm:flex-row sm:justify-center"
          style={{
            animationDuration: animDuration,
            animationDelay: '450ms',
          }}
        >
          <EntryCard
            title="Explorar los legajos"
            description="Navega los 41 legajos del archivo, con su contenido y contexto documental."
            href="/legajos"
            cta="Entrar"
            isVideo={isVideo}
          />
          <EntryCard
            title="Recorridos y timelines narrativas"
            description="Itinerarios guiados a trav&eacute;s de las cartas por temas, personas y cronolog&iacute;a."
            href="/legajos/10"
            cta="Explorar"
            isVideo={isVideo}
          />
        </div>
      </div>

      {/* ── TOGGLE BUTTON (discreto, visible on hover) ── */}
      <button
        onClick={toggleVariant}
        className="absolute z-20 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 hover:opacity-100"
        style={{
          bottom: '16px',
          right: '16px',
          width: '28px',
          height: '28px',
          background: isVideo
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(26,26,24,0.04)',
          border: isVideo
            ? '1px solid rgba(255,255,255,0.12)'
            : '1px solid rgba(26,26,24,0.08)',
          color: isVideo ? 'rgba(255,255,255,0.5)' : 'rgba(107,101,96,0.5)',
          fontSize: '10px',
          cursor: 'pointer',
        }}
        title={variant === 'editorial' ? 'Cambiar a video' : 'Cambiar a editorial'}
      >
        {variant === 'editorial' ? '\u25B6' : '\u25A0'}
      </button>

      {/* Keyframe styles */}
      <style jsx>{`
        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes heroFadeInCards {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes heroZoom {
          from {
            transform: scale(1.05);
          }
          to {
            transform: scale(1);
          }
        }
        @keyframes bgReveal {
          from {
            opacity: 0;
            transform: scale(1.05);
          }
          to {
            opacity: 0.12;
            transform: scale(1);
          }
        }
        .hero-bg-reveal {
          opacity: 0;
          animation: bgReveal 2s ease-out forwards;
        }
        .hero-fadein {
          opacity: 0;
          animation-name: heroFadeIn;
          animation-fill-mode: forwards;
          animation-timing-function: ease-out;
        }
        .hero-fadein-cards {
          animation-name: heroFadeInCards;
        }
      `}</style>
    </section>
  );
}

/* ── Entry Card sub-component ── */

function EntryCard({
  title,
  description,
  href,
  cta,
  isVideo,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  isVideo: boolean;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-lg text-left transition-all duration-250 ease-out"
      style={{
        width: '100%',
        maxWidth: '400px',
        padding: '36px',
        background: isVideo
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.85)',
        border: isVideo
          ? '1px solid rgba(255,255,255,0.15)'
          : '1px solid rgba(197,160,89,0.2)',
        backdropFilter: isVideo ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isVideo ? 'blur(12px)' : 'none',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        if (isVideo) {
          el.style.background = 'rgba(255,255,255,0.12)';
          el.style.borderColor = 'rgba(255,255,255,0.25)';
        } else {
          el.style.boxShadow = '0 12px 36px rgba(44,44,42,0.14)';
          el.style.borderColor = 'rgba(197,160,89,0.5)';
          el.style.transform = 'translateY(-2px)';
        }
        const ctaEl = el.querySelector<HTMLElement>('.entry-cta');
        if (ctaEl) ctaEl.style.paddingLeft = '3px';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (isVideo) {
          el.style.background = 'rgba(255,255,255,0.08)';
          el.style.borderColor = 'rgba(255,255,255,0.15)';
        } else {
          el.style.boxShadow = 'none';
          el.style.borderColor = 'rgba(197,160,89,0.2)';
          el.style.transform = 'translateY(0)';
        }
        const ctaEl = el.querySelector<HTMLElement>('.entry-cta');
        if (ctaEl) ctaEl.style.paddingLeft = '0';
      }}
    >
      <h3
        className="reader-display"
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: isVideo ? '#ffffff' : '#1a1a18',
          marginBottom: '0.6rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.938rem',
          lineHeight: 1.6,
          color: isVideo ? 'rgba(255,255,255,0.7)' : '#8a8078',
          marginBottom: '1.1rem',
        }}
        dangerouslySetInnerHTML={{ __html: description }}
      />
      <span
        className="entry-cta group-hover:underline"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.938rem',
          fontWeight: 500,
          color: isVideo ? '#ffffff' : '#7A5C10',
          display: 'inline-block',
          transition: 'padding-left 250ms ease',
        }}
      >
        {cta} &rarr;
      </span>
    </Link>
  );
}
