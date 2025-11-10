'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TEST_IDS, ARIA_LABELS } from '@/constants';

export interface MainLayoutProps {
  header: React.ReactNode;
  neighborhoodNav: React.ReactNode;
  mainContent: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
  showNeighborhoodNavMobile?: boolean;
  showSidebarTablet?: boolean;
}

export const MainLayout = React.memo<MainLayoutProps>(
  ({
    header,
    neighborhoodNav,
    mainContent,
    sidebar,
    className,
    showNeighborhoodNavMobile = false,
    showSidebarTablet = false,
  }) => {
    return (
      <div
        className={cn('flex h-screen flex-col bg-gray-100', className)}
        data-testid={TEST_IDS.MAIN_LAYOUT}
      >
        {}
        <header
          className="flex-shrink-0"
          role="banner"
          aria-label={ARIA_LABELS.HEADER}
        >
          {header}
        </header>

        {}
        <div
          className={cn(
            'grid flex-1 gap-4 overflow-hidden p-4',
            'grid-cols-1',

            'md:grid-cols-[1fr]',
            showSidebarTablet && 'md:grid-cols-[1fr_360px]',

            'lg:grid-cols-[240px_1fr_360px]',
            'lg:gap-6 lg:p-6',
          )}
        >
          {}
          <aside
            className={cn(
              'overflow-y-auto rounded-lg bg-white p-4 shadow-sm',

              showNeighborhoodNavMobile ? 'block' : 'hidden md:block',
            )}
            role="navigation"
            aria-label={ARIA_LABELS.NEIGHBORHOOD_NAV}
            data-testid={TEST_IDS.NEIGHBORHOOD_NAV_SIDEBAR}
          >
            {neighborhoodNav}
          </aside>

          {}
          <main
            className="overflow-y-auto"
            role="main"
            aria-label={ARIA_LABELS.MAIN_CONTENT}
            data-testid={TEST_IDS.MAIN_CONTENT}
          >
            {mainContent}
          </main>

          {}
          <aside
            className={cn(
              'overflow-y-auto',

              showSidebarTablet ? 'hidden md:block' : 'hidden lg:block',
            )}
            role="complementary"
            aria-label={ARIA_LABELS.FAVORITES_PANEL}
            data-testid={TEST_IDS.FAVORITES_SIDEBAR}
          >
            {sidebar}
          </aside>
        </div>
      </div>
    );
  },
);

MainLayout.displayName = 'MainLayout';
