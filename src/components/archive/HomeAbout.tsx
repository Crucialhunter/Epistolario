export default function HomeAbout() {
  /* ~12 images per track, mixing all 3 legajos */
  const track1 = [
    '/legajos/legajo-06/images/001_1b.jpg',
    '/legajos/legajo-10/images/003-302.jpg',
    '/legajos/legajo-19/images/002_cg2.JPG',
    '/legajos/legajo-06/images/008_4.jpg',
    '/legajos/legajo-10/images/011-306a.jpg',
    '/legajos/legajo-19/images/007_cg6a.JPG',
    '/legajos/legajo-06/images/016_9a.jpg',
    '/legajos/legajo-10/images/018-309a.jpg',
    '/legajos/legajo-19/images/014_cg6h.JPG',
    '/legajos/legajo-06/images/023_13.jpg',
    '/legajos/legajo-10/images/025-313.jpg',
    '/legajos/legajo-19/images/021_cg6o.JPG',
  ];

  const track2 = [
    '/legajos/legajo-10/images/001-301aa.jpg',
    '/legajos/legajo-19/images/004_cg4a.JPG',
    '/legajos/legajo-06/images/005_3a.jpg',
    '/legajos/legajo-10/images/008-305a.jpg',
    '/legajos/legajo-19/images/010_cg6d.JPG',
    '/legajos/legajo-06/images/012_7a.jpg',
    '/legajos/legajo-10/images/015-308a.jpg',
    '/legajos/legajo-19/images/017_cg6k.JPG',
    '/legajos/legajo-06/images/019_11a.jpg',
    '/legajos/legajo-10/images/022-311a.jpg',
    '/legajos/legajo-19/images/025_cg7.JPG',
    '/legajos/legajo-06/images/026_15.jpg',
  ];

  const stats = [
    { value: '6.701', label: 'cartas transcritas' },
    { value: '41', label: 'legajos documentados' },
    { value: '269', label: 'a\u00f1os de correspondencia' },
  ];

  // Background tuning (hardcoded)
  const riverOpacity = 0.53;
  const riverSaturation = 0.3;
  const overlayOpacity = 0.66;

  return (
    <>
      {/* Fix 2: Breathing space between hero and about section */}
      <div style={{ height: '72px', background: 'linear-gradient(to bottom, var(--archive-canvas), #f0ebe2)' }} />

      <section style={{ position: 'relative', overflow: 'hidden', background: '#f0ebe2' }}>
        {/* --- Manuscript river --- */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: riverOpacity,
            filter: `saturate(${riverSaturation}) contrast(0.85)`,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease, filter 0.3s ease',
          }}
        >
          <ManuscriptTrack images={track1} direction="left" duration={120} />
          <ManuscriptTrack images={track2} direction="right" duration={140} />
        </div>

        {/* --- Radial overlay --- */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              `radial-gradient(ellipse at center, rgba(240,235,226,${overlayOpacity}) 0%, rgba(240,235,226,${Math.max(0, overlayOpacity - 0.12)}) 50%, rgba(240,235,226,${Math.max(0, overlayOpacity - 0.22)}) 100%)`,
            pointerEvents: 'none',
            transition: 'background 0.3s ease',
          }}
        />

        {/* --- Content --- */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '680px',
            margin: '0 auto',
            padding: '7rem 1.5rem 5.5rem',
            textAlign: 'center',
          }}
        >
          {/* Label */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#b08a2a',
              marginBottom: '2rem',
            }}
          >
            Sobre el proyecto
          </p>

          {/* Main text */}
          <p
            className="reader-display about-text"
            style={{
              lineHeight: 1.75,
              color: '#3a3530',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            ARCA es una plataforma de acceso y exploraci&oacute;n del Epistolario
            de Pedro de Santacilia y Pax, uno de los fondos de correspondencia
            privada m&aacute;s extensos del Mediterr&aacute;neo occidental en los
            siglos XVI&ndash;XVIII. Cada carta se presenta con su manuscrito
            original y transcripci&oacute;n completa, navegable por legajo,
            cronolog&iacute;a, personas y lugares.
          </p>

          {/* Gold separator */}
          <div
            style={{
              width: '48px',
              height: '1px',
              background: '#c4a44a',
              opacity: 0.4,
              margin: '36px auto',
            }}
          />

          {/* Closing line */}
          <p
            className="reader-display"
            style={{
              fontSize: '15px',
              fontStyle: 'italic',
              color: '#6b6255',
              marginBottom: '2.5rem',
            }}
          >
            Un proyecto de investigaci&oacute;n y edici&oacute;n digital
          </p>

          {/* Stats */}
          <div className="about-stats">
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  textAlign: 'center',
                  background: 'rgba(240, 235, 226, 0.85)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  padding: '20px 24px',
                  borderRadius: '8px',
                }}
              >
                <p
                  className="reader-display"
                  style={{
                    fontSize: '36px',
                    fontWeight: 300,
                    color: '#b08a2a',
                    lineHeight: 1.2,
                    marginBottom: '6px',
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#8a7f72',
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scoped styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes scroll-left {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @keyframes scroll-right {
              from { transform: translateX(-50%); }
              to { transform: translateX(0); }
            }
            .ms-track-left {
              display: flex;
              gap: 16px;
              width: max-content;
              will-change: transform;
              animation: scroll-left 120s linear infinite;
            }
            .ms-track-right {
              display: flex;
              gap: 16px;
              width: max-content;
              will-change: transform;
              animation: scroll-right 140s linear infinite;
              margin-top: 16px;
            }
            .ms-img {
              width: 200px;
              height: 280px;
              object-fit: cover;
              border-radius: 6px;
              flex-shrink: 0;
            }
            .about-text {
              font-size: 18px;
            }
            .about-stats {
              display: flex;
              justify-content: center;
              gap: 60px;
              margin-top: 2.5rem;
            }
            @media (max-width: 767px) {
              .ms-track-left, .ms-track-right {
                gap: 12px;
              }
              .ms-img {
                width: 140px;
                height: 196px;
              }
              .about-text {
                font-size: 16px !important;
              }
              .about-stats {
                flex-direction: column;
                align-items: center;
                gap: 28px;
              }
            }
            @media (min-width: 768px) and (max-width: 1023px) {
              .about-stats {
                gap: 40px;
              }
            }
          `,
          }}
        />
      </section>

      {/* --- Minimal footer --- */}
      <footer
        style={{
          textAlign: 'center',
          padding: '24px 16px',
          fontSize: '12px',
          color: '#a09a90',
          fontFamily: 'var(--font-sans)',
          background: '#f0ebe2',
        }}
      >
        &copy; ARCA &middot; Archivo Digital del Epistolario de Pedro de Santacilia y Pax
      </footer>
    </>
  );
}

/* --- Track subcomponent --- */
function ManuscriptTrack({
  images,
  direction,
  duration,
}: {
  images: string[];
  direction: 'left' | 'right';
  duration: number;
}) {
  const cls = direction === 'left' ? 'ms-track-left' : 'ms-track-right';
  const doubled = [...images, ...images];

  return (
    <div
      className={cls}
      style={{ animationDuration: `${duration}s` }}
    >
      {doubled.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt=""
          loading="lazy"
          className="ms-img"
        />
      ))}
    </div>
  );
}
