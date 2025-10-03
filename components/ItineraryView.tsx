"use client";

import { OptimizedRoute } from "@/types";
import { formatDistance, formatDuration, formatDate, formatTime } from "@/lib/utils";
import { Calendar, Clock, MapPin, Moon, Sun, Download, Share2, FileText } from "lucide-react";
import { useState } from "react";

interface ItineraryViewProps {
  optimizedRoute: OptimizedRoute;
  onExportPDF?: () => void;
  onExportCalendar?: () => void;
  onShare?: () => void;
}

export function ItineraryView({ optimizedRoute, onExportPDF, onExportCalendar, onShare }: ItineraryViewProps) {
  const { stops, totalDistance, totalDuration, drivingDays } = optimizedRoute;
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Group stops by day
  const stopsByDay: { [key: number]: typeof stops } = {};
  stops.forEach((stop) => {
    if (!stopsByDay[stop.dayNumber]) {
      stopsByDay[stop.dayNumber] = [];
    }
    stopsByDay[stop.dayNumber].push(stop);
  });

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Optimized Trip Plan</h2>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            {/* Export Dropdown */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                <button
                  onClick={() => {
                    onExportPDF?.();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Export as PDF
                </button>
                <button
                  onClick={() => {
                    onExportCalendar?.();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Add to Calendar
                </button>
                <button
                  onClick={() => {
                    onShare?.();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Link
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Distance</p>
            <p className="text-3xl font-bold">{formatDistance(totalDistance)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Driving Time</p>
            <p className="text-3xl font-bold">{formatDuration(totalDuration)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Trip Duration</p>
            <p className="text-3xl font-bold">{drivingDays} {drivingDays === 1 ? 'day' : 'days'}</p>
          </div>
        </div>
      </div>

      {/* Daily Itinerary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Day-by-Day Itinerary</h3>

        <div className="space-y-8">
          {Object.entries(stopsByDay).map(([day, dayStops]) => (
            <div key={day} className="relative">
              {/* Day Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {day}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Day {day}</h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(dayStops[0].arrivalTime)}
                  </p>
                </div>
              </div>

              {/* Stops Timeline */}
              <div className="ml-5 border-l-2 border-gray-200 pl-8 space-y-6">
                {dayStops.map((stop, index) => {
                  const isFirstStop = index === 0 && parseInt(day) === 1;
                  const isLastStop = index === dayStops.length - 1 && parseInt(day) === drivingDays;

                  return (
                    <div key={index} className="relative">
                      {/* Timeline Marker */}
                      <div
                        className={`absolute -left-[42px] h-6 w-6 rounded-full border-4 border-white ${
                          isFirstStop
                            ? "bg-green-500"
                            : isLastStop
                            ? "bg-red-500"
                            : stop.isOvernight
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }`}
                      />

                      {/* Stop Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-gray-600" />
                              <h5 className="font-semibold text-gray-900">
                                {stop.waypoint.name}
                              </h5>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">
                              {stop.waypoint.address}
                            </p>
                          </div>

                          {stop.isOvernight && (
                            <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              <Moon className="h-3 w-3" />
                              Overnight
                            </span>
                          )}
                        </div>

                        {/* Times */}
                        <div className="flex items-center gap-4 ml-6 mt-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Clock className="h-4 w-4" />
                            <span>Arrive: {formatTime(stop.arrivalTime)}</span>
                          </div>

                          {stop.stopDuration > 0 && (
                            <>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1 text-gray-700">
                                {stop.isOvernight ? (
                                  <Moon className="h-4 w-4" />
                                ) : (
                                  <Calendar className="h-4 w-4" />
                                )}
                                <span>
                                  {stop.isOvernight
                                    ? "Overnight stay"
                                    : `${stop.stopDuration} min stop`}
                                </span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1 text-gray-700">
                                <Sun className="h-4 w-4" />
                                <span>Depart: {formatTime(stop.departureTime)}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Accommodation Needed */}
                        {stop.accommodationNeeded && (
                          <div className="ml-6 mt-3 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-900">
                            🏨 Book accommodation for the night
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Trip Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Plan to book accommodations in advance at overnight stops</li>
          <li>• Add buffer time for meals, rest stops, and unexpected delays</li>
          <li>• Check weather conditions before departure</li>
          <li>• Keep emergency contacts and roadside assistance info handy</li>
        </ul>
      </div>
    </div>
  );
}