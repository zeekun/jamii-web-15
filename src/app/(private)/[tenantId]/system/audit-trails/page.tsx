"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY, readPermissions } from "./constants";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { Skeleton } from "antd";

export default function Page() {
  const { tenantId } = useParams();

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canRead = hasPermission(permissions, readPermissions);

  const { status, data, error } = useGet(
    `${tenantId}/${ENDPOINT}?filter={"order":["id DESC"]}`,
    [`${tenantId}/${QUERY_KEY}`]
  );

  if (isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  return (
    <div>
      <PageHeader pageTitle={PAGE_TITLE} />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : canRead ? (
        <DataTable data={data} loading={status === "pending" ? true : false} />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
