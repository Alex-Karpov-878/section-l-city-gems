// Wrapper for API list responses
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

// Core Entities
export interface Property {
  id: number;
  documentId: string;
  name: string;
  acronym: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  bookingPage: string;
  slug: string;
  description: string | null;
  lobbyWifiSSID: string | null;
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

export interface Neighborhood {
  id: number;
  documentId: string;
  name: string;
  hashtagOne: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  hashtagTwo: string | null;
  slug: string;
  hashtagOneDescription: string | null;
  hashtagTwoDescription: string | null;
  city_gems: CityGem[];
  properties: Partial<Property>[];
  city: City | null;
  map_pin: MapPin | null;
  offers: Offer[];
  tags: Tag[];
  vibes: Vibe[];
  cardImage: UploadFile | null;
  carousel_images: UploadFile[];
  hashtagOneIcon: UploadFile | null;
  hashtagTwoIcon: UploadFile | null;
}

export interface CityGem {
  id: number;
  documentId: string;
  name: string;
  category: Category;
  shortDescription: string;
  longDescription: string;
  googleMapsUrl: string;
  tip: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  slug: string;
  substatus: 'WIP' | null;
  coverImage: UploadFile;
  neighborhoods: Partial<Neighborhood>[];
  tags: Tag[];
}

// Relational & Nested Entities
export interface MapPin {
  id: number;
  name: string;
  type: 'property' | 'neighborhood';
  lat: number;
  lng: number;
  geohash: string;
}

export interface Offer {
  id: number;
  name: string;
  shortDescription: string;
  claimOfferUrl: string;
  slug: string;
}

export interface RoomType {
  id: number;
  name: string;
  roomCleaningFee: number;
  floorArea: string;
  description: string;
}

export interface PropertyType {
  id: number;
  name: 'Residences' | 'Apart-Hotels';
  carouselSectionHeaderTitle: string;
  carouselSectionHeaderDescription: string;
}

export interface AccessPoint {
  id: number;
  name: string;
  description: string;
  isTrainStation: boolean | null;
  isAirport: boolean | null;
}

export interface Artwork {
  id: number;
  name: string;
}

export interface HappyHour {
  id: number;
  startTime: string;
  endTime: string;
  dayOfWeek:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
}

export interface Tag {
  id: number;
  name: string;
}

export interface Vibe {
  id: number;
  name: string;
  slug: string;
}

export interface City {
  id: number;
  name: string;
  slug: string;
}

// Utility & Media Types
export interface UploadFile {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    large?: FileFormat;
    small?: FileFormat;
    medium?: FileFormat;
    thumbnail?: FileFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
}

export interface FileFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

// App-specific literal type
export type Category = 'Food & Drink' | 'Shopping' | 'Culture';
