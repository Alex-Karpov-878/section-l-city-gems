'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { MapPin, ExternalLink, Heart, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { SharedLayout } from '@/components/templates';
import { Card, LoadingSpinner, EmptyState, Badge } from '@/components/atoms';
import { Logo } from '@/components/ui/Logo';
import { CityGem } from '@/types/api';
import { QUERY_KEYS, IMAGE_SIZES, TEST_IDS } from '@/constants';

function SharePageContent() {
  const searchParams = useSearchParams();
  const gemIdsParam = searchParams.get('gems');
  const gemIds = React.useMemo(
    () => gemIdsParam?.split(',').map(Number).filter(Boolean) || [],
    [gemIdsParam],
  );

  // Fetch gems by IDs
  const {
    data: gems,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.GEMS_BY_IDS(gemIds),
    queryFn: () => api.getGemsByIds(gemIds),
    enabled: gemIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <LoadingSpinner size="lg" label="Loading your gems..." />
        <p className="text-gray-600">Loading your curated list...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card variant="outlined" padding="lg">
        <EmptyState
          icon={<AlertCircle className="h-full w-full text-red-500" />}
          title="Failed to Load List"
          description="Could not load your gems. The link may be invalid or expired."
          size="lg"
        />
      </Card>
    );
  }

  // Empty state
  if (!gems || gems.length === 0) {
    return (
      <Card variant="outlined" padding="lg">
        <EmptyState
          icon={<Heart className="h-full w-full text-gray-300" />}
          title="No Gems Found"
          description="This shared list is empty or the link may be invalid."
          size="lg"
        />
      </Card>
    );
  }

  // Success state -> render gems
  return (
    <div className="space-y-6" data-testid={TEST_IDS.SHARED_GEMS_LIST}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Your Curated City Gems
        </h1>
        <p className="mt-2 text-gray-600">
          {gems.length} gem{gems.length !== 1 ? 's' : ''} shared with you
        </p>
      </div>

      <ul className="space-y-6" role="list">
        {gems.map((gem: CityGem) => {
          const imageUrl =
            gem.coverImage?.formats?.medium?.url ||
            gem.coverImage?.formats?.large?.url ||
            gem.coverImage?.url;

          return (
            <li key={gem.id}>
              <Card
                variant="outlined"
                padding="none"
                className="overflow-hidden transition-shadow duration-200 hover:shadow-lg"
              >
                {imageUrl && (
                  <div className="relative h-48 w-full bg-gray-100 sm:h-64">
                    <Image
                      src={imageUrl}
                      alt={
                        gem.coverImage?.alternativeText ||
                        `Photo of ${gem.name}`
                      }
                      fill
                      className="object-cover"
                      sizes={IMAGE_SIZES.SHARED_GEM}
                    />
                    {/* Category Badge */}
                    <div className="absolute bottom-3 left-3">
                      <Badge
                        variant="secondary"
                        size="md"
                        className="backdrop-blur-sm"
                      >
                        {gem.category}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    {gem.name}
                  </h2>

                  <p className="mt-3 leading-relaxed text-gray-600">
                    {gem.longDescription || gem.shortDescription}
                  </p>

                  {/* Tags */}
                  {gem.tags && gem.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {gem.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" size="sm">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Neighborhood */}
                  {gem.neighborhoods && gem.neighborhoods.length > 0 && (
                    <p className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <span>{gem.neighborhoods[0]?.name}</span>
                    </p>
                  )}

                  {/* Google Maps Link */}
                  {gem.googleMapsUrl && (
                    <a
                      href={gem.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
                    >
                      <MapPin className="h-5 w-5" />
                      Open in Google Maps
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SharePage() {
  return (
    <SharedLayout
      header={<Logo className="h-8 w-auto text-brand-primary" />}
      contentPosition="top"
      maxWidth="3xl"
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-12">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600">Loading your curated list...</p>
          </div>
        }
      >
        <SharePageContent />
      </Suspense>
    </SharedLayout>
  );
}
