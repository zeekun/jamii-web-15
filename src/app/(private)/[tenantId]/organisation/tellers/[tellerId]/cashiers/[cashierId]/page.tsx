"use client";
import React, { useState } from "react";
import { useGet, useGetById } from "@/api";
import { Cashier, CashierTransaction } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import CreateForm from "../create.form";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { Skeleton, Typography } from "antd";
import Link from "next/link";
import RecordActions from "@/components/record-actions";
import TransactionsDataTable from "./transactions/data-table";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import CreateModal from "@/components/create.modal";
import AllocateCashForm from "./transactions/create.form";
import { formatNumber } from "@/utils/numbers";
const { Title } = Typography;

const updatePermissions = ["UPDATECASHIERALLOCATION_TELLER", "ALL_FUNCTIONS"];
const readPermissions = [
  "READCASHIERALLOCATION_TELLER",
  "ALL_FUNCTIONS",
  "ALL_FUNCTIONS_READ",
];
const deletePermissions = ["DELETECASHIERALLOCATION_TELLER", "ALL_FUNCTIONS"];
const allocateCashPermissions = [
  "ALLOCATECASHTOCASHIER_TELLER",
  "ALL_FUNCTIONS",
];
const settleCashPermissions = ["SETTLECASHFROMCASHIER_TELLER", "ALL_FUNCTIONS"];
export default function Page() {
  const { tenantId, tellerId, cashierId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocateCashModalOpen, setIsAllocateCashModalOpen] = useState(false);
  const [isSettleCashModalOpen, setIsSettleCashModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);
  const canAllocateCash = hasPermission(permissions, allocateCashPermissions);
  const canSettleCash = hasPermission(permissions, settleCashPermissions);

  const {
    status: cashierStatus,
    data: cashier,
    error: cashierError,
  } = useGetById<Cashier>(`${tenantId}/cashiers`, `${cashierId}`);

  const {
    status: cashierTransactionsStatus,
    data: cashierTransactions,
    error: cashierTransactionsError,
  } = useGet<CashierTransaction[]>(
    `${tenantId}/cashiers/${cashierId}/cashier-transactions?filter={"order":["id DESC"]}`,
    [`${tenantId}/cashiers/${cashierId}/cashier-transactions`]
  );

  let netSum = 0;
  if (cashierTransactionsStatus === "success") {
    let allocateAmountSum = 0;
    let settleAmountSum = 0;

    cashierTransactions.forEach((transaction) => {
      if (transaction.typeEnum === "ALLOCATE CASH") {
        allocateAmountSum += transaction.amount;
      } else {
        settleAmountSum += transaction.amount;
      }
    });

    netSum = allocateAmountSum - settleAmountSum;
  }

  if (cashierStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={cashierError.message}
        type={"error"}
      />
    );
  }

  if (cashierStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (cashierStatus === "success" && cashier) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Cashier</Title>

              <RecordActions
                actionTitle="cashier"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/organisation/tellers/${tellerId}`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(cashierId)}
                deleteUrl={`${tenantId}/cashiers`}
                updateForm={
                  <CreateForm
                    id={Number(tellerId)}
                    officeId={cashier.teller.officeId}
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
                  <td>
                    <Link
                      href={`/${tenantId}/organisation/employees/${cashier.staff.id}`}
                    >
                      {cashier.staff.firstName} {cashier.staff.middleName || ""}{" "}
                      {cashier.staff.lastName}
                    </Link>
                  </td>
                </tr>

                <tr>
                  <th>Description:</th>
                  <td>{cashier.description || ""}</td>
                </tr>
                <tr>
                  <th>Start Date:</th>
                  <td>{formattedDate(cashier.startDate)}</td>
                </tr>
                <tr>
                  <th>End Date:</th>
                  <td>{formattedDate(cashier.endDate)}</td>
                </tr>
                <tr>
                  <th>Full Day / Time:</th>
                  <td>
                    {cashier.fullDay
                      ? "Yes"
                      : `${formattedDate(
                          String(cashier.startTime),
                          "h:mm A"
                        )} - ${formattedDate(
                          String(cashier.endTime),
                          "h:mm A"
                        )}`}
                  </td>
                </tr>
              </table>
            </div>

            <div className="mt-5">
              <div className="grid grid-cols-2 items-center mb-3">
                <div className="flex items-center justify-start capitalize">
                  <Title level={5}>Transactions</Title>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <Title level={5} className="pt-2">
                    Net: {formatNumber(netSum)}
                  </Title>
                  {canAllocateCash && (
                    <CreateModal
                      pageTitle={"Allocate Cash"}
                      submitType="update"
                      buttonTitle="Allocate Cash"
                      buttonType="green"
                      isModalOpen={isAllocateCashModalOpen}
                      icon={<DownOutlined />}
                      setIsModalOpen={setIsAllocateCashModalOpen}
                      CreateForm={
                        <AllocateCashForm
                          typeEnum={"ALLOCATE CASH"}
                          officeId={cashier.teller.officeId}
                          setIsModalOpen={setIsAllocateCashModalOpen}
                          netSum={netSum}
                        />
                      }
                    />
                  )}

                  {canSettleCash && netSum && (
                    <CreateModal
                      pageTitle={"Settle Cash"}
                      submitType="update"
                      buttonTitle="Settle Cash"
                      buttonType="warning"
                      isModalOpen={isSettleCashModalOpen}
                      icon={<UpOutlined />}
                      setIsModalOpen={setIsSettleCashModalOpen}
                      CreateForm={
                        <AllocateCashForm
                          typeEnum={"SETTLE CASH"}
                          officeId={cashier.teller.officeId}
                          setIsModalOpen={setIsSettleCashModalOpen}
                          netSum={netSum}
                        />
                      }
                    />
                  )}
                </div>
              </div>
              {cashierTransactionsStatus === "error" ? (
                <Alert_
                  message={"Error"}
                  description={cashierTransactionsError}
                  type={"error"}
                />
              ) : (
                <TransactionsDataTable
                  data={cashierTransactions || []}
                  loading={
                    cashierTransactionsError === "pending" ? true : false
                  }
                />
              )}
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
