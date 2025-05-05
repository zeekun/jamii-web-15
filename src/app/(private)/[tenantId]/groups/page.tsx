"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import pluralize from "pluralize";
import { ENDPOINT, MODAL_WIDTH, PAGE_TITLE, QUERY_KEY } from "./constants";
import CreateModal from "@/components/create.modal";
import DataTable from "./data-table";
import CreateForm from "./create.form";
import { useState } from "react";
import { useParams } from "next/navigation";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import AccessDenied from "@/components/access-denied";
import { Skeleton } from "antd";

const readPermissions = ["READ_GROUP", "ALL_FUNCTIONS", "ALL_FUNCTIONS_READ"];
const createPermissions = ["CREATE_GROUP", "ALL_FUNCTIONS"];
export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tenantId } = useParams();

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canRead = hasPermission(permissions, readPermissions);
  const canCreate = hasPermission(permissions, createPermissions);

  const {
    status,
    data: groups,
    error,
  } = useGet(`${tenantId}/${ENDPOINT}?filter={"order":["accountNo DESC"]}`, [
    QUERY_KEY,
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
              pageTitle={PAGE_TITLE}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
              width={MODAL_WIDTH}
            />
          ) : null
        }
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : canRead ? (
        <DataTable
          data={groups || []}
          loading={status === "pending" ? true : false}
        />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
