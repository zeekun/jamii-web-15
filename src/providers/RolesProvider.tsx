import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useGet } from "@/api";
import { MySession, Role } from "@/types";

type RolesContextType = {
  permissions: string[];
  isPermissionsLoading: boolean;
  error: string | null;
};

const RolesContext = createContext<RolesContextType | undefined>(undefined);

export const RolesProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const userSession = session as MySession;
  const tenantId = userSession?.user?.tenantId;
  const userRoles = userSession?.user?.roles || [];

  console.log(userRoles);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status, data: rolePermissions } = useGet<Role[]>(
    `${tenantId}/roles`,
    [`${tenantId}/rolesPermissions`]
  );

  useEffect(() => {
    if (!tenantId || !userRoles.length) return;

    if (status === "pending") {
      setIsPermissionsLoading(true);
      return;
    }

    if (status === "error") {
      setError("Failed to fetch role permissions.");
      setIsPermissionsLoading(false);
      return;
    }

    try {
      const matchingRoles = rolePermissions?.filter((role) =>
        userRoles.includes(role.name)
      );

      const consolidatedPermissions = matchingRoles?.flatMap(
        (role) => role.permissions?.map((permission) => permission.code) || []
      );

      const uniquePermissions = Array.from(new Set(consolidatedPermissions));

      setPermissions(uniquePermissions);
      setError(null);
    } catch (err) {
      console.error("Error processing permissions:", err);
      setError("An error occurred while processing permissions.");
    } finally {
      setIsPermissionsLoading(false);
    }
  }, [status, rolePermissions, userRoles, tenantId]);

  return (
    <RolesContext.Provider value={{ permissions, isPermissionsLoading, error }}>
      {children}
    </RolesContext.Provider>
  );
};

export const useRoles = () => {
  const context = useContext(RolesContext);
  if (context === undefined) {
    throw new Error("useRoles must be used within a RolesProvider");
  }
  return context;
};
