import "server-only";
import { Property, CityGem, ApiResponse } from "@/types/api";
import { createLogger } from "@/lib/logger";

const EXTERNAL_API_URL =
  process.env.SERVER_API_URL || "https://content.section-l.co/api";
const API_TOKEN = process.env.STRAPI_API_TOKEN;

const logger = createLogger("ServerAPI");

async function fetchFromApi<T extends { data: any[]; meta: any }>(
  path: string,
  urlParams: URLSearchParams
): Promise<T> {
  const url = `${EXTERNAL_API_URL}${path}?${urlParams.toString()}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (API_TOKEN) {
    headers["Authorization"] = `Bearer ${API_TOKEN}`;
  }

  logger.debug("Fetching from Strapi", {
    url,
    method: "GET",
    hasAuth: !!API_TOKEN,
  });

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const error = new Error(
        `Failed to fetch data from the external API. Status: ${response.status}`
      );
      logger.error(
        `Failed to fetch from Strapi: ${response.status} ${response.statusText}`,
        error,
        { url, status: response.status, errorBody }
      );
      throw error;
    }

    const jsonResponse = (await response.json()) as T;

    logger.debug("Received Strapi data", {
      path,
      page: jsonResponse.meta.pagination?.page || 1,
      itemsReceived: jsonResponse.data.length,
      totalItems: jsonResponse.meta.pagination?.total,
    });

    return jsonResponse;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Failed to fetch data")
    ) {
      throw error; // Re-throw our custom error
    }
    logger.error("Network error fetching from Strapi", error, { url });
    throw new Error("A network error occurred while fetching data.");
  }
}

async function fetchAllPages<T>(
  path: string,
  initialParams: URLSearchParams
): Promise<T[]> {
  // Fetch the first page to get pagination metadata
  const firstPageResponse = await fetchFromApi<ApiResponse<T>>(
    path,
    initialParams
  );
  let allData = firstPageResponse.data;
  const pagination = firstPageResponse.meta.pagination;

  // If there's only one page, we're done
  if (pagination.pageCount <= 1) {
    return allData;
  }

  // Create an array of promises for the remaining pages
  const pagePromises: Promise<ApiResponse<T>>[] = [];
  for (let page = 2; page <= pagination.pageCount; page++) {
    const pageParams = new URLSearchParams(initialParams);
    pageParams.set("pagination[page]", page.toString());
    pagePromises.push(fetchFromApi<ApiResponse<T>>(path, pageParams));
  }

  const remainingPages = await Promise.all(pagePromises);

  remainingPages.forEach((pageResponse) => {
    allData = allData.concat(pageResponse.data);
  });

  logger.info("Finished fetching all pages from Strapi", {
    path,
    pageCount: pagination.pageCount,
    totalItems: allData.length,
  });

  return allData;
}

export const serverApi = {
  getProperties: async (): Promise<Property[]> => {
    const params = new URLSearchParams({
      // TODO: `populate=*` is used for simplicity
      populate: "*",
      "pagination[pageSize]": "25",
    });

    return fetchAllPages<Property>("/properties", params);
  },

  getPropertyBySlug: async (slug: string): Promise<Property | null> => {
    const params = new URLSearchParams({
      "filters[slug][$eq]": slug,
      // TODO: Revise
      "populate[neighborhoods][populate][city_gems][populate][coverImage]":
        "true",
      "populate[neighborhoods][populate][city_gems][populate][tags]": "true",
      "populate[neighborhoods][populate][vibes]": "true",
      "populate[map_pin]": "true",
      "populate[property_type]": "true",
      // "populate[room_types]": "true",
      // "populate[offers]": "true",
      // "populate[access_points]": "true",
      // "populate[artworks]": "true",
      // "populate[happy_hours]": "true",
      // "populate[carousel_images]": "true",
    });

    const response = await fetchFromApi<ApiResponse<Property>>(
      "/properties",
      params
    );
    return response.data[0] || null;
  },

  getAllCityGems: async (): Promise<CityGem[]> => {
    const params = new URLSearchParams({
      // TODO: `populate=*` can is inefficient -> specifying only needed fields.
      populate: "*",
      "pagination[pageSize]": "25",
    });

    return fetchAllPages<CityGem>("/city-gems", params);
  },

  getGemsByIds: async (ids: number[]): Promise<CityGem[]> => {
    if (ids.length === 0) return [];
    const params = new URLSearchParams();
    ids.forEach((id) => params.append("filters[id][$in]", id.toString()));
    params.append("populate", "*");

    return fetchAllPages<CityGem>("/city-gems", params);
  },
};
