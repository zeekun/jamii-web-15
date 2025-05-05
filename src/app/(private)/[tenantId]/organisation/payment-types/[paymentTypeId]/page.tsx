"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { PaymentType } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import CreateForm from "../create.form";
import AccessDenied from "@/components/access-denied";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
import {
  deletePaymentTypePermissions,
  readPaymentTypePermissions,
  updatePaymentTypePermissions,
} from "../constants";
const { Title } = Typography;

export default function Page() {
  const { tenantId, paymentTypeId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePaymentTypePermissions);
  const canRead = hasPermission(permissions, readPaymentTypePermissions);
  const canDelete = hasPermission(permissions, deletePaymentTypePermissions);

  const {
    status: paymentTypeStatus,
    data: paymentType,
    error: paymentTypeError,
  } = useGetById<PaymentType>(`${tenantId}/payment-types`, `${paymentTypeId}`);

  if (paymentTypeStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={paymentTypeError.message}
        type={"error"}
      />
    );
  }

  if (paymentTypeStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (paymentTypeStatus === "success" && paymentType) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Payment Type</Title>
              <RecordActions
                actionTitle="Payment Type"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/organisation/payment-types`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(paymentTypeId)}
                deleteUrl={`${tenantId}/payment-types`}
                updateForm={
                  <CreateForm
                    id={Number(paymentTypeId)}
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
                  <td>{paymentType.name}</td>
                </tr>
                <tr>
                  <th>Description:</th>
                  <td>{paymentType.description}</td>
                </tr>
                <tr>
                  <th className="w-[10rem]">Is Cash Payment:</th>
                  <td>{paymentType.isCashPayment ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <th className="w-[10rem]">Position:</th>
                  <td>{paymentType.position}</td>
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
