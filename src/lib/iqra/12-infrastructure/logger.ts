/**
 * IQRA Logger — المسجل
 * 
 * "وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُّبِينٍ" — يس: 12
 * 
 * Powered by BetterStack (Logtail) for global visibility.
 */

// Placeholder for Logtail (will be enabled when token is provided)
const BETTER_STACK_TOKEN = process.env.BETTER_STACK_TOKEN;

export class IQRALogger {
  /**
   * Log debug information
   */
  static debug(message: string, meta: any = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Log info information
   */
  static info(message: string, meta: any = {}) {
    this.log('info', message, meta);
  }

  /**
   * Log warn information
   */
  static warn(message: string, meta: any = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Log error information
   */
  static error(message: string, meta: any = {}) {
    this.log('error', message, meta);
  }

  /**
   * Internal logging logic
   */
  private static log(level: 'info' | 'error' | 'warn' | 'debug', message: string, meta: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
      identity: 'IQRA',
    };

    // Console output for local dev
    if (level === 'error') {
      console.error(`[${level.toUpperCase()}] ${message}`, meta);
    } else if (level === 'debug') {
      // Only log debug in dev mode or if explicitly enabled
      if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
        console.log(`[${level.toUpperCase()}] ${message}`, meta);
      }
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, meta);
    }

    // BetterStack Integration (External call)
    if (BETTER_STACK_TOKEN) {
      // In a real environment, we'd use @logtail/js or a fetch call to their ingest API
      // fetch('https://in.logs.betterstack.com', { method: 'POST', body: JSON.stringify(logEntry) })
    }
  }
}
