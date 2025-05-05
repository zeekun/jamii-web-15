import { Typography } from "antd";
import { Loan } from "@/types";
import { formatNumber } from "@/utils/numbers";
import { formattedDate } from "@/utils/dates";
import _ from "lodash";
import "@/components/css/Table.css";

const { Title } = Typography;
export default function General(props: { loan: Loan | undefined }) {
  const { loan } = props;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Title level={5}>Loan Details</Title>
          <div className="border-solid border-2 border-gray-400 p-3">
            <table className="w-full">
              <tr>
                <td className="w-1/4">Disbursement Date:</td>
                <td>
                  {loan?.disbursedOnDate && loan?.loanStatusEnum === "ACTIVE"
                    ? formattedDate(loan.disbursedOnDate)
                    : "Not Available"}
                </td>
              </tr>
              <tr>
                <td>Currency:</td>
                <td>{loan?.currency.name}</td>
              </tr>
              <tr>
                <td>Loan Officer:</td>
                <td>
                  {loan?.loanOfficer?.firstName
                    ? `${loan.loanOfficer?.firstName} ${
                        loan.loanOfficer?.middleName || ""
                      } ${loan.loanOfficer?.lastName}`
                    : "Unassigned"}
                </td>
              </tr>
              <tr>
                <td>External Id:</td>
                <td>{loan?.externalId ? loan?.externalId : "Not Available"}</td>
              </tr>
            </table>
          </div>
        </div>
        <div>
          <Title level={5}>Loan Purpose</Title>

          <div className="border-solid border-2 border-gray-400 p-3">
            <table className="w-full">
              <tr>
                <td className="w-1/4">Loan Purpose:</td>
                <td>
                  {loan?.loanPurpose
                    ? loan?.loanPurpose.codeValue
                    : "Not Provided"}
                </td>
              </tr>
              <tr>
                <td>Proposed Amount:</td>
                <td>{formatNumber(loan?.principalAmountProposed)}</td>
              </tr>
              <tr>
                <td>Approved Amount:</td>
                <td>
                  {loan?.loanStatusEnum === "SUBMITTED AND AWAITING APPROVAL"
                    ? 0
                    : formatNumber(loan?.approvedPrincipal)}
                </td>
              </tr>
              <tr>
                <td>Disbursed Amount:</td>
                <td>{formatNumber(loan?.principalDisbursedDerived)}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Title level={5}>Account Details</Title>

        <div className="border-solid border-2 border-gray-400 p-3">
          <table className="w-full">
            <tr>
              <td className="w-1/4">Repayment Strategy:</td>
              <td>{loan?.loanTransactionProcessingStrategy?.name}</td>
            </tr>
            <tr>
              <td>Repayments:</td>
              <td className="capitalize">
                {loan?.repaymentEvery} every{" "}
                {_.lowerCase(loan?.repaymentFrequencyTypeEnum)} on
              </td>
            </tr>
            <tr>
              <td>Amortization:</td>
              <td className="capitalize">
                {_.lowerCase(loan?.amortizationTypeEnum)}
              </td>
            </tr>
            <tr>
              <td>Equal Amortization:</td>
              <td>{loan?.isEqualAmortization ? "True" : "False"}</td>
            </tr>
            <tr>
              <td>Interest:</td>
              <td className="capitalize">
                {loan?.nominalInterestRatePerPeriod}{" "}
                {loan?.loanProduct.interestRateFrequencyTypeEnum === "PER MONTH"
                  ? "per month"
                  : "per annum"}
                {" ("}
                {loan?.loanProduct.interestRateFrequencyTypeEnum === "PER MONTH"
                  ? `${(loan?.nominalInterestRatePerPeriod * 12).toFixed(
                      2
                    )} per annum`
                  : `${
                      loan?.nominalInterestRatePerPeriod &&
                      (loan?.nominalInterestRatePerPeriod / 12).toFixed(2)
                    } per month`}
                {")"} - {_.lowerCase(loan?.interestTypeEnum)}
              </td>
            </tr>
            <tr>
              <td>Grace On Arrears Ageing:</td>
              <td>{loan?.graceOnArrearsAgeing}</td>
            </tr>
            <tr>
              <td>Grace On Interest Payment:</td>
              <td>{loan?.graceOnInterestPayment}</td>
            </tr>
            <tr>
              <td>Grace On Principal Payment:</td>
              <td>{loan?.graceOnPrincipalPayment}</td>
            </tr>
            <tr className="capitalize">
              <td>Interest Calculation Period:</td>
              <td>{_.lowerCase(loan?.interestCalculationPeriodTypeEnum)}</td>
            </tr>
            <tr className="capitalize">
              <td>
                Allow Partial Interest Calculation with same as repayment:
              </td>
              <td>
                {loan?.allowPartialPeriodInterestCalculation ? "True" : "False"}
              </td>
            </tr>
            <tr>
              <td>Submitted On:</td>
              <td>{formattedDate(String(loan?.submittedOnDate))}</td>
            </tr>
            <tr>
              <td>Approved On:</td>
              <td>
                {loan?.approvedOnDate
                  ? formattedDate(loan?.approvedOnDate)
                  : loan?.approvedOnDate}
              </td>
            </tr>
            <tr>
              <td>Disbursed On:</td>
              <td>
                {loan?.disbursedOnDate
                  ? formattedDate(loan.disbursedOnDate)
                  : ""}
              </td>
            </tr>
            <tr>
              <td>Matures On:</td>
              <td>
                {loan?.maturedOnDate
                  ? formattedDate(String(loan?.maturedOnDate))
                  : ""}
              </td>
            </tr>
            <tr>
              <td>Recalculate Interest:</td>
              <td>
                {loan?.loanProduct.interestRecalculationEnabled ? "Yes" : "No"}
              </td>
            </tr>
            <tr>
              <td>Days In Year:</td>
              <td className="capitalize">
                {_.lowerCase(loan?.loanProduct.daysInYearTypeEnum)}
              </td>
            </tr>

            <tr>
              <td>Days In Month:</td>
              <td className="capitalize">
                {_.lowerCase(loan?.loanProduct.daysInMonthTypeEnum)}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </>
  );
}
