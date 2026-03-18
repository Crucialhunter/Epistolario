import {
  BookOpenText,
  Clock3,
  Files,
  Landmark,
  MapPinned,
  ScrollText,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';

export type ArcaTopBarLink = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly icon?: LucideIcon;
};

export type ArcaTopBarSection = {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly icon?: LucideIcon;
  readonly links?: readonly ArcaTopBarLink[];
};

export const defaultArcaTopBarSections: readonly ArcaTopBarSection[] = [
  {
    id: 'archivo',
    label: 'Archivo',
    icon: Files,
    description: 'Entrada principal al corpus y a sus accesos esenciales.',
    links: [
      { label: 'Explorar archivo', href: '/legajos', description: 'Puerta principal al fondo documental.', icon: Files },
      { label: 'Indice general de legajos', href: '/legajos', description: 'Catalogo completo de los 41 legajos.', icon: ScrollText },
      { label: 'Carta destacada', href: '/legajos/10/cartas/1135', description: 'Entrada directa al lector de carta.', icon: BookOpenText },
    ],
  },
  {
    id: 'legajos',
    label: 'Legajos',
    icon: ScrollText,
    description: 'Acceso al archivo por unidades documentales.',
    links: [
      { label: 'Ver todos los legajos', href: '/legajos', description: 'Panorama completo del fondo disponible.', icon: Files },
      { label: 'Legajo 06', href: '/legajos/6', description: 'Caso breve para lectura y apoyo manuscrito.', icon: ScrollText },
      { label: 'Legajo 10', href: '/legajos/10', description: 'Nucleo principal de la experiencia ARCA actual.', icon: ScrollText },
      { label: 'Legajo 19', href: '/legajos/19', description: 'Fondo amplio para medir escala documental.', icon: ScrollText },
    ],
  },
  {
    id: 'recorridos',
    label: 'Recorridos',
    icon: Waypoints,
    description: 'Exploracion temporal, espacial y guiada del legajo.',
    links: [
      { label: 'Hub de recorridos', href: '/legajos/10/recorridos', description: 'Puerta general a la capa curatorial.', icon: Waypoints },
      { label: 'Timeline Viva', href: '/legajos/10/recorridos/timeline', description: 'Secuencia cronologica inmersiva.', icon: Clock3 },
      { label: 'Mapa interactivo', href: '/legajos/10/recorridos/mapa', description: 'Circulacion geografica del legajo.', icon: MapPinned },
    ],
  },
  {
    id: 'relatos',
    label: 'Relatos',
    icon: BookOpenText,
    description: 'Lecturas curatoriales y actores principales del archivo.',
    links: [
      { label: 'Relatos editoriales', href: '/legajos/10/relatos', description: 'Entrada principal a la capa narrativa.', icon: BookOpenText },
      { label: 'Personas clave', href: '/legajos/10/relatos', description: 'Actores centrales del archivo y sus conexiones.', icon: BookOpenText },
      { label: 'Lugares clave', href: '/legajos/10/relatos', description: 'Geografias recurrentes y nodos del legajo.', icon: MapPinned },
    ],
  },
  {
    id: 'proyecto',
    label: 'Sobre el proyecto',
    icon: Landmark,
    description: 'Marco, metodo y procedencia del archivo ARCA.',
    links: [
      { label: 'Que es ARCA', href: '/ui-lab#que-es-arca', description: 'Resumen del proyecto y su proposito editorial.', icon: Landmark },
      { label: 'Metodologia', href: '/ui-lab#metodologia', description: 'Como se articulan archivo, lector y capas curatoriales.', icon: BookOpenText },
      { label: 'Corpus y fuentes', href: '/ui-lab#corpus-y-fuentes', description: 'Escala, procedencia y criterios de representacion.', icon: Files },
    ],
  },
];
