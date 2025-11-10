'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TEST_IDS, ARIA_LABELS } from '@/constants';

export interface ConfigLayoutProps {
  logo?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl';

  background?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
} as const;

export const ConfigLayout = React.memo<ConfigLayoutProps>(
  ({
    logo,
    title,
    description,
    children,
    footer,
    className,
    maxWidth = '4xl',
    background = 'bg-gray-50',
  }) => {
    return (
      <div
        className={cn('flex min-h-screen flex-col', background, className)}
        data-testid={TEST_IDS.CONFIG_LAYOUT}
      >
        {}
        <main
          className="flex flex-1 flex-col items-center justify-center p-8 sm:p-12 md:p-24"
          role="main"
          aria-labelledby="config-title"
        >
          {}
          <header className="mb-8 flex flex-col items-center gap-4 text-center sm:mb-12">
            {}
            {logo && (
              <div className="flex-shrink-0" aria-label={ARIA_LABELS.LOGO}>
                {logo}
              </div>
            )}

            {}
            <h1
              id="config-title"
              className="text-3xl font-bold text-gray-800 sm:text-4xl"
            >
              {title}
            </h1>

            {}
            {description && (
              <p className="text-base text-gray-600 sm:text-lg">
                {description}
              </p>
            )}
          </header>

          {}
          <div
            className={cn('w-full', maxWidthClasses[maxWidth])}
            data-testid={TEST_IDS.CONFIG_CONTENT}
          >
            {children}
          </div>
        </main>

        {}
        {footer && (
          <footer
            className="flex-shrink-0 border-t border-gray-200 bg-white p-6 text-center"
            role="contentinfo"
          >
            {footer}
          </footer>
        )}
      </div>
    );
  },
);

ConfigLayout.displayName = 'ConfigLayout';
