'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/atoms';
import { usePersistentFavorites } from '@/hooks/usePersistentFavorites';
import { createLogger } from './logger';

const logger = createLogger('Providers');

function AppInitializer({ children }: { children: React.ReactNode }) {
  usePersistentFavorites();

  useEffect(() => {
    logger.info('App initialized with all providers');
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 2, // Retry failed requests
          },
        },
      }),
  );

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Root error boundary caught error', error, {
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AppInitializer>{children}</AppInitializer>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
