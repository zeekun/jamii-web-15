"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { Fund } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import CreateForm from "../create.form";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
import AccessDenied from "@/components/access-denied";
import {
  deletePermissions,
  readPermissions,
  updatePermissions,
} from "../constants";
const { Title } = Typography;

export default function Page() {
  const { tenantId, fundId } = useParams();
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
    status: fundStatus,
    data: fund,
    error: fundError,
  } = useGetById<Fund>(`${tenantId}/funds`, `${fundId}`);

  if (fundStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={fundError.message}
        type={"error"}
      />
    );
  }

  if (fundStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (fundStatus === "success" && fund) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Fund</Title>
              <RecordActions
                actionTitle="fund"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/organisation/funds`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(fundId)}
                deleteUrl={`${tenantId}/funds`}
                updateForm={
                  <CreateForm
                    id={Number(fundId)}
                    submitType="update"
                    setIsModalOpen={setIsModalOpen}
                  />
                }
              />
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full">
                <tr className="text-lg">
                  <th className="w-[15rem]">Name:</th>
                  <td>{fund.name}</td>
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
