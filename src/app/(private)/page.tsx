"use client";
import { STORAGE_KEY } from "@/hooks/url-tracker";
import { MySession } from "@/types";
import { Skeleton } from "antd";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthRedirectHandler() {
  const { data: session, status } = useSession();
  const mySession = session as MySession | null;
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    console.log("Session status:", status);

    // Only proceed if authenticated and not already redirecting
    if (status !== "authenticated" || isRedirecting || redirectAttempted) {
      return;
    }

    const handleRedirect = async () => {
      setIsRedirecting(true);
      setRedirectAttempted(true);

      try {
        // Get the most recent URL from localStorage
        let targetUrl = callbackUrl || null;

        if (!targetUrl) {
          const storedUrls = localStorage.getItem(STORAGE_KEY);
          const visitedUrls = storedUrls ? JSON.parse(storedUrls) : [];

          if (Array.isArray(visitedUrls)) {
            // Get the most recent valid URL
            targetUrl = visitedUrls
              .reverse()
              .find((url) => typeof url === "string" && url.startsWith("/"));
          }
        }

        // Fallback to tenant dashboard or home
        if (!targetUrl) {
          targetUrl = mySession?.user.tenantId
            ? `/${mySession.user.tenantId}`
            : "/";
        }

        console.log("Final redirect target:", targetUrl);

        // Ensure we don't redirect to auth pages
        if (targetUrl.startsWith("/auth")) {
          targetUrl = mySession?.user.tenantId
            ? `/${mySession.user.tenantId}`
            : "/";
        }

        // Clear history after determining target
        localStorage.removeItem(STORAGE_KEY);

        // Use window.location for final redirect to prevent history API issues
        if (typeof window !== "undefined") {
          window.location.href = targetUrl;
        } else {
          router.push(targetUrl);
        }
      } catch (error) {
        console.error("Redirect error:", error);
        const fallbackUrl = mySession?.user.tenantId
          ? `/${mySession.user.tenantId}`
          : "/";
        router.push(fallbackUrl);
      } finally {
        setIsRedirecting(false);
      }
    };

    // Add slight delay to ensure session is fully established
    const timer = setTimeout(handleRedirect, 100);
    return () => clearTimeout(timer);
  }, [
    status,
    callbackUrl,
    mySession,
    router,
    isRedirecting,
    redirectAttempted,
  ]);

  if (status === "loading" || isRedirecting) {
    return <Skeleton />;
  }

  if (status === "unauthenticated") {
    return <>You are not authenticated</>;
  }

  return <Skeleton />;
}
