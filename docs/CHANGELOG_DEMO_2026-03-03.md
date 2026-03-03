# Changelog Demo - 2026-03-03

## Cambios Realizados
1. **Enrutamiento de Acciones Curatorial (P0-1)**
   - Se eliminó la inyección propensa a errores de clicks en el panel curatorial.
   - Las Personas ahora modifican el filtro nativo de Remitente/Destinatario en lugar de inyectar "undefined" al buscador de texto libre.
   - Las Rutas ahora modifican los filtros nativos de Origen/Destino.
   - Elementos sin contexto claro no tienen cursor interactivo.

2. **Rutas Dominantes Fallback (P0-2)**
   - Si un panel tipo `top_routes` viene vacío del JSON (ej. lente Noticias), la UI autocalcula e inyecta dinámicamente el top 6 de rutas en base a las cartas y lo expone al usuario sin generar layout jumps.

3. **Traducciones y Microcopy (P0-3)**
   - Se expandió el diccionario `KPI_TITLES_ES` mapeando de forma tolerante a espacios y capitalización variada mediante `toLowerCase` y underscore parse.
   - Todo rasgo de "Spanglish" en KPIs como "Relevant letters" ahora aparece en su correcta forma castellana.

## Cómo probarlo
1. Servir `index.html` e importar el dataset.
2. Hacer click en la lente "Noticias". Observar que "Rutas dominantes" tiene contenido autogenerado (no vacío).
3. Clickear en una persona en el panel curatorial. Comprobar que el dropdown global "Remitente" (o Destinatario si no había remitente acorde) cambia automáticamente de valor.
4. El input principal de búsqueda de texto debe de seguir limpio (sin "undefined") tras realizar interacciones con los paneles.

## Limitaciones Conocidas
- El algoritmo fallback de "Rutas Dominantes" considera un simple recuento topológico en vivo desde los metadatos de Leaflet. No tiene la misma exhaustividad analítica que el script Python backend, pero mantendrá la interfaz de demo completa y navegable.
