# Contexto del Proyecto: Epistolario Demo
Última actualización: 2026-03-03

Este documento preserva el contexto esencial del proyecto "Epistolario-Demo-Marzo-2026", garantizando que cualquier iteración futura pueda retomarse sin pérdida de información, incluso tras reiniciar entornos o cachés.

## 1. Propósito y Audiencia
- **Proyecto:** Epistolario-Demo-Marzo-2026 (Legajo 10). Demo parcial con 99 cartas procesadas, escalable a 8.000 cartas en producción.
- **Audiencia Objetivo:** Hombre jubilado vinculado a la familia del epistolario.
- **Expectativas:** Rigor histórico, estética premium tipo "museo", y fundamentación estricta de la información ("evidencia" mediante citas exactas y recortes del manuscrito).

## 2. Pila Tecnológica
- **Plataforma:** Web 100% local, frontend-only (sin backend, sin dependencias de servidor externo).
- **Stack:** Vanilla JS + integraciones (ej. Leaflet) + Tailwind CSS (vía CDN).
- **Entorno:** Sin bundlers. Carga directa en navegador.
- **Carga de Datos:** Mediante la API de archivos locales (`<input webkitdirectory>`).

## 3. Estado Actual y Features
Las siguientes funcionalidades principales ya están integradas o en proceso de integración final:
- **Carga Local:** Selección de carpeta del dataset vía UI.
- **Sidebar / Ficha de Carta:** Pestañas para vista literal y modernizada. Incluye componente de "evidencia" y carrusel de imágenes del manuscrito.
- **Periódico del Mes:** Visualización de eventos clave temporales.
- **Timeline:** Navegación por meses (`monthKey YYYY-MM`) con un **Heat Strip** (banda de calor) que visualiza la intensidad/volumen de actividad por mes. Permite ubicar rápidamente los periodos de mayor intercambio epistolar.
- **Modos de Visualización:**
  - **Modo Timeline (Exploración Libre):** El usuario navega libremente por el tiempo y el mapa, descubriendo relaciones y eventos a su propio ritmo.
  - **Modo Tour (Narrativa Guiada):** Una secuencia lineal y curada de vistas (`ui_actions`) que guía al usuario a través de una historia específica.
- **Lentes y Mesa del Curador:** Filtros temáticos (Normal, Noticias, Salud, Objetos) extraídos de `lens_panels.json`. Las "lentes" no son simples filtros; actúan como una curaduría que transforma la interfaz, aportando contexto, insights narrativos y destacando el *por qué* de la información mostrada para esa temática específica.

## 4. Estructura de Datos y Reglas

### Estructura del Dataset (Import Folder)
La carpeta seleccionada por el usuario al cargar la web DEBE tener exactamente esta estructura:

```text
/dataset_demo/
  /letters/           # (Requerido para demo completa con evidencia: quotes + highlight + manuscrito)
  /images/            # (Requerido para demo completa con evidencia: quotes + highlight + manuscrito. Opcional SOLO si se acepta demo degradada sin evidencia visual)
  /derived/           # (Requerido) JSONs generados por scripts de curaduría
```

### Resolución de imágenes (regla de carga)
Las referencias a imágenes dentro del JSON original `images[]` pueden venir en dos formatos:
- Con directorio: `"images/028-315.jpg"`
- Solo el archivo: `"028-315.jpg"`

El loader del frontal debe resolver la imagen siguiendo este orden fallback:
1. Intenta `webkitRelativePath` exacto.
2. Si falla, intenta la concatenación `images/<basename>`.
3. Si falla, intenta directamente `<basename>`.
*Importante:* Si tras estos pasos no se encuentra la imagen, el sistema debe inyectar un **placeholder elegante** para evitar mostrar el ícono de `<img>` rota.

### Archivos Derivados Requeridos (en `/derived/`)
- `letter_edges.json`
- `event_markers.json`
- `tour_legajo10.json`
- `coords.json`
- `places.json`
- `lens_panels.json`

