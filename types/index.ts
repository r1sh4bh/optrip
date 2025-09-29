export interface TripParameters {
  googleMapsLink: string;
  maxDrivingHours: number;
  departureTime?: Date;
  arrivalDeadline?: Date;
  preferredStopDuration: number; // in minutes
  avoidHighways?: boolean;
  avoidTolls?: boolean;
}

export interface Waypoint {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  address?: string;
}

export interface RouteSegment {
  from: Waypoint;
  to: Waypoint;
  distance: number; // in meters
  duration: number; // in seconds
  drivingTime: number; // in minutes
  polyline?: string;
}

export interface OptimizedStop {
  waypoint: Waypoint;
  arrivalTime: Date;
  departureTime: Date;
  stopDuration: number; // in minutes
  dayNumber: number;
  isOvernight: boolean;
  accommodationNeeded: boolean;
}

export interface OptimizedRoute {
  stops: OptimizedStop[];
  segments: RouteSegment[];
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  drivingDays: number;
  originalWaypoints: Waypoint[];
}

export interface ParsedGoogleMapsLink {
  origin: Waypoint;
  destination: Waypoint;
  waypoints: Waypoint[];
  rawUrl: string;
}