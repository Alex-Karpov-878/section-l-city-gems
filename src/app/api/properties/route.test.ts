import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import type { Property } from "@/types/api";

// Mock server-only module
vi.mock("server-only", () => ({}));

// Mock the server API module
vi.mock("@/lib/api/server", () => ({
  serverApi: {
    getProperties: vi.fn(),
    getPropertyBySlug: vi.fn(),
  },
}));

describe("Properties API Route", () => {
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

    // Mock console to avoid cluttering test output
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET handler", () => {
    it("should fetch all properties when no slug provided", async () => {
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

      (serverApi.getProperties as Mock).mockResolvedValue(mockProperties);

      const request = new NextRequest("http://localhost:3000/api/properties");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProperties);
      expect(serverApi.getProperties as Mock).toHaveBeenCalledOnce();
      expect(serverApi.getPropertyBySlug as Mock).not.toHaveBeenCalled();
    });

    it("should fetch property by slug when slug provided", async () => {
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
      };

      (serverApi.getPropertyBySlug as Mock).mockResolvedValue(mockProperty);

      const request = new NextRequest(
        "http://localhost:3000/api/properties?slug=test-property",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockProperty]);
      expect(serverApi.getPropertyBySlug as Mock).toHaveBeenCalledWith(
        "test-property",
      );
      expect(serverApi.getProperties as Mock).not.toHaveBeenCalled();
    });

    it("should return empty array when property not found by slug", async () => {
      (serverApi.getPropertyBySlug as Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/properties?slug=non-existent",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(serverApi.getPropertyBySlug as Mock).toHaveBeenCalledWith(
        "non-existent",
      );
    });

    it("should handle errors from getProperties", async () => {
      const errorMessage = "Database connection failed";
      (serverApi.getProperties as Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      const request = new NextRequest("http://localhost:3000/api/properties");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        message: "Error fetching properties from external API",
        error: errorMessage,
      });
      expect(console.error).toHaveBeenCalledWith(
        "[API_PROXY_ERROR] /api/properties:",
        errorMessage,
      );
    });

    it("should handle errors from getPropertyBySlug", async () => {
      const errorMessage = "Network error";
      (serverApi.getPropertyBySlug as Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/properties?slug=test",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        message: "Error fetching properties from external API",
        error: errorMessage,
      });
    });

    it("should handle non-Error exceptions", async () => {
      (serverApi.getProperties as Mock).mockRejectedValue("String error");

      const request = new NextRequest("http://localhost:3000/api/properties");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        message: "Error fetching properties from external API",
        error: "An unknown error occurred",
      });
    });

    it("should parse URL query parameters correctly", async () => {
      (serverApi.getPropertyBySlug as Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/properties?slug=test-slug&other=param",
      );
      await GET(request);

      expect(serverApi.getPropertyBySlug as Mock).toHaveBeenCalledWith(
        "test-slug",
      );
    });
  });
});
