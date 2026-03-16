import { StitchLegajoNavCViewData } from '@/lib/stitch/legajoNavCAdapter';

export const legajoNavCMockData: Readonly<StitchLegajoNavCViewData> = {
  projectId: '18111140058027548168',
  screenId: 'a839986bf54b4470b4d296166b018205',
  projectName: 'ARCA',
  headerLinks: [
    { label: 'Global', href: '/' },
    { label: 'Archivo', href: '/legajos/37/stitch', active: true },
    { label: 'Colecciones', href: '/legajos' },
  ],
  heroEyebrow: 'Editorial spread',
  title: 'Legajo 37: La Ruta Comercial de Mallorca a Napoles (1732-1745)',
  description:
    'Este conjunto documental constituye una fuente excepcional para comprender el entramado mercantil del Mediterraneo occidental durante el siglo XVIII y sus redes de correspondencia.',
  metrics: [
    { label: 'Fechas', value: '1732 a 1745' },
    { label: 'Cartas', value: '43 unidades' },
    { label: 'Manuscritos', value: '32 folios' },
    { label: 'Lugares clave', value: 'Mallorca, Napoles, Barcelona' },
  ],
  heroImageSrc:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDUTewl6CBo-1-WWlFH4RQoWdd12qYhcmoSMJaOKRW2CbQ0K3YAFPV2lBKsCV_u8TP36hI6oxIi4opiNUy7fGhnGSNMIh3bkOWmhkEYAvZ8MqnbtsqfHL1Qz0TfPcA6ts-ATRU9rySNJGjKpEg-n_Cd2wt4uh0j9HCHD85emtOIkpYEo1cCvWfgfoOeXvqQcxqBBf8EvLdOnerJDnnhkYozEViNi3j8HL4mcBdaMIzDXHMgfOD1Xu7MKrfGum84yULasZblWoUN-Aj0',
  heroImageAlt: 'Composicion archivistica con cartas y sello',
  tabs: [
    { id: 'archivo', label: 'Archivo', href: '/legajos/37/stitch', active: true },
    { id: 'recorridos', label: 'Recorridos', href: '/legajos/37/recorridos' },
    { id: 'relatos', label: 'Relatos', href: '/legajos/37/relatos' },
  ],
  narrative: {
    title: 'Recorridos',
    description: 'Modulo narrativo previsto para contextualizar itinerarios, nodos comerciales y lecturas curatoriales del legajo.',
    cta: 'Explorar recorridos',
  },
  backToCurrentHref: '/legajos/37',
  sourceHref: null,
  legajoId: '37',
  letters: [
    {
      id_carta: '1745-02-18',
      fecha: 'Febrero 18, 1745',
      remitente: 'Juan Serra',
      destinatario: 'Francesco Grimaldi',
      lugar: 'Napoles',
      temas: 'Comercio mediterraneo',
      hasImages: true,
      primaryImage: null,
    },
    {
      id_carta: '1745-03-02',
      fecha: 'Marzo 02, 1745',
      remitente: 'Juan Serra',
      destinatario: 'Francesco Grimaldi',
      lugar: 'Palma',
      temas: 'Factura de carga',
      hasImages: false,
      primaryImage: null,
    },
  ],
  initialPreview: {
    id_carta: '1745-02-18',
    fecha: 'Febrero 18, 1745',
    remitente: 'Juan Serra',
    destinatario: 'Francesco Grimaldi',
    lugar: 'Napoles',
    temas: 'Comercio mediterraneo',
    hasImages: true,
    primaryImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBs4D3DwHC0a3Hj2XhEQJPI-dpHhN5m7JZRv-sf06Fgdgp3ZmXRzx9pDYxOOzncz0BuWqHtUOKwebhFRvjgj1hYFmNmWdXInaLwbzDSeHf_WWK-ynv016oZCgRm5fCroP3gHSjnk9FgcwPJeGI0k_yp6CnRlBA0NQvtva6sBYJyk07H6lLSUXKCBiY_Nrkx-3bq5yHnBKdm6XoAwgEK7t8Pq-JW0KniGANQFwqx3Vdx-g3EcOKsFrxm5xVEc4xOVtGMuoC6X7Wekltu',
    resumen: 'Correspondencia mercantil relativa al comercio mediterraneo y a las cargas en transito.',
    signatura: 'LEG-37-001',
    nombre_carta: 'Carta de Juan Serra a Francesco Grimaldi (Napoles)',
    idioma: 'es',
    transcripcion: {
      modernizada: 'Carta de Juan Serra a Francesco Grimaldi (Napoles), correspondencia mercantil relativa al comercio mediterraneo y a las cargas en transito.',
      literal: 'Carta de Juan Serra a Francesco Grimaldi (Napoles), correspondencia mercantil relativa al comercio mediterraneo y a las cargas en transito.',
    },
    imagenes: [],
    previousCartaId: null,
    nextCartaId: '1745-03-02',
  },
};
