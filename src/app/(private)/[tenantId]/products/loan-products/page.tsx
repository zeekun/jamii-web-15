"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import {
  createPermissions,
  ENDPOINT,
  PAGE_TITLE,
  QUERY_KEY,
  readPermissions,
} from "./constants";
import CreateModal from "./create.modal";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { Skeleton } from "antd";

export default function ProductLoansPage() {
  const { tenantId } = useParams();

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canCreate = hasPermission(permissions, createPermissions);
  const canRead = hasPermission(permissions, readPermissions);

  const {
    status: loansStatus,
    data: loans,
    error,
  } = useGet(`${tenantId}/${ENDPOINT}?filter={"order":["id DESC"]}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  if (isPermissionsLoading || loansStatus === "pending") {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  return (
    <div>
      <PageHeader
        pageTitle={pluralize(PAGE_TITLE)}
        createModal={canCreate && <CreateModal submitType="create" />}
      />

      {loansStatus === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : canRead ? (
        <DataTable data={loans} loading={loansStatus !== "success"} />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
