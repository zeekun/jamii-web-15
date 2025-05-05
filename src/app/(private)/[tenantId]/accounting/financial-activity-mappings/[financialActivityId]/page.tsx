"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { GLFinancialActivityAccount } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import CreateForm from "../create.form";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { Skeleton, Typography } from "antd";
import { CREATE_MODAL_WIDTH, PAGE_URL } from "../constants";
import RecordActions from "@/components/record-actions";
import _ from "lodash";
const { Title } = Typography;

const updatePermissions = ["UPDATE_FINANCIALACTIVITYACCOUNT", "ALL_FUNCTIONS"];
const readPermissions = [
  "READ_FINANCIALACTIVITYACCOUNT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
const deletePermissions = ["DELETE_FINANCIALACTIVITYACCOUNT", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, financialActivityId } = useParams();
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
    status: financialActivityStatus,
    data: financialActivity,
    error: financialActivityError,
  } = useGetById<GLFinancialActivityAccount>(
    `${tenantId}/gl-financial-activity-accounts`,
    `${financialActivityId}`
  );

  if (financialActivityStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={financialActivityError.message}
        type={"error"}
      />
    );
  }

  if (financialActivityStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (financialActivityStatus === "success" && financialActivity) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Financial Activity Mapping</Title>
              <RecordActions
                actionTitle="financial activity"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/${PAGE_URL}`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(financialActivityId)}
                deleteUrl={`${tenantId}/gl-financial-activity-accounts`}
                updateForm={
                  <CreateForm
                    id={Number(financialActivityId)}
                    submitType="update"
                    setIsModalOpen={setIsModalOpen}
                  />
                }
                modalWidth={CREATE_MODAL_WIDTH}
              />
            </div>
            <div className=" w-full">
              <table className="text-md text-left w-full border-solid border-[1px] mt-3 border-gray-200">
                <tr className="text-lg">
                  <th className="w-[15rem]">Financial Activity:</th>
                  <td className="capitalize">
                    {_.toLower(financialActivity.financialActivityTypeEnum)}
                  </td>
                </tr>
                <tr>
                  <th>Account Name:</th>
                  <td className="capitalize">
                    {financialActivity.glAccount.name} (
                    {financialActivity.glAccount.glCode})
                  </td>
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
