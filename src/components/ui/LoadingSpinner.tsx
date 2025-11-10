import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  centered?: boolean;
  variant?: 'default' | 'primary' | 'white';
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const spinnerVariants = {
  default: 'text-gray-500',
  primary: 'text-brand-primary',
  white: 'text-white',
};

export const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  LoadingSpinnerProps
>(
  (
    {
      className,
      size = 'md',
      label,
      centered = false,
      variant = 'default',
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2',
          centered && 'justify-center',
          className,
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
        {...props}
      >
        <Loader2
          className={cn(
            'animate-spin',
            spinnerSizes[size],
            spinnerVariants[variant],
          )}
          aria-hidden="true"
        />
        {label && (
          <span className={cn('text-sm font-medium', spinnerVariants[variant])}>
            {label}
          </span>
        )}
        <span className="sr-only">{label || 'Loading'}</span>
      </div>
    );
  },
);

LoadingSpinner.displayName = 'LoadingSpinner';
