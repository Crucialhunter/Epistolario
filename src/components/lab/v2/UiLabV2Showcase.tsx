'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import UiLabV2LegajoCard from '@/components/lab/v2/UiLabV2LegajoCard';
import ArcaTopBar from '@/components/navigation/ArcaTopBar';
import {
  LabV2Button,
  LabV2Panel,
  LabV2Pill,
  LabV2SegmentedTabs,
  LabV2TagCluster,
} from '@/components/lab/v2/UiLabV2Primitives';

type PanelMode = 'cards' | 'states' | 'structure';

const modeCopy: Record<PanelMode, { title: string; text: string }> = {
  cards: {
    title: 'Cards con mas densidad y mejor superficie',
    text: 'Las cards ya no se sienten cajas neutras. Se comportan como objetos editoriales con jerarquia, tono y respuesta al hover.',
  },
  states: {
    title: 'Estados breves con peso institucional',
    text: 'Pills, tags y tabs no parecen componentes de SaaS. Funcionan como micro-etiquetas de archivo y seleccion de modos.',
  },
  structure: {
    title: 'Shell y paneles con mas gravedad visual',
    text: 'La version consolidada mejora bordes, radios, fondos y ritmo vertical para que todo el laboratorio se sienta una sola familia.',
  },
};

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-4xl">
      <p className="app-label">{eyebrow}</p>
      <h2 className="reader-display mt-3 text-[2.3rem] font-semibold leading-[0.94] text-[#211a12] sm:text-[2.85rem]">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#665944]">{description}</p>
    </div>
  );
}

