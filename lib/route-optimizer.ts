import { OptimizedRoute, OptimizedStop, RouteSegment, Waypoint } from "@/types";
import { RoutesApiResponse, parseDuration } from "./google-maps";

interface OptimizationParams {
  maxDrivingHours: number; // Maximum driving hours per day
  departureTime?: Date; // When to start the trip
  arrivalDeadline?: Date; // When to arrive at destination
  preferredStopDuration: number; // Rest stop duration in minutes
}

/**
 * Optimize a route by breaking it into daily segments based on driving time limits
 * Now supports Routes API response format
 */
export async function optimizeRoute(
  routeData: RoutesApiResponse,
  waypoints: Waypoint[],
  params: OptimizationParams
): Promise<OptimizedRoute> {
  const route = routeData.routes[0];
  if (!route) {
    throw new Error("No route found");
  }

  const legs = route.legs;
  const maxDrivingSeconds = params.maxDrivingHours * 3600;

  // Build segments from legs (Routes API format)
  const segments: RouteSegment[] = legs.map((leg, index) => ({
    from: waypoints[index],
    to: waypoints[index + 1],
    distance: leg.distanceMeters,
    duration: parseDuration(leg.duration), // Convert "3600s" to 3600
    drivingTime: parseDuration(leg.duration) / 60, // Convert to minutes
    polyline: leg.steps?.map(step => step.polyline?.encodedPolyline).filter(Boolean).join("") || route.polyline?.encodedPolyline || "",
  }));

  // Calculate total distance and duration
  const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);

  // Generate optimized stops
  const stops = generateOptimizedStops(
    waypoints,
    segments,
    maxDrivingSeconds,
    params
  );

  const drivingDays = stops.filter(stop => stop.isOvernight).length + 1;

  return {
    stops,
    segments,
    totalDistance,
    totalDuration,
    drivingDays,
    originalWaypoints: waypoints,
  };
}

/**
 * Generate optimized stops based on driving time limits
 */
function generateOptimizedStops(
  waypoints: Waypoint[],
  segments: RouteSegment[],
  maxDrivingSeconds: number,
  params: OptimizationParams
): OptimizedStop[] {
  const stops: OptimizedStop[] = [];
  let currentTime = params.departureTime || new Date();
  let dayNumber = 1;
  let accumulatedDrivingTime = 0;

  // First stop is always the origin (departure)
  stops.push({
    waypoint: waypoints[0],
    arrivalTime: currentTime,
    departureTime: currentTime,
    stopDuration: 0,
    dayNumber,
    isOvernight: false,
    accommodationNeeded: false,
  });

  currentTime = new Date(currentTime);

  // Process each segment
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const segmentDuration = segment.duration; // in seconds

    // Check if adding this segment would exceed daily limit
    if (accumulatedDrivingTime + segmentDuration > maxDrivingSeconds) {
      // Need to stop for the night at current location
      const previousStop = stops[stops.length - 1];

      // Mark previous stop as overnight
      previousStop.isOvernight = true;
      previousStop.accommodationNeeded = true;
      previousStop.stopDuration = 720; // 12 hours overnight (8pm to 8am)

      // Update current time for overnight stay
      currentTime = new Date(currentTime.getTime() + previousStop.stopDuration * 60 * 1000);

      // Start new day
      dayNumber++;
      accumulatedDrivingTime = 0;
    }

    // Add driving time for this segment
    accumulatedDrivingTime += segmentDuration;
    currentTime = new Date(currentTime.getTime() + segmentDuration * 1000);

    // Arrival at this waypoint
    const arrivalTime = new Date(currentTime);

    // Determine stop duration
    let stopDuration = 0;
    let isOvernight = false;
    let accommodationNeeded = false;

    // If this is the final destination
    if (i === segments.length - 1) {
      stopDuration = 0;
      isOvernight = false;
    }
    // If we need to check remaining driving time
    else {
      const nextSegment = segments[i + 1];
      const remainingTimeToday = maxDrivingSeconds - accumulatedDrivingTime;

      // If next segment won't fit today, mark as overnight
      if (nextSegment && nextSegment.duration > remainingTimeToday) {
        stopDuration = 720; // 12 hours overnight
        isOvernight = true;
        accommodationNeeded = true;
        dayNumber++;
        accumulatedDrivingTime = 0;
      } else {
        // Short rest stop
        stopDuration = params.preferredStopDuration;
      }
    }

    const departureTime = new Date(arrivalTime.getTime() + stopDuration * 60 * 1000);

    stops.push({
      waypoint: waypoints[i + 1],
      arrivalTime,
      departureTime,
      stopDuration,
      dayNumber,
      isOvernight,
      accommodationNeeded,
    });

    currentTime = departureTime;
  }

  return stops;
}

/**
 * Find points along route for optimal overnight stops
 * This is a more advanced version that finds intermediate cities/towns
 * Updated to work with Routes API
 */
export async function findOptimalStopPoints(
  routeData: RoutesApiResponse,
  maxDrivingSeconds: number
): Promise<Array<{ lat: number; lng: number }>> {
  const route = routeData.routes[0];
  if (!route) {
    throw new Error("No route found");
  }

  const totalDuration = parseDuration(route.duration);

  // If trip is within one day, no stops needed
  if (totalDuration <= maxDrivingSeconds) {
    return [];
  }

  // Find intermediate points along the route
  const numStops = Math.ceil(totalDuration / maxDrivingSeconds) - 1;
  const stopPoints: Array<{ lat: number; lng: number }> = [];

  // Use leg positions to approximate stop points
  const legs = route.legs;
  const stopInterval = legs.length / (numStops + 1);

  for (let i = 1; i <= numStops; i++) {
    const legIndex = Math.floor(stopInterval * i);
    if (legs[legIndex]) {
      stopPoints.push({
        lat: legs[legIndex].endLocation.latLng.latitude,
        lng: legs[legIndex].endLocation.latLng.longitude,
      });
    }
  }

  return stopPoints;
}

/**
 * Calculate estimated arrival time at destination
 */
export function calculateArrivalTime(
  departureTime: Date,
  totalDurationSeconds: number,
  numOvernightStops: number
): Date {
  const drivingTime = totalDurationSeconds * 1000; // Convert to ms
  const overnightTime = numOvernightStops * 12 * 60 * 60 * 1000; // 12 hours per overnight

  return new Date(departureTime.getTime() + drivingTime + overnightTime);
}

/**
 * Check if trip meets arrival deadline
 */
export function meetsDeadline(
  departureTime: Date,
  arrivalDeadline: Date,
  totalDurationSeconds: number,
  numOvernightStops: number
): boolean {
  const estimatedArrival = calculateArrivalTime(
    departureTime,
    totalDurationSeconds,
    numOvernightStops
  );

  return estimatedArrival <= arrivalDeadline;
}