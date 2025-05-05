"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { Holiday } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import CreateForm from "../create.form";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
import AccessDenied from "@/components/access-denied";
const { Title } = Typography;

const updatePermissions = ["UPDATE_HOLIDAY", "ALL_FUNCTIONS"];
const readPermissions = ["READ_HOLIDAY", "ALL_FUNCTIONS", "ALL_FUNCTIONS_READ"];
const deletePermissions = ["DELETE_HOLIDAY", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, holidayId } = useParams();
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
    status: holidayStatus,
    data: holiday,
    error: holidayError,
  } = useGetById<Holiday>(`${tenantId}/holidays`, `${holidayId}`);

  if (holidayStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={holidayError.message}
        type={"error"}
      />
    );
  }

  if (holidayStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (holidayStatus === "success" && holiday) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Holiday</Title>
              <RecordActions
                actionTitle="holiday"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/organisation/holidays`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(holidayId)}
                deleteUrl={`${tenantId}/holidays`}
                updateForm={
                  <CreateForm
                    id={Number(holidayId)}
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
                  <td>{holiday.name}</td>
                </tr>
                <tr>
                  <th>From:</th>
                  <td>
                    {formattedDate(holiday.fromDate) &&
                      formattedDate(holiday.fromDate)}
                  </td>
                </tr>
                <tr>
                  <th>To:</th>
                  <td>
                    {formattedDate(holiday.toDate) &&
                      formattedDate(holiday.toDate)}
                  </td>
                </tr>
                <tr>
                  <th>Repayments Scheduled To:</th>
                  <td>
                    {holiday.repaymentScheduledTo &&
                      formattedDate(holiday.repaymentScheduledTo)}
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
