'use client';

import * as React from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/atoms';
import { Property } from '@/types/api';
import { cn } from '@/lib/utils';
import { TEST_IDS, ARIA_LABELS } from '@/constants';

export interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  isSelected?: boolean;
  showNeighborhoodsCount?: boolean;
  className?: string;
}

export const PropertyCard = React.memo<PropertyCardProps>(
  ({
    property,
    onSelect,
    isSelected = false,
    showNeighborhoodsCount = true,
    className,
  }) => {
    const handleClick = React.useCallback(() => {
      onSelect(property);
    }, [onSelect, property]);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      },
      [handleClick],
    );

    const neighborhoodsCount = property.neighborhoods?.length || 0;

    return (
      <Card
        variant={isSelected ? 'elevated' : 'outlined'}
        clickable
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'group transition-all duration-200',
          isSelected && 'shadow-lg ring-2 ring-brand-primary',
          className,
        )}
        tabIndex={0}
        role="button"
        aria-label={ARIA_LABELS.SELECT_PROPERTY(property.name)}
        aria-pressed={isSelected}
        data-testid={TEST_IDS.PROPERTY_SELECT_BUTTON(property.slug)}
      >
        <div className="flex items-center gap-4">
          {}
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
              isSelected
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary',
            )}
            aria-hidden="true"
          >
            <Building2 className="h-6 w-6" />
          </div>

          {}
          <div className="min-w-0 flex-grow">
            <CardTitle className="text-lg">{property.name}</CardTitle>
            <CardDescription className="mt-1">
              {property.acronym}
              {showNeighborhoodsCount && neighborhoodsCount > 0 && (
                <span className="ml-2 text-xs">
                  • {neighborhoodsCount} neighborhood
                  {neighborhoodsCount !== 1 ? 's' : ''}
                </span>
              )}
            </CardDescription>
            {property.description && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                {property.description}
              </p>
            )}
          </div>

          {}
          <ChevronRight
            className={cn(
              'h-5 w-5 flex-shrink-0 transition-transform',
              'group-hover:translate-x-1',
              isSelected ? 'text-brand-primary' : 'text-gray-400',
            )}
            aria-hidden="true"
          />
        </div>
      </Card>
    );
  },
);

PropertyCard.displayName = 'PropertyCard';
