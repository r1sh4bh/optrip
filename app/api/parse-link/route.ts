import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Basic validation
    if (!url.includes("google.com/maps") && !url.includes("maps.app.goo.gl")) {
      return NextResponse.json(
        { error: "Invalid Google Maps URL" },
        { status: 400 }
      );
    }

    // Expand short URL if needed
    let fullUrl = url;
    if (url.includes("maps.app.goo.gl")) {
      const expandResponse = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
      });
      fullUrl = expandResponse.url;
    }

    const parsedUrl = new URL(fullUrl);
    const waypoints: Array<{
      name: string;
      lat: number;
      lng: number;
      address: string;
    }> = [];

    // Extract waypoints from the URL path
    const pathMatch = parsedUrl.pathname.match(/\/dir\/([^/@]+(?:\/[^/@]+)*)/);
    if (pathMatch) {
      const locations = pathMatch[1].split("/").filter(Boolean);

      // Process each location
      for (let i = 0; i < locations.length; i++) {
        const location = decodeURIComponent(locations[i]);

        // Check if it's already a coordinate pair
        const coordMatch = location.match(/^([-\d.]+),([-\d.]+)$/);

        if (coordMatch) {
          waypoints.push({
            name: `Point ${i + 1}`,
            lat: parseFloat(coordMatch[1]),
            lng: parseFloat(coordMatch[2]),
            address: location,
          });
        } else {
          // Geocode the location name
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            throw new Error("Google Maps API key not configured");
          }

          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            location
          )}&key=${apiKey}`;

          const geocodeResponse = await fetch(geocodeUrl);
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
            const result = geocodeData.results[0];
            waypoints.push({
              name: location,
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
              address: result.formatted_address,
            });
          } else {
            // Skip invalid locations
            console.warn(`Could not geocode location: ${location}`);
          }
        }
      }
    }

    if (waypoints.length < 2) {
      return NextResponse.json(
        { error: "Could not find origin and destination in the URL" },
        { status: 400 }
      );
    }

    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const intermediateWaypoints = waypoints.slice(1, -1);

    return NextResponse.json({
      origin,
      destination,
      waypoints: intermediateWaypoints,
      rawUrl: url,
    });
  } catch (error) {
    console.error("Error parsing link:", error);
    return NextResponse.json(
      { error: "Failed to parse Google Maps link" },
      { status: 500 }
    );
  }
}