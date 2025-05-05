"use client";
import { useGetById } from "@/api";
import { ENDPOINT, MODAL_WIDTH, PAGE_TITLE } from "../constants";
import { SavingsProduct } from "@/types";
import { Typography } from "antd";
import Alert_ from "@/components/alert";
import { formatNumber } from "@/utils/numbers";
import { EditOutlined } from "@ant-design/icons";
import Loading from "@/components/loading";
import CreateModal from "@/components/create.modal";
import CreateForm from "../create.form";
import { useState } from "react";
import { useParams } from "next/navigation";
const _ = require("lodash");

const { Title } = Typography;

export default function Page() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    status: savingProductStatus,
    data: savingProduct,
    error: savingProductError,
  } = useGetById<SavingsProduct>(ENDPOINT, id as string);

  return (
    <>
      {savingProductStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={savingProductError.message}
          type={"error"}
        />
      ) : (
        <>
          {savingProductStatus === "pending" ? (
            <Loading config={{ size: "large" }} />
          ) : (
            <>
              <div className="flex justify-between">
                <Title level={3} className="capitalize">
                  {savingProduct.name}
                </Title>

                <CreateModal
                  submitType="update"
                  buttonTitle="Edit"
                  isModalOpen={isModalOpen}
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
              </div>

              <table className="min-w-[30%] table-auto capitalize">
                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Details</td>
                </th>
                <tr>
                  <td>Short Name:</td>
                  <td>{savingProduct.shortName}</td>
                </tr>
                {savingProduct?.description && (
                  <tr>
                    <td>Description:</td>
                    <td>{savingProduct.description}</td>
                  </tr>
                )}

                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Currency</td>
                </th>

                <tr>
                  <td>Currency:</td>
                  <td>{savingProduct.currencyCode}</td>
                </tr>
                <tr>
                  <td>Currency In Multiples Of:</td>
                  <td>{formatNumber(savingProduct.inMultiplesOf)}</td>
                </tr>

                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Terms</td>
                </th>

                <tr>
                  <td>Nominal Annual Interest:</td>
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

                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Settings</td>
                </th>

                <tr>
                  <td>Minimum Opening Balance:</td>
                  <td>
                    {formatNumber(savingProduct.minRequiredOpeningBalance)}
                  </td>
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
                    {formatNumber(
                      savingProduct.minBalanceForInterestCalculation
                    )}
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
                  <td>
                    {savingProduct.isDormancyTrackingActive ? "Yes" : "No"}
                  </td>
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

                {savingProduct.charges && (
                  <th className="pb-1 pt-2">
                    <td className="text-blue-500">Charges</td>
                  </th>
                )}

                {savingProduct.charges && (
                  <tr className="text-left">
                    <th>Name</th>
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

                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Accounting</td>
                </th>

                <tr>
                  <td>Type:</td>
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
            </>
          )}
        </>
      )}
    </>
  );
}
