# Despliegue de Epistolario Demo

Este proyecto ha sido optimizado para ser desplegado como un **sitio estático puro 100% Frontend** (Vanilla JS, sin bundlers ni backend).

Incluye una función de **Autoload** que cargará los datos de la carpeta `dataset_demo/` al iniciar la página si existe un archivo `manifest.json` válido en su interior. En caso de fallo o ausencia del directorio, el usuario puede seguir usando el botón "Subir Carpeta".

## Opción 1: Cloudflare Pages (Recomendada)
1. Entra a tu dashboard de Cloudflare > Pages.
2. Conecta este repositorio de GitHub.
3. **Configuración de compilación (Build settings):**
   - **Framework preset:** `None`
   - **Build command:** (Dejar en blanco)
   - **Build output directory:** `/` (La raíz del proyecto)

## Opción 2: GitHub Pages
1. Ve a **Settings > Pages** en tu repositorio de GitHub.
2. En **Source**, selecciona `Deploy from a branch`.
3. Elige la rama `main` (o la rama a desplegar, ej. `demo-polish`) y la carpeta `/ (root)`.
4. El archivo `.nojekyll` incluido en la raíz asegurará que el servidor no preprocese el sitio estático y sirva los archivos directamente y muy rápido.

> **Nota sobre rutas**: El proyecto usa rutas relativas (`./dataset_demo/...`) lo cual permite que GitHub Pages o Cloudflare resuelvan correctamente los JSONs y las imágenes incluso si la app se sirve desde un subdirectorio.
