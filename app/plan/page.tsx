"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TripParameters } from "@/types";
import { Map, AlertCircle } from "lucide-react";
import { MapDisplay } from "@/components/MapDisplay";

interface ParsedRoute {
  origin: { name: string; lat: number; lng: number; address: string };
  destination: { name: string; lat: number; lng: number; address: string };
  waypoints: Array<{ name: string; lat: number; lng: number; address: string }>;
}

export default function PlanPage() {
  const router = useRouter();
  const [tripData, setTripData] = useState<TripParameters | null>(null);
  const [parsedRoute, setParsedRoute] = useState<ParsedRoute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("tripParameters");
    if (data) {
      const params = JSON.parse(data);
      setTripData(params);

      // Parse the Google Maps link
      parseGoogleMapsLink(params.googleMapsLink);
    } else {
      router.push("/");
    }
  }, [router]);

  const parseGoogleMapsLink = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/parse-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse link");
      }

      const data = await response.json();
      setParsedRoute(data);
    } catch (err) {
      console.error("Error parsing link:", err);
      setError(err instanceof Error ? err.message : "Failed to parse Google Maps link");
    } finally {
      setIsLoading(false);
    }
  };

  if (!tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">OpTrip</h1>
            </div>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Optimized Trip Plan
          </h2>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Trip Parameters</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Google Maps Link:</span>{" "}
                <a
                  href={tripData.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Original Route
                </a>
              </p>
              <p>
                <span className="font-medium">Max Driving Hours:</span>{" "}
                {tripData.maxDrivingHours} hours/day
              </p>
              {tripData.departureTime && (
                <p>
                  <span className="font-medium">Departure:</span>{" "}
                  {new Date(tripData.departureTime).toLocaleString()}
                </p>
              )}
              {tripData.arrivalDeadline && (
                <p>
                  <span className="font-medium">Arrival Deadline:</span>{" "}
                  {new Date(tripData.arrivalDeadline).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Parsing your route...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Failed to parse route</p>
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={() => router.push("/")}
                    className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try a different link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Map Display */}
          {parsedRoute && !isLoading && !error && (
            <div className="space-y-6">
              <MapDisplay
                origin={parsedRoute.origin}
                destination={parsedRoute.destination}
                waypoints={parsedRoute.waypoints}
                avoidHighways={tripData.avoidHighways}
                avoidTolls={tripData.avoidTolls}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-900">
                  🚧 Route optimization is coming soon! This shows your original route.
                  Next, we&apos;ll break it down into daily segments based on your preferences.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}