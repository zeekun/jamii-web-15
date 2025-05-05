"use client";
import { useGet, useGetById } from "@/api";
import Alert_ from "@/components/alert";
import CreateModal from "@/components/create.modal";
import PageHeader from "@/components/page-header";
import { Code, CodeValue } from "@/types";
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

const readPermissions = [
  "READ_CODEVALUE",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
const createPermissions = ["CREATE_CODEVALUE", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, codeId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canRead = hasPermission(permissions, readPermissions);
  const canCreate = hasPermission(permissions, createPermissions);

  const {
    status: codeValuesStatus,
    data: codeValues,
    error: codeValuesError,
  } = useGet<CodeValue[]>(`${tenantId}/codes/${codeId}/code-values`, [
    `${tenantId}/codes/${codeId}/code-values`,
  ]);

  const {
    status: codeStatus,
    data: code,
    error: codeError,
  } = useGetById<Code>(`${tenantId}/codes`, `${codeId}`);

  const subPageTitle = codeStatus === "success" ? code.name : null;
  const actionColumns = codeStatus === "success" ? code.systemDefined : null;

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
        pageTitle={`${pluralize(PAGE_TITLE)} For ${subPageTitle}`}
        createModal={
          canCreate && (
            <CreateModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              pageTitle={PAGE_TITLE}
              CreateForm={<CreateForm setIsModalOpen={setIsModalOpen} />}
            />
          )
        }
      />

      {codeValuesStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={codeValuesError}
          type={"error"}
        />
      ) : canRead ? (
        <DataTable
          data={codeValues}
          loading={codeValuesStatus === "pending" ? true : false}
          actionColumns={actionColumns}
          codeId={`${codeId}`}
          subPageTitle={subPageTitle}
        />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
