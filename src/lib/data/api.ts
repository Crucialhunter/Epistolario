import { LegajoMeta, CartaSummary, CartaDetail } from '../types';

/**
 * Universal JSON fetcher: Reads from filesystem during Next.js SSG build (Node),
 * and uses standard fetch() during client-side navigation.
 * This guarantees perfect static export without requiring a running server,
 * while allowing client components to fetch the same data easily.
 */
async function fetchJson<T>(relativePath: string): Promise<T | null> {
  const urlPath = `/data/demo${relativePath}`;
  
  if (typeof window !== 'undefined') {
    // We are in the browser
    try {
      const res = await fetch(urlPath);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  } else {
    // We are in Node (Next.js build time SSG)
    try {
      // Dynamic imports prevent client bundles from including fs/path
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', urlPath);
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('FS error reading JSON:', urlPath, error);
      return null;
    }
  }
}

export async function getLegajos(): Promise<LegajoMeta[]> {
  const legajo = await fetchJson<LegajoMeta>('/legajos/10/meta.json');
  return legajo ? [legajo] : [];
}

export async function getLegajo(id: string): Promise<LegajoMeta | null> {
  return fetchJson<LegajoMeta>(`/legajos/${id}/meta.json`);
}

export async function getLegajoLetters(id: string): Promise<CartaSummary[]> {
  const letters = await fetchJson<CartaSummary[]>(`/legajos/${id}/letters/index.json`);
  return letters || [];
}

export async function getCarta(legajoId: string, cartaId: string): Promise<CartaDetail | null> {
  return fetchJson<CartaDetail>(`/legajos/${legajoId}/letters/${cartaId}.json`);
}
