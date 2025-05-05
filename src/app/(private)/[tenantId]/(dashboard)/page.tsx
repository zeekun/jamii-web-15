"use client";

import { useGetById } from "@/api";
import Alert_ from "@/components/alert";
import Loading from "@/components/loading";
import { MySession, Tenant } from "@/types";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import SuperDashboard from "./components/super-dashboard";
import NonSuperDashboard from "./components/non-super-dashboard";
import { Skeleton } from "antd";

export default function Dashboard() {
  const { tenantId } = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const mySession = session as MySession | null;

  const {
    status: tenantStatus,
    data: tenant,
    error: tenantError,
  } = useGetById<Tenant>(`${tenantId}/tenants`, `${tenantId}`);

  // 🛡️ Guard: If either session or tenant is still loading
  if (sessionStatus === "loading" || tenantStatus === "pending") {
    return <Skeleton />;
  }

  // 🛡️ Guard: If session failed (very rare but defensive)
  if (sessionStatus === "unauthenticated") {
    return <Alert_ message="Not authenticated" type="error" />;
  }

  // 🛡️ Guard: If tenant fetching failed
  if (tenantStatus === "error") {
    return (
      <Alert_
        message="Error loading tenant"
        description={tenantError}
        type="error"
      />
    );
  }

  // 🛡️ Guard: If session somehow didn't load properly
  if (!mySession) {
    return <Alert_ message="Session not found" type="error" />;
  }

  // ✅ Now both session and tenant are loaded safely
  if (mySession.user.roles?.includes("super") && tenant?.name === "default") {
    return <SuperDashboard />;
  }

  return (
    <div className="grid grid-cols-12 capitalize">
      <NonSuperDashboard mySession={mySession} tenant={tenant} />
    </div>
  );
}
