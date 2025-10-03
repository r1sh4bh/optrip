import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let googleMapsLoaded = false;

/**
 * Routes API response types
 */
export interface RoutesApiRoute {
  distanceMeters: number;
  duration: string; // e.g., "3600s"
  polyline: {
    encodedPolyline: string;
  };
  legs: Array<{
    distanceMeters: number;
    duration: string;
    startLocation: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
    endLocation: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
    steps?: Array<{
      distanceMeters: number;
      staticDuration: string;
      polyline: {
        encodedPolyline: string;
      };
    }>;
  }>;
}

export interface RoutesApiResponse {
  routes: RoutesApiRoute[];
}

/**
 * Initialize and load the Google Maps JavaScript API
 */
export async function loadGoogleMaps(): Promise<typeof google.maps> {
  if (googleMapsLoaded && window.google?.maps) {
    return window.google.maps;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file."
    );
  }

  try {
    // Set options before loading
    setOptions({
      key: apiKey,
      v: "weekly",
      libraries: ["places", "geometry"],
    });

    // Import the maps library
    await importLibrary("maps");
    googleMapsLoaded = true;
    return window.google.maps;
  } catch (error) {
    console.error("Error loading Google Maps:", error);
    throw new Error("Failed to load Google Maps");
  }
}

/**
 * Calculate route between waypoints using Routes API (server-side)
 */
export async function calculateRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints: Array<{ lat: number; lng: number }> = [],
  options?: {
    avoidHighways?: boolean;
    avoidTolls?: boolean;
  }
): Promise<RoutesApiResponse | null> {
  try {
    const response = await fetch("/api/optimize-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin,
        destination,
        waypoints,
        maxDrivingHours: 8, // Default value
        avoidHighways: options?.avoidHighways || false,
        avoidTolls: options?.avoidTolls || false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Routes API error:", error);
      return null;
    }

    const data = await response.json();
    return data.routeData;
  } catch (error) {
    console.error("Error calculating route:", error);
    return null;
  }
}

/**
 * Convert Routes API duration string (e.g., "3600s") to seconds
 */
export function parseDuration(duration: string): number {
  return parseInt(duration.replace("s", ""), 10);
}

/**
 * Get total distance and duration from Routes API response
 */
export function getRouteTotals(routeData: RoutesApiResponse): {
  distance: number; // in meters
  duration: number; // in seconds
} {
  const route = routeData.routes[0];
  if (!route) {
    return { distance: 0, duration: 0 };
  }

  return {
    distance: route.distanceMeters,
    duration: parseDuration(route.duration),
  };
}

/**
 * Convert Routes API response to legacy DirectionsResult format for backward compatibility
 */
export function convertToDirectionsResult(
  routeData: RoutesApiResponse
): google.maps.DirectionsResult | null {
  const route = routeData.routes[0];
  if (!route) return null;

  // This is a simplified conversion - expand as needed
  return {
    routes: [
      {
        legs: route.legs.map((leg) => ({
          distance: {
            text: `${(leg.distanceMeters / 1000).toFixed(1)} km`,
            value: leg.distanceMeters,
          },
          duration: {
            text: `${Math.round(parseDuration(leg.duration) / 60)} mins`,
            value: parseDuration(leg.duration),
          },
          start_location: new google.maps.LatLng(
            leg.startLocation.latLng.latitude,
            leg.startLocation.latLng.longitude
          ),
          end_location: new google.maps.LatLng(
            leg.endLocation.latLng.latitude,
            leg.endLocation.latLng.longitude
          ),
          steps: [],
          start_address: "",
          end_address: "",
          via_waypoints: [],
          traffic_speed_entry: [],
        })),
        overview_path: [],
        overview_polyline: route.polyline.encodedPolyline,
        bounds: new google.maps.LatLngBounds(),
        copyrights: "",
        warnings: [],
        waypoint_order: [],
        summary: "",
      },
    ],
    geocoded_waypoints: [],
    request: {} as google.maps.DirectionsRequest,
  } as google.maps.DirectionsResult;
}