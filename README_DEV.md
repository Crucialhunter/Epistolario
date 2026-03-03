# Desarrollo Local - Epistolario Demo

Este documento describe cómo configurar y ejecutar el entorno local para la demo del epistolario.

## 1. Ubicación Local
El repositorio se encuentra dentro de:
`E:\Proyectos Web\Legajo10\Epistolario-Demo-Marzo-2026`

## 2. Ejecutar la Demo (Localmente)

El proyecto utiliza **Vite** como entorno de desarrollo. Sigue estos pasos para arrancar la aplicación de forma rápida:

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre el navegador en `http://localhost:3000` (o la URL que indique Vite en la consola).

## 3. Estructura del Dataset

La demo procesa los datos en el frontend mediante la API de archivos locales (`webkitdirectory`), solicitando al usuario que seleccione la carpeta que contiene el dataset.

Asegúrate de tener preparada una carpeta llamada `dataset_demo/` con la siguiente estructura:

```
dataset_demo/
├── letters/       # (Opcional) Contiene los transcritos de las cartas originales.
├── images/        # (Opcional) Imágenes relacionadas a las cartas o eventos.
└── derived/       # (Requerido) Aquí se colocan todos los JSON preprocesados.
```

**Ubicación de los JSON derivados:**
Coloca todos los archivos JSON resultantes del procesamiento en la carpeta `dataset_demo/derived/`.
Archivos requeridos:
- `letter_edges.json`
- `event_markers.json`
- `tour_legajo10.json`
- `coords.json`
- `places.json`
- `lens_panels.json`

## 4. Checklist de Smoke Test

Para comprobar que el entorno local funciona correctamente, realiza los siguientes pasos de validación (Smoke Test):

- [ ] 1. Ejecutar `npm run dev` y la UI carga correctamente en el navegador sin errores críticos en consola.
- [ ] 2. Hacer clic en la carga de carpeta e importar la carpeta `dataset_demo/` usando el selector de archivos (webkitdirectory habilitado).
- [ ] 3. Comprobar que los datos cargan exitosamente y se visualiza la información principal.
- [ ] 4. Abrir el **sidebar** lateral y verificar que funciona.
- [ ] 5. Seleccionar y ver un **evento** específico en el mapa/interfaz.
- [ ] 6. Hacer clic en **Iniciar Tour** para probar el modo de visita guiada interactiva.
