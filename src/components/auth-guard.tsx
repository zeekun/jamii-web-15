"use client";
import { useAuth } from "@/providers/AuthProvider";
import { LoadingOutlined } from "@ant-design/icons";
import { Modal, Spin } from "antd";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_TIMEOUT_MS = 1 * 60 * 1000; // 1 minute before logout

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setTokens } = useAuth(); // Now safe to destructure
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [warningModalVisible, setWarningModalVisible] = useState(false);

  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const guestRoutes = useMemo(
    () => [
      "/auth/login",
      "/auth/forgot",
      "/auth/reset-password",
      "/multiple-tabs-error",
    ],
    []
  );

  const handleLogout = useCallback(() => {
    setTokens(null, null);
    setWarningModalVisible(false);
    signOut();
    router.push("/auth/login");
  }, [router, setTokens]);

  const resetIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    warningTimeoutRef.current = setTimeout(() => {
      setWarningModalVisible(true);
      idleTimeoutRef.current = setTimeout(() => {
        handleLogout();
      }, WARNING_TIMEOUT_MS);
    }, IDLE_TIMEOUT_MS - WARNING_TIMEOUT_MS);
  }, [handleLogout]);

  const handleModalStayActive = useCallback(() => {
    setWarningModalVisible(false);
    resetIdleTimeout();
  }, [resetIdleTimeout]);

  useEffect(() => {
    const isGuestRoute = guestRoutes.includes(pathname);
    setLoading(true);

    if (status === "loading") return;

    if (status === "authenticated" && isGuestRoute) {
      setTokens(session?.accessToken ?? null, session?.refreshToken ?? null);
      router.push("/");
    } else if (status === "unauthenticated" && !isGuestRoute) {
      setWarningModalVisible(false);
      router.push("/auth/login");
    } else {
      setLoading(false);
    }
  }, [pathname, status, guestRoutes, router, setTokens, session]);

  useEffect(() => {
    const handleUserActivity = () => {
      resetIdleTimeout();
    };

    if (status === "authenticated") {
      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
      window.addEventListener("click", handleUserActivity);
      window.addEventListener("touchstart", handleUserActivity);

      resetIdleTimeout();
    }

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, [status, resetIdleTimeout]);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-screen bg-white">
          <Spin size="large" indicator={<LoadingOutlined spin />} />
        </div>
      ) : (
        <>
          {children}
          <Modal
            title="Session Timeout Warning"
            open={warningModalVisible}
            onOk={handleModalStayActive}
            onCancel={handleLogout}
            okText="Stay Logged In"
            cancelText="Logout Now"
          >
            <p>
              You have been inactive for a while. You will be logged out soon
              unless you take action.
            </p>
          </Modal>
        </>
      )}
    </>
  );
}
