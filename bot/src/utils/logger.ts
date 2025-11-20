export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, ...args: unknown[]): void {
    console.log(`[${this.timestamp()}] [${this.context}] ${message}`, ...args);
  }

  error(message: string, error?: Error | unknown): void {
    console.error(`[${this.timestamp()}] [${this.context}] ERROR: ${message}`);
    if (error) {
      console.error(error);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.timestamp()}] [${this.context}] WARN: ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.timestamp()}] [${this.context}] DEBUG: ${message}`, ...args);
    }
  }

  private timestamp(): string {
    return new Date().toISOString();
  }
}
