'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { SearchBar, FilterGroup } from '@/components/molecules';
import type { FilterItem } from '@/components/molecules';
import { Property, Category } from '@/types/api';
import {
  useSearchQuery,
  useActiveCategory,
  useKioskActions,
} from '@/store/kiosk-store';
import { cn } from '@/lib/utils';
import { createLogger } from '@/lib/logger';
import {
  ROUTES,
  QUERY_KEYS,
  TIMING,
  INTERACTION,
  TEST_IDS,
  UI_LABELS,
} from '@/constants';

export interface HeaderProps {
  property: Property;

  className?: string;
}

const logger = createLogger('Header');

export const Header = React.memo<HeaderProps>(({ property, className }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const searchQuery = useSearchQuery();
  const activeCategory = useActiveCategory();

  const { setSearchQuery, setActiveCategory } = useKioskActions();

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const clickTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const clickCountRef = React.useRef(0);

  const availableFilters = React.useMemo(() => {
    const categoriesMap = new Map<Category, FilterItem>();

    property.neighborhoods?.forEach((neighborhood) => {
      neighborhood.city_gems?.forEach((gem) => {
        if (gem.category && !categoriesMap.has(gem.category)) {
          categoriesMap.set(gem.category, {
            id: gem.category,
            name: gem.category,
          });
        }
      });
    });

    return {
      categories: Array.from(categoriesMap.values()),
    };
  }, [property]);

  const handleLogoClick = React.useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickCountRef.current += 1;
    const newCount = clickCountRef.current;

    clickTimerRef.current = setTimeout(async () => {
      if (newCount >= INTERACTION.LOGO_TAPS_FOR_CONFIG) {
        logger.info('Admin: Multi-tap detected - navigating to config', {
          tapCount: newCount,
        });
        await router.push(ROUTES.CONFIG);
      } else if (newCount >= INTERACTION.LOGO_TAPS_FOR_REFRESH) {
        logger.info('Admin: Multi-tap detected - refreshing data', {
          tapCount: newCount,
        });
        setIsRefreshing(true);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.PROPERTY(property.slug),
          }),
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.ALL_GEMS],
          }),
        ]);

        setTimeout(() => {
          setIsRefreshing(false);
        }, TIMING.REFRESH_ANIMATION_DURATION);
      }

      clickCountRef.current = 0;
    }, TIMING.MULTI_TAP_WINDOW);
  }, [property.slug, router, queryClient]);

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearchQuery(value);
    },
    [setSearchQuery],
  );

  const handleCategorySelect = React.useCallback(
    (categoryId: string | null) => {
      setActiveCategory(categoryId as Category | null);
    },
    [setActiveCategory],
  );

  React.useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const hasFilters = availableFilters.categories.length > 0;

  return (
    <header
      className={cn(
        'flex-shrink-0 border-b bg-white shadow-sm',
        'transition-shadow duration-200',
        className,
      )}
      data-testid={TEST_IDS.HEADER}
    >
      <div className="p-4 md:p-6">
        {}
        <div className="flex items-center gap-4 md:gap-6">
          {}
          <div
            onClick={handleLogoClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogoClick();
              }
            }}
            className="relative cursor-pointer select-none"
            role="button"
            tabIndex={0}
            title={`Admin: ${INTERACTION.LOGO_TAPS_FOR_REFRESH} taps to refresh, ${INTERACTION.LOGO_TAPS_FOR_CONFIG} taps for config`}
            data-testid={TEST_IDS.LOGO_CONTAINER}
            aria-label="Logo - Multiple taps for admin functions"
          >
            <Logo className="text-brand-primary" />

            {}
            {isRefreshing && (
              <div
                className="absolute -right-6 top-1/2 -translate-y-1/2"
                role="status"
                aria-live="polite"
              >
                <RefreshCw
                  className="h-5 w-5 animate-spin text-brand-primary"
                  aria-label="Refreshing data"
                />
                <span className="sr-only">Refreshing data...</span>
              </div>
            )}
          </div>

          {}
          <div className="flex-grow">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={UI_LABELS.SEARCH_PLACEHOLDER}
              size="md"
            />
          </div>
        </div>

        {}
        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-start gap-4 md:gap-6">
            {}
            {availableFilters.categories.length > 0 && (
              <FilterGroup
                label={UI_LABELS.CATEGORIES_LABEL}
                items={availableFilters.categories}
                activeItemId={activeCategory}
                onSelect={handleCategorySelect}
                showClearAll
                size="md"
              />
            )}

            {}
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';
