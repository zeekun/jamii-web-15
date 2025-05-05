// templates/page.tsx
"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import {
  PAGE_TITLE,
  ENDPOINT,
  QUERY_KEY,
  createPermissions,
  readPermissions,
} from "./constants";
import CreateForm from "./create.form";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import { Skeleton } from "antd";
import AccessDenied from "@/components/access-denied";

export default function TemplatesPage() {
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
    data: templates,
    error,
  } = useGet(`${tenantId}/${ENDPOINT}?filter={"order":["id DESC"]}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  if (templates === "pending" || isPermissionsLoading) {
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
              width={1000}
              pageTitle={PAGE_TITLE}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              submitType="create"
              CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
            />
          ) : null
        }
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : canRead ? (
        <DataTable data={templates} loading={status === "pending"} />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
