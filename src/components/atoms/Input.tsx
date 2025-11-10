import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;

  helperText?: string;

  error?: string;

  success?: string;

  leftIcon?: React.ReactNode;

  rightIcon?: React.ReactNode;

  fullWidth?: boolean;

  size?: 'sm' | 'md' | 'lg';

  variant?: 'default' | 'filled' | 'outline';
}

const inputSizes = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg',
};

const inputVariants = {
  default: 'border border-gray-300 bg-white',
  filled: 'border-0 bg-gray-100',
  outline: 'border-2 border-gray-300 bg-transparent',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      fullWidth = false,
      size = 'md',
      variant = 'default',
      id,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const helperTextId = `${inputId}-helper-text`;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium text-gray-700',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {}
        <div className="relative">
          {}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              error ? errorId : helperText ? helperTextId : undefined
            }
            className={cn(
              'w-full rounded-lg px-3 transition-colors',
              'placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-0',

              inputSizes[size],

              inputVariants[variant],

              leftIcon && 'pl-10',
              rightIcon && 'pr-10',

              hasError && 'border-red-500 focus:ring-red-500',
              hasSuccess && 'border-green-500 focus:ring-green-500',
              disabled && 'cursor-not-allowed bg-gray-50 opacity-50',

              className,
            )}
            {...props}
          />

          {}
          {rightIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                hasError
                  ? 'text-red-500'
                  : hasSuccess
                    ? 'text-green-500'
                    : 'text-gray-400',
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {}
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {}
        {!error && success && (
          <p
            className="text-sm text-green-600"
            role="status"
            aria-live="polite"
          >
            {success}
          </p>
        )}

        {}
        {!error && !success && helperText && (
          <p id={helperTextId} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
