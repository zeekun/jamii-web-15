"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import CreateForm from "./create.form";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import { Skeleton } from "antd";
import AccessDenied from "@/components/access-denied";

const readPermissions = ["READ_OFFICE", "ALL_FUNCTIONS", "ALL_FUNCTIONS_READ"];
const createPermissions = ["CREATE_OFFICE", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canRead = hasPermission(permissions, readPermissions);
  const canCreate = hasPermission(permissions, createPermissions);

  const {
    status,
    data: offices,
    error,
  } = useGet(`${tenantId}/${ENDPOINT}?filter[include][]=parent`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  if (isPermissionsLoading) {
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
        <DataTable
          data={offices || []}
          loading={status === "pending" ? true : false}
        />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
