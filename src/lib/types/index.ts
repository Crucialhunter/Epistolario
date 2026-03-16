export interface LegajoMeta {
  legajoId: string;
  title: string;
  dateRange: string;
  letterCount: number;
  imageCount: number;
  summary: string;
  keyPlaces: string[];
  keyPeople: string[];
  keyThemes: string[];
  featuredLetterIds: string[];
  featuredEventIds: string[];
}

export interface CartaImage {
  src: string;
  order: number;
  originalFilename: string;
}

export interface CartaSummary {
  id_carta: string;
  fecha: string;
  remitente: string;
  destinatario: string;
  lugar: string;
  temas: string;
  hasImages: boolean;
  primaryImage: string | null;
}

export interface CartaDetail extends CartaSummary {
  resumen?: string;
  url_origen?: string;
  signatura?: string;
  nombre_carta?: string;
  idioma?: string;
  transcripcion: {
    modernizada: string;
    literal: string;
  };
  imagenes: CartaImage[];
  previousCartaId: string | null;
  nextCartaId: string | null;
}
