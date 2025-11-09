import { describe, it, expect, beforeEach } from "vitest";
import { useKioskStore } from "./kiosk-store";
import { act } from "@testing-library/react";
import { Property } from "@/types/api";

const mockProperty: Property = {
  id: 1,
  name: "Test Property",
  slug: "test-property",
} as Property;

describe("useKioskStore", () => {
  beforeEach(() => {
    act(() => {
      useKioskStore.setState(useKioskStore.getInitialState());
    });
  });

  it("should set and get a property", () => {
    act(() => {
      useKioskStore.getState().setProperty(mockProperty);
    });
    expect(useKioskStore.getState().property).toEqual(mockProperty);
  });

  it("should set and get a search query", () => {
    act(() => {
      useKioskStore.getState().setSearchQuery("sushi");
    });
    expect(useKioskStore.getState().searchQuery).toBe("sushi");
  });

  it("should toggle favorites", () => {
    const gemId = 101;
    expect(useKioskStore.getState().favoriteGemIds.has(gemId)).toBe(false);

    act(() => {
      useKioskStore.getState().toggleFavorite(gemId);
    });
    expect(useKioskStore.getState().favoriteGemIds.has(gemId)).toBe(true);
    expect(Array.from(useKioskStore.getState().favoriteGemIds)).toEqual([
      gemId,
    ]);

    act(() => {
      useKioskStore.getState().toggleFavorite(gemId);
    });
    expect(useKioskStore.getState().favoriteGemIds.has(gemId)).toBe(false);
  });

  it("should reset the session state but keep the property", () => {
    act(() => {
      useKioskStore.getState().setProperty(mockProperty);
      useKioskStore.getState().setSearchQuery("test");
      useKioskStore.getState().setActiveCategory("Culture");
      useKioskStore.getState().toggleFavorite(1);
    });

    expect(useKioskStore.getState().searchQuery).toBe("test");
    expect(useKioskStore.getState().favoriteGemIds.size).toBe(1);

    act(() => {
      useKioskStore.getState().resetSession();
    });

    expect(useKioskStore.getState().searchQuery).toBe("");
    expect(useKioskStore.getState().activeCategory).toBeNull();
    expect(useKioskStore.getState().favoriteGemIds.size).toBe(0);

    expect(useKioskStore.getState().property).toEqual(mockProperty);
  });
});
