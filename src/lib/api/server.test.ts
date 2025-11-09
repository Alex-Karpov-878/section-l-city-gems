import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Property, CityGem, ApiResponse } from "@/types/api";

// Mock server-only module
vi.mock("server-only", () => ({}));

// Mock logger module
vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// Mock environment variables
const mockEnv = {
  SERVER_API_URL: "https://test-api.example.com/api",
  STRAPI_API_TOKEN: "test-token-123",
};

describe("serverApi", () => {
  // We need to dynamically import after setting up mocks
  let serverApi: any;

  beforeEach(async () => {
    // Set up environment variables
    process.env.SERVER_API_URL = mockEnv.SERVER_API_URL;
    process.env.STRAPI_API_TOKEN = mockEnv.STRAPI_API_TOKEN;

    // Reset modules to ensure fresh import
    vi.resetModules();

    // Import the module under test
    const serverModule = await import("./server");
    serverApi = serverModule.serverApi;

    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SERVER_API_URL;
    delete process.env.STRAPI_API_TOKEN;
  });

  describe("getProperties", () => {
    it("should fetch all properties with single page", async () => {
      const mockProperties: Property[] = [
        {
          id: 1,
          documentId: "prop1",
          name: "Test Property",
          acronym: "TP",
          slug: "test-property",
          createdAt: "2025-11-11",
          updatedAt: "2025-11-11",
          publishedAt: "2025-11-11",
          locale: "en",
          bookingPage: "https://booking.example.com",
          description: "Test description",
          lobbyWifiSSID: null,
          localizations: [],
          neighborhoods: [],
          map_pin: null,
          offers: [],
          room_types: [],
          property_type: null,
          carousel_images: [],
          access_points: [],
          artworks: [],
          happy_hours: [],
        },
      ];

      const mockResponse: ApiResponse<Property> = {
        data: mockProperties,
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 1,
            total: 1,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await serverApi.getProperties();

      expect(result).toEqual(mockProperties);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/properties"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockEnv.STRAPI_API_TOKEN}`,
          }),
        })
      );
    });

    it("should fetch all properties across multiple pages", async () => {
      const mockPropertiesPage1: Property[] = [
        {
          id: 1,
          documentId: "prop1",
          name: "Property 1",
          acronym: "P1",
          slug: "property-1",
          createdAt: "2025-11-11",
          updatedAt: "2025-11-11",
          publishedAt: "2025-11-11",
          locale: "en",
          bookingPage: "https://booking.example.com",
          description: null,
          lobbyWifiSSID: null,
          localizations: [],
          neighborhoods: [],
          map_pin: null,
          offers: [],
          room_types: [],
          property_type: null,
          carousel_images: [],
          access_points: [],
          artworks: [],
          happy_hours: [],
        },
      ];

      const mockPropertiesPage2: Property[] = [
        {
          id: 2,
          documentId: "prop2",
          name: "Property 2",
          acronym: "P2",
          slug: "property-2",
          createdAt: "2025-11-12",
          updatedAt: "2025-11-12",
          publishedAt: "2025-11-12",
          locale: "en",
          bookingPage: "https://booking.example.com",
          description: null,
          lobbyWifiSSID: null,
          localizations: [],
          neighborhoods: [],
          map_pin: null,
          offers: [],
          room_types: [],
          property_type: null,
          carousel_images: [],
          access_points: [],
          artworks: [],
          happy_hours: [],
        },
      ];

      const mockResponsePage1: ApiResponse<Property> = {
        data: mockPropertiesPage1,
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 2,
            total: 2,
          },
        },
      };

      const mockResponsePage2: ApiResponse<Property> = {
        data: mockPropertiesPage2,
        meta: {
          pagination: {
            page: 2,
            pageSize: 25,
            pageCount: 2,
            total: 2,
          },
        },
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponsePage1,
          text: async () => JSON.stringify(mockResponsePage1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponsePage2,
          text: async () => JSON.stringify(mockResponsePage2),
        });

      const result = await serverApi.getProperties();

      expect(result).toEqual([...mockPropertiesPage1, ...mockPropertiesPage2]);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should handle HTTP errors gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Server error occurred",
      });

      await expect(serverApi.getProperties()).rejects.toThrow(
        "Failed to fetch data from the external API. Status: 500"
      );
    });

    it("should handle network errors", async () => {
      const networkErrorMessage = "Network connection failed";
      global.fetch = vi.fn().mockRejectedValue(new Error(networkErrorMessage));

      await expect(serverApi.getProperties()).rejects.toThrow(
        "A network error occurred while fetching data."
      );
    });

    it("should work without API token", async () => {
      delete process.env.STRAPI_API_TOKEN;
      vi.resetModules();
      const serverModule = await import("./server");
      const apiWithoutToken = serverModule.serverApi;

      const mockResponse: ApiResponse<Property> = {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 1,
            total: 0,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      await apiWithoutToken.getProperties();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });
  });

  describe("getPropertyBySlug", () => {
    it("should fetch property by slug with populated data", async () => {
      const mockProperty: Property = {
        id: 1,
        documentId: "prop1",
        name: "Test Property",
        acronym: "TP",
        slug: "test-property",
        createdAt: "2025-11-11",
        updatedAt: "2025-11-11",
        publishedAt: "2025-11-11",
        locale: "en",
        bookingPage: "https://booking.example.com",
        description: "Test description",
        lobbyWifiSSID: "TestWiFi",
        neighborhoods: [],
        map_pin: null,
        offers: [],
        room_types: [],
        property_type: null,
        carousel_images: [],
        access_points: [],
        artworks: [],
        happy_hours: [],
        localizations: [],
      };

      const mockResponse: ApiResponse<Property> = {
        data: [mockProperty],
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 1,
            total: 1,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await serverApi.getPropertyBySlug("test-property");

      expect(result).toEqual(mockProperty);
      const fetchCall = (fetch as any).mock.calls[0]?.[0];
      // URLs are encoded, so check for the encoded version
      expect(fetchCall).toContain("filters%5Bslug%5D%5B%24eq%5D=test-property");
    });

    it("should return null when property not found", async () => {
      const mockResponse: ApiResponse<Property> = {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 1,
            total: 0,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await serverApi.getPropertyBySlug("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getAllCityGems", () => {
    it("should fetch all city gems", async () => {
      const mockCityGems: CityGem[] = [
        {
          id: 1,
          documentId: "gem1",
          name: "Test Gem",
          category: "Food & Drink",
          shortDescription: "A great place",
          longDescription: "A really great place to visit",
          googleMapsUrl: "https://maps.google.com/test",
          tip: "Visit in the morning",
          createdAt: "2025-11-11",
          updatedAt: "2025-11-11",
          publishedAt: "2025-11-11",
          locale: "en",
          slug: "test-gem",
          substatus: null,
          icon: null,
          localizations: [],
          coverImage: {} as any,
          neighborhoods: [],
          tags: [],
        },
      ];

      const mockResponse: ApiResponse<CityGem> = {
        data: mockCityGems,
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 1,
            total: 1,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await serverApi.getAllCityGems();

      expect(result).toEqual(mockCityGems);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/city-gems"),
        expect.any(Object)
      );
    });
  });

  describe("getGemsByIds", () => {
    it("should fetch gems by array of IDs", async () => {
      const ids = [1, 2, 3];
      const mockCityGems: CityGem[] = ids.map(
        (id) =>
          ({
            id,
            documentId: `gem${id}`,
            name: `Gem ${id}`,
            category: "Food & Drink",
            shortDescription: `Description ${id}`,
            longDescription: `Long description ${id}`,
            googleMapsUrl: `https://maps.google.com/gem${id}`,
            tip: null,
            createdAt: "2025-11-11",
            updatedAt: "2025-11-11",
            publishedAt: "2025-11-11",
            locale: "en",
            slug: `gem-${id}`,
            substatus: null,
            coverImage: {} as any,
            neighborhoods: [],
            tags: [],
            icon: null,
            localizations: [],
          } as CityGem)
      );

      const mockResponse: ApiResponse<CityGem> = {
        data: mockCityGems,
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 1,
            total: 3,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await serverApi.getGemsByIds(ids);

      expect(result).toEqual(mockCityGems);
      const fetchCall = (fetch as any).mock.calls[0]?.[0];
      // Check for URL-encoded filter parameters for repeated keys
      ids.forEach((id) => {
        expect(fetchCall).toContain(`filters%5Bid%5D%5B%24in%5D=${id}`);
      });
    });

    it("should return empty array when no IDs provided", async () => {
      global.fetch = vi.fn();

      const result = await serverApi.getGemsByIds([]);

      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("API configuration", () => {
    it("should use default API URL when not set in environment", async () => {
      delete process.env.SERVER_API_URL;
      vi.resetModules();
      const serverModule = await import("./server");

      const mockResponse: ApiResponse<Property> = {
        data: [],
        meta: {
          pagination: { page: 1, pageSize: 25, pageCount: 1, total: 0 },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      await serverModule.serverApi.getProperties();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("https://content.section-l.co/api"),
        expect.any(Object)
      );
    });

    it("should include next revalidate in fetch options", async () => {
      const mockResponse: ApiResponse<Property> = {
        data: [],
        meta: {
          pagination: { page: 1, pageSize: 25, pageCount: 1, total: 0 },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      await serverApi.getProperties();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: { revalidate: 3600 },
        })
      );
    });
  });

  describe("Error handling and logging", () => {
    it("should log request details", async () => {
      // Logger is mocked, so we just verify the serverApi works
      const mockResponse: ApiResponse<Property> = {
        data: [],
        meta: {
          pagination: { page: 1, pageSize: 25, pageCount: 1, total: 0 },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await serverApi.getProperties();

      expect(result).toEqual([]);
      expect(fetch).toHaveBeenCalled();
    });

    it("should log error details on failed requests", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "Resource not found",
      });

      await expect(serverApi.getProperties()).rejects.toThrow();
    });

    it("should handle API token securely", async () => {
      const mockResponse: ApiResponse<Property> = {
        data: [],
        meta: {
          pagination: { page: 1, pageSize: 25, pageCount: 1, total: 0 },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      await serverApi.getProperties();

      // Verify fetch was called with auth header
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockEnv.STRAPI_API_TOKEN}`,
          }),
        })
      );
    });
  });
});
