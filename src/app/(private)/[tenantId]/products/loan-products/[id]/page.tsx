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
import { LoanCycle, LoanProduct } from "@/types";
import { Skeleton, Typography } from "antd";
import Alert_ from "@/components/alert";
import { formatNumber } from "@/utils/numbers";
import { EditOutlined } from "@ant-design/icons";
import CreateModal from "@/components/create.modal";
import CreateForm from "../create.form";
import { formattedDate } from "@/utils/dates";
import React, { useState } from "react";
import { useParams } from "next/navigation";
const _ = require("lodash");
import "@/components/css/Table.css";
import { hasPermission } from "@/utils/permissions";
import { useRoles } from "@/providers/RolesProvider";
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
    status: loanProductStatus,
    data: loanProduct,
    error: loanProductError,
  } = useGetById<LoanProduct>(`${tenantId}/${ENDPOINT}`, `${id}`);

  if (isPermissionsLoading || loanProductStatus === "pending") {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  return (
    <>
      {loanProductStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={loanProductError.message}
          type={"error"}
        />
      ) : (
        <>
          {canRead ? (
            <>
              <div className="flex justify-between">
                <Title level={3} className="capitalize">
                  {loanProduct.name}
                </Title>
                {canUpdate && (
                  <CreateModal
                    submitType="update"
                    buttonTitle="Update"
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

              <table className="w-full table-auto border-solid border-[1px] mt-3 border-gray-200  capitalize">
                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Details</td>
                </th>
                <tr>
                  <td className="w-[40%]">Short Name:</td>
                  <td>{loanProduct.shortName}</td>
                </tr>
                {loanProduct?.startDate && (
                  <tr>
                    <td>Start Date:</td>
                    <td>{formattedDate(loanProduct.startDate)}</td>
                  </tr>
                )}

                {loanProduct?.closeDate && (
                  <tr>
                    <td>Close Date:</td>
                    <td>{formattedDate(loanProduct.closeDate)}</td>
                  </tr>
                )}

                {loanProduct?.inCustomerLoanCounter && (
                  <tr>
                    <td>Include in Customer Loan Counter ::</td>
                    <td>{loanProduct.inCustomerLoanCounter ? "Yes" : "No"}</td>
                  </tr>
                )}

                {loanProduct?.description && (
                  <tr>
                    <td>Description:</td>
                    <td>{loanProduct.description}</td>
                  </tr>
                )}

                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Currency</td>
                </th>

                <tr>
                  <td>Currency:</td>
                  <td>{loanProduct.currencyCode}</td>
                </tr>
                <tr>
                  <td>Currency In Multiples Of:</td>
                  <td>{formatNumber(loanProduct.inMultiplesOf)}</td>
                </tr>

                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Settings</td>
                </th>

                <tr>
                  <td>Amortization:</td>
                  <td>{_.capitalize(loanProduct.amortizationTypeEnum)}</td>
                </tr>

                <tr>
                  <td>Interest Method:</td>
                  <td>{_.capitalize(loanProduct.interestTypeEnum)}</td>
                </tr>

                <tr>
                  <td>Interest Calculation Period:</td>
                  <td>
                    {_.capitalize(
                      loanProduct.interestCalculationPeriodTypeEnum
                    )}
                  </td>
                </tr>

                {loanProduct?.isEqualAmortization && (
                  <tr>
                    <td>Is Equal Amortization:</td>
                    <td>{loanProduct.isEqualAmortization ? "Yes" : "No"}</td>
                  </tr>
                )}

                {loanProduct?.allowPartialPeriodInterestCalculation && (
                  <tr>
                    <td>Allow Partial Period Interest Calculation:</td>
                    <td>
                      {loanProduct.allowPartialPeriodInterestCalculation
                        ? "Yes"
                        : "No"}
                    </td>
                  </tr>
                )}

                <tr>
                  <td>Loan Schedule Type:</td>
                  <td>{_.capitalize(loanProduct.loanScheduleTypeEnum)}</td>
                </tr>

                <tr>
                  <td>Repayment Strategy:</td>
                  <td>
                    {_.capitalize(
                      loanProduct.loanTransactionProcessingStrategy.name
                    )}
                  </td>
                </tr>

                {loanProduct?.allowMultipleDisbursements && (
                  <>
                    <tr>
                      <td>Enable Multiple Disbursements:</td>
                      <td>
                        {loanProduct.allowMultipleDisbursements ? "Yes" : "No"}
                      </td>
                    </tr>
                    <tr>
                      <td>Maximum Tranche Count:</td>
                      <td>{formatNumber(loanProduct.maximumTrancheCount)}</td>
                    </tr>
                    <tr>
                      <td>Maximum Allowed Standing Balance:</td>
                      <td>
                        {formatNumber(
                          loanProduct.maximumAllowedStandingBalance
                        )}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <td>Disallow Expected Multiple Disbursements:</td>
                  <td>
                    {loanProduct.disallowExpectedMultipleDisbursements
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>Enable Down Payment:</td>
                  <td>{loanProduct.enableDownPayment ? "Yes" : "No"}</td>
                </tr>

                <tr>
                  <td>Grace On Principal Payment:</td>
                  <td>{formatNumber(loanProduct.graceOnPrincipalPayment)}</td>
                </tr>

                <tr>
                  <td>Grace On Interest Payment:</td>
                  <td>{formatNumber(loanProduct.graceOnInterestPayment)}</td>
                </tr>

                <tr>
                  <td>Interest Fee Period:</td>
                  <td>{formatNumber(loanProduct.interestFreePeriod)}</td>
                </tr>

                <tr>
                  <td>Arrears Tolerance:</td>
                  <td>{formatNumber(loanProduct.inArrearsTolerance)}</td>
                </tr>

                <tr>
                  <td>Days In A year:</td>
                  <td>{_.capitalize(loanProduct.daysInYearTypeEnum)}</td>
                </tr>

                <tr>
                  <td>Days In A Month:</td>
                  <td>{_.capitalize(loanProduct.daysInMonthTypeEnum)}</td>
                </tr>

                <tr>
                  <td>Allow fixing of the installment amount:</td>
                  <td>
                    {loanProduct.canDefineInstallmentAmount ? "Yes" : "No"}
                  </td>
                </tr>

                <tr>
                  <td>
                    Account moves out of NPA only after all arrears have been
                    cleared:
                  </td>
                  <td>
                    {loanProduct.accountMovesOutOfNPAOnlyOnArrearsCompletion
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>
                    Number of days a loan may be overdue before moving into
                    arrears:
                  </td>
                  <td>
                    {formatNumber(
                      loanProduct.daysOverdueBeforeMovingIntoArrears
                    )}
                  </td>
                </tr>

                <tr>
                  <td>Principal Threshold (%) for Last Instalment:</td>
                  <td>
                    {formatNumber(
                      loanProduct.principalThresholdForLastInstalment
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Maximum number of days a loan may be overdue before becoming
                    an NPA (Non Performing Asset):
                  </td>
                  <td>
                    {formatNumber(
                      loanProduct.maxDaysOverdueBeforeBecomingAnNPA
                    )}
                  </td>
                </tr>

                <tr>
                  <td>Are Variable Installments Allowed?:</td>
                  <td>
                    {loanProduct.allowVariableInstallments ? "Yes" : "No"}
                  </td>
                </tr>

                {loanProduct.allowVariableInstallments && (
                  <>
                    <tr>
                      <td>Minimum Gap Between Installments:</td>
                      <td>{formatNumber(loanProduct.minimumGap)}</td>
                    </tr>

                    <tr>
                      <td>Maximum Gap Between Installments:</td>
                      <td>{formatNumber(loanProduct.maximumGap)}</td>
                    </tr>
                  </>
                )}

                <tr>
                  <td>Allowed to be used for providing Top Up Loans?:</td>
                  <td>{loanProduct.canUseForTopUp ? "Yes" : "No"}</td>
                </tr>

                <tr>
                  <td>Are Variable Installments Allowed?:</td>
                  <td>
                    {loanProduct.allowVariableInstallments ? "Yes" : "No"}
                  </td>
                </tr>

                <tr>
                  <td>Recalculate Interest:</td>
                  <td>
                    {loanProduct.interestRecalculationEnabled ? "Yes" : "No"}
                  </td>
                </tr>

                {loanProduct.interestRecalculationEnabled && (
                  <>
                    <tr>
                      <td>Pre-Closure Interest Calculation Rule:</td>
                      <td>
                        {_.capitalize(
                          loanProduct.preClosureInterestCalculationStrategyEnum
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td>Advance Payments Adjustment Type:</td>
                      <td>
                        {_.capitalize(loanProduct.rescheduleStrategyMethodEnum)}
                      </td>
                    </tr>

                    <tr>
                      <td>Interest Recalculation Compounding On:</td>
                      <td>
                        {_.capitalize(
                          loanProduct.interestRecalculationCompoundingMethodEnum
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td>Frequency For Recalculate Outstanding Principal:</td>
                      <td>
                        {_.capitalize(
                          loanProduct.recalculationCompoundingFrequencyTypeEnum
                        )}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <td>Place Guarantee Funds On-Hold?:</td>
                  <td>{loanProduct.holdGuaranteeFunds ? "Yes" : "No"}</td>
                </tr>

                {loanProduct.holdGuaranteeFunds && (
                  <>
                    <tr>
                      <td>Mandatory Guarantee (%) is required:</td>
                      <td>{formatNumber(loanProduct.mandatoryGuarantee)}</td>
                    </tr>

                    <tr>
                      <td>Minimum Guarantee From Own Funds(%):</td>
                      <td>
                        {formatNumber(loanProduct.minimumGuaranteeFromOwnFunds)}
                      </td>
                    </tr>

                    <tr>
                      <td>Minimum Guarantee From Guarantor Funds(%):</td>
                      <td>
                        {formatNumber(
                          loanProduct.minimumGuaranteeFromGuarantor
                        )}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <td>
                    Use the Global Configurations values to the Repayment Event
                    (notifications):
                  </td>
                  <td>
                    {loanProduct.useGlobalConfigValuesRepaymentEvent
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                {loanProduct.useGlobalConfigValuesRepaymentEvent && (
                  <>
                    <tr>
                      <td>Due days for repayment event:</td>
                      <td>
                        {formatNumber(loanProduct.dueDaysForRepaymentEvent)}
                      </td>
                    </tr>

                    <tr>
                      <td>OverDue days for repayment event:</td>
                      <td>
                        {formatNumber(loanProduct.overDueDaysForRepaymentEvent)}
                      </td>
                    </tr>
                  </>
                )}

                <th className="pb-1 pt-2">
                  <td className="text-blue-500">
                    Configurable Terms and Settings
                  </td>
                </th>

                <tr>
                  <td>
                    Allow overriding select terms and settings in loan
                    accounts?:
                  </td>
                  <td>
                    {loanProduct.loanProductSettingsAndTerms?.termsAndSettings
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>Amortization?:</td>
                  <td>
                    {loanProduct.loanProductSettingsAndTerms?.amortization
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>Repayment Strategy?:</td>
                  <td>
                    {loanProduct.loanProductSettingsAndTerms?.repaymentStrategy
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>Arrears Tolerance?:</td>
                  <td>
                    {loanProduct.loanProductSettingsAndTerms?.arrearsTolerance
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>Moratorium?:</td>
                  <td>
                    {loanProduct.loanProductSettingsAndTerms?.moratorium
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>Interest Method?:</td>
                  <td>
                    {loanProduct.loanProductSettingsAndTerms?.interestMethod
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>Interest Calculation Period?:</td>
                  <td>
                    {loanProduct.loanProductSettingsAndTerms
                      ?.interestCalculationPeriod
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>Repaid Every?:</td>
                  <td>
                    {loanProduct.loanProductSettingsAndTerms?.repaidEvery
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <tr>
                  <td>
                    Number of days a loan may be overdue before moving into
                    arrears?:
                  </td>
                  <td>
                    {loanProduct.loanProductSettingsAndTerms
                      ?.numDaysOverdueBeforeMovingIntoArrears
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>

                <th className="pb-1 pt-2">
                  <td className="text-blue-500">Terms</td>
                </th>

                {loanProduct.minPrincipalAmount && (
                  <tr>
                    <td>Minimum Principal:</td>
                    <td>{formatNumber(loanProduct.minPrincipalAmount)}</td>
                  </tr>
                )}

                <tr>
                  <td>Default Principal:</td>
                  <td>{formatNumber(loanProduct.principalAmount)}</td>
                </tr>

                {loanProduct.maxPrincipalAmount && (
                  <tr>
                    <td>Maximum Principal:</td>
                    <td>{formatNumber(loanProduct.maxPrincipalAmount)}</td>
                  </tr>
                )}

                <tr>
                  <td>
                    Allow approval / disbursal above loan applied amount?:
                  </td>
                  <td>
                    {loanProduct.approvalDisbursalAboveLoan ? "Yes" : "No"}
                  </td>
                </tr>

                {loanProduct.approvalDisbursalAboveLoan && (
                  <>
                    {" "}
                    <tr>
                      <td>Over Amount Calculation Type:</td>
                      <td>
                        {_.capitalize(
                          loanProduct.overAmountCalculationTypeEnum
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Over Amount:</td>
                      <td>{formatNumber(loanProduct.overAmount)}</td>
                    </tr>
                  </>
                )}

                <tr>
                  <td>Installment Day Calculation From:</td>
                  <td>
                    {_.capitalize(
                      loanProduct.installmentDayCalculationFromEnum
                    )}
                  </td>
                </tr>
                {loanProduct.minNumberOfRepayments && (
                  <tr>
                    <td>Minimum Number Of Repayments:</td>
                    <td>{formatNumber(loanProduct.minNumberOfRepayments)}</td>
                  </tr>
                )}

                <tr>
                  <td>Number Of Repayments:</td>
                  <td>{formatNumber(loanProduct.numberOfRepayments)}</td>
                </tr>

                {loanProduct.maxNumberOfRepayments && (
                  <tr>
                    <td>Maximum Number Of Repayments:</td>
                    <td>{formatNumber(loanProduct.maxNumberOfRepayments)}</td>
                  </tr>
                )}

                <tr>
                  <td>Is Zero Interest Rate?:</td>
                  <td>{loanProduct.isZeroInterestRate ? "Yes" : "No"}</td>
                </tr>

                <tr>
                  <td>Is Linked to floating interest rates?:</td>
                  <td>
                    {loanProduct.isLinkedToFloatingInterestRates ? "Yes" : "No"}
                  </td>
                </tr>

                {loanProduct.minNominalInterestRatePerPeriod && (
                  <tr>
                    <td>Minimum Nominal Interest Rate Per Period:</td>
                    <td>{loanProduct.minNominalInterestRatePerPeriod}</td>
                  </tr>
                )}

                <tr>
                  <td>Nominal Interest Rate Per Period:</td>
                  <td>{loanProduct.nominalInterestRatePerPeriod}</td>
                </tr>
                {loanProduct.maxNominalInterestRatePerPeriod && (
                  <tr>
                    <td>Maximum Nominal Interest Rate Per Period:</td>
                    <td>{loanProduct.maxNominalInterestRatePerPeriod}</td>
                  </tr>
                )}

                <tr>
                  <td>Frequency:</td>
                  <td>
                    {_.capitalize(loanProduct.interestRateFrequencyTypeEnum)}
                  </td>
                </tr>

                <tr>
                  <td>Terms vary based on loan cycle?:</td>
                  <td>
                    {loanProduct.termsVaryBasedOnLoanCycle ? "Yes" : "No"}
                  </td>
                </tr>

                {loanProduct.loanProductVariationsBorrowerCycles?.map(
                  (loanCycle: LoanCycle, i: number) => (
                    <React.Fragment key={i}>
                      {loanCycle.paramTypeEnum === "PRINCIPAL" && (
                        <>
                          <th className="pb-1 pt-2">
                            <td className="text-black">
                              Principal by loan cycle
                            </td>
                          </th>
                          <tr className="text-left">
                            <th>Condition</th>
                            <th>Loan Cycle</th>
                            <th>Minimum</th>
                            <th>Default</th>
                            <th>Maximum</th>
                          </tr>
                          <tr>
                            <td>
                              {_.capitalize(loanCycle.valueConditionTypeEnum)}
                            </td>
                            <td>
                              {formatNumber(loanCycle.borrowerCycleNumber)}
                            </td>
                            <td>{formatNumber(loanCycle.minValue)}</td>
                            <td>{formatNumber(loanCycle.defaultValue)}</td>
                            <td>{formatNumber(loanCycle.maxValue)}</td>
                          </tr>
                        </>
                      )}

                      {loanCycle.paramTypeEnum === "NUMBER OF REPAYMENTS" && (
                        <>
                          <th className="pb-1 pt-2">
                            <td className="text-black">Number of repayments</td>
                          </th>
                          <tr className="text-left">
                            <th>Condition</th>
                            <th>Loan Cycle</th>
                            <th>Minimum</th>
                            <th>Default</th>
                            <th>Maximum</th>
                          </tr>
                          <tr>
                            <td>
                              {_.capitalize(loanCycle.valueConditionTypeEnum)}
                            </td>
                            <td>
                              {formatNumber(loanCycle.borrowerCycleNumber)}
                            </td>
                            <td>{formatNumber(loanCycle.minValue)}</td>
                            <td>{formatNumber(loanCycle.defaultValue)}</td>
                            <td>{formatNumber(loanCycle.maxValue)}</td>
                          </tr>
                        </>
                      )}

                      {loanCycle.paramTypeEnum === "NOMINAL INTEREST RATE" && (
                        <>
                          <th className="pb-1 pt-2">
                            <td className="text-black">
                              Nominal Interest Rate
                            </td>
                          </th>
                          <tr className="text-left">
                            <th>Condition</th>
                            <th>Loan Cycle</th>
                            <th>Minimum</th>
                            <th>Default</th>
                            <th>Maximum</th>
                          </tr>
                          <tr>
                            <td>
                              {_.capitalize(loanCycle.valueConditionTypeEnum)}
                            </td>
                            <td>
                              {formatNumber(loanCycle.borrowerCycleNumber)}
                            </td>
                            <td>{formatNumber(loanCycle.minValue)}</td>
                            <td>{formatNumber(loanCycle.defaultValue)}</td>
                            <td>{formatNumber(loanCycle.maxValue)}</td>
                          </tr>
                        </>
                      )}
                    </React.Fragment>
                  )
                )}

                {loanProduct.charges && (
                  <>
                    <th className="pb-1 pt-2">
                      <td className="text-blue-500">Charges</td>
                    </th>
                    <tr className="text-left">
                      <th>Name</th>
                      <th>Type</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </>
                )}
                {loanProduct.charges?.map((charge, i: number) => (
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
                  <td>{_.capitalize(loanProduct.accountingRuleEnum)}</td>
                </tr>

                {loanProduct.loanProductAccountings?.map((account) => (
                  <tr key={account.id}>
                    <td>{account.name}</td>{" "}
                    <td>{_.capitalize(account.glAccount.name)}</td>
                  </tr>
                ))}

                {loanProduct.advancedAccountingRules && (
                  <th className="pb-1 pt-2">
                    <td className="text-blue-500">Advanced Accounting Rules</td>
                  </th>
                )}

                {loanProduct.loanProductAccountings && (
                  <tr className="text-left">
                    <th>Payment Type</th>
                    <th>Fund Source</th>
                  </tr>
                )}

                {loanProduct.fundSources?.map((fundSource) => (
                  <tr key={fundSource.id}>
                    <td>{fundSource.paymentType.name}</td>{" "}
                    <td>{_.capitalize(fundSource.glAccount.name)}</td>
                  </tr>
                ))}

                {loanProduct.feeIncomeAccounts && (
                  <tr className="text-left">
                    <th>Fee</th>
                    <th>Income Account</th>
                  </tr>
                )}

                {loanProduct.feeIncomeAccounts?.map((feeIncome) => (
                  <tr key={feeIncome.id}>
                    <td>{feeIncome.charge.name}</td>{" "}
                    <td>{_.capitalize(feeIncome.glAccount.name)}</td>
                  </tr>
                ))}

                {loanProduct.penaltyIncomeAccounts && (
                  <tr className="text-left">
                    <th>Penalty</th>
                    <th>Income Account</th>
                  </tr>
                )}

                {loanProduct.penaltyIncomeAccounts?.map((penaltyIncome) => (
                  <tr key={penaltyIncome.id}>
                    <td>{penaltyIncome.charge.name}</td>{" "}
                    <td>{_.capitalize(penaltyIncome.glAccount.name)}</td>
                  </tr>
                ))}
              </table>
            </>
          ) : (
            <AccessDenied />
          )}
        </>
      )}
    </>
  );
}
