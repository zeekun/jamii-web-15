"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import { GLFinancialActivityAccount } from "@/types";
import pluralize from "pluralize";
import { CREATE_MODAL_WIDTH, ENDPOINT, PAGE_TITLE } from "./constants";
import CreateForm from "./create.form";
import DataTable from "./data-table";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { Skeleton } from "antd";

const createPermissions = ["CREATE_FINANCIALACTIVITYACCOUNT", "ALL_FUNCTIONS"];
const readPermissions = [
  "READ_FINANCIALACTIVITYACCOUNT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
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
    data: chartOfAccounts,
    error,
  } = useGet<GLFinancialActivityAccount[]>(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${ENDPOINT}`,
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
              pageTitle={PAGE_TITLE}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              CreateForm={
                <CreateForm
                  submitType="create"
                  setIsModalOpen={setIsModalOpen}
                />
              }
              submitType="create"
              width={CREATE_MODAL_WIDTH}
            />
          )
        }
      />
      {canRead ? (
        <>
          {" "}
          {status === "error" ? (
            <Alert_ message={"Error"} description={error} type={"error"} />
          ) : (
            <DataTable
              data={chartOfAccounts}
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
