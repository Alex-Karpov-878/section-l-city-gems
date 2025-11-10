import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/atoms';
import { Badge } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { UI_LABELS, ARIA_LABELS } from '@/constants';

export interface FilterItem {
  id: string;
  name: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface FilterGroupProps<T extends FilterItem> {
  label: string;
  items: T[];
  activeItemId?: string | null;
  activeItemIds?: string[];

  onSelect: (itemId: string | null) => void;
  multiSelect?: boolean;
  showClearAll?: boolean;

  size?: 'sm' | 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export const FilterGroup = React.memo(
  <T extends FilterItem>({
    label,
    items,
    activeItemId,
    activeItemIds = [],
    onSelect,
    multiSelect = false,
    showClearAll = true,
    size = 'md',
    direction = 'horizontal',
    className,
  }: FilterGroupProps<T>) => {
    const getIsActive = React.useCallback(
      (itemId: string): boolean => {
        if (multiSelect) {
          return activeItemIds.includes(itemId);
        }
        return activeItemId === itemId;
      },
      [activeItemId, activeItemIds, multiSelect],
    );

    const handleItemClick = React.useCallback(
      (itemId: string) => {
        if (multiSelect) {
          const isCurrentlyActive = activeItemIds.includes(itemId);
          if (isCurrentlyActive) {
            onSelect(null);
          } else {
            onSelect(itemId);
          }
        } else {
          const isCurrentlyActive = activeItemId === itemId;
          onSelect(isCurrentlyActive ? null : itemId);
        }
      },
      [activeItemId, activeItemIds, multiSelect, onSelect],
    );

    const handleClearAll = React.useCallback(() => {
      onSelect(null);
    }, [onSelect]);

    const hasActiveFilters = multiSelect
      ? activeItemIds.length > 0
      : activeItemId !== null;

    return (
      <div
        className={cn('flex flex-col gap-2', className)}
        role="group"
        aria-label={label}
      >
        {}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
          {showClearAll && hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              aria-label={ARIA_LABELS.CLEAR_ALL_FILTERS}
              className="h-6 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              {UI_LABELS.CLEAR_FILTERS}
            </Button>
          )}
        </div>

        {}
        <div
          className={cn(
            'flex flex-wrap gap-2',
            direction === 'vertical' && 'flex-col',
          )}
        >
          {items.map((item) => {
            const isActive = getIsActive(item.id);

            return (
              <Button
                key={item.id}
                variant={isActive ? 'primary' : 'outline'}
                size={size}
                onClick={() => handleItemClick(item.id)}
                leftIcon={item.icon}
                aria-pressed={isActive}
                aria-label={
                  isActive
                    ? `${item.name} filter active. Click to remove.`
                    : `Filter by ${item.name}`
                }
                className={cn(
                  'transition-all',
                  isActive && 'ring-2 ring-brand-primary ring-offset-2',
                )}
              >
                <span>{item.name}</span>
                {item.count !== undefined && (
                  <Badge
                    variant={isActive ? 'outline' : 'default'}
                    size="sm"
                    className={cn(
                      'ml-1',
                      isActive && 'border-white/30 bg-white/20 text-white',
                    )}
                  >
                    {item.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {}
        <div className="sr-only" role="status" aria-live="polite">
          {hasActiveFilters
            ? multiSelect
              ? `${activeItemIds.length} filter${
                  activeItemIds.length === 1 ? '' : 's'
                } active`
              : `1 filter active: ${
                  items.find((i) => i.id === activeItemId)?.name
                }`
            : 'No filters active'}
        </div>
      </div>
    );
  },
);

FilterGroup.displayName = 'FilterGroup';
