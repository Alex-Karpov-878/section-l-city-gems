'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { createLogger } from '@/lib/logger';
import { Button } from './Button';
import { Card } from './Card';

const logger = createLogger('ErrorBoundary');

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?:
    | React.ReactNode
    | ((error: Error, reset: () => void) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

function DefaultFallback({
  error,
  errorInfo,
  onReset,
  showDetails,
}: {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
  showDetails: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle
              className="h-10 w-10 text-red-600"
              aria-hidden="true"
            />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Something went wrong
          </h1>

          <p className="mb-6 text-gray-600">
            An unexpected error occurred. Please try refreshing the page or
            contact support if the problem persists.
          </p>

          {showDetails && (
            <div className="mb-6 rounded-lg bg-gray-100 p-4 text-left">
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                Error Details:
              </h3>
              <div className="mb-2 font-mono text-xs text-red-600">
                {error.toString()}
              </div>
              {errorInfo?.componentStack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold text-gray-700">
                    Component Stack
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-gray-600">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold text-gray-700">
                    Error Stack
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-gray-600">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <Button
            onClick={onReset}
            leftIcon={<RefreshCw className="h-5 w-5" />}
            size="lg"
            variant="primary"
          >
            Try Again
          </Button>

          <div className="mt-4 text-sm text-gray-500">
            <button
              onClick={() => (window.location.href = '/')}
              className="underline hover:text-gray-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });

    this.props.onError?.(error, errorInfo);
  }

  private reset = (): void => {
    logger.info('Error boundary reset');

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    this.props.onReset?.();
  };

  override render(): React.ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails } = this.props;

    if (hasError && error) {
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.reset);
        }
        return fallback;
      }

      const shouldShowDetails =
        showDetails ?? process.env.NODE_ENV === 'development';

      return (
        <DefaultFallback
          error={error}
          errorInfo={errorInfo}
          onReset={this.reset}
          showDetails={shouldShowDetails}
        />
      );
    }

    return children;
  }
}

export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState<Error>();

  return React.useCallback((error: Error) => {
    logger.error('Error thrown from useErrorHandler', error);
    setError(() => {
      throw error;
    });
  }, []);
}
