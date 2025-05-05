import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Loan, LoanProduct, SubmitType } from "@/types";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import toast from "@/utils/toast";
import { Form, Typography } from "antd";
import _ from "lodash";
import { useState } from "react";
import { ENDPOINT } from "./constants";
import { useCreate, usePatchV2 } from "@/api";
import { useParams } from "next/navigation";
import "@/components/css/Table.css";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const { Title } = Typography;

export default function Review(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<Loan>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<Loan>>>;
  selectedLoanProduct: Partial<LoanProduct>;
  submitType: SubmitType;
  id?: number;
  productName?: string;
}) {
  const { tenantId } = useParams();
  const router = useRouter();

  const {
    setIsModalOpen,
    current,
    setCurrent,
    formValues,
    setFormValues,
    submitType,
    id,
    productName,
    selectedLoanProduct,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertSavingsAccount } = useCreate(`${tenantId}/loans`, [
    `${tenantId}/${formValues.clientId}/loans?filter={"where":{"statusEnum":{"neq":"CLOSED"}}}`,
  ]);
  const { mutate: updateSavingsAccount } = usePatchV2(
    `${tenantId}/${ENDPOINT}`,
    id,
    [`${tenantId}/loans`, `${id}`]
  );

  console.log("review", formValues);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const expectedMaturedOnDate = dayjs(formValues.expectedDisbursedOnDate).add(
      Number(formValues.repaymentEvery),
      formValues.repaymentFrequencyTypeEnum as
        | "days"
        | "months"
        | "years"
        | "weeks"
    );

    const updatedValues = {
      loan: {
        loanProductId: formValues.loanProductId,
        clientId: formValues.clientId,
        groupId:formValues.groupId,
        submittedOnDate: formValues.submittedOnDate,
        expectedDisbursedOnDate: formValues.expectedDisbursedOnDate,
        maturedOnDate: expectedMaturedOnDate,
        expectedMaturedOnDate: expectedMaturedOnDate,
        externalId: formValues.externalId,
        createStandingInstructionsAtDisbursement:
          formValues.createStandingInstructionsAtDisbursement,
        loanTypeEnum: formValues.loanTypeEnum,
        principalAmountProposed: formValues.principalAmount,
        principalAmount: formValues.principalAmount || 0,
        approvedPrincipal:
          formValues.approvedPrincipal || formValues.principalAmount,
        interestTypeEnum: formValues.interestTypeEnum,
        allowPartialPeriodInterestCalculation:
          formValues.allowPartialPeriodInterestCalculation,
        interestCalculationPeriodTypeEnum:
          formValues.interestCalculationPeriodTypeEnum,
        termFrequency: formValues.termFrequency,
        termPeriodFrequencyEnum: formValues.termPeriodFrequencyEnum,
        numberOfRepayments: formValues.numberOfRepayments,
        repaymentFrequencyTypeEnum: formValues.repaymentFrequencyTypeEnum,
        amortizationTypeEnum: formValues.amortizationTypeEnum,
        repaymentEvery: formValues.repaymentEvery,
        currencyCode: formValues.currencyCode,
        nominalInterestRatePerPeriod: formValues.nominalInterestRatePerPeriod,
        loanTransactionProcessingStrategyId:
          formValues.loanTransactionProcessingStrategyId,
        loanOfficerId: formValues.loanOfficerId,
        loanPurposeId: formValues.loanPurposeId,
        interestRateFrequencyTypeEnum: formValues.interestRateFrequencyTypeEnum,
      },
      charges: formValues.loanCharges,
      savingsAccountId: formValues.savingsAccountId,
    };

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertSavingsAccount(updatedValues, {
        onSuccess: (data) => {
          const response: any = data;

          toast({
            type: "success",
            response: `Loan Account ${submitTypeMessage} successfully.`,
          });

          if (response.id) {
            router.push(
              `${window.location.pathname}/loan-accounts/${response.id}`
            );
          }

          setSubmitLoader(false);
          setIsModalOpen(false);
          form.resetFields();
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateSavingsAccount(
        { id, ...updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            //setIsModalOpen(false);
            toast({
              type: "success",
              response: `Loan Account ${submitTypeMessage} successfully.`,
            });
          },
          onError(error, variables, context) {
            toast({ type: "error", response: error });

            setSubmitLoader(false);
          },
        }
      );
    }
  }

  const onReset = () => {
    form.resetFields();
  };
  return (
    <div className="mt-5">
      <Title level={5} className="pl-2 pt-2">
        <span className="text-blue-700">Details</span>
      </Title>
      {/* <table className="table-auto w-full capitalize text-left border-[1px] mt-2 border-gray-200">
        <tr>
          <th className="w-1/2">Product</th>
          <td>
            {formValues.savingsProduct && formValues.savingsProduct.name}
            {productName && productName}
          </td>
        </tr>
        {formValues.submittedOnDate && (
          <tr>
            <th>Submitted On</th>
            <td>{formattedDate(formValues.submittedOnDate)}</td>
          </tr>
        )}

        {formValues.externalId && (
          <tr>
            <th>External Id</th>
            <td>{formValues.externalId}</td>
          </tr>
        )}
      </table>

      <div className="pl-2 pt-2 ">
        <Title level={5}>
          <span className="text-blue-700">Terms</span>
        </Title>
      </div>

      <table className="table-auto capitalize  border-[1px] mt-2 border-gray-200">
        <tr>
          <th className="w-1/2">Currency</th>
          <td>
            {selectedLoanProduct.currencyCode ?? formValues.currencyCode}
          </td>
        </tr>

        {formValues.currencyMultiplesOf && (
          <tr>
            <th>Currency In Multiples Of</th>
            <td>{formValues.currencyMultiplesOf}</td>
          </tr>
        )}
        {formValues.nominalAnnualInterestRate && (
          <tr>
            <th>Nominal Annual Interest Rate</th>
            <td>{formValues.nominalAnnualInterestRate}</td>
          </tr>
        )}
        {formValues.interestCompoundingPeriodEnum && (
          <tr>
            <th>Interest Compounding Period</th>
            <td>{_.capitalize(formValues.interestCompoundingPeriodEnum)}</td>
          </tr>
        )}
        {formValues.interestPostingPeriodEnum && (
          <tr>
            <th>Interest Posting Period</th>
            <td>{_.capitalize(formValues.interestPostingPeriodEnum)}</td>
          </tr>
        )}
        {formValues.currencyMultiplesOf && (
          <tr>
            <th>Currency In Multiples Of</th>
            <td>{formValues.currencyMultiplesOf}</td>
          </tr>
        )}
        {formValues.interestCalculationTypeEnum && (
          <tr>
            <th>Interest Calculated Using</th>
            <td>{_.capitalize(formValues.interestCalculationTypeEnum)}</td>
          </tr>
        )}
        {formValues.interestCalculationDaysInYearTypeEnum && (
          <tr>
            <th>Days in year</th>
            <td>{formValues.interestCalculationDaysInYearTypeEnum}</td>
          </tr>
        )}
        {formValues.minRequiredOpeningBalance && (
          <tr>
            <th>Minimum Opening Balance</th>
            <td>{formatNumber(formValues.minRequiredOpeningBalance)}</td>
          </tr>
        )}
        {formValues.lockInPeriodFrequency && (
          <tr>
            <th>Lock-In Period</th>
            <td>{formValues.lockInPeriodFrequency}</td>
          </tr>
        )}

        <tr>
          <th>Is Overdraft Allowed</th>
          <td>{formValues.allowOverdraft ? "True" : "False"}</td>
        </tr>

        <tr>
          <th>Apply Withdrawal Fee For Transfers</th>
          <td>{formValues.withdrawalFeeForTransfer ? "True" : "False"}</td>
        </tr>

        <tr>
          <th>Enforce Minimum Balance</th>
          <td>{formValues.enforceMinRequiredBalance ? "True" : "False"}</td>
        </tr>

        <tr>
          <th>Minimum balance</th>
          <td>
            {formValues.minRequiredBalance && (
              <>{formatNumber(formValues.minRequiredBalance)}</>
            )}
          </td>
        </tr>
      </table>
      <div className="pl-2 pt-2 ">
        <Title level={5}>
          <span className="text-blue-700">Charges</span>
        </Title>
      </div>

      <table className="table-auto w-full capitalize text-left border-[1px] mt-2 border-gray-200">
        <tr>
          {["Name", "Type", "Amount", "Collected On"].map((header, index) => (
            <th key={index} className="w-1/4">
              {header}
            </th>
          ))}
        </tr>
        {formValues.savingsAccountCharges?.map(
          (charge: SavingsAccountCharge) => (
            <tr key={charge.charge.id}>
              <td>{charge.charge.name}</td>
              <td>{charge.charge.chargeCalculationTypeEnum}</td>
              <td>
                {charge.charge.chargeCalculationTypeEnum === "FLAT" &&
                  `${charge.charge.currencyId} `}
                {formatNumber(charge.amount, 2)}
                {charge.charge.chargeCalculationTypeEnum !== "FLAT" && ` %`}
              </td>
              <td>{_.toLower(charge.charge.chargeTimeTypeEnum)}</td>
            </tr>
          )
        )}
      </table> */}

      <Form
        layout="vertical"
        form={form}
        name={"accountingForm"}
        onFinish={onFinish}
        className="grid grid-cols-2 gap-2 mt-4"
      >
        <div className="col-span-2">
          <FormSubmitButtonsStep
            cancelText="Previous"
            submitLoader={submitLoader}
            onReset={onReset}
            handleCancel={() => {
              setCurrent(current - 1);
            }}
          />
        </div>
      </Form>
    </div>
  );
}
