export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}
export interface LogEntry {
  level: LogLevel;
  namespace: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableTimestamps: boolean;
  prettyPrint: boolean;
}

const getDefaultConfig = (): LoggerConfig => ({
  minLevel:
    process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableTimestamps: true,
  prettyPrint: process.env.NODE_ENV === 'development',
});

let globalConfig: LoggerConfig = getDefaultConfig();

export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

export function resetLoggerConfig(): void {
  globalConfig = getDefaultConfig();
}

const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.NONE]: 'NONE',
};

const LOG_COLORS: Record<string, string> = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m', // Green
  [LogLevel.WARN]: '\x1b[33m', // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function formatLogEntry(entry: LogEntry): string {
  const { level, namespace, message, timestamp, metadata, error } = entry;

  if (!globalConfig.prettyPrint) {
    return JSON.stringify({
      level: LOG_LEVEL_NAMES[level],
      namespace,
      message,
      timestamp,
      ...(metadata && { metadata }),
      ...(error && { error: error.message, stack: error.stack }),
    });
  }

  const color = LOG_COLORS[String(level)] || LOG_COLORS['reset'];
  const reset = LOG_COLORS['reset'];
  const gray = LOG_COLORS['gray'];
  const bold = LOG_COLORS['bold'];

  const parts: string[] = [];

  if (globalConfig.enableTimestamps) {
    parts.push(`${gray}${timestamp}${reset}`);
  }

  parts.push(`${color}${bold}${LOG_LEVEL_NAMES[level]?.padEnd(5)}${reset}`);
  parts.push(`${gray}[${namespace}]${reset}`);
  parts.push(message);

  let output = parts.join(' ');

  if (metadata && Object.keys(metadata).length > 0) {
    output += `\n${gray}${JSON.stringify(metadata, null, 2)}${reset}`;
  }

  if (error) {
    output += `\n${color}Error: ${error.message}${reset}`;
    if (error.stack) {
      output += `\n${gray}${error.stack}${reset}`;
    }
  }

  return output;
}

function writeToConsole(entry: LogEntry): void {
  if (!globalConfig.enableConsole) {
    return;
  }

  const formatted = formatLogEntry(entry);

  switch (entry.level) {
    case LogLevel.DEBUG:
      console.debug(formatted);
      break;
    case LogLevel.INFO:
      console.info(formatted);
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    case LogLevel.ERROR:
      console.error(formatted);
      break;
  }
}

export class Logger {
  constructor(private readonly namespace: string) {}

  private shouldLog(level: LogLevel): boolean {
    return level >= globalConfig.minLevel;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error,
  ): LogEntry {
    return {
      level,
      namespace: this.namespace,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      error,
    };
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createEntry(level, message, metadata, error);
    writeToConsole(entry);

    // Future: Could add other transports here (e.g., remote logging service)
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(
    message: string,
    error?: Error | unknown,
    metadata?: Record<string, unknown>,
  ): void {
    const errorObj = error instanceof Error ? error : undefined;
    const combinedMetadata: Record<string, unknown> = {
      ...(metadata || {}),
    };
    if (error && !(error instanceof Error)) {
      combinedMetadata['errorDetails'] = error;
    }

    this.log(
      LogLevel.ERROR,
      message,
      Object.keys(combinedMetadata).length > 0 ? combinedMetadata : undefined,
      errorObj,
    );
  }

  child(childNamespace: string): Logger {
    return new Logger(`${this.namespace}:${childNamespace}`);
  }

  apiRequest(
    method: string,
    url: string,
    params?: Record<string, unknown>,
  ): void {
    this.debug('API Request', {
      method: method.toUpperCase(),
      url,
      ...(params && { params }),
    });
  }

  apiResponse(status: number, url: string, data?: unknown): void {
    const responseMeta: Record<string, unknown> = { status, url };
    if (data) {
      responseMeta['dataKeys'] = Object.keys(data as Record<string, unknown>);
    }
    this.debug('API Response', responseMeta);
  }

  apiError(url: string, error: Error | unknown): void {
    this.error('API Error', error, { url });
  }

  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    this.debug(`${label} started`);

    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`${label} completed`, { durationMs: duration.toFixed(2) });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${label} failed`, error, { durationMs: duration.toFixed(2) });
      throw error;
    }
  }
}

export function createLogger(namespace: string): Logger {
  return new Logger(namespace);
}

export const logger = createLogger('App');

export const apiLogger = createLogger('API');
export const storeLogger = createLogger('Store');
export const hookLogger = createLogger('Hook');
export const componentLogger = createLogger('Component');
