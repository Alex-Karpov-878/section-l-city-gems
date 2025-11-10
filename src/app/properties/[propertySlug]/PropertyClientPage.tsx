'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { useKioskMode } from '@/hooks/useKioskMode';
import { useKioskActions } from '@/store/kiosk-store';
import { MainLayout, SharedLayout } from '@/components/templates';
import {
  Header,
  NeighborhoodList,
  GemFeed,
  FavoritesPane,
  GemDetailModal,
} from '@/components/organisms';
import { LoadingSpinner, EmptyState, Card } from '@/components/atoms';
import { Property, CityGem } from '@/types/api';
import { QUERY_KEYS, UI_LABELS, TEST_IDS } from '@/constants';

export default function PropertyClientPage() {
  const params = useParams();
  const propertySlug = params['propertySlug'] as string;
  const { setProperty, clearFilters } = useKioskActions();

  useKioskMode();

  const {
    data: property,
    isLoading: isPropertyLoading,
    error: propertyError,
  } = useQuery<Property | null>({
    queryKey: QUERY_KEYS.PROPERTY(propertySlug),
    queryFn: () => api.getPropertyBySlug(propertySlug),
    enabled: !!propertySlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch all city gems
  const {
    data: allGems,
    isLoading: areGemsLoading,
    error: gemsError,
  } = useQuery<CityGem[]>({
    queryKey: [QUERY_KEYS.ALL_GEMS],
    queryFn: api.getAllCityGems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when property loads
  React.useEffect(() => {
    if (property) {
      setProperty(property);
      clearFilters();
    }
  }, [property, setProperty, clearFilters]);

  // Loading State
  const isLoading = isPropertyLoading || areGemsLoading;
  if (isLoading) {
    return (
      <SharedLayout contentPosition="center">
        <div
          className="flex flex-col items-center gap-4"
          data-testid={TEST_IDS.LOADING_SPINNER}
        >
          <LoadingSpinner size="lg" label={UI_LABELS.LOADING_DATA} />
          <p className="text-lg text-gray-600">{UI_LABELS.LOADING_DATA}</p>
        </div>
      </SharedLayout>
    );
  }

  // Error State
  const error = propertyError || gemsError;
  if (error || !property || !allGems) {
    return (
      <SharedLayout contentPosition="center">
        <Card
          variant="outlined"
          padding="lg"
          className="max-w-2xl"
          data-testid={TEST_IDS.ERROR_MESSAGE}
        >
          <EmptyState
            icon={<AlertCircle className="h-full w-full text-red-500" />}
            title={UI_LABELS.ERROR_TITLE}
            description={UI_LABELS.ERROR_DESCRIPTION}
            size="lg"
          />
          {error && (
            <div className="mt-6">
              <details className="rounded-lg bg-gray-50 p-4">
                <summary className="cursor-pointer font-semibold text-gray-700">
                  Error Details
                </summary>
                <pre className="mt-2 overflow-x-auto text-xs text-red-800">
                  {error instanceof Error
                    ? error.message
                    : 'An unknown error occurred'}
                </pre>
              </details>
            </div>
          )}
        </Card>
      </SharedLayout>
    );
  }

  // Success State -> Render Main Layout
  return (
    <>
      <MainLayout
        header={<Header property={property} />}
        neighborhoodNav={
          <NeighborhoodList property={property} allGems={allGems} />
        }
        mainContent={<GemFeed property={property} allGems={allGems} />}
        sidebar={<FavoritesPane allGems={allGems} />}
      />
      <GemDetailModal allGems={allGems} />
    </>
  );
}
