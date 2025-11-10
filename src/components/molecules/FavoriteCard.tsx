'use client';

import * as React from 'react';
import Image from 'next/image';
import { X, MapPin } from 'lucide-react';
import { Card, Badge, Button } from '@/components/atoms';
import { CityGem } from '@/types/api';
import { cn } from '@/lib/utils';
import { TEST_IDS, ARIA_LABELS, IMAGE_SIZES } from '@/constants';

export interface FavoriteCardProps {
  gem: CityGem;
  onClick: () => void;
  onRemove: () => void;
  variant?: 'compact' | 'expanded';
  className?: string;
}

export const FavoriteCard = React.memo<FavoriteCardProps>(
  ({ gem, onClick, onRemove, variant = 'compact', className }) => {
    const handleClick = React.useCallback(() => {
      onClick();
    }, [onClick]);

    const handleRemove = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
      },
      [onRemove],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      },
      [handleClick],
    );

    const imageUrl =
      gem.coverImage?.formats?.thumbnail?.url ||
      gem.coverImage?.formats?.small?.url ||
      gem.coverImage?.url;

    if (variant === 'compact') {
      return (
        <Card
          variant="outlined"
          padding="sm"
          clickable
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn('group', 'hover:bg-gray-50', className)}
          tabIndex={0}
          role="button"
          aria-label={ARIA_LABELS.GEM_CARD(gem.name)}
          data-testid={TEST_IDS.FAVORITE_ITEM(gem.id)}
        >
          <div className="flex items-center gap-3">
            {}
            {imageUrl && (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={gem.coverImage?.alternativeText || gem.name}
                  fill
                  className="object-cover"
                  sizes={IMAGE_SIZES.THUMBNAIL}
                />
              </div>
            )}

            {}
            <div className="min-w-0 flex-grow">
              <p className="truncate text-sm font-medium text-gray-900">
                {gem.name}
              </p>
              <p className="truncate text-xs text-gray-500">{gem.category}</p>
            </div>

            {}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className={cn(
                'h-6 w-6 flex-shrink-0 rounded-full',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity',
                'hover:bg-red-100 hover:text-red-600',
              )}
              aria-label={ARIA_LABELS.REMOVE_FROM_FAVORITES(gem.name)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <Card
        variant="outlined"
        padding="none"
        clickable
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn('group overflow-hidden', className)}
        tabIndex={0}
        role="button"
        aria-label={ARIA_LABELS.GEM_CARD(gem.name)}
        data-testid={TEST_IDS.FAVORITE_ITEM(gem.id)}
      >
        {}
        {imageUrl && (
          <div className="relative h-32 w-full bg-gray-100">
            <Image
              src={imageUrl}
              alt={gem.coverImage?.alternativeText || gem.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={IMAGE_SIZES.GEM_CARD}
            />

            {}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className={cn(
                'absolute right-2 top-2 z-10',
                'h-7 w-7 rounded-full',
                'bg-white/90 shadow-md backdrop-blur-sm',
                'hover:bg-white hover:text-red-600',
              )}
              aria-label={ARIA_LABELS.REMOVE_FROM_FAVORITES(gem.name)}
            >
              <X className="h-4 w-4" />
            </Button>

            {}
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" size="sm" className="backdrop-blur-sm">
                {gem.category}
              </Badge>
            </div>
          </div>
        )}

        {}
        <div className="p-3">
          <h4 className="line-clamp-1 font-semibold text-gray-900">
            {gem.name}
          </h4>
          <p className="mt-1 line-clamp-2 text-xs text-gray-600">
            {gem.shortDescription}
          </p>

          {}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            <span className="truncate">
              {gem.neighborhoods?.[0]?.name || 'Location'}
            </span>
          </div>
        </div>
      </Card>
    );
  },
);

FavoriteCard.displayName = 'FavoriteCard';
