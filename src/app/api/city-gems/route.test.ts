import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import type { Property, CityGem } from "@/types/api";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock("@/lib/api/server", () => ({
  serverApi: {
    getPropertyBySlug: vi.fn(),
    getGemsByIds: vi.fn(),
    getAllCityGems: vi.fn(),
  },
}));

const mockGem1: CityGem = {
  id: 1,
  documentId: "gem1",
  name: "Test Gem 1",
  category: "Food & Drink",
  slug: "test-gem-1",
  shortDescription: "Short desc 1",
  longDescription: "Long desc 1",
  googleMapsUrl: "https://maps.google.com/gem1",
  tip: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  publishedAt: "2025-01-01T00:00:00.000Z",
  locale: "en",
  substatus: null,
  coverImage: {} as any,
  neighborhoods: [],
  tags: [],
};

const mockGem2: CityGem = {
  id: 2,
  documentId: "gem2",
  name: "Test Gem 2",
  category: "Culture",
  slug: "test-gem-2",
  shortDescription: "Short desc 2",
  longDescription: "Long desc 2",
  googleMapsUrl: "https://maps.google.com/gem2",
  tip: null,
  createdAt: "2025-01-02T00:00:00.000Z",
  updatedAt: "2025-01-02T00:00:00.000Z",
  publishedAt: "2025-01-02T00:00:00.000Z",
  locale: "en",
  substatus: null,
  coverImage: {} as any,
  neighborhoods: [],
  tags: [],
};

const mockProperty: Partial<Property> = {
  id: 1,
  slug: "test-property",
  neighborhoods: [
    {
      id: 1,
      documentId: "n1",
      name: "Neighborhood 1",
      city_gems: [mockGem1, mockGem2],
    } as any,
    {
      id: 2,
      documentId: "n2",
      name: "Neighborhood 2",
      city_gems: [mockGem2], // Gem 2 is in both neighborhoods
    } as any,
  ],
};

describe("City Gems API Route", () => {
  let GET: (request: NextRequest) => Promise<NextResponse>;
  let serverApi: typeof import("@/lib/api/server").serverApi;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Import the mocked server API
    const mockModule = await import("@/lib/api/server");
    serverApi = mockModule.serverApi;

    // Import the route handler
    const routeModule = await import("./route");
    GET = routeModule.GET;

    // Mock console.error to avoid cluttering test output
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET handler", () => {
    it("should fetch all city gems when no params provided", async () => {
      (serverApi.getAllCityGems as Mock).mockResolvedValue([
        mockGem1,
        mockGem2,
      ]);

      const request = new NextRequest("http://localhost:3000/api/city-gems");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockGem1, mockGem2]);
      expect(serverApi.getAllCityGems as Mock).toHaveBeenCalledOnce();
      expect(serverApi.getGemsByIds as Mock).not.toHaveBeenCalled();
      expect(serverApi.getPropertyBySlug as Mock).not.toHaveBeenCalled();
    });

    it("should fetch city gems by IDs when ids param provided", async () => {
      (serverApi.getGemsByIds as Mock).mockResolvedValue([mockGem1]);

      const request = new NextRequest(
        "http://localhost:3000/api/city-gems?ids=1,invalid,2",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockGem1]);
      expect(serverApi.getGemsByIds as Mock).toHaveBeenCalledWith([1, 2]);
      expect(serverApi.getAllCityGems as Mock).not.toHaveBeenCalled();
      expect(serverApi.getPropertyBySlug as Mock).not.toHaveBeenCalled();
    });

    it("should fetch city gems by propertySlug when propertySlug param provided", async () => {
      (serverApi.getPropertyBySlug as Mock).mockResolvedValue(
        mockProperty as Property,
      );

      const request = new NextRequest(
        "http://localhost:3000/api/city-gems?propertySlug=test-property",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should be de-duplicated
      expect(data).toEqual([mockGem1, mockGem2]);
      expect(data.length).toBe(2);
      expect(serverApi.getPropertyBySlug as Mock).toHaveBeenCalledWith(
        "test-property",
      );
      expect(serverApi.getAllCityGems as Mock).not.toHaveBeenCalled();
      expect(serverApi.getGemsByIds as Mock).not.toHaveBeenCalled();
    });

    it("should return an empty array if propertySlug is not found", async () => {
      (serverApi.getPropertyBySlug as Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/city-gems?propertySlug=not-found",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(serverApi.getPropertyBySlug as Mock).toHaveBeenCalledWith(
        "not-found",
      );
    });

    it("should return an empty array if property has no neighborhoods", async () => {
      (serverApi.getPropertyBySlug as Mock).mockResolvedValue({
        ...mockProperty,
        neighborhoods: [],
      } as Property);

      const request = new NextRequest(
        "http://localhost:3000/api/city-gems?propertySlug=test-property",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("should return an empty array if property neighborhoods have no city_gems", async () => {
      (serverApi.getPropertyBySlug as Mock).mockResolvedValue({
        ...mockProperty,
        neighborhoods: [{ ...mockProperty.neighborhoods[0], city_gems: [] }],
      } as Property);

      const request = new NextRequest(
        "http://localhost:3000/api/city-gems?propertySlug=test-property",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("should prioritize propertySlug over ids", async () => {
      (serverApi.getPropertyBySlug as Mock).mockResolvedValue(
        mockProperty as Property,
      );

      const request = new NextRequest(
        "http://localhost:3000/api/city-gems?propertySlug=test-property&ids=1,2,3",
      );
      await GET(request);

      // Should only call getPropertyBySlug
      expect(serverApi.getPropertyBySlug as Mock).toHaveBeenCalledOnce();
      expect(serverApi.getGemsByIds as Mock).not.toHaveBeenCalled();
      expect(serverApi.getAllCityGems as Mock).not.toHaveBeenCalled();
    });

    it("should handle errors from getAllCityGems", async () => {
      const errorMessage = "Failed to fetch all gems";
      (serverApi.getAllCityGems as Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      const request = new NextRequest("http://localhost:3000/api/city-gems");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        message: "Error fetching city gems from external API",
        error: errorMessage,
      });
    });

    it("should handle errors from getGemsByIds", async () => {
      const errorMessage = "Failed to fetch gems by IDs";
      (serverApi.getGemsByIds as Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/city-gems?ids=1",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        message: "Error fetching city gems from external API",
        error: errorMessage,
      });
    });

    it("should handle errors from getPropertyBySlug", async () => {
      const errorMessage = "Failed to fetch property";
      (serverApi.getPropertyBySlug as Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/city-gems?propertySlug=test",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        message: "Error fetching city gems from external API",
        error: errorMessage,
      });
    });

    it("should handle non-Error exceptions", async () => {
      (serverApi.getAllCityGems as Mock).mockRejectedValue("A string error");

      const request = new NextRequest("http://localhost:3000/api/city-gems");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        message: "Error fetching city gems from external API",
        error: "An unknown error occurred",
      });
    });
  });
});
