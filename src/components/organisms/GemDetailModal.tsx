'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, MapPin, Heart, ExternalLink } from 'lucide-react';
import { Button, Badge } from '@/components/atoms';
import {
  useFavoriteGemIds,
  useProperty,
  useKioskActions,
} from '@/store/kiosk-store';
import { CityGem } from '@/types/api';
import { cn } from '@/lib/utils';
import {
  ROUTES,
  TEST_IDS,
  ARIA_LABELS,
  UI_LABELS,
  IMAGE_SIZES,
} from '@/constants';

export interface GemDetailModalProps {
  allGems: CityGem[];
  className?: string;
}

export const GemDetailModal = React.memo<GemDetailModalProps>(
  ({ allGems = [], className }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const property = useProperty();
    const favoriteGemIds = useFavoriteGemIds();
    const { toggleFavorite } = useKioskActions();

    const gemSlug = searchParams.get('gem');

    const gem = React.useMemo(
      () => allGems.find((g) => g.slug === gemSlug),
      [allGems, gemSlug],
    );

    const isFavorite = gem ? favoriteGemIds.has(gem.id) : false;

    const closeButtonRef = React.useRef<HTMLButtonElement>(null);

    const handleClose = React.useCallback(() => {
      if (property?.slug) {
        void router.push(ROUTES.PROPERTY(property.slug), { scroll: false });
      }
    }, [property?.slug, router]);

    const handleToggleFavorite = React.useCallback(() => {
      if (gem) {
        toggleFavorite(gem.id);
      }
    }, [gem, toggleFavorite]);

    const handleMapsClick = React.useCallback(() => {
      if (gem?.googleMapsUrl) {
        window.open(gem.googleMapsUrl, '_blank', 'noopener,noreferrer');
      }
    }, [gem]);

    React.useEffect(() => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      if (gem && closeButtonRef.current) {
        timer = setTimeout(() => {
          closeButtonRef.current?.focus();
        }, 100);
      }

      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [gem]);

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && gem) {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [gem, handleClose]);

    const imageUrl = gem?.coverImage
      ? gem.coverImage.formats?.medium?.url ||
        gem.coverImage.formats?.large?.url ||
        gem.coverImage.url
      : null;

    if (!gem) {
      return null;
    }

    return (
      <AnimatePresence mode="wait">
        <Dialog.Root
          open={!!gem}
          onOpenChange={(open) => !open && handleClose()}
        >
          <Dialog.Portal forceMount>
            {}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                data-testid={TEST_IDS.GEM_DETAIL_MODAL}
              />
            </Dialog.Overlay>

            {}
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  duration: 0.3,
                }}
                className={cn(
                  'fixed inset-0 z-50',
                  'flex items-center justify-center',
                  'p-4',
                  className,
                )}
                data-testid={TEST_IDS.GEM_DETAIL_MODAL}
              >
                <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl md:p-8">
                  {}
                  <Dialog.Close asChild>
                    <Button
                      ref={closeButtonRef}
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className={cn(
                        'absolute right-3 top-3 z-10',
                        'rounded-full bg-white/90 shadow-md backdrop-blur-sm',
                        'hover:bg-gray-100',
                      )}
                      aria-label={ARIA_LABELS.CLOSE_MODAL}
                      data-testid={TEST_IDS.GEM_DETAIL_CLOSE}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </Dialog.Close>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                    {}
                    <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100 md:h-full">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={
                            gem.coverImage?.alternativeText ||
                            `Photo of ${gem.name}`
                          }
                          fill
                          className="object-cover"
                          sizes={IMAGE_SIZES.GEM_DETAIL}
                          priority
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-sm text-gray-400">
                            No image available
                          </p>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="flex flex-col">
                      {}
                      <Dialog.Title className="text-3xl font-bold text-gray-900">
                        {gem.name}
                      </Dialog.Title>

                      <Badge
                        variant="secondary"
                        size="md"
                        className="mt-2 w-fit"
                      >
                        {gem.category}
                      </Badge>

                      {}
                      <Dialog.Description className="mt-4 flex-grow text-base leading-relaxed text-gray-700">
                        {gem.longDescription || gem.shortDescription}
                      </Dialog.Description>

                      {}
                      {gem.tags && gem.tags.length > 0 && (
                        <div className="mt-4">
                          <h3 className="mb-2 text-sm font-semibold text-gray-700">
                            Tags
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {gem.tags.map((tag) => (
                              <Badge key={tag.id} variant="outline" size="sm">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {}
                      {gem.neighborhoods && gem.neighborhoods.length > 0 && (
                        <div className="mt-4">
                          <p className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" aria-hidden="true" />
                            <span>{gem.neighborhoods[0]?.name}</span>
                          </p>
                        </div>
                      )}

                      {}
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        {}
                        {gem.googleMapsUrl && (
                          <Button
                            onClick={handleMapsClick}
                            variant="primary"
                            size="lg"
                            leftIcon={<MapPin className="h-5 w-5" />}
                            rightIcon={<ExternalLink className="h-4 w-4" />}
                            className="flex-1"
                            aria-label={ARIA_LABELS.OPEN_IN_MAPS(gem.name)}
                            data-testid={TEST_IDS.GEM_DETAIL_MAPS_LINK}
                          >
                            {UI_LABELS.OPEN_IN_MAPS}
                          </Button>
                        )}

                        {}
                        <Button
                          onClick={handleToggleFavorite}
                          variant={isFavorite ? 'secondary' : 'outline'}
                          size="lg"
                          leftIcon={
                            <Heart
                              className={cn(
                                'h-5 w-5 transition-all',
                                isFavorite && 'fill-current text-red-500',
                              )}
                            />
                          }
                          className={cn(
                            'flex-1 transition-colors',
                            isFavorite
                              ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                              : 'hover:border-red-300 hover:text-red-600',
                          )}
                          aria-label={
                            isFavorite
                              ? ARIA_LABELS.REMOVE_FROM_FAVORITES(gem.name)
                              : ARIA_LABELS.ADD_TO_FAVORITES(gem.name)
                          }
                          aria-pressed={isFavorite}
                          data-testid={`gem-detail-favorite-button`}
                        >
                          {isFavorite
                            ? UI_LABELS.FAVORITED
                            : UI_LABELS.ADD_TO_LIST}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="sr-only" role="status" aria-live="polite">
                    Viewing details for {gem.name}.{' '}
                    {isFavorite ? 'Added to favorites.' : ''}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </AnimatePresence>
    );
  },
);

GemDetailModal.displayName = 'GemDetailModal';
