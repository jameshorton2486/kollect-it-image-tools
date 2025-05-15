
/**
 * Generic retry utility for asynchronous operations
 */
export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, delayMs, backoffFactor = 1.5, onRetry } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt the operation
      return await operation();
    } catch (error) {
      // Capture error for potential last throw or retry callback
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if this was the last attempt
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Calculate delay for next attempt with exponential backoff
      const nextDelay = Math.round(delayMs * Math.pow(backoffFactor, attempt));
      
      // Notify about retry if callback is provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, nextDelay));
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}
