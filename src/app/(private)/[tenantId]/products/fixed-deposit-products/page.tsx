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
import { useState } from "react";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { Skeleton } from "antd";

export default function SavingsPage() {
  const { tenantId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    `${tenantId}/${ENDPOINT}?filter={"where":{"depositTypeEnum":"FIXED DEPOSIT"}}`,
    [
      `${tenantId}/${ENDPOINT}?filter={"where":{"depositTypeEnum":"FIXED DEPOSIT"}}`,
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
