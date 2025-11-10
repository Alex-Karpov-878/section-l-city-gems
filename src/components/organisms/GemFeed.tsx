'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variant } from 'framer-motion';
import { Search } from 'lucide-react';
import { GemCard } from '@/components/molecules';
import { EmptyState } from '@/components/atoms';
import { useDebounce } from '@/hooks/useDebounce';
import { useFilteredGems } from '@/hooks/useFilteredGems';
import {
  useSearchQuery,
  useFavoriteGemIds,
  useKioskActions,
} from '@/store/kiosk-store';
import { Property, CityGem } from '@/types/api';
import { TEST_IDS, ARIA_LABELS, UI_LABELS, TIMING } from '@/constants';

export interface GemFeedProps {
  property: Property;
  allGems: CityGem[];
  disableAnimations?: boolean;
  className?: string;
}

export const GemFeed = React.memo<GemFeedProps>(
  ({ property, allGems, disableAnimations = false, className }) => {
    const searchQuery = useSearchQuery();
    const favoriteGemIds = useFavoriteGemIds();
    const { toggleFavorite } = useKioskActions();

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

    const sectionInitial: Variant = { opacity: 0, y: 20 };
    const sectionAnimate: Variant = { opacity: 1, y: 0 };
    const sectionExit: Variant = { opacity: 0, y: -20 };

    const totalGems = React.useMemo(
      () =>
        neighborhoods.reduce((sum, name) => sum + groupedGems[name]!.length, 0),
      [neighborhoods, groupedGems],
    );

    const handleToggleFavorite = React.useCallback(
      (gemId: number) => {
        toggleFavorite(gemId);
      },
      [toggleFavorite],
    );

    if (neighborhoods.length === 0) {
      return (
        <div
          className={className}
          data-testid={TEST_IDS.GEM_FEED}
          role="region"
          aria-label={ARIA_LABELS.GEM_FEED}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-96 items-center justify-center"
          >
            <EmptyState
              icon={<Search className="h-full w-full" />}
              title={UI_LABELS.NO_GEMS_FOUND}
              description={UI_LABELS.NO_GEMS_DESCRIPTION}
              size="lg"
            />
          </motion.div>

          {}
          <div
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            No city gems found. Try adjusting your search or filter criteria.
          </div>
        </div>
      );
    }

    return (
      <div
        className={className}
        data-testid={TEST_IDS.GEM_FEED}
        role="region"
        aria-label={ARIA_LABELS.GEM_FEED}
      >
        {}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {totalGems} city gem{totalGems !== 1 ? 's' : ''} found across{' '}
          {neighborhoods.length} neighborhood
          {neighborhoods.length !== 1 ? 's' : ''}
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {neighborhoods.map((name) => {
              const gems = groupedGems[name];
              if (!gems || gems.length === 0) return null;

              return (
                <motion.section
                  key={name}
                  id={name}
                  data-neighborhood-section
                  initial={disableAnimations ? undefined : sectionInitial}
                  animate={disableAnimations ? undefined : sectionAnimate}
                  exit={disableAnimations ? undefined : sectionExit}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                  className="scroll-mt-4"
                  aria-labelledby={`neighborhood-${name}`}
                >
                  {}
                  <h2
                    id={`neighborhood-${name}`}
                    className="sticky top-[-1px] z-10 border-b border-gray-200 bg-gray-100/80 py-2 pl-1 text-2xl font-bold text-gray-800 backdrop-blur-sm"
                  >
                    {name}
                    <span className="ml-2 text-base font-normal text-gray-500">
                      ({gems.length})
                    </span>
                  </h2>

                  {}
                  <div
                    className="grid gap-6 pt-4"
                    style={{
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(280px, 280px))',
                    }}
                    role="list"
                    aria-label={`City gems in ${name}`}
                  >
                    {gems.map((gem) => (
                      <div key={gem.id} role="listitem">
                        <GemCard
                          gem={gem}
                          isFavorite={favoriteGemIds.has(gem.id)}
                          onToggleFavorite={() => handleToggleFavorite(gem.id)}
                          disableAnimations={disableAnimations}
                        />
                      </div>
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);

GemFeed.displayName = 'GemFeed';
