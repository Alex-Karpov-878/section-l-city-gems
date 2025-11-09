import { NextRequest, NextResponse } from "next/server";
import "server-only";
import { serverApi } from "@/lib/api/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("CityGemsAPI");

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertySlug = searchParams.get("propertySlug");
  const idsParam = searchParams.get("ids");

  try {
    if (propertySlug) {
      logger.debug("Fetching city gems for property", { propertySlug });

      const property = await serverApi.getPropertyBySlug(propertySlug);

      if (!property) {
        logger.info("Property not found", { propertySlug });
        return NextResponse.json([]);
      }

      if (!property.neighborhoods || property.neighborhoods.length === 0) {
        logger.debug("Property has no neighborhoods", { propertySlug });
        return NextResponse.json([]);
      }

      const allGems = property.neighborhoods.flatMap(
        (neighborhood) => neighborhood.city_gems || []
      );

      const uniqueGems = Array.from(
        new Map(allGems.map((gem) => [gem.id, gem])).values()
      );

      logger.info("Fetched city gems for property", {
        propertySlug,
        gemsCount: uniqueGems.length,
      });

      return NextResponse.json(uniqueGems);
    }

    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id) && id > 0);

      logger.debug("Fetching city gems by IDs", { ids });

      if (ids.length === 0) {
        logger.warn("No valid IDs provided", { idsParam });
        return NextResponse.json([]);
      }

      const gems = await serverApi.getGemsByIds(ids);

      logger.info("Fetched city gems by IDs", {
        requestedCount: ids.length,
        foundCount: gems.length,
      });

      return NextResponse.json(gems);
    }

    logger.debug("Fetching all city gems");
    const gems = await serverApi.getAllCityGems();

    logger.info("Fetched all city gems", { count: gems.length });

    return NextResponse.json(gems);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    logger.error("Failed to fetch city gems", error, {
      propertySlug,
      idsParam,
    });

    return NextResponse.json(
      {
        message: "Error fetching city gems from external API",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
