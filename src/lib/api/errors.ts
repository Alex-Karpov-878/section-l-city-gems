export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION = 'VALIDATION_ERROR',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

export interface ErrorDetails {
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode?: number;
  public readonly details?: ErrorDetails;
  public readonly timestamp: Date;
  public readonly endpoint?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    details?: ErrorDetails,
    endpoint?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    this.endpoint = endpoint;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  public getUserMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return 'Network connection error. Please check your internet connection.';
      case ErrorType.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorType.UNAUTHORIZED:
        return 'You are not authorized to access this resource.';
      case ErrorType.FORBIDDEN:
        return 'Access to this resource is forbidden.';
      case ErrorType.VALIDATION:
        return (
          ((this.details?.details as Record<string, unknown> | undefined)?.[
            'message'
          ] as string) || 'Invalid request data.'
        );
      case ErrorType.SERVER:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  public toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      endpoint: this.endpoint,
      stack: this.stack,
    };
  }
}
export class NetworkError extends ApiError {
  constructor(message: string, endpoint?: string, details?: ErrorDetails) {
    super(message, ErrorType.NETWORK, undefined, details, endpoint);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string, endpoint?: string, details?: ErrorDetails) {
    super(message, ErrorType.TIMEOUT, 408, details, endpoint);
    this.name = 'TimeoutError';
  }
}
export class NotFoundError extends ApiError {
  constructor(message: string, endpoint?: string, details?: ErrorDetails) {
    super(message, ErrorType.NOT_FOUND, 404, details, endpoint);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, endpoint?: string, details?: ErrorDetails) {
    super(message, ErrorType.VALIDATION, 400, details, endpoint);
    this.name = 'ValidationError';
  }
}
export class ServerError extends ApiError {
  constructor(
    message: string,
    statusCode: number = 500,
    endpoint?: string,
    details?: ErrorDetails,
  ) {
    super(message, ErrorType.SERVER, statusCode, details, endpoint);
    this.name = 'ServerError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string, endpoint?: string, details?: ErrorDetails) {
    super(message, ErrorType.UNAUTHORIZED, 401, details, endpoint);
    this.name = 'UnauthorizedError';
  }
}
export class ForbiddenError extends ApiError {
  constructor(message: string, endpoint?: string, details?: ErrorDetails) {
    super(message, ErrorType.FORBIDDEN, 403, details, endpoint);
    this.name = 'ForbiddenError';
  }
}

export function createErrorFromResponse(
  statusCode: number,
  message: string,
  endpoint?: string,
  details?: ErrorDetails,
): ApiError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, endpoint, details);
    case 401:
      return new UnauthorizedError(message, endpoint, details);
    case 403:
      return new ForbiddenError(message, endpoint, details);
    case 404:
      return new NotFoundError(message, endpoint, details);
    case 408:
      return new TimeoutError(message, endpoint, details);
    default:
      if (statusCode >= 500) {
        return new ServerError(message, statusCode, endpoint, details);
      }
      return new ApiError(
        message,
        ErrorType.UNKNOWN,
        statusCode,
        details,
        endpoint,
      );
  }
}
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isErrorType(error: unknown, type: ErrorType): boolean {
  return isApiError(error) && error.type === type;
}
