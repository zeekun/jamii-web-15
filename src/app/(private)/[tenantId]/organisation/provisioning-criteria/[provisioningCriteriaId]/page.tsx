"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { ProvisioningCriteria } from "@/types";
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
import { ENDPOINT, MODAL_WIDTH, PAGE_TITLE } from "../constants";
const { Title } = Typography;

const updatePermissions = ["UPDATE_PROVISIONCRITERIA", "ALL_FUNCTIONS"];
const deletePermissions = ["DELETE_PROVISIONCRITERIA", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, provisioningCriteriaId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: provisioningCriteriaStatus,
    data: provisioningCriteria,
    error: ProvisioningCriteriaError,
  } = useGetById<ProvisioningCriteria>(
    `${tenantId}/${ENDPOINT}`,
    `${provisioningCriteriaId}`
  );

  if (provisioningCriteriaStatus === "success") {
    console.log(provisioningCriteria);
  }

  if (provisioningCriteriaStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={ProvisioningCriteriaError.message}
        type={"error"}
      />
    );
  }

  if (provisioningCriteriaStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (provisioningCriteriaStatus === "success" && provisioningCriteria) {
    return (
      <>
        <div className="flex justify-between">
          <Title level={4} className="capitalize">
            {PAGE_TITLE}
          </Title>
          <RecordActions
            actionTitle={PAGE_TITLE}
            isModalOpen={isModalOpen}
            redirectUrl={`/${tenantId}/organisation/${ENDPOINT}`}
            setIsModalOpen={setIsModalOpen}
            canUpdate={canUpdate}
            id={Number(provisioningCriteriaId)}
            canDelete={canDelete}
            deleteUrl={`${tenantId}/${ENDPOINT}`}
            modalWidth={MODAL_WIDTH}
            updateForm={
              <CreateForm
                id={Number(provisioningCriteriaId)}
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
              <td>{provisioningCriteria.name}</td>
            </tr>
            <tr>
              <th>Loan Product(s):</th>
              <td>
                <ol>
                  {provisioningCriteria.loanProducts?.map((product, i) => (
                    <li key={i}>{product.name}</li>
                  ))}
                </ol>
              </td>
            </tr>
          </table>
          <table>
            <tr>
              <th>Category</th>
              <th>Min Age</th>
              <th>Max Age</th>
              <th>Percentage</th>
              <th>Liability Account</th>
              <th>Expense Account</th>
            </tr>

            {provisioningCriteria.provisioningCriteriaDefinitions?.map(
              (definition, i) => (
                <tr key={i}>
                  <th>{definition.category.name}</th>
                  <td>{definition.minAge}</td>
                  <td>{definition.maxAge}</td>
                  <td>{definition.provisionPercentage}</td>
                  <td>{definition.liabilityAccount.name}</td>
                  <td>{definition.expenseAccount.name}</td>
                </tr>
              )
            )}
          </table>
        </div>
      </>
    );
  }

  return null;
}
