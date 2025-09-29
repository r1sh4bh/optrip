import { ParsedGoogleMapsLink, Waypoint } from "@/types";

/**
 * Parse a Google Maps URL to extract route information
 * Supports both short links (maps.app.goo.gl) and full URLs
 */
export async function parseGoogleMapsLink(
  url: string
): Promise<ParsedGoogleMapsLink> {
  try {
    // For short links, we need to follow the redirect to get the full URL
    let fullUrl = url;

    if (url.includes("maps.app.goo.gl")) {
      // In a browser environment, we can't directly follow redirects
      // We'll need to handle this on the server side
      fullUrl = await expandShortUrl(url);
    }

    const parsedUrl = new URL(fullUrl);

    // Extract coordinates from the URL
    // Google Maps URLs can have coordinates in different formats:
    // 1. /dir/Origin/Destination/@lat,lng
    // 2. /dir/Origin/Waypoint/Destination
    // 3. Query parameters like ?saddr=...&daddr=...

    const waypoints = extractWaypointsFromUrl(parsedUrl);

    if (waypoints.length < 2) {
      throw new Error("Could not find origin and destination in the URL");
    }

    return {
      origin: waypoints[0],
      destination: waypoints[waypoints.length - 1],
      waypoints: waypoints.slice(1, -1), // Intermediate waypoints
      rawUrl: url,
    };
  } catch (error) {
    console.error("Error parsing Google Maps link:", error);
    throw new Error("Failed to parse Google Maps link. Please check the URL and try again.");
  }
}

/**
 * Expand a short Google Maps URL to get the full URL
 */
async function expandShortUrl(shortUrl: string): Promise<string> {
  try {
    // We'll make a request to our API route to expand the URL
    const response = await fetch("/api/expand-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: shortUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to expand short URL");
    }

    const data = await response.json();
    return data.expandedUrl;
  } catch (error) {
    console.error("Error expanding short URL:", error);
    // Fallback: return the original URL
    return shortUrl;
  }
}

/**
 * Extract waypoints from a Google Maps URL
 */
function extractWaypointsFromUrl(url: URL): Waypoint[] {
  const waypoints: Waypoint[] = [];

  // Method 1: Extract from /dir/ path
  const pathMatch = url.pathname.match(/\/dir\/([^/]+(?:\/[^/]+)*)/);
  if (pathMatch) {
    const locations = pathMatch[1].split("/").filter(Boolean);

    locations.forEach((location, index) => {
      // Decode URL-encoded location names
      const decodedLocation = decodeURIComponent(location);

      // Check if it's a coordinate pair
      const coordMatch = decodedLocation.match(/^([-\d.]+),([-\d.]+)$/);
      if (coordMatch) {
        waypoints.push({
          name: `Point ${index + 1}`,
          location: {
            lat: parseFloat(coordMatch[1]),
            lng: parseFloat(coordMatch[2]),
          },
          address: decodedLocation,
        });
      } else {
        // It's a place name - we'll need to geocode it
        // For now, add it with placeholder coordinates
        waypoints.push({
          name: decodedLocation,
          location: {
            lat: 0, // Will be geocoded later
            lng: 0,
          },
          address: decodedLocation,
        });
      }
    });
  }

  // Method 2: Extract from query parameters
  const searchParams = url.searchParams;
  const saddr = searchParams.get("saddr");
  const daddr = searchParams.get("daddr");

  if (saddr && daddr && waypoints.length === 0) {
    waypoints.push(
      createWaypointFromString(saddr, "Origin"),
      createWaypointFromString(daddr, "Destination")
    );
  }

  // Method 3: Extract from data parameter (directions data)
  const dataParam = searchParams.get("data");
  if (dataParam && waypoints.length === 0) {
    // This is more complex and would require parsing the data parameter
    // For now, we'll skip this method
  }

  return waypoints;
}

/**
 * Create a waypoint from a string (either coordinates or place name)
 */
function createWaypointFromString(str: string, defaultName: string): Waypoint {
  const coordMatch = str.match(/^([-\d.]+),([-\d.]+)$/);

  if (coordMatch) {
    return {
      name: defaultName,
      location: {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2]),
      },
      address: str,
    };
  }

  return {
    name: str,
    location: {
      lat: 0, // Will be geocoded later
      lng: 0,
    },
    address: str,
  };
}

/**
 * Geocode a place name to get coordinates using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `/api/geocode?address=${encodeURIComponent(address)}`
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();
    return data.location;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}