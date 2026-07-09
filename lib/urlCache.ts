/** In-memory memoization for derived media URLs (no network; prevents duplicate string work). */

export function memoizeStringResolver(
  resolver: (input: string) => string,
): (input: string) => string {
  const cache = new Map<string, string>();

  return (input: string) => {
    const key = input.trim();
    if (!key) return resolver(input);

    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const resolved = resolver(input);
    cache.set(key, resolved);
    return resolved;
  };
}