*(Opcionales: `validation_report.json`, `lens_panels.validation.json`, `demo_overview.md`)*

### Reglas Estrictas (No Negociables)
- **Canonización Geográfica:** Uso estricto de claves canónicas en lugares (ej. `mao` -> `mahon`, `caller_cagliari` -> `caller`).
- **Rigor en Citas:** Las *quotes* deben tener entre 10 y 18 palabras y existir **literalmente** en el transcrito original.
- **Coordenadas:** Deben estar completas. Entidades sin ubicación física se marcan como `sin_especificar=null`.
- **Deduplicación:** Aplicada en todos los datasets derivados.

## 5. Demo Flow Recomendado (90 Segundos)
Para la presentación de la demo, se sugiere este guion de 90 segundos con pasos concretos:
- **Tiempo 0:** Carga inicial instantánea. Importar la carpeta `dataset_demo` desde el botón de la web.
- **Click 1:** Activar lente superior de "Salud" -> leer header para mostrar la intención curatorial -> abrir carta "1174" o similar sugerida -> mostrar la superposición perfecta del *highlight* (quote + transcrito + manuscrito).
- **Click 2:** Transición a modo libre exploratorio, navegando al área inferior de "Timeline" -> pulsar Play en la barra de calor ("Heat Strip") -> ver en vivo la reconstrucción espacial del Periódico del Mes.
- **Click 3:** Regreso a la narrativa guiada pulsando en "Tour" -> permitir el *autoplay* -> efectuar detenciones estratégicas (*stop 1* de enganche introductorio + *stop 4* confirmando la escalada de la trama + *stop 5* clímax/conclusión).

## 6. TABLET CHECK (Validación Móvil y Plan B)
- **Recomendación Principal (Plan A):** Usar siempre un Laptop convencional para asegurar lectura de la API de *File System*.
- **Alternativa (Plan B):** Tablet, **solo si pasa los test del smoke test hoy**.

**Plan B Crítico (Si falla `webkitdirectory` en la tablet):**
Si el iPad / Android no permite seleccionar la carpeta completa, usar el Laptop (Plan A) y duplicar/espejar la experiencia conectando la tablet exclusivamente como "pantalla secundaria" para que el usuario la manipule. Alternativamente, descartar la tablet por completo y guiar usando la laptop. *(Preparar un zip con el dataset y descomprimirlo localmente en la tablet solo si este proceso ha sido pre-testeado hoy y es sin fisuras, no prometer)..*

**Lista de 5 checks para validar iPad/Android:**
1. [ ] **Selector de Carpeta:** Verificar si el navegador de la tablet soporta/maneja correctamente `<input webkitdirectory>` para seleccionar la carpeta entera.
2. [ ] **Rendimiento (Mapa/DOM):** Confirmar que no hay "lag" al renderizar muchos nodos en el mapa o al animar el timeline.
3. [ ] **Scroll y Gestos:** Comprobar comportamiento táctil en el Sidebar (carrusel de imágenes) y en modales.
4. [ ] **Layout Sidebar:** Validar que el panel lateral no oculta controles críticos en orientaciones portrait/landscape.
5. [ ] **Tour Autoplay:** Asegurar que las pausas automáticas del Tour no se ven interrumpidas por políticas de ahorro de energía o bloqueo de pantalla en la tablet.

## 7. Limitaciones y Próximos Pasos (Prioridad Demo)
- **Limitación Conocida:** La carga de imágenes de alta resolución sin lazy loading avanzado puede afectar memoria en la tablet (pendiente de confirmar optimización en el carrusel).
- **Próximos Pasos (Prioridad MAÑANA):**
  1. Completar la validación física en Tablet del "TABLET CHECK".
  2. Ajustar CSS final (paddings del sidebar para evitar solapes).
  3. Ejecutar Smoke Test final del flujo de Demo (Carga -> Exploración Libre -> Ficha -> Tour).
  4. Empaquetar la carpeta `dataset_demo` final certificada para el despliegue.

