"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Clock, Route, Sparkles } from "lucide-react";
import { TripForm } from "@/components/TripForm";
import { TripParameters } from "@/types";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: TripParameters) => {
    setIsLoading(true);
    try {
      // Store trip data in session storage for now
      sessionStorage.setItem("tripParameters", JSON.stringify(data));
      // Navigate to plan page
      router.push("/plan");
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <Map className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">OpTrip</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Optimize Your Road Trip
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Turn your Google Maps route into a realistic travel plan with smart overnight stops,
            perfect timing, and personalized preferences.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Custom Timing</h3>
              <p className="text-sm text-gray-600">
                Set your daily driving limits and departure times
              </p>
            </div>

            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <Route className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Smart Stops</h3>
              <p className="text-sm text-gray-600">
                Get optimal overnight locations and rest stops
              </p>
            </div>

            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Day-by-Day Plan</h3>
              <p className="text-sm text-gray-600">
                Detailed itinerary with times, distances, and routes
              </p>
            </div>
          </div>
        </div>

        {/* Trip Form */}
        <TripForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* How It Works */}
        <div className="max-w-2xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Share Your Route</h4>
                <p className="text-gray-600">
                  Paste a Google Maps link with your desired destinations
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Set Your Preferences</h4>
                <p className="text-gray-600">
                  Choose driving hours per day, departure time, and arrival deadline
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Get Your Optimized Plan</h4>
                <p className="text-gray-600">
                  Receive a detailed day-by-day itinerary with perfect stopping points
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200">
        <p className="text-center text-gray-600 text-sm">
          Built with Next.js and Google Maps API
        </p>
      </footer>
    </div>
  );
}
