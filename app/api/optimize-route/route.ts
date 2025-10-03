import { NextRequest, NextResponse } from "next/server";

interface RouteWaypoint {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface ComputeRoutesRequest {
  origin: {
    location: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
  };
  destination: {
    location: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
  };
  intermediates?: Array<{
    location: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
  }>;
  travelMode: string;
  routingPreference: string;
  computeAlternativeRoutes: boolean;
  routeModifiers?: {
    avoidTolls: boolean;
    avoidHighways: boolean;
    avoidFerries: boolean;
  };
  languageCode: string;
  units: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      origin,
      destination,
      waypoints = [],
      maxDrivingHours,
      departureTime,
      arrivalDeadline,
      preferredStopDuration,
      avoidHighways = false,
      avoidTolls = false,
    } = body;

    // Validate required fields
    if (!origin || !destination || !maxDrivingHours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Build Routes API request
    const routesRequest: ComputeRoutesRequest = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls,
        avoidHighways,
        avoidFerries: false,
      },
      languageCode: "en-US",
      units: "METRIC",
    };

    // Add intermediate waypoints if provided
    if (waypoints && waypoints.length > 0) {
      routesRequest.intermediates = waypoints.map((wp: RouteWaypoint) => ({
        location: {
          latLng: {
            latitude: wp.lat,
            longitude: wp.lng,
          },
        },
      }));
    }

    // Call Routes API
    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.duration,routes.legs.distanceMeters,routes.legs.startLocation,routes.legs.endLocation,routes.legs.steps",
        },
        body: JSON.stringify(routesRequest),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Routes API error:", errorText);
      return NextResponse.json(
        { error: "Failed to compute route", details: errorText },
        { status: response.status }
      );
    }

    const routeData = await response.json();

    // Return the route data along with optimization parameters
    return NextResponse.json({
      routeData,
      optimizationParams: {
        maxDrivingHours,
        departureTime,
        arrivalDeadline,
        preferredStopDuration,
      },
    });
  } catch (error) {
    console.error("Error optimizing route:", error);
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    );
  }
}