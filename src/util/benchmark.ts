export function withDurationLogging<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`Duration for ${name}: ${end - start}ms`);
  return result;
}
