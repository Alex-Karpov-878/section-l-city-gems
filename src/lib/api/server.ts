import "server-only";

import { Property, CityGem, ApiResponse } from "@/types/api";

const EXTERNAL_API_URL =
  process.env.SERVER_API_URL || "https://content.section-l.co/api";
const API_TOKEN = process.env.STRAPI_API_TOKEN;

async function fetchFromApi<T extends ApiResponse<unknown>>(
  path: string,
  urlParams: URLSearchParams,
): Promise<T> {
  const url = `${EXTERNAL_API_URL}${path}?${urlParams.toString()}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (API_TOKEN) {
    headers["Authorization"] = `Bearer ${API_TOKEN}`;
  }

  console.log(`[SERVER_API_REQUEST] Fetching data...`, {
    url,
    method: "GET",
    headers: {
      Authorization: API_TOKEN ? "Bearer [REDACTED]" : "None",
    },
  });

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 }, // Revalidate cache every hour
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `[SERVER_API_ERROR] Failed to fetch ${url}: ${response.status} ${response.statusText}`,
        { errorBody },
      );
      throw new Error(
        `External API request failed with status: ${response.status} ${response.statusText}`,
      );
    }

    const jsonResponse = (await response.json()) as T;

    console.log(`[SERVER_API_RESPONSE] Received data for ${path}`, {
      page: jsonResponse.meta.pagination?.page || 1,
      itemsReceived: jsonResponse.data.length,
      totalItems: jsonResponse.meta.pagination?.total,
    });

    return jsonResponse;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(
      `[SERVER_API_ERROR] Network or parsing error fetching ${url}:`,
      errorMessage,
      error,
    );
    throw new Error(
      `A network error occurred while fetching data from ${path}: ${errorMessage}`,
    );
  }
}

async function fetchAllPages<T>(
  path: string,
  initialParams: URLSearchParams,
): Promise<T[]> {
  const firstPageResponse = await fetchFromApi<ApiResponse<T>>(
    path,
    initialParams,
  );
  let allData = firstPageResponse.data;
  const pagination = firstPageResponse.meta.pagination;

  if (pagination.pageCount <= 1) {
    return allData;
  }

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

  console.log(
    `[SERVER_API_AGGREGATE] Finished fetching all ${pagination.pageCount} pages for ${path}. Total items: ${allData.length}`,
  );

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
      // "populate[property_type]": "true",
      // "populate[room_types]": "true",
      // "populate[offers]": "true",
      // "populate[access_points]": "true",
      // "populate[artworks]": "true",
      // "populate[happy_hours]": "true",
      // "populate[carousel_images]": "true",
    });

    const response = await fetchFromApi<ApiResponse<Property>>(
      "/properties",
      params,
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
    if (ids.length === 0) {
      return [];
    }
    const params = new URLSearchParams();
    ids.forEach((id) => params.append("filters[id][$in]", id.toString()));
    params.append("populate", "*");

    // Assuming IDs will fit in a single page for simplicity
    const response = await fetchFromApi<ApiResponse<CityGem>>(
      "/city-gems",
      params,
    );
    return response.data;
  },
};
