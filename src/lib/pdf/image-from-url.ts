// Cache muy simple en memoria (Map) para evitar descargas repetidas del mismo logo durante una generación de PDF
const cache = new Map<string, CachedEntry>();
const TTL_MS = 5 * 60 * 1000;

interface CachedEntry {
  data: string;
  mimeType: string;
  timestamp: number;
}

function base64ToDataUrl(base64: string, mimeType: string) {
  return `data:${mimeType};base64,${base64}`;
}

function guessMime(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'image/png';
}

export async function imageFromUrl(url: string | null | undefined): Promise<{ dataUrl: string; mimeType: string; format: 'PNG' | 'JPEG' } | null> {
  if (!url) return null;

  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < TTL_MS) {
    return { dataUrl: base64ToDataUrl(cached.data, cached.mimeType), mimeType: cached.mimeType, format: getFormat(cached.mimeType) };
  }

  try {
    const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
    const fullUrl = isAbsolute ? url : `${process.env.NEXT_PUBLIC_APP_URL || ''}${url}`;

    if (!fullUrl) return null;

    const res = await fetch(fullUrl);
    if (!res.ok) return null;

    const mimeType = res.headers.get('content-type') || guessMime(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    const data = buffer.toString('base64');

    cache.set(url, { data, mimeType, timestamp: Date.now() });

    return { dataUrl: base64ToDataUrl(data, mimeType), mimeType, format: getFormat(mimeType) };
  } catch {
    console.warn('[imageFromUrl] Error fetching logo');
    return null;
  }
}

function getFormat(mimeType: string): 'PNG' | 'JPEG' {
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
  return 'PNG';
}

export function clearImageCache() {
  cache.clear();
}
