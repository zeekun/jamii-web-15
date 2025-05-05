"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { FloatingRate } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import CreateForm from "../create.form";
import AccessDenied from "@/components/access-denied";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
import { MODAL_WIDTH } from "../constants";
const { Title } = Typography;

const updatePermissions = ["UPDATE_FLOATINGRATE", "ALL_FUNCTIONS"];
const readPermissions = [
  "READ_FLOATINGRATE",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];

export default function Page() {
  const { tenantId, floatingRateId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);

  const {
    status: floatingRateStatus,
    data: floatingRate,
    error: floatingRateError,
  } = useGetById<FloatingRate>(
    `${tenantId}/floating-rates`,
    `${floatingRateId}`
  );

  if (floatingRateStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={floatingRateError.message}
        type={"error"}
      />
    );
  }

  if (floatingRateStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (floatingRateStatus === "success" && floatingRate) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Floating Rate</Title>
              <RecordActions
                actionTitle="floating rate"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/products/floating-rates`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                id={Number(floatingRateId)}
                modalWidth={MODAL_WIDTH}
                updateForm={
                  canUpdate ? (
                    <CreateForm
                      id={Number(floatingRateId)}
                      submitType="update"
                      setIsModalOpen={setIsModalOpen}
                    />
                  ) : undefined
                }
              />
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full">
                <tr className="text-lg">
                  <th className="w-[10rem]">Name:</th>
                  <td>{floatingRate.name}</td>
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
