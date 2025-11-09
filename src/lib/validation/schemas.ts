import { z } from "zod";

export const uploadFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  alternativeText: z.string().nullable(),
  caption: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  formats: z.object({
    large: z
      .object({
        ext: z.string(),
        url: z.string(),
        hash: z.string(),
        mime: z.string(),
        name: z.string(),
        size: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    small: z
      .object({
        ext: z.string(),
        url: z.string(),
        hash: z.string(),
        mime: z.string(),
        name: z.string(),
        size: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    medium: z
      .object({
        ext: z.string(),
        url: z.string(),
        hash: z.string(),
        mime: z.string(),
        name: z.string(),
        size: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    thumbnail: z
      .object({
        ext: z.string(),
        url: z.string(),
        hash: z.string(),
        mime: z.string(),
        name: z.string(),
        size: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
  }),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  size: z.number(),
  url: z.string(),
});

export const mapPinSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(["property", "neighborhood"]),
  lat: z.number(),
  lng: z.number(),
  geohash: z.string(),
});

export const tagSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const vibeSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const citySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const categorySchema = z.enum(["Food & Drink", "Shopping", "Culture"]);

export const cityGemSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string().min(1, "Name is required"),
  category: categorySchema,
  shortDescription: z.string(),
  longDescription: z.string(),
  googleMapsUrl: z.string().url("Invalid Google Maps URL"),
  tip: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string(),
  slug: z.string(),
  substatus: z.enum(["WIP"]).nullable(),
  coverImage: uploadFileSchema,
  neighborhoods: z.array(
    z
      .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
      })
      .passthrough()
  ),
  tags: z.array(tagSchema),
});

export const neighborhoodSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string().min(1, "Name is required"),
  hashtagOne: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string(),
  hashtagTwo: z.string().nullable(),
  slug: z.string(),
  hashtagOneDescription: z.string().nullable(),
  hashtagTwoDescription: z.string().nullable(),
  city_gems: z.array(cityGemSchema),
  properties: z.array(z.any()),
  city: citySchema.nullable(),
  map_pin: mapPinSchema.nullable(),
  offers: z.array(z.any()),
  tags: z.array(tagSchema),
  vibes: z.array(vibeSchema),
  cardImage: uploadFileSchema.nullable(),
  carousel_images: z.array(uploadFileSchema),
  hashtagOneIcon: uploadFileSchema.nullable(),
  hashtagTwoIcon: uploadFileSchema.nullable(),
});

export const propertySchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string().min(1, "Name is required"),
  acronym: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string(),
  bookingPage: z.string().url("Invalid booking URL"),
  slug: z.string(),
  description: z.string().nullable(),
  lobbyWifiSSID: z.string().nullable(),
  neighborhoods: z.array(neighborhoodSchema),
  map_pin: mapPinSchema.nullable(),
  offers: z.array(z.any()),
  room_types: z.array(z.any()),
  property_type: z
    .object({
      id: z.number(),
      name: z.enum(["Residences", "Apart-Hotels"]),
      carouselSectionHeaderTitle: z.string(),
      carouselSectionHeaderDescription: z.string(),
    })
    .nullable(),
  carousel_images: z.array(uploadFileSchema),
  access_points: z.array(z.any()),
  artworks: z.array(z.any()),
  happy_hours: z.array(z.any()),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    meta: z.object({
      pagination: z.object({
        page: z.number(),
        pageSize: z.number(),
        pageCount: z.number(),
        total: z.number(),
      }),
    }),
  });

export const propertiesResponseSchema = apiResponseSchema(propertySchema);
export const cityGemsResponseSchema = apiResponseSchema(cityGemSchema);
export const searchQuerySchema = z
  .string()
  .trim()
  .max(200, "Search query too long")
  .transform((val) => val.toLowerCase());

export const gemIdsSchema = z
  .array(z.number().int().positive())
  .max(100, "Too many gem IDs");

export const propertySlugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug too long")
  .regex(/^[a-z0-9-]+$/, "Invalid slug format");

export type ValidatedProperty = z.infer<typeof propertySchema>;
export type ValidatedCityGem = z.infer<typeof cityGemSchema>;
export type ValidatedNeighborhood = z.infer<typeof neighborhoodSchema>;
export type ValidatedCategory = z.infer<typeof categorySchema>;
export type ValidatedSearchQuery = z.infer<typeof searchQuerySchema>;
export type ValidatedGemIds = z.infer<typeof gemIdsSchema>;
export type ValidatedPropertySlug = z.infer<typeof propertySlugSchema>;
export function validateData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validateDataOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}
