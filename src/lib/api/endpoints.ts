import { apiClient } from "./client";
import { Property, CityGem } from "@/types/api";
import { ROUTES } from "@/constants";

export const propertiesApi = {
  getAll: (): Promise<Property[]> => {
    return apiClient.get<Property[]>(ROUTES.API.PROPERTIES);
  },

  getBySlug: async (slug: string): Promise<Property | null> => {
    const properties = await apiClient.get<Property[]>(ROUTES.API.PROPERTIES, {
      params: { slug },
    });
    return properties[0] ?? null;
  },
};

export const cityGemsApi = {
  getAll: (): Promise<CityGem[]> => {
    return apiClient.get<CityGem[]>(ROUTES.API.CITY_GEMS);
  },

  getByIds: (ids: number[]): Promise<CityGem[]> => {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return apiClient.get<CityGem[]>(ROUTES.API.CITY_GEMS, {
      params: {
        ids: ids.join(","),
      },
    });
  },

  getBySlug: async (slug: string): Promise<CityGem | null> => {
    const gems = await apiClient.get<CityGem[]>(ROUTES.API.CITY_GEMS, {
      params: { slug },
    });
    return gems[0] ?? null;
  },
};

export const api = {
  getProperties: propertiesApi.getAll,
  getPropertyBySlug: propertiesApi.getBySlug,
  getAllCityGems: cityGemsApi.getAll,
  getGemsByIds: cityGemsApi.getByIds,
};
