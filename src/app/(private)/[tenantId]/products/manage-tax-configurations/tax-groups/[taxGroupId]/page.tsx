"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { TaxGroup } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import CreateForm from "../create.form";
import AccessDenied from "@/components/access-denied";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
import { formatNumber } from "@/utils/numbers";
const { Title } = Typography;

const updatePermissions = ["UPDATE_TAXGROUP", "ALL_FUNCTIONS"];
const readPermissions = [
  "READ_TAXGROUP",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];

export default function Page() {
  const { tenantId, taxGroupId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);

  const {
    status: taxGroupStatus,
    data: taxGroup,
    error: taxGroupError,
  } = useGetById<TaxGroup>(`${tenantId}/tax-groups`, `${taxGroupId}`);

  if (taxGroupStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={taxGroupError.message}
        type={"error"}
      />
    );
  }

  if (taxGroupStatus === "success") {
    console.log("taxGroup", taxGroup);
  }

  if (taxGroupStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (taxGroupStatus === "success" && taxGroup) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Tax Group</Title>
              <RecordActions
                actionTitle="tax group"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/products/manage-tax-configurations/tax-groups`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                id={Number(taxGroupId)}
                deleteUrl={`${tenantId}/taxGroups`}
                updateForm={
                  <CreateForm
                    id={Number(taxGroupId)}
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
                  <td>{taxGroup.name}</td>
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
