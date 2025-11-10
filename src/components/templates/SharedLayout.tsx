'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TEST_IDS } from '@/constants';

export interface SharedLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentPosition?: 'top' | 'center' | 'bottom';
  background?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  className?: string;
  showPattern?: boolean;
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
  full: 'max-w-full',
} as const;

const positionClasses = {
  top: 'justify-start pt-12',
  center: 'justify-center',
  bottom: 'justify-end pb-12',
} as const;

export const SharedLayout = React.memo<SharedLayoutProps>(
  ({
    header,
    children,
    footer,
    contentPosition = 'center',
    background = 'bg-gray-50',
    maxWidth = '2xl',
    className,
    showPattern = false,
  }) => {
    return (
      <div
        className={cn(
          'relative flex min-h-screen flex-col',
          background,
          className,
        )}
        data-testid={TEST_IDS.SHARED_LAYOUT}
      >
        {}
        {showPattern && (
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
        )}

        {}
        {header && (
          <header className="relative z-10 flex-shrink-0 p-6" role="banner">
            <div className={cn('mx-auto w-full', maxWidthClasses[maxWidth])}>
              {header}
            </div>
          </header>
        )}

        {}
        <main
          className={cn(
            'relative z-10 flex flex-1 flex-col px-6 py-8',
            positionClasses[contentPosition],
          )}
          role="main"
        >
          <div className={cn('mx-auto w-full', maxWidthClasses[maxWidth])}>
            {children}
          </div>
        </main>

        {}
        {footer && (
          <footer
            className="relative z-10 flex-shrink-0 border-t border-gray-200 bg-white/50 p-6 backdrop-blur-sm"
            role="contentinfo"
          >
            <div
              className={cn(
                'mx-auto w-full text-center',
                maxWidthClasses[maxWidth],
              )}
            >
              {footer}
            </div>
          </footer>
        )}
      </div>
    );
  },
);

SharedLayout.displayName = 'SharedLayout';
