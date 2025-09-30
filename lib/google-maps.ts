import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let googleMapsLoaded = false;

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
 * Calculate route between waypoints using Directions API
 */
export async function calculateRoute(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  waypoints: google.maps.LatLngLiteral[] = [],
  options?: {
    avoidHighways?: boolean;
    avoidTolls?: boolean;
  }
): Promise<google.maps.DirectionsResult | null> {
  try {
    const maps = await loadGoogleMaps();
    const directionsService = new maps.DirectionsService();

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      waypoints: waypoints.map((wp) => ({
        location: wp,
        stopover: true,
      })),
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: options?.avoidHighways || false,
      avoidTolls: options?.avoidTolls || false,
    };

    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          console.error("Directions request failed:", status);
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error("Error calculating route:", error);
    return null;
  }
}

/**
 * Get total distance and duration from directions result
 */
export function getRouteTotals(result: google.maps.DirectionsResult): {
  distance: number; // in meters
  duration: number; // in seconds
} {
  let totalDistance = 0;
  let totalDuration = 0;

  if (result.routes[0]?.legs) {
    result.routes[0].legs.forEach((leg) => {
      if (leg.distance?.value) totalDistance += leg.distance.value;
      if (leg.duration?.value) totalDuration += leg.duration.value;
    });
  }

  return { distance: totalDistance, duration: totalDuration };
}