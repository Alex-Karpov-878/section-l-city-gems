import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  primary: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  secondary: 'bg-brand-secondary text-gray-900 border-gray-300',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  outline: 'bg-transparent text-gray-700 border-gray-300',
};

const badgeSizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

const dotColors = {
  default: 'bg-gray-500',
  primary: 'bg-brand-primary',
  secondary: 'bg-gray-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  outline: 'bg-gray-500',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      dot = false,
      removable = false,
      onRemove,
      icon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5',
          'rounded-full border font-medium',
          'transition-colors',
          badgeVariants[variant],
          badgeSizes[size],
          className,
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn('h-2 w-2 rounded-full', dotColors[variant])}
            aria-hidden="true"
          />
        )}

        {icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        {children && <span>{children}</span>}

        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'flex-shrink-0 rounded-full',
              'hover:bg-black/10 active:bg-black/20',
              'transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-black/20',
            )}
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
