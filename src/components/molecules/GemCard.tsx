'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '@/components/atoms';
import { CityGem } from '@/types/api';
import { cn } from '@/lib/utils';
import { useProperty } from '@/store/kiosk-store';
import { ROUTES, TEST_IDS, ARIA_LABELS, IMAGE_SIZES } from '@/constants';

export interface GemCardProps {
  gem: CityGem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  disableAnimations?: boolean;
  imagePriority?: boolean;
}

export const GemCard = React.memo<GemCardProps>(
  ({
    gem,
    isFavorite,
    onToggleFavorite,
    disableAnimations = false,
    imagePriority = false,
  }) => {
    const router = useRouter();
    const property = useProperty();

    const handleCardClick = React.useCallback(() => {
      if (property?.slug) {
        router.push(`${ROUTES.PROPERTY(property.slug)}?gem=${gem.slug}`, {
          scroll: false,
        });
      }
    }, [property?.slug, gem.slug, router]);

    const handleFavoriteClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite();
      },
      [onToggleFavorite],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      },
      [handleCardClick],
    );

    const imageUrl =
      gem.coverImage?.formats?.small?.url ||
      gem.coverImage?.formats?.medium?.url ||
      gem.coverImage?.url;

    if (!imageUrl) {
      return (
        <Card
          variant="outlined"
          padding="none"
          className={cn(
            'flex h-[280px] items-center justify-center',
            'cursor-not-allowed opacity-60',
          )}
          data-testid={TEST_IDS.GEM_CARD(gem.slug)}
        >
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">Image not available</p>
            <p className="mt-1 font-semibold text-gray-700">{gem.name}</p>
          </div>
        </Card>
      );
    }

    const cardContent = (
      <Card
        variant="outlined"
        padding="none"
        clickable
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'group overflow-hidden',
          'transition-all duration-300',
          isFavorite && 'bg-red-50/30 ring-2 ring-red-200',
        )}
        tabIndex={0}
        role="button"
        aria-label={ARIA_LABELS.GEM_CARD(gem.name)}
        data-testid={TEST_IDS.GEM_CARD(gem.slug)}
      >
        {}
        <div className="relative h-40 w-full overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={gem.coverImage?.alternativeText || `Photo of ${gem.name}`}
            fill
            priority={imagePriority}
            loading={imagePriority ? undefined : 'lazy'}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={IMAGE_SIZES.GEM_CARD}
          />

          {}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className={cn(
              'absolute right-3 top-3 z-10',
              'h-9 w-9 rounded-full',
              'bg-white/90 shadow-md backdrop-blur-sm',
              'hover:scale-110 hover:bg-white',
              'active:scale-95',
              'focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
            )}
            aria-label={ARIA_LABELS[
              isFavorite ? 'REMOVE_FROM_FAVORITES' : 'ADD_TO_FAVORITES'
            ](gem.name)}
            data-testid={TEST_IDS.GEM_CARD_FAVORITE_BUTTON(gem.slug)}
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-colors',
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600 group-hover:text-red-500',
              )}
              aria-hidden="true"
            />
          </Button>

          {}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" size="sm" className="backdrop-blur-sm">
              {gem.category}
            </Badge>
          </div>
        </div>

        {}
        <div className="p-4">
          <h3 className="line-clamp-1 font-bold text-gray-900 transition-colors group-hover:text-brand-primary">
            {gem.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {gem.shortDescription}
          </p>

          {}
          {gem.tags && gem.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {gem.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" size="sm">
                  {tag.name}
                </Badge>
              ))}
              {gem.tags.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{gem.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    );

    if (!disableAnimations) {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: 'easeOut',
          }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  },
);

GemCard.displayName = 'GemCard';
