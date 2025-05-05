"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import {
  createPermissions,
  ENDPOINT,
  PAGE_TITLE,
  readPermissions,
} from "./constants";
import CreateModal from "./create.modal";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import { Skeleton } from "antd";
import AccessDenied from "@/components/access-denied";

export default function SavingsPage() {
  const { tenantId } = useParams();

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canCreate = hasPermission(permissions, createPermissions);
  const canRead = hasPermission(permissions, readPermissions);

  const {
    status,
    data: savings,
    error,
  } = useGet(
    `${tenantId}/savings-products?filter={"where":{"depositTypeEnum":"SAVING DEPOSIT"},"order":["id DESC"]}`,
    [
      `${tenantId}/savings-products?filter={"where":{"depositTypeEnum":"SAVING DEPOSIT"},"order":["id DESC"]}`,
    ]
  );

  if (isPermissionsLoading || status === "pending") {
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

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : canRead ? (
        <DataTable
          data={savings}
          loading={status !== "success" ? true : false}
        />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
