"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import {
  createPermissions,
  ENDPOINT,
  PAGE_TITLE,
  QUERY_KEY,
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

export default function Page() {
  const { tenantId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canCreate = hasPermission(permissions, createPermissions);
  const canRead = hasPermission(permissions, readPermissions);

  const { status, data, error } = useGet(
    `${tenantId}/${ENDPOINT}?filter={"order":["id DESC"]}`,
    [`${tenantId}/${QUERY_KEY}?filter={"order":["id DESC"]}`]
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
        pageTitle={PAGE_TITLE}
        createModal={
          canCreate && (
            <CreateModal
              pageTitle={PAGE_TITLE}
              setIsModalOpen={setIsModalOpen}
              isModalOpen={isModalOpen}
              CreateForm={
                <CreateForm
                  submitType="create"
                  setIsModalOpen={setIsModalOpen}
                />
              }
              submitType="create"
            />
          )
        }
      />

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : canRead ? (
        <DataTable data={data} loading={status !== "success" ? true : false} />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
