import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionButtonProps?: Partial<ButtonProps>;
  size?: 'sm' | 'md' | 'lg';
}

const iconSizes = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

const titleSizes = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

const descriptionSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon,
      title,
      description,
      actionLabel,
      onAction,
      actionButtonProps,
      size = 'md',
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center',
          'text-center',
          'px-4 py-12',
          className,
        )}
        role="status"
        aria-live="polite"
        {...props}
      >
        {icon && (
          <div
            className={cn('mb-4 text-gray-400', iconSizes[size])}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        <h3 className={cn('font-semibold text-gray-900', titleSizes[size])}>
          {title}
        </h3>

        {description && (
          <p
            className={cn(
              'mt-2 max-w-md text-gray-600',
              descriptionSizes[size],
            )}
          >
            {description}
          </p>
        )}

        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-6" {...actionButtonProps}>
            {actionLabel}
          </Button>
        )}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';
