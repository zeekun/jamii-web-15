import { Typography } from "antd";
import { DepositAccount, SavingsProduct } from "@/types";
import { formatNumber } from "@/utils/numbers";
import { formattedDate } from "@/utils/dates";
import { useGetById } from "@/api";
import InterestRateSlabDataTable from "./interest-rate-slab.data-table";
import { useParams } from "next/navigation";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import _ from "lodash";
dayjs.extend(duration);

const { Title } = Typography;
export default function General(props: { saving: DepositAccount | undefined }) {
  const { tenantId } = useParams();
  const { saving } = props;

  console.log("savingsssssssss", saving);

  const {
    status: savingsProductStatus,
    data: savingsProduct,
    error,
  } = useGetById<SavingsProduct>(
    `${tenantId}/savings-products`,
    saving?.savingsProductId
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-1">
          <Title level={5}>Details</Title>
          <div className="border-solid border-2 border-gray-400 p-3 mb-3">
            {saving?.savingsProduct.depositTypeEnum === "SAVING DEPOSIT" && (
              <>
                {" "}
                <table className="w-full">
                  <tr>
                    <td className="w-1/4">Activated On:</td>
                    <td>
                      {saving?.activatedOnDate
                        ? formattedDate(saving.activatedOnDate)
                        : "Not Activated"}
                    </td>
                  </tr>
                  <tr>
                    <td>Currency:</td>
                    <td>{saving?.currencyCode}</td>
                  </tr>
                  <tr>
                    <td>Field Officer:</td>
                    <td>
                      {saving?.fieldOfficer?.firstName
                        ? `${saving.fieldOfficer?.firstName} ${
                            saving.fieldOfficer?.middleName || ""
                          } ${saving.fieldOfficer?.lastName}`
                        : "Unassigned"}
                    </td>
                  </tr>
                  <tr>
                    <td>External Id:</td>
                    <td>
                      {saving?.externalId
                        ? saving?.externalId
                        : "Not Available"}
                    </td>
                  </tr>
                </table>
              </>
            )}

            {(saving?.savingsProduct.depositTypeEnum === "FIXED DEPOSIT" ||
              saving?.savingsProduct.depositTypeEnum ===
                "RECURRING DEPOSIT") && (
              <table className="w-full capitalize">
                <tbody>
                  <tr>
                    <td className="w-1/4">Activation Date:</td>
                    <td>
                      {saving?.activatedOnDate
                        ? formattedDate(saving.activatedOnDate)
                        : "Not Activated"}
                    </td>
                    <td className="w-1/4">Principal Amount:</td>
                    <td>
                      {saving.currencyCode}{" "}
                      {formatNumber(
                        saving.depositAccountTermAndPreClosure.depositAmount
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/4">Maturity Date:</td>
                    <td>
                      {saving.depositAccountTermAndPreClosure.maturityDate
                        ? formattedDate(
                            saving.depositAccountTermAndPreClosure.maturityDate
                          )
                        : "No Maturity Date"}
                    </td>
                    <td className="w-1/4"></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Period:</td>
                    <td>
                      {saving.depositAccountTermAndPreClosure.depositPeriod}{" "}
                      {_.toLower(
                        saving.depositAccountTermAndPreClosure
                          .depositPeriodFrequencyEnum
                      )}
                    </td>
                    <td className="w-1/4">Rate of Interest:</td>
                    <td>
                      {saving?.savingsAccountInterestRateCharts?.[0]
                        ?.savingsAccountInterestRateSlabs?.[0]
                        ?.annualInterestRate ?? 0}{" "}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td>Field Officer:</td>
                    <td>
                      {saving.fieldOfficer
                        ? `${saving.fieldOfficer.firstName} ${
                            saving.fieldOfficer.middleName || ""
                          } ${saving.fieldOfficer.lastName}`
                        : "Not Available"}
                    </td>
                    <td className="w-1/4">Maturity Amount:</td>
                    <td>
                      {saving.currencyCode}{" "}
                      {formatNumber(
                        saving.depositAccountTermAndPreClosure.maturityAmount
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Interest compounding period:</td>
                    <td>{_.toLower(saving.interestCompoundingPeriodEnum)}</td>
                    <td className="w-1/4">Interest posting period:</td>
                    <td>{_.toLower(saving.interestPostingPeriodEnum)}</td>
                  </tr>
                  <tr>
                    <td>Interest calculated using:</td>
                    <td>{_.toLower(saving.interestCalculationTypeEnum)}</td>
                    <td className="w-1/4"># Days in Year:</td>
                    <td>
                      {_.toLower(saving.interestCalculationDaysInYearTypeEnum)}{" "}
                      Days
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="col-span-1">
          {saving?.statusEnum === "ACTIVE" && (
            <>
              <Title level={5}>Performance History</Title>
              <div className="border-solid border-2 border-gray-400 p-3 mb-3">
                <table className="w-full border-solid border-1">
                  <tr>
                    <td className="w-1/4">Total Deposits:</td>
                    <td>
                      {saving?.currencyCode}{" "}
                      {formatNumber(saving?.totalDepositsDerived)}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Withdraws:</td>
                    <td>
                      {saving?.currencyCode}{" "}
                      {formatNumber(saving?.totalWithdrawalsDerived)}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Withdraw Fees:</td>
                    <td>
                      {saving?.currencyCode}{" "}
                      {formatNumber(saving?.totalWithdrawalFeesDerived)}
                    </td>
                  </tr>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {saving?.savingsProduct.depositTypeEnum === "FIXED DEPOSIT" ||
        (saving?.savingsProduct.depositTypeEnum === "RECURRING DEPOSIT" && (
          <>
            <Title level={5}>Interest Rate Chart</Title>
            <div className="border-solid border-2 border-gray-400 p-3 mb-3">
              {savingsProductStatus === "success" &&
                savingsProduct.interestRateCharts && (
                  <>
                    <InterestRateSlabDataTable
                      data={
                        savingsProduct.interestRateCharts[0]?.interestRateSlabs
                      }
                    />
                  </>
                )}
            </div>
          </>
        ))}

      {/* for savings deposit */}
      {saving?.statusEnum === "APPROVED" ||
        (saving?.statusEnum === "ACTIVE" && (
          <>
            <Title level={5}>
              {saving?.savingsProduct.depositTypeEnum === "FIXED DEPOSIT"
                ? null
                : "Terms"}
            </Title>
            {saving?.savingsProduct.depositTypeEnum ===
            "FIXED DEPOSIT" ? null : (
              <div className="border-solid border-2 border-gray-400 p-3 mb-3">
                <table className="w-full border-solid border-1">
                  <tr>
                    <td className="w-1/4">Interest Posted:</td>
                    <td>
                      {formatNumber(saving?.totalInterestPostedDerived, 2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/4">Earned interest not posted:</td>
                    <td>{0}</td>
                  </tr>
                  <tr>
                    <td>Nominal interest rate:</td>
                    <td>{saving?.nominalAnnualInterestRate} %</td>
                  </tr>
                  <tr>
                    <td>Interest compounding period:</td>
                    <td>{saving?.interestCompoundingPeriodEnum}</td>
                  </tr>
                  <tr>
                    <td>Interest posting period:</td>
                    <td>{saving?.interestPostingPeriodEnum}</td>
                  </tr>
                  <tr>
                    <td>Interest calculated using:</td>
                    <td>{saving?.interestCalculationTypeEnum}</td>
                  </tr>
                  <tr>
                    <td># Days in Year:</td>
                    <td>{saving?.interestCalculationDaysInYearTypeEnum}</td>
                  </tr>
                  <tr>
                    <td>Withdrawal Fee:</td>
                    <td>
                      {saving?.savingsAccountCharges?.map((charge) => {
                        const amount =
                          charge.chargeTimeEnum === "WITHDRAWAL FEE" &&
                          charge.amount;
                        const unit =
                          charge.chargeCalculationEnum === "FLAT"
                            ? charge.charge.currencyId
                            : "%";
                        const fee = `${formatNumber(
                          Number(amount),
                          2
                        )} ${unit}`;
                        return fee;
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td>Apply Withdrawal Fee For Transfers:</td>
                    <td>{saving?.withdrawalFeeForTransfer ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td># Days to Inactive:</td>
                    <td>{saving?.savingsProduct.daysToInactive}</td>
                  </tr>
                  <tr>
                    <td># Days to Dormancy:</td>
                    <td>{saving?.savingsProduct.daysToDormant}</td>
                  </tr>
                  <tr>
                    <td># Days to Escheat:</td>
                    <td>{saving?.savingsProduct.daysToEscheat}</td>
                  </tr>
                  <tr>
                    <td>Enforce Minimum Balance:</td>
                    <td>
                      {saving?.enforceMinRequiredBalance ? "True" : "False"}
                    </td>
                  </tr>
                  <tr>
                    <td>Minimum balance :</td>
                    <td>
                      {saving?.minRequiredBalance
                        ? formatNumber(saving.minRequiredBalance)
                        : ""}
                    </td>
                  </tr>
                </table>
              </div>
            )}
          </>
        ))}

      {/* for savings deposit */}
    </>
  );
}
