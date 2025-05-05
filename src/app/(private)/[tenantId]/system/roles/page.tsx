"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import {
  createRolePermissions,
  ENDPOINT,
  PAGE_TITLE,
  QUERY_KEY,
  readRolePermissions,
} from "./constants";
import CreateForm from "./create.form";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { Skeleton } from "antd";

export default function Page() {
  const { tenantId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canCreate = hasPermission(permissions, createRolePermissions);
  const canRead = hasPermission(permissions, readRolePermissions);

  const {
    status,
    data: roles,
    error,
  } = useGet(`${tenantId}/${ENDPOINT}?filter={"order":["id DESC"]}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  if (roles === "pending" || isPermissionsLoading) {
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
        createModal={
          canCreate ? (
            <CreateModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              pageTitle={PAGE_TITLE}
              CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
            />
          ) : null
        }
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : canRead ? (
        <DataTable data={roles} loading={status === "pending" ? true : false} />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