export default function UiLabV2Showcase() {
  const [mode, setMode] = useState<PanelMode>('cards');
  const cards = useMemo(
    () => [
      {
        title: 'Legajo 10',
        summary:
          'Conjunto de 99 cartas y 185 referencias de imagen con arco concentrado en 1668-1669. Buen caso para overview, archivo, lector y recorridos.',
        imageUrl: '/legajos/legajo-10/images/001-301aa.jpg',
        dateRange: '1668-1669',
        letterCount: 99,
        imageCount: 185,
        keyActors: ['Jeronimo Pelegrin de Aragues', 'Pedro Santacilia y Pax', 'Miguel Malo'],
        keyPlaces: ['Madrid', 'Valencia', 'Palma'],
        tone: 'paper' as const,
      },
      {
        title: 'Legajo 19',
        summary:
          'Fondo de alta densidad documental y gran amplitud cronologica. La card mide bien volumen, contraste y capa visual sin volverse pesada.',
        imageUrl: '/legajos/legajo-19/images/001_cg1.JPG',
        dateRange: '1510-1698',
        letterCount: 331,
        imageCount: 602,
        keyActors: ['Pedro Santacilia y Pax', 'Persona desconocida', 'Jeronimo Pelegrin de Aragues'],
        keyPlaces: ['Mallorca', 'Madrid', 'Lugar sin especificar'],
        tone: 'ink' as const,
      },
    ],
    [],
  );

  return (
    <div className="mx-auto grid max-w-[1520px] gap-8 bg-[radial-gradient(circle_at_top_left,rgba(203,176,116,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(101,78,46,0.08),transparent_24%)] px-6 py-6 md:px-10 md:py-8 lg:px-16 lg:py-10">
      <section id="que-es-arca" className="overflow-hidden rounded-[2.3rem] border border-[#3c332b] bg-[radial-gradient(circle_at_top_left,rgba(144,104,48,0.22),transparent_26%),linear-gradient(180deg,#1a1715_0%,#12100f_100%)] text-[#faf3e7] shadow-[0_38px_72px_rgba(18,14,11,0.28)]">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.22fr)_360px] lg:px-8 lg:py-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d8be66]">Sistema visual ARCA</p>
            <h1 className="reader-display mt-3 max-w-5xl text-[2.9rem] font-semibold leading-[0.92] text-[#fff9ef] md:text-[4.4rem]">
              Sistema visual consolidado para archivo, lectura y navegacion.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#e8dfce]">
              El laboratorio queda como banco de pruebas del sistema promovido. Header, surfaces, cards y lectura pueden evaluarse aqui sin mantener familias paralelas.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <LabV2Pill leftLabel="Ruta" rightLabel="/ui-lab" tone="accent" />
              <LabV2Pill leftLabel="Estado" rightLabel="Promovido a producto" tone="muted" />
              <LabV2Pill leftLabel="Direccion" rightLabel="Editorial premium 2025" tone="default" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <LabV2Button label="Abrir carta refinada" tone="secondary" />
              <LabV2Button label="Abrir indice real" tone="ghost" />
            </div>
          </div>

          <div className="grid gap-4">
            <LabV2Panel tone="ink" className="rounded-[1.6rem] px-5 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d8be66]">Mini-spec</p>
              <div className="mt-4 grid gap-3 text-sm leading-relaxed text-[#e8dfce]">
                <p>Header promovido con jerarquia institucional y popovers editoriales.</p>
                <p>Primitives nuevas con mejor geometria, densidad y estados de interaccion.</p>
                <p>Cards y paneles con mas contraste material, menos look utilitario y mejor composicion.</p>
              </div>
            </LabV2Panel>

            <LabV2TagCluster
              tone="paper"
              eyebrow="Focos de mejora"
              title="Lo que sube en el sistema consolidado"
              description="Coherencia de shell, densidad, materialidad y comportamiento interactivo."
              items={['Header', 'Cards', 'Pills', 'Tags', 'Tabs', 'Shells']}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5">
        <SectionIntro
          eyebrow="Header promovido"
          title="La navegacion principal que ya alimenta el producto"
          description="Popover por seccion, paleta editorial y comportamiento compacto preparados para integrarse en home, legajos, carta y recorridos sin mantener otra familia paralela."
        />
        <ArcaTopBar defaultOpenId={null} surface="card" />
      </section>

      <section id="metodologia" className="grid gap-5">
        <SectionIntro
          eyebrow="Primitives y shell"
          title="Un vocabulario visual mas preciso para estados, seleccion y agrupacion"
          description="Pills, tags, tabs, botones y paneles ya comparten una misma logica de tono, geometria y densidad. El laboratorio se comporta como wrapper fino del sistema real."
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <LabV2Panel
            eyebrow="Selector de lectura"
            title="Segmented tabs con mejor estado activo"
            description="Mas compactos y mas editoriales. Funcionan como selector de modo, no como micro-botones cualquiera."
          >
            <LabV2SegmentedTabs
              items={[
                { value: 'cards', label: 'Cards' },
                { value: 'states', label: 'Estados' },
                { value: 'structure', label: 'Shell' },
              ]}
              value={mode}
              onValueChange={(value) => setMode(value as PanelMode)}
            />
            <div className="mt-4 rounded-[1.2rem] border border-[#d9cfbe] bg-[linear-gradient(180deg,rgba(255,252,246,0.88),rgba(242,234,221,0.94))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8f7742]">{modeCopy[mode].title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#615443]">{modeCopy[mode].text}</p>
            </div>
          </LabV2Panel>

          <LabV2Panel
            eyebrow="Botones y señales"
            title="CTA y estados con mas intencion"
            description="Los botones secundarios dejan de parecer utilitarios. Las pills oscuras y los paneles ya tienen un tono premium consistente."
            tone="muted"
          >
            <div className="flex flex-wrap gap-3">
              <LabV2Button label="Primario editorial" tone="primary" />
              <LabV2Button label="Secundario claro" tone="secondary" />
              <LabV2Button label="Fantasma" tone="ghost" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <LabV2Pill leftLabel="Capa visual" rightLabel="Activa" tone="accent" />
              <LabV2Pill leftLabel="Acceso" rightLabel="Manuscrito local" tone="default" />
              <LabV2Pill leftLabel="Estado" rightLabel="Sistema consolidado" tone="muted" />
            </div>
          </LabV2Panel>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <LabV2TagCluster
            eyebrow="Agrupacion semantica"
            title="Tags en contenedor con mas gravedad editorial"
            description="Sirven para nodos documentales, filtros o conjuntos de entidades. Se sienten parte del archivo y no de una libreria genérica."
            items={['Madrid', 'Palma', 'Correspondencia politica', 'Miguel Malo', 'Contexto cortesano', 'Circulacion comercial']}
          />

          <LabV2Panel
            eyebrow="Shell del laboratorio"
            title="Paneles con mejor profundidad y mejor criterio"
            description="La version consolidada reduce el look modular plano. Los paneles se distinguen por tono, materialidad y contraste, no solo por repetir borders."
            tone="ink"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d8be66]">Superficie principal</p>
                <p className="mt-2 text-sm leading-relaxed text-[#e5dbc8]">Fondo oscuro con una luz controlada y piezas claras que emergen con mas precision.</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d8be66]">Interaccion</p>
                <p className="mt-2 text-sm leading-relaxed text-[#e5dbc8]">Hover, active y selection usan contraste y desplazamiento minimo; no hay motion gratuita.</p>
              </div>
            </div>
          </LabV2Panel>
        </div>
      </section>

      <section id="corpus-y-fuentes" className="grid gap-5">
        <SectionIntro
          eyebrow="Cards y modulos"
          title="Cards de legajo y paneles de sistema con mas caracter"
          description="La version consolidada sube el nivel de materialidad, densidad y jerarquia. Las cards ya no parecen bloques neutros: se acercan a piezas de producto maduras y listas para decision."
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <LabV2Panel
            eyebrow="Legajo cards"
            title="Una direccion mas premium para listados y destacados"
            description="Dos tratamientos para medir contraste, densidad y presencia material dentro del mismo lenguaje editorial."
          >
            <div className="grid gap-5 2xl:grid-cols-2">
              {cards.map((card) => (
                <UiLabV2LegajoCard key={card.title} {...card} />
              ))}
            </div>
          </LabV2Panel>

          <div className="grid content-start gap-5">
            <LabV2Panel
              eyebrow="Panel de decision"
              title="Donde se nota la mejora"
              description="El sistema sube varias piezas a la vez: el header ya no parece solo una navbar, las cards ganan caracter y los componentes base dejan de verse genericos."
              tone="paper"
            >
              <div className="grid gap-3">
                {[
                  'Header mas autoritativo',
                  'Segmented tabs mas precisos',
                  'Pills y tags con tono de archivo',
                  'Cards con mejor densidad y mejor cierre',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.1rem] border border-[#ddd3c2] bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(246,239,227,0.96))] px-4 py-3 text-sm leading-relaxed text-[#605341] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </LabV2Panel>

            <LabV2Panel
              eyebrow="Acceso"
              title="Rutas vivas del laboratorio"
              description="El laboratorio queda consolidado en una sola entrada y la carta refinada permanece accesible como superficie de referencia."
              tone="muted"
            >
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/ui-lab"
                  className="rounded-full border border-[#d1c6b5] bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(246,239,227,0.96))] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6a5d49]"
                >
                  Abrir laboratorio
                </Link>
                <Link
                  href="/legajos"
                  className="rounded-full border border-[#c8aa6d] bg-[linear-gradient(180deg,#e7d19d_0%,#dcbc79_100%)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#241a10]"
                >
                  Abrir indice real
                </Link>
                <Link
                  href="/ui-lab/carta"
                  className="rounded-full border border-[#d1c6b5] bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(246,239,227,0.96))] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6a5d49]"
                >
                  Abrir carta refinada
                </Link>
              </div>
            </LabV2Panel>
          </div>
        </div>
      </section>
    </div>
  );
}
