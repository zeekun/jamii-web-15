"use client";
import React, { useState } from "react";
import { useGetById } from "@/api";
import { AccountTransferDetail, Holiday } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";
import { formatNumber } from "@/utils/numbers";
import _ from "lodash";
const { Title } = Typography;

const updatePermissions = ["UPDATE_HOLIDAY", "ALL_FUNCTIONS"];
const readPermissions = ["READ_HOLIDAY", "ALL_FUNCTIONS", "ALL_FUNCTIONS_READ"];
const deletePermissions = ["DELETE_HOLIDAY", "ALL_FUNCTIONS"];

export default function Page() {
  const { tenantId, standingInstructionId } = useParams();
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
    status: accountTransferDetailStatus,
    data: accountTransferDetail,
    error: accountTransferDetailError,
  } = useGetById<AccountTransferDetail>(
    `${tenantId}/account-transfer-details`,
    `${standingInstructionId}`
  );

  if (accountTransferDetailStatus === "success") {
    console.log(accountTransferDetail);
  }

  if (accountTransferDetailStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={accountTransferDetailError.message}
        type={"error"}
      />
    );
  }

  if (accountTransferDetailStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (accountTransferDetailStatus === "success" && accountTransferDetail) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Standing Instruction</Title>
              {/* <RecordActions
                actionTitle="holiday"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/organisation/holidays`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(standingInstructionId)}
                deleteUrl={`${tenantId}/holidays`}
                updateForm={
                  <CreateForm
                    id={Number(standingInstructionId)}
                    submitType="update"
                    setIsModalOpen={setIsModalOpen}
                  />
                }
              /> */}
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full">
                <tr className="text-lg">
                  <th className="w-[15rem]">Name:</th>
                  <td>
                    {
                      accountTransferDetail.accountTransferStandingInstruction
                        ?.name
                    }
                  </td>
                </tr>
                <tr>
                  <th>Applicant:</th>
                  <td>
                    {accountTransferDetail.fromClient?.firstName ? (
                      <>
                        {accountTransferDetail.fromClient.firstName}{" "}
                        {accountTransferDetail.fromClient.middleName || ""}{" "}
                        {accountTransferDetail.fromClient.lastName}
                      </>
                    ) : (
                      <>{accountTransferDetail.fromClient?.fullName || "N/A"}</>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Type:</th>
                  <td className="capitalize">
                    {_.toLower(accountTransferDetail.transferType)}
                  </td>
                </tr>
                <tr>
                  <th>Priority:</th>
                  <td className={"capitalize"}>
                    {_.toLower(
                      accountTransferDetail.accountTransferStandingInstruction
                        ?.priority
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Status:</th>
                  <td>
                    {accountTransferDetail.accountTransferStandingInstruction
                      ?.status === true
                      ? "Active"
                      : "Disabled"}
                  </td>
                </tr>
                <tr>
                  <th>From Account Type:</th>
                  <td>
                    {accountTransferDetail.fromSavingsAccount
                      ? "Savings Account"
                      : "Loan Account"}
                  </td>
                </tr>
                <tr>
                  <th>From Account:</th>
                  <td>
                    {accountTransferDetail.fromSavingsAccount
                      ? `${accountTransferDetail.fromSavingsAccount.savingsProduct.name} - ${accountTransferDetail.fromSavingsAccount.accountNo}`
                      : `${accountTransferDetail.fromLoanAccount?.loanProduct.name} - ${accountTransferDetail.fromLoanAccount?.accountNo}`}
                  </td>
                </tr>
                <tr>
                  <th>Destination:</th>
                  <td>
                    {accountTransferDetail.fromClientId ===
                    accountTransferDetail.toClientId
                      ? "Own Account"
                      : "External Account"}
                  </td>
                </tr>
                <tr>
                  <th>To Office:</th>
                  <td>{accountTransferDetail.toOffice.name}</td>
                </tr>
                <tr>
                  <th>Beneficiary:</th>
                  <td>
                    {" "}
                    {accountTransferDetail.toClient?.firstName ? (
                      <>
                        {accountTransferDetail.toClient.firstName}{" "}
                        {accountTransferDetail.toClient.middleName || ""}{" "}
                        {accountTransferDetail.toClient.lastName}
                      </>
                    ) : (
                      <>{accountTransferDetail.fromClient?.fullName}</>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>To Account Type:</th>
                  <td>
                    {accountTransferDetail.toSavingsAccount
                      ? "Savings Account"
                      : "Loan Account"}
                  </td>
                </tr>
                <tr>
                  <th>To Account:</th>
                  <td>
                    {accountTransferDetail.toSavingsAccount
                      ? `${accountTransferDetail.toSavingsAccount.savingsProduct.name} - ${accountTransferDetail.toSavingsAccount.accountNo}`
                      : `${accountTransferDetail.toLoanAccount?.loanProduct.name} - ${accountTransferDetail.toLoanAccount?.accountNo}`}
                  </td>
                </tr>
                <tr>
                  <th>Standing Instruction Type:</th>
                  <td className="capitalize">
                    {_.toLower(
                      accountTransferDetail.accountTransferStandingInstruction
                        ?.instructionType
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Amount:</th>
                  <td>
                    {formatNumber(
                      accountTransferDetail.accountTransferStandingInstruction
                        ?.amount
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Validity From:</th>
                  <td>
                    {accountTransferDetail.accountTransferStandingInstruction
                      ?.validFrom
                      ? formattedDate(
                          accountTransferDetail
                            .accountTransferStandingInstruction?.validFrom
                        )
                      : null}
                  </td>
                </tr>
                <tr>
                  <th>Validity Till:</th>
                  <td>
                    {accountTransferDetail.accountTransferStandingInstruction
                      ?.validTill
                      ? formattedDate(
                          accountTransferDetail
                            .accountTransferStandingInstruction?.validTill
                        )
                      : null}
                  </td>
                </tr>
                <tr>
                  <th>Recurrence Type:</th>
                  <td className="capitalize">
                    {_.toLower(
                      accountTransferDetail.accountTransferStandingInstruction
                        ?.recurrenceType
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Interval:</th>
                  <td>
                    {
                      accountTransferDetail.accountTransferStandingInstruction
                        ?.recurrenceInterval
                    }
                  </td>
                </tr>
                <tr>
                  <th>Frequency:</th>
                  <td className={"capitalize"}>
                    {_.toLower(
                      accountTransferDetail.accountTransferStandingInstruction
                        ?.recurrenceFrequency
                    )}
                  </td>
                </tr>
                <tr>
                  <th>On Month Day:</th>
                  <td>
                    {accountTransferDetail.accountTransferStandingInstruction
                      ?.recurrenceOnMonth
                      ? formattedDate(
                          accountTransferDetail
                            .accountTransferStandingInstruction
                            ?.recurrenceOnMonth
                        )
                      : null}
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
