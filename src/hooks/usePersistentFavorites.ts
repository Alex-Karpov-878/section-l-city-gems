import { useEffect, useRef } from 'react';
import { useFavoriteGemIds, useKioskActions } from '@/store/kiosk-store';
import { createLogger } from '@/lib/logger';

const logger = createLogger('usePersistentFavorites');
const STORAGE_KEY = 'kiosk-favorites';
const WRITE_DEBOUNCE_MS = 500;
function serializeFavorites(favoriteIds: Set<number>): string {
  return JSON.stringify(Array.from(favoriteIds));
}

function deserializeFavorites(json: string): Set<number> {
  try {
    const array = JSON.parse(json) as unknown;
    if (!Array.isArray(array)) {
      logger.warn('Invalid favorites data in localStorage (not an array)');
      return new Set();
    }

    const numbers = array.filter(
      (item): item is number => typeof item === 'number',
    );

    if (numbers.length !== array.length) {
      logger.warn('Some favorite IDs were not numbers', {
        total: array.length,
        valid: numbers.length,
      });
    }
    return new Set(numbers);
  } catch (error) {
    logger.error('Failed to deserialize favorites from localStorage', error);
    return new Set();
  }
}

function loadFavorites(): Set<number> | null {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  ) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      logger.debug('No favorites found in localStorage');
      return null;
    }

    const favorites = deserializeFavorites(stored);
    logger.info('Loaded favorites from localStorage', {
      count: favorites.size,
    });
    return favorites;
  } catch (error) {
    logger.error('Failed to load favorites from localStorage', error);
    return null;
  }
}

function saveFavorites(favoriteIds: Set<number>): void {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  ) {
    return;
  }

  try {
    const serialized = serializeFavorites(favoriteIds);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    logger.debug('Saved favorites to localStorage', {
      count: favoriteIds.size,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      logger.error(
        'localStorage quota exceeded - cannot save favorites',
        error,
      );
    } else {
      logger.error('Failed to save favorites to localStorage', error);
    }
  }
}

function clearFavorites(): void {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  ) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    logger.debug('Cleared favorites from localStorage');
  } catch (error) {
    logger.error('Failed to clear favorites from localStorage', error);
  }
}

export function usePersistentFavorites(): void {
  const favoriteGemIds = useFavoriteGemIds();
  const { addFavorite } = useKioskActions();
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isInitializedRef = useRef(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    const stored = loadFavorites();
    if (stored && stored.size > 0) {
      logger.info('Restoring favorites from localStorage', {
        count: stored.size,
      });
      stored.forEach((gemId) => {
        addFavorite(gemId);
      });
    }

    isInitializedRef.current = true;
  }, [addFavorite]);

  // Save favorites to localStorage when they change (debounced)
  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (favoriteGemIds.size === 0) {
        clearFavorites();
      } else {
        saveFavorites(favoriteGemIds);
      }
    }, WRITE_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [favoriteGemIds]);
}

export const favoritesStorage = {
  load: loadFavorites,
  save: saveFavorites,
  clear: clearFavorites,
  storageKey: STORAGE_KEY,
};
