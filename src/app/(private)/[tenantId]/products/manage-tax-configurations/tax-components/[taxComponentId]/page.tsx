"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { TaxComponent } from "@/types";
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

const updatePermissions = ["UPDATE_TAXCOMPONENT", "ALL_FUNCTIONS"];
const readPermissions = [
  "READ_TAXCOMPONENT",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];

export default function Page() {
  const { tenantId, taxComponentId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);

  const {
    status: taxComponentStatus,
    data: taxComponent,
    error: taxComponentError,
  } = useGetById<TaxComponent>(
    `${tenantId}/tax-components`,
    `${taxComponentId}`
  );

  if (taxComponentStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={taxComponentError.message}
        type={"error"}
      />
    );
  }

  if (taxComponentStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (taxComponentStatus === "success" && taxComponent) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Tax component</Title>
              <RecordActions
                actionTitle="tax component"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/products/manage-tax-configurations/tax-components`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                id={Number(taxComponentId)}
                deleteUrl={`${tenantId}/tax-components`}
                updateForm={
                  <CreateForm
                    id={Number(taxComponentId)}
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
                  <td>{taxComponent.name}</td>
                </tr>
                <tr className="text-lg">
                  <th className="w-[10rem]">Percentage:</th>
                  <td>{formatNumber(taxComponent.percentage, 2)}%</td>
                </tr>

                <tr>
                  <th>Start Date:</th>
                  <td>{formattedDate(taxComponent.startDate)}</td>
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
