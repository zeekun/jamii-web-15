"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { CodeValue } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import CreateForm from "../create.form";
import AccessDenied from "@/components/access-denied";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
const { Title } = Typography;

const updatePermissions = ["UPDATE_CODEVALUE", "ALL_FUNCTIONS"];
const readPermissions = [
  "READ_CODEVALUE",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
const deletePermissions = ["DELETE_CODEVALUE", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, codeId, codeValueId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: codeValueStatus,
    data: codeValue,
    error: codeValueError,
  } = useGetById<CodeValue>(`${tenantId}/code-values`, `${codeValueId}`);

  if (codeValueStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={codeValueError.message}
        type={"error"}
      />
    );
  }

  if (codeValueStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (codeValueStatus === "success" && codeValue) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Code Value</Title>
              <RecordActions
                actionTitle="Code Value"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/system/codes/${codeId}`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                id={Number(codeValueId)}
                deleteUrl={`${tenantId}/code-values`}
                canDelete={canDelete}
                updateForm={
                  <CreateForm
                    id={Number(codeValueId)}
                    submitType="update"
                    setIsModalOpen={setIsModalOpen}
                  />
                }
              />
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full">
                <tr className="text-lg">
                  <th className="w-[10rem]">Name:</th>
                  <td>{codeValue.codeValue}</td>
                </tr>
                <tr>
                  <th>Description:</th>
                  <td>{codeValue.codeDescription}</td>
                </tr>
              </table>
            </div>
          </>
        ) : (
          <AccessDenied />
        )}
      </>
    );
  }

  return null;
}
