"use client";
import { useGetById } from "@/api";
import {
  deletePermissions,
  ENDPOINT,
  MODAL_WIDTH,
  PAGE_TITLE,
  readPermissions,
  updatePermissions,
} from "../constants";
import { SavingsProduct } from "@/types";
import { Skeleton, Typography } from "antd";
import Alert_ from "@/components/alert";
import { formatNumber } from "@/utils/numbers";
import { EditOutlined } from "@ant-design/icons";
import CreateModal from "@/components/create.modal";
import CreateForm from "../create.form";
import { useParams } from "next/navigation";
import { useState } from "react";
const _ = require("lodash");
import "@/components/css/Table.css";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import AccessDenied from "@/components/access-denied";

const { Title } = Typography;

export default function Page() {
  const { tenantId, id } = useParams();
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
    status: savingProductStatus,
    data: savingProduct,
    error: savingProductError,
  } = useGetById<SavingsProduct>(`${tenantId}/${ENDPOINT}`, `${id}`);

  if (isPermissionsLoading || savingProductStatus === "pending") {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  return (
    <>
      {savingProductStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={savingProductError.message}
          type={"error"}
        />
      ) : canRead ? (
        <>
          <div className="flex justify-between">
            <Title level={3} className="capitalize">
              {savingProduct.name}
            </Title>

            {canUpdate && (
              <CreateModal
                submitType="update"
                buttonTitle="Update Saving Product"
                isModalOpen={isModalOpen}
                buttonType="green"
                setIsModalOpen={setIsModalOpen}
                CreateForm={
                  <CreateForm
                    submitType="update"
                    id={Number(id)}
                    setIsModalOpen={setIsModalOpen}
                  />
                }
                pageTitle={PAGE_TITLE}
                width={MODAL_WIDTH}
                icon={<EditOutlined />}
              />
            )}
          </div>

          <div className="w-full" style={{ margin: "auto" }}>
            <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
              <th className="pb-1 pt-2">
                <td className="text-blue-500">Details</td>
              </th>
              <tr>
                <td className="w-[40%]">Short Name:</td>
                <td>{savingProduct.shortName}</td>
              </tr>
              {savingProduct?.description && (
                <tr>
                  <td>Description:</td>
                  <td>{savingProduct.description}</td>
                </tr>
              )}
            </table>
            <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
              <th className="pb-1 pt-2">
                <td className="text-blue-500">Currency</td>
              </th>

              <tr>
                <td className="w-[40%]">Currency:</td>
                <td>{savingProduct.currencyCode}</td>
              </tr>
              <tr>
                <td>Currency In Multiples Of:</td>
                <td>{formatNumber(savingProduct.inMultiplesOf)}</td>
              </tr>
            </table>
            <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
              <th className="pb-1 pt-2">
                <td className="text-blue-500">Terms</td>
              </th>

              <tr>
                <td className="w-[40%]">Nominal Annual Interest:</td>
                <td>{savingProduct.nominalAnnualInterestRate}%</td>
              </tr>
              <tr>
                <td>Interest Compounding Period:</td>
                <td>
                  {_.capitalize(
                    savingProduct.interestCompoundingPeriodTypeEnum
                  )}
                </td>
              </tr>
              <tr>
                <td>Interest Posting Period:</td>
                <td>
                  {_.capitalize(savingProduct.interestPostingPeriodTypeEnum)}
                </td>
              </tr>
              <tr>
                <td>Interest Calculated Using:</td>
                <td>
                  {_.capitalize(savingProduct.interestCalculationTypeEnum)}
                </td>
              </tr>
              <tr>
                <td>Days in Year:</td>
                <td>{savingProduct.interestCalculationDaysInYearTypeEnum}</td>
              </tr>
            </table>
            <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
              <th className="pb-1 pt-2">
                <td className="text-blue-500">Settings</td>
              </th>

              <tr>
                <td className="w-[40%]">Minimum Opening Balance:</td>
                <td>{formatNumber(savingProduct.minRequiredOpeningBalance)}</td>
              </tr>
              <tr>
                <td>Lock-in Period:</td>
                <td>
                  {formatNumber(savingProduct.lockInPeriodFrequency)}{" "}
                  {_.capitalize(savingProduct.lockInPeriodFrequencyTypeEnum)}
                </td>
              </tr>
              <tr>
                <td>Apply Withdrawal Fee for Transfers:</td>
                <td>
                  {savingProduct.withdrawalFeeForTransfers ? "Yes" : "No"}
                </td>
              </tr>
              <tr>
                <td>Balance Required for Interest Calculation:</td>
                <td>
                  {formatNumber(savingProduct.minBalanceForInterestCalculation)}
                </td>
              </tr>
              <tr>
                <td>Enforce Minimum Balance:</td>
                <td>
                  {savingProduct.enforceMinRequiredBalance ? "Yes" : "No"}
                </td>
              </tr>
              <tr>
                <td>Minimum Balance:</td>
                <td>{formatNumber(savingProduct.minRequiredBalance)}</td>
              </tr>
              <tr>
                <td>Withhold Tax is Applicable:</td>
                <td>{savingProduct.withHoldTax ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>Is Overdraft Allowed:</td>
                <td>{savingProduct.allowOverdraft ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>Minimum Overdraft Required for Interest Calculation:</td>
                <td>
                  {formatNumber(
                    savingProduct.minOverdraftForInterestCalculation
                  )}
                </td>
              </tr>
              <tr>
                <td>Nominal Annual Interest for Overdraft:</td>
                <td>
                  {formatNumber(
                    savingProduct.nominalAnnualInterestRateOverdraft
                  )}
                  %
                </td>
              </tr>
              <tr>
                <td>Maximum Overdraft Amount Limit:</td>
                <td>{formatNumber(savingProduct.overdraftLimit)}</td>
              </tr>
              <tr>
                <td>Enable Dormancy Tracking::</td>
                <td>{savingProduct.isDormancyTrackingActive ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>Number of Days to Inactive sub-status:</td>
                <td>{formatNumber(savingProduct.daysToInactive)}</td>
              </tr>
              <tr>
                <td>Number of Days to Dormant sub-status:</td>
                <td>{formatNumber(savingProduct.daysToDormant)}</td>
              </tr>
              <tr>
                <td>Number of Days to Escheat:</td>
                <td>{formatNumber(savingProduct.daysToEscheat)}</td>
              </tr>
            </table>
            <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
              {savingProduct.charges && (
                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Charges</td>
                </th>
              )}

              {savingProduct.charges && (
                <tr className="text-left">
                  <th className="w-[40%]">Name</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                </tr>
              )}
              {savingProduct.charges?.map((charge, i: number) => (
                <tr key={i}>
                  <td>{charge.name}</td>
                  <td>{_.capitalize(charge.chargeCalculationTypeEnum)}</td>
                  <td className="text-right">
                    {formatNumber(charge.amount)} {charge.currencyId}
                  </td>
                </tr>
              ))}
            </table>
            <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
              <th className="pb-1 pt-2">
                <td className="text-blue-500">Accounting</td>
              </th>

              <tr>
                <td className="w-[40%]">Type:</td>
                <td>{_.capitalize(savingProduct.accountingRuleEnum)}</td>
              </tr>

              {savingProduct.savingsProductAccountings?.map((account) => (
                <tr key={account.id}>
                  <td>{account.name}</td>{" "}
                  <td>{_.capitalize(account.glAccount.name)}</td>
                </tr>
              ))}

              {savingProduct.advancedAccountingRules && (
                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Advanced Accounting Rules</td>
                </th>
              )}

              {savingProduct.fundSources && (
                <tr className="text-left">
                  <th>Payment Type</th>
                  <th>Fund Source</th>
                </tr>
              )}

              {savingProduct.fundSources?.map((fundSource) => (
                <tr key={fundSource.id}>
                  <td>{fundSource.paymentType.name}</td>{" "}
                  <td>{_.capitalize(fundSource.glAccount.name)}</td>
                </tr>
              ))}

              {savingProduct.feeIncomeAccounts && (
                <tr className="text-left">
                  <th>Fee</th>
                  <th>Income Account</th>
                </tr>
              )}

              {savingProduct.feeIncomeAccounts?.map((feeIncome) => (
                <tr key={feeIncome.id}>
                  <td>{feeIncome.charge.name}</td>{" "}
                  <td>{_.capitalize(feeIncome.glAccount.name)}</td>
                </tr>
              ))}

              {savingProduct.penaltyIncomeAccounts && (
                <tr className="text-left">
                  <th>Penalty</th>
                  <th>Income Account</th>
                </tr>
              )}

              {savingProduct.penaltyIncomeAccounts?.map((penaltyIncome) => (
                <tr key={penaltyIncome.id}>
                  <td>{penaltyIncome.charge.name}</td>{" "}
                  <td>{_.capitalize(penaltyIncome.glAccount.name)}</td>
                </tr>
              ))}
            </table>
          </div>
        </>
      ) : (
        <AccessDenied />
      )}
    </>
  );
}
