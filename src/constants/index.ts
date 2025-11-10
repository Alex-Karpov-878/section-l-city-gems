export const ROUTES = {
  HOME: '/',
  CONFIG: '/config',
  PROPERTY: (slug: string) => `/properties/${slug}`,
  SHARE: (shareId: string) => `/share/${shareId}`,
  API: {
    PROPERTIES: '/properties',
    CITY_GEMS: '/city-gems',
  },
} as const;

export const QUERY_KEYS = {
  PROPERTIES: 'properties',
  PROPERTY: (slug: string) => ['property', slug] as const,
  ALL_GEMS: 'allGems',
  GEMS_BY_IDS: (ids: number[]) => ['gems', 'byIds', ids] as const,
} as const;

export const CATEGORIES = {
  FOOD_AND_DRINK: 'Food & Drink',
  SHOPPING: 'Shopping',
  CULTURE: 'Culture',
} as const;

export type CategoryType = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export const TIMING = {
  DEBOUNCE_DELAY: 300,
  INACTIVITY_TIMEOUT: 300000,
  INACTIVITY_CHECK_INTERVAL: 10000,
  MULTI_TAP_WINDOW: 800,
  REFRESH_ANIMATION_DURATION: 500,
  STALE_TIME: 300000,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
} as const;

export const INTERACTION = {
  LOGO_TAPS_FOR_REFRESH: 3,
  LOGO_TAPS_FOR_CONFIG: 5,
  MAX_FAVORITES: 50,
  SEARCH_MIN_LENGTH: 2,
} as const;

export const TEST_IDS = {
  LOGO_CONTAINER: 'logo-container',
  MAIN_LAYOUT: 'main-layout',
  CONFIG_LAYOUT: 'config-layout',
  SHARED_LAYOUT: 'shared-layout',
  HEADER: 'header',
  MAIN_CONTENT: 'main-content',
  NEIGHBORHOOD_NAV_SIDEBAR: 'neighborhood-nav-sidebar',
  FAVORITES_SIDEBAR: 'favorites-sidebar',
  CONFIG_CONTENT: 'config-content',

  SEARCH_INPUT: 'search-input',
  SEARCH_CLEAR_BUTTON: 'search-clear-button',
  CATEGORY_FILTER: (category: string) => `category-filter-${category}`,
  VIBE_FILTER: (vibe: string) => `vibe-filter-${vibe}`,
  CLEAR_FILTERS_BUTTON: 'clear-filters-button',

  GEM_CARD: (slug: string) => `gem-card-${slug}`,
  GEM_CARD_FAVORITE_BUTTON: (slug: string) => `gem-card-favorite-${slug}`,
  GEM_DETAIL_MODAL: 'gem-detail-modal',
  GEM_DETAIL_CLOSE: 'gem-detail-close',
  GEM_DETAIL_MAPS_LINK: 'gem-detail-maps-link',

  FAVORITES_PANEL: 'favorites-panel',
  FAVORITES_EMPTY_STATE: 'favorites-empty-state',
  FAVORITE_ITEM: (id: number) => `favorite-item-${id}`,
  FAVORITES_CLEAR_ALL: 'favorites-clear-all',
  FAVORITES_QR_BUTTON: 'favorites-qr-button',

  NEIGHBORHOOD_NAV: 'neighborhood-nav',
  NEIGHBORHOOD_NAV_ITEM: (name: string) => `neighborhood-nav-item-${name}`,
  NEIGHBORHOOD_LINK: (slug: string) => `neighborhood-link-${slug}`,
  GEM_FEED: 'gem-feed',
  SHARED_GEMS_LIST: 'shared-gems-list',

  CONFIG_PAGE: 'config-page',
  PROPERTY_SELECT_BUTTON: (slug: string) => `property-select-${slug}`,

  LOADING_SPINNER: 'loading-spinner',
  ERROR_MESSAGE: 'error-message',
  EMPTY_STATE: 'empty-state',

  QR_CODE_MODAL: 'qr-code-modal',
  QR_CODE_IMAGE: 'qr-code-image',
  QR_CODE_DOWNLOAD: 'qr-code-download',
} as const;

export const ARIA_LABELS = {
  MAIN_NAV: 'Main navigation',
  NEIGHBORHOOD_NAV: 'Neighborhood navigation',
  SKIP_TO_CONTENT: 'Skip to main content',
  LOGO: 'Section L Logo',
  HEADER: 'Page header',
  MAIN_CONTENT: 'Main content area',

  SEARCH_INPUT: 'Search city gems',
  CLEAR_SEARCH: 'Clear search query',
  FILTER_BY_CATEGORY: 'Filter by category',
  FILTER_BY_VIBE: 'Filter by vibe',
  CLEAR_ALL_FILTERS: 'Clear all filters',
  ACTIVE_FILTER: 'Active filter',

  GEM_FEED: 'City gems feed',
  GEM_CARD: (name: string) => `View details for ${name}`,
  ADD_TO_FAVORITES: (name: string) => `Add ${name} to favorites`,
  REMOVE_FROM_FAVORITES: (name: string) => `Remove ${name} from favorites`,
  OPEN_IN_MAPS: (name: string) => `Open ${name} in Google Maps`,
  NEIGHBORHOOD_LINK: (name: string, count: number) => `${name} - ${count} gems`,
  GEM_DETAIL_MODAL: 'Gem detail modal',
  GEM_DETAIL_OVERLAY: 'Modal overlay',
  GEM_DETAIL_MAPS_BUTTON: 'Open in Google Maps button',
  GEM_DETAIL_FAVORITE_BUTTON: 'Toggle favorite button',
  GEM_DETAIL_CLOSE: 'Close button',

  FAVORITES_PANEL: 'Your favorite places',
  FAVORITES_COUNT: (count: number) =>
    `${count} favorite${count !== 1 ? 's' : ''}`,
  CLEAR_ALL_FAVORITES: 'Clear all favorites',
  GENERATE_QR_CODE: 'Generate QR code for favorites',

  CLOSE_MODAL: 'Close modal',
  CLOSE_DIALOG: 'Close dialog',

  SELECT_PROPERTY: (name: string) => `Select ${name} property`,

  LOADING: 'Loading content',
  ERROR_OCCURRED: 'An error occurred',
} as const;

