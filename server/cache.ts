interface CacheEntry {
  answer: string;
  source: string;
  category: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500;

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ');
}

export function getCachedAnswer(question: string, hasPersonalContext: boolean): CacheEntry | null {
  // Never serve from cache if personal cycle context is involved
  if (hasPersonalContext) return null;

  const key = normalizeKey(question);
  const entry = cache.get(key);

  if (!entry) return null;

  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry;
}

export function setCachedAnswer(
  question: string,
  answer: string,
  source: string,
  category: string,
  hasPersonalContext: boolean
): void {
  if (hasPersonalContext) return;
  if (!answer || answer.length < 30) return;

  const key = normalizeKey(question);

  // Evict oldest if limit reached
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }

  cache.set(key, {
    answer,
    source,
    category,
    timestamp: Date.now(),
  });
}

export function clearCache(): void {
  cache.clear();
}
