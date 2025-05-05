"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const APP_PREFIX = process.env.NEXT_PUBLIC_API_BASE_URL || "myapp";
export const STORAGE_KEY = `${APP_PREFIX}_visitedUrls_v2`;
const MAX_URLS = 5;

export function useUrlTracker() {
  const pathname = usePathname();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Skip if not client-side
    if (typeof window === "undefined") return;

    // Only initialize localStorage once
    if (!initializedRef.current) {
      try {
        const storedUrls = localStorage.getItem(STORAGE_KEY);
        if (!storedUrls) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
        initializedRef.current = true;
      } catch (error) {
        // Handle potential localStorage errors silently
      }
    }

    // Track URL changes
    try {
      // Don't process if the pathname is invalid
      if (!pathname) return;

      const fullUrl = window.location.origin + pathname;

      // Get current URLs from localStorage
      const storedUrls = localStorage.getItem(STORAGE_KEY);
      const urls = storedUrls ? JSON.parse(storedUrls) : [];

      // Skip if this is the exact same URL as the most recent one
      if (urls.length > 0 && urls[urls.length - 1] === fullUrl) {
        return;
      }

      // More efficient URL management - remove duplicates and add to end
      const newUrls = [
        ...urls.filter((url: string) => url !== fullUrl),
        fullUrl,
      ];

      // Keep only the most recent MAX_URLS
      const trimmedUrls = newUrls.slice(-MAX_URLS);

      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedUrls));
    } catch (error) {
      // Gracefully handle errors
    }
  }, [pathname]);
}
