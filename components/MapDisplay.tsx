"use client";

import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { calculateRoute, getRouteTotals } from "@/lib/google-maps";
import { formatDistance, formatDuration } from "@/lib/utils";

interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface MapDisplayProps {
  origin: Waypoint;
  destination: Waypoint;
  waypoints?: Waypoint[];
  avoidHighways?: boolean;
  avoidTolls?: boolean;
}

export function MapDisplay({
  origin,
  destination,
  waypoints = [],
  avoidHighways = false,
  avoidTolls = false,
}: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const { isLoaded, error } = useGoogleMaps();
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !origin || !destination) return;

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      zoom: 7,
      center: { lat: origin.lat, lng: origin.lng },
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Initialize directions renderer
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#3B82F6",
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });

    directionsRendererRef.current = directionsRenderer;

    // Calculate and display route
    const displayRoute = async () => {
      setIsCalculating(true);
      try {
        const result = await calculateRoute(
          { lat: origin.lat, lng: origin.lng },
          { lat: destination.lat, lng: destination.lng },
          waypoints.map((wp) => ({ lat: wp.lat, lng: wp.lng })),
          { avoidHighways, avoidTolls }
        );

        if (result && directionsRenderer) {
          directionsRenderer.setDirections(result);

          // Get route totals
          const totals = getRouteTotals(result);
          setRouteInfo(totals);
        }
      } catch (err) {
        console.error("Error displaying route:", err);
      } finally {
        setIsCalculating(false);
      }
    };

    displayRoute();

    // Cleanup
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [isLoaded, origin, destination, waypoints, avoidHighways, avoidTolls]);

  if (error) {
    return (
      <div className="w-full h-[500px] bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-800 font-semibold mb-2">Failed to load map</p>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Make sure you have added your Google Maps API key to .env.local
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Route Info */}
      {routeInfo && (
        <div className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Distance</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatDistance(routeInfo.distance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Duration</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatDuration(routeInfo.duration)}
            </p>
          </div>
        </div>
      )}

      {isCalculating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          Calculating route...
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-[500px] rounded-lg shadow-lg border border-gray-200"
      />

      {/* Waypoints List */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Route Waypoints</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              A
            </div>
            <div>
              <p className="font-medium text-gray-900">{origin.name}</p>
              <p className="text-sm text-gray-600">{origin.address}</p>
            </div>
          </div>

          {waypoints.map((wp, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">{wp.name}</p>
                <p className="text-sm text-gray-600">{wp.address}</p>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              B
            </div>
            <div>
              <p className="font-medium text-gray-900">{destination.name}</p>
              <p className="text-sm text-gray-600">{destination.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}