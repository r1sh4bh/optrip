import { NextRequest, NextResponse } from "next/server";

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
      avoidHighways,
      avoidTolls,
    } = body;

    // Validate required fields
    if (!origin || !destination || !maxDrivingHours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // This is a server-side route, but Google Maps Directions API
    // is better called from the client side with the JavaScript API
    // So we'll return instructions to use the client-side optimization

    return NextResponse.json({
      message: "Use client-side optimization with Google Maps JavaScript API",
      useClientSide: true,
    });
  } catch (error) {
    console.error("Error optimizing route:", error);
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    );
  }
}