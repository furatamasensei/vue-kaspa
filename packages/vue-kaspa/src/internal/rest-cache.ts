type CacheEntry<T> = {
  updatedAt: number
  expiresAt: number
  promise: Promise<T> | null
  value: T | null
}

const cache = new Map<string, CacheEntry<unknown>>()

export function getRestCacheSize(): number {
  return cache.size
}

export function clearRestCache(prefix?: string): void {
  if (!prefix) {
    cache.clear()
    return
  }

  for (const key of Array.from(cache.keys())) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

export async function getCachedRestValue<T>(
  key: string,
  loader: () => Promise<T>,
  staleTimeMs: number,
  cacheTimeMs: number,
  forceRefresh = false,
): Promise<T> {
  const now = Date.now()
  const existing = cache.get(key) as CacheEntry<T> | undefined

  if (existing && !forceRefresh) {
    if (existing.value !== null && now - existing.updatedAt < staleTimeMs) {
      return existing.value
    }
    if (existing.promise) {
      return existing.promise
    }
  }

  const entry: CacheEntry<T> = existing ?? {
    updatedAt: 0,
    expiresAt: 0,
    promise: null,
    value: null,
  }

  entry.promise = loader()
    .then((value) => {
      entry.value = value
      entry.updatedAt = Date.now()
      entry.expiresAt = entry.updatedAt + cacheTimeMs
      entry.promise = null
      return value
    })
    .catch((err) => {
      entry.promise = null
      throw err
    })

  cache.set(key, entry)

  const value = await entry.promise
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
  }
  return value
}