export const UI_LABELS = {
  APP_NAME: 'Section L City Gems',
  KIOSK_MODE: 'Kiosk Mode',

  SEARCH_PLACEHOLDER: 'Search for sushi, cafes, museums...',
  SEARCH_NO_RESULTS: 'No gems found matching your search',
  SEARCH_RESULTS: (count: number) =>
    `${count} result${count !== 1 ? 's' : ''} found`,

  CATEGORIES_LABEL: 'Categories',
  VIBES_LABEL: 'Vibes',
  ALL_CATEGORIES: 'All Categories',
  ALL_VIBES: 'All Vibes',
  CLEAR_FILTERS: 'Clear Filters',
  ACTIVE_FILTERS: (count: number) =>
    `${count} active filter${count !== 1 ? 's' : ''}`,

  FAVORITES_TITLE: 'Your List',
  FAVORITES_EMPTY: 'No favorites yet',
  FAVORITES_EMPTY_DESCRIPTION:
    'Tap the heart icon on any gem to add it to your list',
  ADD_TO_FAVORITES: 'Add to List',
  REMOVE_FROM_FAVORITES: 'Remove from List',
  FAVORITED: 'Favorited',

  OPEN_IN_MAPS: 'Map',
  CLOSE: 'Close',
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',
  SAVE: 'Save',
  CLEAR_ALL: 'Clear All',
  GENERATE_QR: 'Generate QR Code',
  DOWNLOAD_QR: 'Download QR Code',

  CONFIG_TITLE: 'Kiosk Configuration',
  CONFIG_DESCRIPTION: 'Please select the property for this device.',
  SELECT_PROPERTY: 'Select Property',

  LOADING_KIOSK: 'Initializing Kiosk...',
  LOADING_DATA: 'Loading Kiosk Data...',
  LOADING_GEMS: 'Loading City Gems...',
  LOADING_PROPERTY: 'Loading Property Information...',

  ERROR_TITLE: 'Failed to Load Data',
  ERROR_DESCRIPTION: 'Could not retrieve information for this property.',
  ERROR_RETRY: 'Retry',
  ERROR_GO_HOME: 'Go Home',
  ERROR_NETWORK: 'Network connection error',
  ERROR_NOT_FOUND: 'Resource not found',
  ERROR_SERVER: 'Server error',
  ERROR_UNKNOWN: 'An unknown error occurred',

  NEIGHBORHOODS_LABEL: 'Neighborhoods',
  NEIGHBORHOODS_TITLE: 'Neighborhoods',
  EXPLORE_NEIGHBORHOOD: 'Explore',
  NO_NEIGHBORHOODS_FOUND: 'No Neighborhoods Found',

  NO_GEMS_FOUND: 'No Gems Found',
  NO_GEMS_DESCRIPTION: 'Try adjusting your search or filter criteria.',
  MY_LIST_LABEL: 'My List',
  FAVORITES_EMPTY_TITLE: 'Your list is empty',
  ADD_TO_LIST: 'Add to List',

  QR_CODE_TITLE: 'Your Favorites QR Code',
  QR_CODE_DESCRIPTION:
    'Scan this code to access your favorites on your mobile device',
  QR_CODE_SHARE_URL: 'Share URL',

  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
  SHARE_LINK_GENERATED: 'Share link generated',
  DATA_REFRESHED: 'Data refreshed',
} as const;

export const IMAGE_SIZES = {
  GEM_CARD: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  GEM_DETAIL: '(max-width: 768px) 90vw, 50vw',
  NEIGHBORHOOD_CARD: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  THUMBNAIL: '(max-width: 768px) 25vw, 10vw',
  SHARED_GEM: '(max-width: 640px) 100vw, 672px',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 10,
  STICKY: 20,
  OVERLAY: 30,
  MODAL: 40,
  POPOVER: 50,
  TOAST: 60,
  TOOLTIP: 70,
} as const;

export const API_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 50000,
  BASE_URL: process.env['NEXT_PUBLIC_API_BASE_URL'] || '/api',
  EXTERNAL_API_URL:
    process.env['NEXT_PUBLIC_STRAPI_URL'] || 'http://localhost:1337',
} as const;

export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type QueryKey = keyof typeof QUERY_KEYS;
export type TestId = (typeof TEST_IDS)[keyof typeof TEST_IDS];
export type AriaLabel = (typeof ARIA_LABELS)[keyof typeof ARIA_LABELS];
export type UILabel = (typeof UI_LABELS)[keyof typeof UI_LABELS];
