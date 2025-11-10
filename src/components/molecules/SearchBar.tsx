import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/atoms';
import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { sanitizeSearchQuery } from '@/lib/sanitization';
import { UI_LABELS, ARIA_LABELS, TEST_IDS } from '@/constants';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
}

export const SearchBar = React.memo<SearchBarProps>(
  ({
    value,
    onChange,
    onClear,
    placeholder = UI_LABELS.SEARCH_PLACEHOLDER,
    isLoading = false,
    disabled = false,
    className,
    size = 'md',
    autoFocus = false,
  }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const hasValue = value.length > 0;

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = sanitizeSearchQuery(e.target.value);
        onChange(sanitized);
      },
      [onChange],
    );

    const handleClear = React.useCallback(() => {
      onChange('');
      onClear?.();
      inputRef.current?.focus();
    }, [onChange, onClear]);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape' && hasValue) {
          e.preventDefault();
          handleClear();
        }
      },
      [hasValue, handleClear],
    );

    return (
      <div className={cn('relative', className)}>
        <Input
          ref={inputRef}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          size={size}
          fullWidth
          leftIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          rightIcon={
            hasValue && !isLoading ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                disabled={disabled}
                aria-label={ARIA_LABELS.CLEAR_SEARCH}
                data-testid={TEST_IDS.SEARCH_CLEAR_BUTTON}
                className="h-6 w-6 rounded-full p-0 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : isLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-primary" />
              </div>
            ) : null
          }
          aria-label={ARIA_LABELS.SEARCH_INPUT}
          data-testid={TEST_IDS.SEARCH_INPUT}
          className={cn(
            'rounded-full',
            hasValue && 'pr-10',
            isLoading && 'pr-10',
          )}
        />

        {}
        {hasValue && (
          <div className="sr-only" role="status" aria-live="polite">
            {`${value.length} character${
              value.length === 1 ? '' : 's'
            } entered. Press Escape to clear.`}
          </div>
        )}
      </div>
    );
  },
);

SearchBar.displayName = 'SearchBar';
