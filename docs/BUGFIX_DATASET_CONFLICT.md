# Resolución del Conflicto de Dataset (Race Condition Asíncrona)

## El Problema Reportado
El usuario reportó que en Cloudflare Pages, al entrar a la aplicación, la interfaz oscilaba entre mostrar el abanico completo del Legajo (99 cartas) y un "dataset fantasma" de 5 cartas de debug. Además, ciertas interacciones reinicializaban la UI devolviendo el estado a las 5 cartas de prueba. Finalmente, un problema estético reportó que la detección del Dark Mode del Sistema Operativo invertía de forma indeseada los colores del frontend (especialmente en tablets).

## Causa Raíz
1. **Doble Fuente de Verdad:** En `index.html`, la variable `letters` se declaraba inicialmente de forma estática con 5 cartas inyectadas (`let letters = [{id: 1, remitente: "Pedro..."}, ...]`). 
2. **Carrera Asíncrona (Race Condition):** En `DOMContentLoaded`, la aplicación inyectaba la función síncrona de renderizado y filtros mientras de manera asíncrona llamaba a `await loadDatasetDemo()`. Dependiendo de la velocidad (o caché de red), el DOM renderizaba las 5 cartas iniciales *antes* de que el fetch asíncrono sobreescribiera la variable `letters` con las 99 cartas estáticas.
3. **Resolución de Rutas Relativas (CORS/Basepath):** Las peticiones relativas (`./dataset_demo/...`) en la infraestructura de Cloudflare Pages a veces se resolvían contra subdirectorios dependiendo de los "trailing slashes" de la URL visitada, provocando fallos en el fetch y obligando al Catch a devolver las 5 cartas iniciales.
4. **Dark Mode OS Override:** Al usar el link a la CDN de Tailwind CSS `<script src="https://cdn.tailwindcss.com"></script>` sin configuración estricta, Tailwind respeta la instrucción universal de media queries `@media (prefers-color-scheme: dark)`, forzando negro en todos los contenedores y textos genéricos de usuarios cuyas tablets operan en modo oscuro nativo.

## Solución Implementada (Arquitectura Mínima)

### 1. Estado Global Absoluto (`window.APP_STATE`)
Se ha abolido la manipulación esparcida de la variable `letters`. Se introdujo el objeto de único origen de verdad:
```javascript
window.APP_STATE = { 
    mode: "loading", // "embedded" | "seed"
    letters: [], 
    edges: [], 
    derived: {}, 
    ready: false 
};
```
La variable estática de 5 cartas ya no se inyecta por defecto a menos que la URL explícitamente tenga el subfijo de testing paramétrico: `?seed=1`. Si no lo tiene, las cartas falsas se borran de memoria en el instante 0.

### 2. Loading Gate (Sincronización de Render)
Se inyectó un bloqueador visual CSS-JS (`<div id="loading-gate">`) que envuelve la pantalla con un diseño acorde a la estética museo ("Cargando Legajo 10...") impidiendo que el motor Leaflet o el Dashboard intenten dibujar el DOM *hasta que la promesa asíncrona termine*. 
Una vez que el JSON se decodifica y asigna a `APP_STATE`, el Loading Gate se desvanece y la aplicación se estabiliza. Si el fetch falla (Status 404), el loading gate reporta el error en pantalla en lugar de tragarlo silenciosamente.

### 3. Parseador Dinámico de Base Path
Dentro de `loadDatasetDemo`, la ruta ahora se reconstruye forzándola a partir del origen del window location, tolerando ser hosteada tanto bajo un dominio principal `/` como bajo un path `/repo-demo/`:
```javascript
const basePath = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname.split('/').slice(0, -1).join('/') + '/';
const manifestUrl = `${basePath}dataset_demo/manifest.json`.replace(/\/\//g, '/');
```

### 4. Bloqueo de Tailwind Dark Mode
Se inyectó una forzada anulación en la configuración `tailwind.config` del HEAD impidiendo reaccionar a la media query del sistema:
```javascript
tailwind.config = {
    darkMode: 'class', // Disable automatic dark mode query detection
    theme: { ... }
}
```
