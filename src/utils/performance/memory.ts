
/**
 * Memory usage utilities
 */

/**
 * Get memory usage information if available
 */
export function getMemoryUsage() {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    // @ts-ignore - memory might not be available in all browsers
    const memory = performance.memory;
    return {
      // @ts-ignore
      totalJSHeapSize: memory?.totalJSHeapSize,
      // @ts-ignore
      usedJSHeapSize: memory?.usedJSHeapSize,
      // @ts-ignore
      jsHeapSizeLimit: memory?.jsHeapSizeLimit
    };
  }
  return null;
}
