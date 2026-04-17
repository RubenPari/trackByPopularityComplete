/**
 * Log levels for structured logging
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger interface for structured logging
 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, error?: Error | unknown, ...args: unknown[]): void
}

/**
 * Structured logger implementation for frontend
 * Provides consistent logging with context and error tracking
 */
class AppLogger implements Logger {
  private minLevel: LogLevel
  private context: string

  constructor(context: string = 'App', minLevel: LogLevel = LogLevel.INFO) {
    this.context = context
    this.minLevel = minLevel
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  private formatMessage(level: string, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString()
    const context = `[${this.context}]`
    const levelStr = `[${level}]`
    const argsStr = args.length > 0 ? ` ${JSON.stringify(args)}` : ''
    return `${timestamp} ${levelStr} ${context} ${message}${argsStr}`
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, ...args))
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, ...args))
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, ...args))
    }
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorDetails =
        error instanceof Error
          ? { message: error.message, stack: error.stack, name: error.name }
          : error

      console.error(
        this.formatMessage('ERROR', message, ...args),
        errorDetails ? { error: errorDetails } : '',
      )
    }
  }
}

/**
 * Creates a logger instance with a specific context
 * @param context - The context/component name for the logger
 * @param minLevel - Minimum log level to output (default: INFO)
 * @returns A logger instance
 */
export function createLogger(context: string, minLevel: LogLevel = LogLevel.INFO): Logger {
  return new AppLogger(context, minLevel)
}

/**
 * Default application logger
 */
export const logger = createLogger('App', import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO)
