import { useEffect, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps";

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load Google Maps:", err);
        setError(err.message || "Failed to load Google Maps");
      });
  }, []);

  return { isLoaded, error };
}