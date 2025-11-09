// Base interface for common Strapi entity fields to keep types DRY.
interface StrapiEntity {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  localizations: unknown[];
}

export interface ApiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface OneDayItinerary extends StrapiEntity {
  description: string | null;
  mapColorHex: string;
  personaName: string | null;
}

export interface Property extends StrapiEntity {
  name: string;
  acronym: string;
  bookingPage: string;
  slug: string;
  description: string | null;
  lobbyWifiSSID: string | null;
  artist_depracated?: unknown | null;
  neighborhoods: Neighborhood[];
  map_pin: MapPin | null;
  offers: Offer[];
  room_types: RoomType[];
  property_type: PropertyType | null;
  carousel_images: UploadFile[];
  access_points: AccessPoint[];
  artworks: Artwork[];
  happy_hours: HappyHour[];
}

export interface Neighborhood extends StrapiEntity {
  name: string;
  hashtagOne: string;
  description: string | null;
  hashtagTwo: string | null;
  slug: string;
  hashtagOneDescription: string | null;
  hashtagTwoDescription: string | null;
  city_gems: CityGem[];
  properties: Partial<Property>[];
  city: City | null;
  map_pin: MapPin | null;
  offers: Offer[];
  one_day_itinerary: OneDayItinerary | null;
  tags: Tag[];
  vibes: Vibe[];
  cardImage: UploadFile | null;
  carousel_images: UploadFile[];
  hashtagOneIcon: UploadFile | null;
  hashtagTwoIcon: UploadFile | null;
}

export interface CityGem extends StrapiEntity {
  name: string;
  category: Category;
  shortDescription: string;
  longDescription: string;
  googleMapsUrl: string;
  tip: string | null;
  slug: string;
  substatus: "WIP" | null;
  coverImage: UploadFile;
  icon: UploadFile | null;
  neighborhoods: Partial<Neighborhood>[];
  tags: Tag[];
}

export interface MapPin {
  id: number;
  documentId: string;
  name: string;
  type: "property" | "neighborhood";
  lat: number;
  lng: number;
  geohash: string;
  map?: {
    lat: number;
    lng: number;
  };
}

export interface Offer extends StrapiEntity {
  name: string;
  shortDescription: string;
  claimOfferUrl: string;
  slug: string;
}

export interface RoomType extends StrapiEntity {
  name: string;
  roomCleaningFee: number;
  floorArea: string;
  description: string;
  bookingEngineRoomId: string | null;
}

export interface PropertyType {
  id: number;
  documentId: string;
  name: "Residences" | "Apart-Hotels";
  carouselSectionHeaderTitle: string;
  carouselSectionHeaderDescription: string;
}

export interface AccessPoint extends StrapiEntity {
  name: string;
  description: string | null;
  isTrainStation: boolean | null;
  isAirport: boolean | null;
}

export interface Artwork extends StrapiEntity {
  name: string;
  description: string | null;
}

export interface HappyHour {
  id: number;
  startTime: string;
  endTime: string;
  dayOfWeek:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
}

export interface Tag extends StrapiEntity {
  name: string;
  type: string | null;
}

export interface Vibe extends StrapiEntity {
  name: string;
  slug: string;
}

export interface City extends StrapiEntity {
  name: string;
  slug: string;
}

export interface UploadFile extends StrapiEntity {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: {
    large?: FileFormat;
    small?: FileFormat;
    medium?: FileFormat;
    thumbnail?: FileFormat;
  } | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: Record<string, unknown> | null;
  isUrlSigned: boolean;
}

export interface FileFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
  isUrlSigned?: boolean;
}

export type Category = "Food & Drink" | "Shopping" | "Culture";
