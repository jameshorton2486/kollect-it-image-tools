
/**
 * Centralized logging utility for the application
 * 
 * Provides consistent logging patterns and levels for better debugging and monitoring
 */

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  module?: string;
  data?: any;
  silent?: boolean;
}

/**
 * Log a message with optional context data
 */
export function log(level: LogLevel, message: string, options: LogOptions = {}) {
  const timestamp = new Date().toISOString();
  const module = options.module ? `[${options.module}]` : '';
  const prefix = `${timestamp} ${level.toUpperCase()} ${module}:`;

  // Only output to console if not silent
  if (!options.silent) {
    switch (level) {
      case 'debug':
        console.debug(prefix, message, options.data || '');
        break;
      case 'info':
        console.info(prefix, message, options.data || '');
        break;
      case 'warn':
        console.warn(prefix, message, options.data || '');
        break;
      case 'error':
        console.error(prefix, message, options.data || '');
        break;
    }
  }

  // Here we could also send logs to a monitoring service
  // if implemented in the future
}

/**
 * Convenience methods for different log levels
 */
export const logger = {
  debug: (message: string, options?: LogOptions) => log('debug', message, options),
  info: (message: string, options?: LogOptions) => log('info', message, options),
  warn: (message: string, options?: LogOptions) => log('warn', message, options),
  error: (message: string, options?: LogOptions) => log('error', message, options),
};

/**
 * Error handling utilities
 */
export function handleError(error: any, context: string, showToast: boolean = true): Error {
  // Normalize error to Error type
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  
  // Log the error with context
  logger.error(`${context}: ${normalizedError.message}`, { 
    module: 'ErrorHandler',
    data: {
      stack: normalizedError.stack,
      context
    }
  });

  // If toast notifications should be shown
  if (showToast) {
    import('@/components/ui/use-toast').then(({ toast }) => {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: normalizedError.message || "An unexpected error occurred"
      });
    }).catch(() => {
      // Fallback if toast module fails to load
      console.error('Failed to show toast notification');
    });
  }

  return normalizedError;
}

/**
 * Create a safe async function wrapper that catches and handles errors
 */
export function createSafeAsyncFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorContext: string,
  showToast: boolean = true
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, errorContext, showToast);
      return null;
    }
  };
}
