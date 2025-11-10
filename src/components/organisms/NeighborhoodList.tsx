'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import { EmptyState } from '@/components/atoms';
import { useDebounce } from '@/hooks/useDebounce';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useFilteredGems } from '@/hooks/useFilteredGems';
import { useSearchQuery } from '@/store/kiosk-store';
import { Property, CityGem } from '@/types/api';
import { cn } from '@/lib/utils';
import { TEST_IDS, ARIA_LABELS, UI_LABELS, TIMING } from '@/constants';

export interface NeighborhoodListProps {
  property: Property;
  allGems: CityGem[];
  className?: string;
}

export const NeighborhoodList = React.memo<NeighborhoodListProps>(
  ({ property, allGems, className }) => {
    const searchQuery = useSearchQuery();

    const debouncedSearchQuery = useDebounce(
      searchQuery,
      TIMING.DEBOUNCE_DELAY,
    );

    const { groupedGems } = useFilteredGems(
      property,
      allGems,
      debouncedSearchQuery,
    );

    const neighborhoods = React.useMemo(
      () => Object.keys(groupedGems),
      [groupedGems],
    );

    const activeNeighborhood = useScrollSpy(neighborhoods, {
      rootMargin: '-40% 0px -59% 0px',
      threshold: 0.1,
    });

    const handleNavClick = React.useCallback((neighborhoodName: string) => {
      const element = document.getElementById(neighborhoodName);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, []);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent, neighborhoodName: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavClick(neighborhoodName);
        }
      },
      [handleNavClick],
    );

    if (neighborhoods.length === 0) {
      return (
        <nav
          className={cn('rounded-lg bg-white p-4 shadow-sm', className)}
          aria-label={ARIA_LABELS.NEIGHBORHOOD_NAV}
          data-testid={TEST_IDS.NEIGHBORHOOD_NAV}
        >
          <EmptyState
            icon={<MapPin className="h-full w-full" />}
            title={UI_LABELS.NO_NEIGHBORHOODS_FOUND}
            description="No neighborhoods match your search."
            size="sm"
          />
        </nav>
      );
    }

    return (
      <nav
        className={cn('rounded-lg bg-white p-4 shadow-sm', className)}
        aria-label={ARIA_LABELS.NEIGHBORHOOD_NAV}
        data-testid={TEST_IDS.NEIGHBORHOOD_NAV}
      >
        {}
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          {UI_LABELS.NEIGHBORHOODS_LABEL}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({neighborhoods.length})
          </span>
        </h2>

        {}
        <div className="sr-only" role="status" aria-live="polite">
          {neighborhoods.length} neighborhood
          {neighborhoods.length !== 1 ? 's' : ''} available.
          {activeNeighborhood && ` Currently viewing ${activeNeighborhood}.`}
        </div>

        {}
        <ul className="space-y-1" role="list">
          {neighborhoods.map((name) => {
            const isActive = activeNeighborhood === name;
            const gemCount = groupedGems[name]?.length || 0;

            return (
              <li key={name}>
                <button
                  onClick={() => handleNavClick(name)}
                  onKeyDown={(e) => handleKeyDown(e, name)}
                  className={cn(
                    'group w-full rounded-md p-2 text-left transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1',
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                  aria-current={isActive ? 'location' : undefined}
                  aria-label={ARIA_LABELS.NEIGHBORHOOD_LINK(name, gemCount)}
                  data-testid={TEST_IDS.NEIGHBORHOOD_NAV_ITEM(name)}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isActive ? 'font-semibold' : 'group-hover:font-medium',
                      )}
                    >
                      {name}
                    </span>
                    <span
                      className={cn(
                        'text-xs transition-colors',
                        isActive
                          ? 'text-brand-primary/70'
                          : 'text-gray-400 group-hover:text-gray-600',
                      )}
                      aria-label={`${gemCount} gems`}
                    >
                      {gemCount}
                    </span>
                  </div>

                  {}
                  {isActive && (
                    <div
                      className="mt-1 h-0.5 w-full rounded-full bg-brand-primary/30"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {}
        <div className="mt-4 border-t pt-3">
          <p className="text-xs text-gray-500">
            Total:{' '}
            {neighborhoods.reduce(
              (sum, name) => sum + (groupedGems[name]?.length || 0),
              0,
            )}{' '}
            gems
          </p>
        </div>
      </nav>
    );
  },
);

NeighborhoodList.displayName = 'NeighborhoodList';
