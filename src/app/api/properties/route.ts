import { NextRequest, NextResponse } from "next/server";
import "server-only";
import { serverApi } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      const property = await serverApi.getPropertyBySlug(slug);
      return NextResponse.json(property ? [property] : []);
    } else {
      const properties = await serverApi.getProperties();
      return NextResponse.json(properties);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("[API_PROXY_ERROR] /api/properties:", message);
    return NextResponse.json(
      {
        message: "Error fetching properties from external API",
        error: message,
      },
      { status: 500 }
    );
  }
}
