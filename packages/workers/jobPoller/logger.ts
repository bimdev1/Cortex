// Simple logger utility to centralize logging
export class Logger {
  private context: string;
  private enabled: boolean;

  constructor(context: string, enabled = true) {
    this.context = context;
    this.enabled = enabled;
  }

  log(message: string, ...args: unknown[]): void {
    if (this.enabled) {
      // eslint-disable-next-line no-console
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.enabled) {
      // eslint-disable-next-line no-console
      console.error(`[${this.context}] ERROR: ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.enabled) {
      // eslint-disable-next-line no-console
      console.warn(`[${this.context}] WARNING: ${message}`, ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.enabled) {
      // eslint-disable-next-line no-console
      console.debug(`[${this.context}] DEBUG: ${message}`, ...args);
    }
  }
}

// Default logger instance
export const logger = new Logger('JobPoller');
