'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { HeartCrack, Trash2 } from 'lucide-react';
import { QRCodeGenerator, FavoriteCard } from '@/components/molecules';
import { EmptyState, Card, Button } from '@/components/atoms';
import {
  useFavoriteGemIds,
  useProperty,
  useKioskActions,
} from '@/store/kiosk-store';
import { CityGem } from '@/types/api';
import { cn } from '@/lib/utils';
import { ROUTES, TEST_IDS, ARIA_LABELS, UI_LABELS } from '@/constants';

export interface FavoritesPaneProps {
  allGems: CityGem[];
  showQRCode?: boolean;
  qrCodeSize?: number;
  className?: string;
}

export const FavoritesPane = React.memo<FavoritesPaneProps>(
  ({ allGems = [], showQRCode = true, qrCodeSize = 160, className }) => {
    const router = useRouter();

    const favoriteGemIds = useFavoriteGemIds();
    const property = useProperty();
    const { toggleFavorite, clearFavorites } = useKioskActions();

    const favoriteGems = React.useMemo(
      () => allGems.filter((gem) => favoriteGemIds.has(gem.id)),
      [allGems, favoriteGemIds],
    );

    const propertySlug = property?.slug;

    const handleGemClick = React.useCallback(
      (gem: CityGem) => {
        if (propertySlug) {
          void router.push(`${ROUTES.PROPERTY(propertySlug)}?gem=${gem.slug}`, {
            scroll: false,
          });
        }
      },
      [propertySlug, router],
    );

    const handleRemoveFavorite = React.useCallback(
      (gemId: number) => {
        toggleFavorite(gemId);
      },
      [toggleFavorite],
    );

    const handleClearAll = React.useCallback(() => {
      if (window.confirm('Are you sure you want to clear all favorites?')) {
        clearFavorites();
      }
    }, [clearFavorites]);

    const hasFavorites = favoriteGems.length > 0;

    return (
      <div
        className={cn('flex h-full flex-col gap-6', className)}
        data-testid={TEST_IDS.FAVORITES_PANEL}
        role="complementary"
        aria-label={ARIA_LABELS.FAVORITES_PANEL}
      >
        {}
        {showQRCode && (
          <div className="flex-shrink-0">
            <QRCodeGenerator
              gemIds={Array.from(favoriteGemIds)}
              propertySlug={propertySlug}
              size={qrCodeSize}
              showDownload={false}
            />
          </div>
        )}

        {}
        <Card
          variant="default"
          padding="md"
          className="flex min-h-0 flex-grow flex-col"
        >
          {}
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-lg font-bold text-gray-800"
              id="favorites-heading"
            >
              {UI_LABELS.MY_LIST_LABEL}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({favoriteGems.length})
              </span>
            </h2>
            {hasFavorites && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="text-gray-500 hover:bg-red-50 hover:text-red-600"
                aria-label="Clear all favorites"
              >
                Clear All
              </Button>
            )}
          </div>

          {}
          <div
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {hasFavorites
              ? `${favoriteGems.length} favorite gem${
                  favoriteGems.length !== 1 ? 's' : ''
                } in your list`
              : 'Your favorites list is empty'}
          </div>

          {}
          <div className="flex-grow overflow-hidden">
            {hasFavorites ? (
              <div
                className="h-full overflow-y-auto pr-1"
                role="list"
                aria-labelledby="favorites-heading"
              >
                <div className="space-y-3">
                  {favoriteGems.map((gem) => (
                    <div key={gem.id} role="listitem">
                      <FavoriteCard
                        gem={gem}
                        onClick={() => handleGemClick(gem)}
                        onRemove={() => handleRemoveFavorite(gem.id)}
                        variant="compact"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  icon={<HeartCrack className="h-full w-full" />}
                  title={UI_LABELS.FAVORITES_EMPTY_TITLE}
                  description={UI_LABELS.FAVORITES_EMPTY_DESCRIPTION}
                  size="sm"
                />
              </div>
            )}
          </div>

          {}
          {hasFavorites && (
            <div className="mt-4 flex-shrink-0 border-t pt-3">
              <p className="text-center text-xs text-gray-500">
                {favoriteGems.length} of {allGems.length} gems favorited
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  },
);

FavoritesPane.displayName = 'FavoritesPane';
