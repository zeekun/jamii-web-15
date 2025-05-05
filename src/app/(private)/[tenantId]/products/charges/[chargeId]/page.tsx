"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { Charge } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import CreateForm from "../create.form";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
import AccessDenied from "@/components/access-denied";
import { formatNumber } from "@/utils/numbers";
import _ from "lodash";
import {
  deletePermissions,
  readPermissions,
  updatePermissions,
} from "../constants";
const { Title } = Typography;

export default function Page() {
  const { tenantId, chargeId } = useParams();
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
    status: chargeStatus,
    data: charge,
    error: chargeError,
  } = useGetById<Charge>(`${tenantId}/charges`, `${chargeId}`);

  if (chargeStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={chargeError.message}
        type={"error"}
      />
    );
  }

  if (chargeStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (chargeStatus === "success" && charge) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Charge</Title>
              <RecordActions
                actionTitle="charge"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/products/charges`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(chargeId)}
                deleteUrl={`${tenantId}/charges`}
                updateForm={
                  <CreateForm
                    id={Number(chargeId)}
                    submitType="update"
                    setIsModalOpen={setIsModalOpen}
                  />
                }
              />
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full capitalize">
                <tr className="text-lg">
                  <th className="w-[15rem]">Name:</th>
                  <td>{charge.name}</td>
                </tr>
                <tr>
                  <th>Charge Type:</th>
                  <td>{charge.isPenalty ? `Penalty` : `Charge`}</td>
                </tr>
                <tr>
                  <th>Currency:</th>
                  <td>{charge.currencyId}</td>
                </tr>
                <tr>
                  <th>Amount:</th>
                  <td>
                    {formatNumber(charge.amount, 2)}{" "}
                    {charge.chargeCalculationTypeEnum !== "FLAT" && `%`}
                  </td>
                </tr>
                <tr>
                  <th>Charge Time Type:</th>
                  <td>{_.toLower(charge.chargeTimeTypeEnum)}</td>
                </tr>
                <tr>
                  <th>Charge Applies To:</th>
                  <td>{_.toLower(charge.chargeAppliesToEnum)}</td>
                </tr>
                <tr>
                  <th>Charge Calculation Type:</th>
                  <td>{_.toLower(charge.chargeCalculationTypeEnum)}</td>
                </tr>
                <tr>
                  <th>Active:</th>
                  <td>{charge.isActive ? "True" : "False"}</td>
                </tr>
                <tr>
                  <th>Charge Payment Mode:</th>
                  <td>
                    {charge.chargePaymentModeEnum
                      ? _.toLower(charge.chargePaymentModeEnum)
                      : "Not Available"}
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
