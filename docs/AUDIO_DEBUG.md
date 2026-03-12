# Audio Debug Report

## Bug: Doble extensión `.mp3.mp3`

### Origen del problema
Los archivos MP3 fueron generados por ElevenLabs con extensión `.mp3` pero nombrados con el formato
`<date>__<event_id>__<slug>.mp3` por el script `generar_guion.js`. Sin embargo, el script **ya incluía `.mp3` en el slug**
(porque los archivos originales de ElevenLabs ya terminaban en `.mp3`), resultando en `.mp3.mp3`.

### Ejemplo real (ANTES del fix)
| Campo | Valor |
|---|---|
| event_id | `evt_muerte_presidente_castilla` |
| audio_file | `1668-05-23__evt_muerte_presidente_castilla__muerte-repentina-del-presidente-de-castilla.mp3.mp3` |
| audio_path | `mp3/1668-05-23__evt_muerte_presidente_castilla__muerte-repentina-del-presidente-de-castilla.mp3.mp3` |
| URL generada | `/dataset_demo/mp3/...mp3.mp3` → **404** |

### Ejemplo real (DESPUÉS del fix)
| Campo | Valor |
|---|---|
| event_id | `evt_muerte_presidente_castilla` |
| audio_file | `1668-05-23__evt_muerte_presidente_castilla__muerte-repentina-del-presidente-de-castilla.mp3` |
| audio_path | `mp3/1668-05-23__evt_muerte_presidente_castilla__muerte-repentina-del-presidente-de-castilla.mp3` |
| URL generada | `/dataset_demo/mp3/...mp3` → **200 OK** |

## Acciones realizadas
1. **Renombrado en disco**: 34 archivos `.mp3.mp3` → `.mp3` en `dataset_demo/mp3/`
2. **Actualizado JSON**: `event_markers.json` campos `audio_file` y `audio_path` limpiados
3. **Backup creado**: `event_markers.before_audio_fix.json`
4. **Validador runtime**: `sanitizeAudioPath()` corrige en memoria si se detecta doble extensión
5. **getAssetUrl corregido**: Ahora antepone correctamente `dataset_demo/` al `audio_path`

## Bug: Leaflet NaN LatLng
- **Causa**: `dispatchAction('map_highlight_route')` no validaba coords numéricas finitas
- **Fix**: Se añadió `isValidLatLng(lat, lng)` que verifica `typeof === 'number'` + `isFinite()`
- **Aplicado en**: `drawTimelineArcs`, `map_pulse_location`, `map_highlight_route`

## Bug: Autoplay bloqueado en tablet
- **Fix**: `AudioManager.unlock()` crea un `<audio>` mudo y lo reproduce en la primera interacción
- **Debounce**: 150ms anti-ráfaga para evitar múltiples `play()` simultáneos
- **UX**: Si autoplay falla, muestra toast "Pulsa para activar audio" que desbloquea al pulsar

## Validación final
- **34/34** archivos MP3 existen en disco correctamente
- **0** rutas con doble `.mp3`
- **0** NaN LatLng posibles gracias a `isValidLatLng` guards
