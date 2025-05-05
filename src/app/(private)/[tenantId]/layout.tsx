"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Alert_ from "@/components/alert";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenantId } = useParams();
  const [isValidTenantId, setIsValidTenantId] = useState(true);

  useEffect(() => {
    const numericId = Number(tenantId);
    setIsValidTenantId(!isNaN(numericId));
  }, [tenantId]);

  if (!isValidTenantId) {
    return (
      <Alert_
        message="Error 404"
        description="Invalid Tenant ID"
        type="error"
      />
    );
  }

  return <>{children}</>;
}
