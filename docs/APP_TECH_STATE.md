# Estado Técnico de la Aplicación (APP_TECH_STATE)

Este documento describe la arquitectura, el estado actual y los puntos de fricción del frontend de la demo (Vanilla JS + Leaflet), con el objetivo de mantener un contexto claro para futuras modificaciones.

## 1. Organización de la Aplicación

La aplicación es un Single Page Application (SPA) sin backend, contenida íntegramente en el cliente.

- **Archivos y Vistas**:
  - `index.html`: Contiene toda la lógica (Vanilla JS), estilos (Tailwind CSS vía CDN) y mapas (Leaflet vía CDN). No hay bundlers ni proceso de build.
  - **Vistas principales**: 
    - `dashboard`: Vista inicial con mapa estático (rutas agregadas) y lista lateral de cartas. Incluye la "Mesa del Curador".
    - `timeline`: Vista interactiva con línea de tiempo (heat strip), panel de eventos ("Periódico del Mes"), crónica de envíos y el modo Tour.

- **Funciones Clave**:
  - `switchView(view)`: Alterna la visibilidad entre `dashboard` y `timeline`.
  - `handleFileUpload(event)`: Único punto de entrada de datos. Procesa la carpeta local seleccionada por el usuario.
  - `renderLetterList()`: Dibuja y actualiza la lista lateral de cartas, aplicando filtros y ordenamiento.
  - `drawRoutes()` y `renderTimeline()`: Lógica de Leaflet para dibujar arcos estáticos y animados.
  - `setLens(lens)`: Aplica filtros temáticos ("lentes"), reordena las cartas y actualiza la "Mesa del Curador".
  - `openLetterSidebar(letterId)`: Abre el panel lateral de lectura de una carta (transcripción, metadatos, imágenes).
  - `applyTourStep(index)` y `dispatchAction(action)`: Motor del Tour interactivo.

## 2. Loaders y Archivos Detectados

La función `handleFileUpload` actúa como el único loader. Detecta y procesa archivos basándose en su nombre o ruta (`webkitRelativePath`):

- `letter_edges.json` -> `derivedData.edges` (Relaciones y metadatos enriquecidos).
- `event_markers.json` -> `derivedData.events` (Eventos históricos).
- `tour_legajo10.json` -> `derivedData.tour` (Pasos y acciones del Tour).
- `coords.json` -> `derivedData.coords` (Diccionario de coordenadas geográficas).
- `places.json` -> `derivedData.places` (Metadatos de lugares).
- `validation_report.json` -> `derivedData.report` (Reporte de calidad de datos).
- `demo_overview.md` -> `derivedData.overview` (Texto introductorio).
- `lens_panels.json` -> `derivedData.lensPanels` (Datos curados para la "Mesa del Curador").
- **Cartas**: Cualquier otro archivo `*.json` se asume como datos de cartas y se indexa en `window.letterIndex`.
- **Imágenes**: Cualquier archivo `image/*` se procesa creando una URL local (`URL.createObjectURL`).

## 3. Resolución de Imágenes

Las imágenes se gestionan en memoria mediante un diccionario `imageMap`.

- **Indexación**: Al cargar, cada imagen se guarda bajo tres claves: `file.name`, `file.webkitRelativePath` y `"images/" + file.name`.
- **Resolución (`openLetterSidebar`)**: Se busca la imagen usando el nombre exacto en `edgeData.images` o `originalLetter.imagenes`. Si falla, se intenta con `"images/" + basename` o solo `basename`.
- **Por qué falla (Broken Images)**: 
  1. Si el JSON referencia una imagen pero el usuario subió las imágenes en una estructura de carpetas inesperada.
  2. Si hay discrepancias en la extensión (ej. `.jpeg` vs `.jpg`).
  3. Si el array de imágenes en el JSON está vacío, la app actualmente no intenta hacer un "fallback" adivinando el nombre (ej. buscar `ID_carta.jpg`), dejando la carta sin imagen aunque el archivo exista en la carga.

## 4. Integración de `derivedData`

El objeto global `derivedData` centraliza la información contextual:

- **`edges`**: Dibuja las rutas en el mapa y provee metadatos para las cartas (temas, `evidence_quote`).
- **`events`**: Alimenta el "Periódico del Mes" y permite mostrar tarjetas de eventos (`show_event_card`).
- **`tour`**: Define la secuencia narrativa. Cada paso mueve el mapa y dispara `ui_actions` (abrir paneles, resaltar texto, pulsar ubicaciones).
- **`coords` y `places`**: Geolocalizan orígenes y destinos.
- **`lens_panels`**: Provee el contenido (KPIs, resúmenes, paneles destacados) de la "Mesa del Curador" al activar un lente.

## 5. Bugs y Fricción (Feedback del Usuario)

- **Lentes reordenan sin contexto**: `getLetterLensScore` reordena las cartas basándose en reglas internas (temas, palabras clave). Aunque se agregó un snippet de "Relevancia", el cambio de orden se percibe abrupto.
- **Imágenes rotas en el sidebar**: La lógica de `imageMap` es frágil frente a variaciones en la carga del usuario.
- **Panel "Periódico del Mes" tapa controles zoom**: El panel tiene posicionamiento absoluto (`top-32 left-4`) que se superpone con los controles por defecto de Leaflet (top-left).
- **Tour confuso**:
  - *Autoplay descontrolado*: Si el usuario cierra el Tour (`exitTour`), el `setInterval` del autoplay no se limpia, ejecutándose en segundo plano.
  - *Cerrar modal rompe continuidad*: El Tour abre modales (cartas, eventos) pero no los cierra al avanzar, acumulando UI abierta.

## 6. Plan P0/P1 para Demo-Ready

### P0 (Crítico para la demo - Cambios Quirúrgicos)
- [ ] **Fix Tour Autoplay**: En `exitTour()`, añadir limpieza del intervalo: `if (tourAutoplayInterval) { clearInterval(tourAutoplayInterval); tourAutoplayInterval = null; }`.
- [ ] **Fix Layout "Periódico del Mes"**: Mover los controles de zoom de Leaflet a la esquina inferior derecha al inicializar el mapa: `zoomControl: false` y luego `L.control.zoom({ position: 'bottomright' }).addTo(mapTimeline);`.
- [ ] **Robustecer Resolución de Imágenes**: En `openLetterSidebar`, si el array de imágenes está vacío, añadir un fallback proactivo que busque `imageMap[letterId + '.jpg']` o `imageMap[letterId + '.png']`.

### P1 (Mejoras de UX)
- [ ] **Gestión de Modales en el Tour**: Modificar `applyTourStep` para que ejecute `closeLetterSidebar()` y `closeEventCard()` antes de procesar las nuevas acciones, asegurando una pantalla limpia para cada paso.
- [ ] **Mejorar Transición de Lentes**: Asegurar que el bloque de "Relevancia" en las cartas destaque visualmente por qué esa carta subió en el ranking al aplicar un lente.
