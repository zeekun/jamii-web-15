"use client";
import React, { useState } from "react";
import { useGet, useGetById } from "@/api";
import { Cashier, Teller } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import CreateModal from "@/components/create.modal";
import CreateForm from "../create.form";
import CreateCashierForm from "./cashiers/create.form";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { Skeleton, Typography } from "antd";
import { PAGE_URL } from "../constants";
import CashiersDataTable from "./cashiers.data-table";
import PageHeader from "@/components/page-header";
import RecordActions from "@/components/record-actions";
const { Title } = Typography;

const updatePermissions = ["UPDATE_TELLER", "ALL_FUNCTIONS"];
const readPermissions = ["READ_TELLER", "ALL_FUNCTIONS", "ALL_FUNCTIONS_READ"];
const deletePermissions = ["DELETE_TELLER", "ALL_FUNCTIONS"];
const createCashierPermissions = ["ALLOCATECASHIER_TELLER", "ALL_FUNCTIONS"];
export default function Page() {
  const { tenantId, tellerId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);
  const canCreateCashier = hasPermission(permissions, createCashierPermissions);

  const {
    status: tellerStatus,
    data: teller,
    error: tellerError,
  } = useGetById<Teller>(`${tenantId}/tellers`, `${tellerId}`);

  const {
    status: cashierStatus,
    data: cashiers,
    error: cashiersError,
  } = useGet<Cashier[]>(`${tenantId}/tellers/${tellerId}/cashiers`, [
    `${tenantId}/tellers/${tellerId}/cashiers`,
  ]);

  if (tellerStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={tellerError.message}
        type={"error"}
      />
    );
  }

  if (tellerStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (tellerStatus === "success" && teller) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Teller</Title>
              <RecordActions
                actionTitle="teller"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/${PAGE_URL}`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(tellerId)}
                deleteUrl={`${tenantId}/tellers`}
                updateForm={
                  <CreateForm
                    id={Number(tellerId)}
                    submitType="update"
                    setIsModalOpen={setIsModalOpen}
                  />
                }
              />
            </div>
            <div className=" w-full">
              <table className="text-md text-left w-full border-solid border-[1px] mt-3 border-gray-200">
                <tr className="text-lg">
                  <th className="w-[10rem]">Name:</th>
                  <td>{teller.name}</td>
                </tr>
                <tr>
                  <th>Office:</th>
                  <td>{teller.office.name}</td>
                </tr>
                <tr>
                  <th>Description:</th>
                  <td>{teller.description || ""}</td>
                </tr>
                <tr>
                  <th>Start Date:</th>
                  <td>{formattedDate(teller.validFrom)}</td>
                </tr>
                <tr>
                  <th>End Date:</th>
                  <td>{teller.validTo ? formattedDate(teller.validTo) : ""}</td>
                </tr>
                <tr>
                  <th>Status:</th>
                  <td>{teller.status ? "Active" : "Inactive"}</td>
                </tr>
              </table>
              <div className="mt-5">
                <PageHeader
                  pageTitle={"Cashiers"}
                  createModal={
                    canCreateCashier && (
                      <CreateModal
                        isModalOpen={isCashierModalOpen}
                        setIsModalOpen={setIsCashierModalOpen}
                        pageTitle={"Cashier"}
                        CreateForm={
                          <CreateCashierForm
                            officeId={teller.officeId}
                            setIsModalOpen={setIsCashierModalOpen}
                          />
                        }
                      />
                    )
                  }
                />
                {cashierStatus === "error" ? (
                  <Alert_
                    message="Error"
                    description={cashiersError}
                    type="error"
                  />
                ) : (
                  <CashiersDataTable
                    data={cashiers}
                    loading={cashierStatus === "pending" ? true : false}
                  />
                )}
              </div>
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
