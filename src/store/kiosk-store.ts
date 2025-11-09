import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";
import { enableMapSet } from "immer";
import { Property, Category } from "@/types/api";
import { TIMING } from "@/constants";
import { createLogger } from "@/lib/logger";

enableMapSet();

const logger = createLogger("KioskStore");
interface KioskState {
  property: Property | null;
  searchQuery: string;
  activeCategory: Category | null;
  favoriteGemIds: Set<number>;
  lastActivity: number;

  hasActiveFilters: () => boolean;
  favoriteCount: () => number;
  isFavorite: (gemId: number) => boolean;
}

interface KioskActions {
  setProperty: (property: Property) => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: Category | null) => void;
  clearFilters: () => void;

  toggleFavorite: (gemId: number) => void;
  addFavorite: (gemId: number) => void;
  removeFavorite: (gemId: number) => void;
  clearFavorites: () => void;
  isFavorite: (gemId: number) => boolean;

  updateActivity: () => void;

  resetSession: () => void;
  resetToInitialState: () => void;
}

export type KioskStore = KioskState & KioskActions;

const getInitialState = (): KioskState => ({
  property: null,
  searchQuery: "",
  activeCategory: null,

  favoriteGemIds: new Set<number>(),
  lastActivity: Date.now(),

  hasActiveFilters: function () {
    return !!(this.searchQuery || this.activeCategory);
  },
  favoriteCount: function () {
    return this.favoriteGemIds.size;
  },
  isFavorite: function (gemId: number) {
    return this.favoriteGemIds.has(gemId);
  },
});

export const useKioskStore = create<KioskStore>()(
  devtools(
    immer((set, get) => ({
      ...getInitialState(),

      setProperty: (property) =>
        set(
          (state) => {
            state.property = property;
            logger.info("Property set", {
              propertyName: property.name,
              slug: property.slug,
            });
          },
          false,
          "setProperty"
        ),

      setSearchQuery: (query) =>
        set(
          (state) => {
            state.searchQuery = query;
            state.lastActivity = Date.now();
          },
          false,
          "setSearchQuery"
        ),

      setActiveCategory: (category) =>
        set(
          (state) => {
            state.activeCategory = category;
            state.lastActivity = Date.now();
          },
          false,
          "setActiveCategory"
        ),

      clearFilters: () =>
        set(
          (state) => {
            state.searchQuery = "";
            state.activeCategory = null;
            state.lastActivity = Date.now();
          },
          false,
          "clearFilters"
        ),

      toggleFavorite: (gemId) =>
        set(
          (state) => {
            if (state.favoriteGemIds.has(gemId)) {
              state.favoriteGemIds.delete(gemId);
            } else {
              state.favoriteGemIds.add(gemId);
            }
            state.lastActivity = Date.now();
          },
          false,
          "toggleFavorite"
        ),

      addFavorite: (gemId) =>
        set(
          (state) => {
            state.favoriteGemIds.add(gemId);
            state.lastActivity = Date.now();
          },
          false,
          "addFavorite"
        ),

      removeFavorite: (gemId) =>
        set(
          (state) => {
            state.favoriteGemIds.delete(gemId);
            state.lastActivity = Date.now();
          },
          false,
          "removeFavorite"
        ),

      clearFavorites: () =>
        set(
          (state) => {
            state.favoriteGemIds = new Set();
            state.lastActivity = Date.now();
          },
          false,
          "clearFavorites"
        ),

      isFavorite: (gemId) => get().favoriteGemIds.has(gemId),

      updateActivity: () =>
        set(
          (state) => {
            state.lastActivity = Date.now();
          },
          false,
          "updateActivity"
        ),

      resetSession: () =>
        set(
          (state) => {
            const currentProperty = state.property;
            Object.assign(state, getInitialState());
            state.property = currentProperty;
            logger.info("Session reset (property preserved)");
          },
          false,
          "resetSession"
        ),

      resetToInitialState: () =>
        set(
          (state) => {
            Object.assign(state, getInitialState());
            logger.info("Store reset to initial state");
          },
          false,
          "resetToInitialState"
        ),
    })),
    {
      name: "kiosk-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

export const useProperty = () => useKioskStore((state) => state.property);
export const useSearchQuery = () => useKioskStore((state) => state.searchQuery);
export const useActiveCategory = () =>
  useKioskStore((state) => state.activeCategory);
export const useFavoriteGemIds = () =>
  useKioskStore((state) => state.favoriteGemIds);
export const useFavoriteCount = () =>
  useKioskStore((state) => state.favoriteGemIds.size);
export const useHasActiveFilters = () =>
  useKioskStore((state) => !!(state.searchQuery || state.activeCategory));
export const useLastActivity = () =>
  useKioskStore((state) => state.lastActivity);

export const useIsFavorite = (gemId: number) =>
  useKioskStore((state) => state.favoriteGemIds.has(gemId));

export const useFilters = () =>
  useKioskStore((state) => ({
    searchQuery: state.searchQuery,
    activeCategory: state.activeCategory,
  }));

export const useKioskActions = () =>
  useKioskStore(
    useShallow((state) => ({
      setProperty: state.setProperty,
      setSearchQuery: state.setSearchQuery,
      setActiveCategory: state.setActiveCategory,
      clearFilters: state.clearFilters,
      toggleFavorite: state.toggleFavorite,
      addFavorite: state.addFavorite,
      removeFavorite: state.removeFavorite,
      clearFavorites: state.clearFavorites,
      updateActivity: state.updateActivity,
      resetSession: state.resetSession,
      resetToInitialState: state.resetToInitialState,
    }))
  );

export function isSessionInactive(): boolean {
  const lastActivity = useKioskStore.getState().lastActivity;
  const now = Date.now();
  return now - lastActivity > TIMING.INACTIVITY_TIMEOUT;
}

export function getStateSnapshot() {
  const state = useKioskStore.getState();
  return {
    property: state.property?.name ?? "None",
    searchQuery: state.searchQuery,
    activeCategory: state.activeCategory,
    favoriteCount: state.favoriteGemIds.size,
    lastActivity: new Date(state.lastActivity).toISOString(),
  };
}
