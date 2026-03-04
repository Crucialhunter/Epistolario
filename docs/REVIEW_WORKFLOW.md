# Review Workflow

## Estados de revisión

Cada combinación **(documento + modelo + modo)** tiene un estado de revisión independiente, persistido en IndexedDB (tabla `reviews`).

| Estado         | Label UI           | Descripción                                        |
|----------------|--------------------|----------------------------------------------------|
| `pending`      | Pendiente          | Sin revisar (default)                              |
| `approved`     | Aprobado           | Transcripción validada por el revisor              |
| `needs_edit`   | Requiere edición   | La transcripción es parcialmente correcta pero necesita ajustes manuales |
| `rejected`     | Rechazado          | Resultado inutilizable, requiere re-run            |

## Cómo usar

1. Abre un documento en el **Workspace**.
2. En la barra superior del panel derecho, verás un **dropdown** con el estado actual.
3. Cambia el estado al que corresponda. Se guarda inmediatamente.
4. Opcionalmente, haz clic en **"Añadir nota"** para adjuntar un comentario de revisión.
5. El contador **"Revisadas: X / Y"** muestra el progreso global para el modelo seleccionado.

## Persistencia

- Los reviews se almacenan en IndexedDB en la tabla `reviews`.
- Cada review tiene: `docId`, `modelId`, `mode`, `variantIdsString`, `status`, `comment`, `updatedAt`.
- La clave compuesta `[docId+modelId+mode]` permite búsquedas O(1).

## Reset

Los reviews se eliminan junto con todos los datos al usar **"Clear All Data"** en Settings.
