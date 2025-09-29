"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { MapPin, Clock, Calendar, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { TripParameters } from "@/types";

interface TripFormProps {
  onSubmit: (data: TripParameters) => void;
  isLoading?: boolean;
}

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxHours, setMaxHours] = useState(8);

  const { register, handleSubmit, formState: { errors } } = useForm<TripParameters>({
    defaultValues: {
      maxDrivingHours: 8,
      preferredStopDuration: 60,
      avoidHighways: false,
      avoidTolls: false,
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          Plan Your Road Trip
        </CardTitle>
        <CardDescription>
          Paste your Google Maps link and customize your travel preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Google Maps Link */}
          <div className="space-y-2">
            <Label htmlFor="googleMapsLink" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Google Maps Link
            </Label>
            <Input
              id="googleMapsLink"
              placeholder="https://maps.app.goo.gl/..."
              {...register("googleMapsLink", {
                required: "Please enter a Google Maps link",
                pattern: {
                  value: /^https:\/\/(maps\.app\.goo\.gl|www\.google\.com\/maps)/,
                  message: "Please enter a valid Google Maps link"
                }
              })}
            />
            {errors.googleMapsLink && (
              <p className="text-sm text-red-600">{errors.googleMapsLink.message}</p>
            )}
          </div>

          {/* Max Driving Hours */}
          <div className="space-y-2">
            <Label htmlFor="maxDrivingHours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Max Driving Hours per Day
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="maxDrivingHours"
                type="range"
                min="4"
                max="12"
                step="1"
                {...register("maxDrivingHours", { valueAsNumber: true })}
                onChange={(e) => setMaxHours(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-16 text-center">
                {maxHours} hrs
              </span>
            </div>
          </div>

          {/* Departure Time */}
          <div className="space-y-2">
            <Label htmlFor="departureTime" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Departure Date & Time (Optional)
            </Label>
            <Input
              id="departureTime"
              type="datetime-local"
              {...register("departureTime", { valueAsDate: true })}
            />
          </div>

          {/* Arrival Deadline */}
          <div className="space-y-2">
            <Label htmlFor="arrivalDeadline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Arrival Deadline (Optional)
            </Label>
            <Input
              id="arrivalDeadline"
              type="datetime-local"
              {...register("arrivalDeadline", { valueAsDate: true })}
            />
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Settings2 className="h-4 w-4" />
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="preferredStopDuration">
                  Preferred Stop Duration (minutes)
                </Label>
                <Input
                  id="preferredStopDuration"
                  type="number"
                  min="30"
                  max="180"
                  {...register("preferredStopDuration", { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="avoidHighways"
                  type="checkbox"
                  {...register("avoidHighways")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="avoidHighways" className="font-normal">
                  Avoid Highways
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="avoidTolls"
                  type="checkbox"
                  {...register("avoidTolls")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="avoidTolls" className="font-normal">
                  Avoid Tolls
                </Label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Optimizing Route..." : "Optimize My Trip"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}