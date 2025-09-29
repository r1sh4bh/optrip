"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TripParameters } from "@/types";
import { Map } from "lucide-react";

export default function PlanPage() {
  const router = useRouter();
  const [tripData, setTripData] = useState<TripParameters | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("tripParameters");
    if (data) {
      setTripData(JSON.parse(data));
    } else {
      router.push("/");
    }
  }, [router]);

  if (!tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-900">
              🚧 Route optimization is coming soon! We&apos;re working on parsing your Google Maps link
              and generating the optimal itinerary.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}