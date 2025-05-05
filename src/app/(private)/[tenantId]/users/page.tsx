"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { PAGE_TITLE } from "./constants";
import CreateForm from "./create.form";
import DataTable from "./data-table";
import { useParams } from "next/navigation";
import { useState } from "react";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import { Skeleton } from "antd";
import AccessDenied from "@/components/access-denied";

const createPermissions = ["CREATE_USER", "ALL_FUNCTIONS"];
const readPermissions = ["READ_USER", "ALL_FUNCTIONS", "ALL_FUNCTIONS_READ"];
export default function UsersPage() {
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
    data: users,
    error,
  } = useGet(`${tenantId}/users?filter={"order":["id DESC"]}`, [
    `${tenantId}/users?filter={"order":["id DESC"]}`,
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
          canCreate && (
            <CreateModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              pageTitle={PAGE_TITLE}
              submitType="create"
              CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
            />
          )
        }
      />

      {canRead ? (
        <>
          {status === "error" ? (
            <Alert_ message={"Error"} description={error} type={"error"} />
          ) : (
            <DataTable
              data={users}
              loading={status === "pending" ? true : false}
            />
          )}
        </>
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
