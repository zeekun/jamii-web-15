"use client";
import { useGetById } from "@/api";
import RecordActions from "@/components/record-actions";
import { LoanCollateral } from "@/types";
import { Skeleton, Typography } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import Alert_ from "@/components/alert";
import { formatNumber } from "@/utils/numbers";
import "@/components/css/Table.css";

const { Title } = Typography;

const readPermissions = [
  "READ_COLLATERAL",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
const deletePermissions = ["DELETE_COLLATERAL", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, id, loanId, collateralId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: collateralStatus,
    data: collateral,
    error: collateralError,
  } = useGetById<LoanCollateral>(
    `${tenantId}/loan-collaterals/`,
    `${collateralId}`
  );

  if (collateralStatus === "pending" || isPermissionsLoading)
    return <Skeleton />;

  if (collateralError)
    return (
      <Alert_ message="Error" description={collateralError} type="error" />
    );
  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  return (
    <>
      <div className="flex justify-between">
        <Title level={4}>Note</Title>
        <RecordActions
          actionTitle="collateral"
          isModalOpen={isModalOpen}
          redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}`}
          setIsModalOpen={setIsModalOpen}
          canDelete={canDelete}
          id={Number(collateralId)}
          deleteUrl={`${tenantId}/collaterals`}
          queryKey={[`${tenantId}/collaterals/`, `${collateralId}`]}
        />
      </div>

      <div className="w-full">
        <table className="text-md text-left w-full capitalize border-1 border-gray-200">
          <tbody>
            <tr>
              <th className="w-1/12">Name: </th>
              <td>{collateral?.type.codeValue}</td>
            </tr>
            <tr>
              <th>Description: </th>
              <td>{collateral?.description}</td>
            </tr>
            <tr>
              <th>Value: </th>
              <td>{formatNumber(collateral?.value)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
