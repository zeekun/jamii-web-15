"use client";
import { useGetById } from "@/api";
import RecordActions from "@/components/record-actions";
import { LoanCharge } from "@/types";
import { Skeleton, Typography } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";

const { Title } = Typography;

const readPermissions = [
  "READ_LOANCHARGE",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
const deletePermissions = ["DELETE_LOANCHARGE", "ALL_FUNCTIONS"];
const updatePermissions = ["UPDATE_LOANCHARGE", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, id, loanId, chargeId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);
  const canUpdate = hasPermission(permissions, updatePermissions);

  const {
    status: chargeStatus,
    data: loanCharge,
    error: chargeError,
  } = useGetById<LoanCharge>(`${tenantId}/loan-charges/`, `${chargeId}`);

  if (chargeStatus === "pending" || isPermissionsLoading) return <Skeleton />;

  if (chargeError)
    return <Alert_ message="Error" description={chargeError} type="error" />;
  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  return (
    <>
      <div className="flex justify-between">
        <Title level={4}>Charge</Title>
        <RecordActions
          actionTitle="charge"
          isModalOpen={isModalOpen}
          redirectUrl={`/${tenantId}/clients/${id}/loan-accounts/${loanId}`}
          setIsModalOpen={setIsModalOpen}
          canDelete={canDelete}
          id={Number(chargeId)}
          deleteUrl={`${tenantId}/charges`}
          queryKey={[`${tenantId}/charges/`, `${chargeId}`]}
        />
      </div>

      <div className="w-full">
        <table className="text-md text-left w-full capitalize">
          <tbody>
            <tr>
              <th>Name :</th>
              <td>{loanCharge.charge.name}</td>
            </tr>
            <tr>
              <th>Charge Type :</th>
              <td>{loanCharge.chargeCalculationEnum}</td>
            </tr>
            <tr>
              <th>Currency :</th>
              <td>{loanCharge.charge.currencyId}</td>
            </tr>
            <tr>
              <th>Payment due at :</th>
              <td>{loanCharge.chargeTimeEnum}</td>
            </tr>
            <tr>
              <th>Payment Due as Of :</th>
              <td>{loanCharge.chargePaymentModeEnum}</td>
            </tr>
            <tr>
              <th>Calculation Type :</th>
              <td>{loanCharge.chargeCalculationEnum}</td>
            </tr>
            <tr>
              <th>Due :</th>
              <td>{loanCharge.charge.name}</td>
            </tr>
            <tr>
              <th>Paid :</th>
              <td>{loanCharge.charge.name}</td>
            </tr>
            <tr>
              <th>Waived :</th>
              <td>{loanCharge.charge.name}</td>
            </tr>
            <tr>
              <th>Outstanding :</th>
              <td>{loanCharge.charge.name}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
