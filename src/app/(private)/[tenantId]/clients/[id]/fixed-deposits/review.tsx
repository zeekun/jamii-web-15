import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import {
  DepositAccount,
  SavingsAccount,
  SavingsAccountCharge,
  SavingsAccountInterestRateSlab,
  SavingsProduct,
  SubmitType,
} from "@/types";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import toast from "@/utils/toast";
import { Form, Typography } from "antd";
import _ from "lodash";
import { useState } from "react";
import { ENDPOINT, QUERY_KEY } from "./constants";
import { useCreate, usePatch } from "@/api";
import { useParams } from "next/navigation";
import "@/components/css/Table.css";
import { useRouter } from "next/navigation";

const { Title } = Typography;

export default function Review(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<DepositAccount>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<DepositAccount>>>;
  selectedSavingsProduct: Partial<SavingsProduct>;
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
    selectedSavingsProduct,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertSavingsAccount } = useCreate(
    `${tenantId}/savings-accounts`,
    [
      `${tenantId}/${formValues.clientId}/savings-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}}}`,
    ]
  );
  const { mutate: updateSavingsAccount } = usePatch(
    `${tenantId}/savings-accounts`,
    id,
    [QUERY_KEY]
  );

  console.log("review", formValues);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const updatedValues = {
      savingsAccount: {
        clientId: formValues.clientId,
        currencyCode: formValues.currencyCode,
        savingsProductId: formValues.savingsProductId,
        statusEnum: "SUBMITTED AND AWAITING APPROVAL",
        subStatusEnum: "SUBMITTED AND AWAITING APPROVAL",
        accountTypeEnum: "INDIVIDUAL",
        depositTypeEnum: "SUBMITTED AND AWAITING APPROVAL",
        submittedOnDate: formValues.submittedOnDate,
        nominalAnnualInterestRate:
          formValues.savingsProduct?.nominalAnnualInterestRate,
        interestPostingPeriodEnum: formValues.interestPostingPeriodTypeEnum,
        interestCompoundingPeriodEnum: formValues.interestCompoundingPeriodEnum,
        interestCalculationTypeEnum: formValues.interestCalculationTypeEnum,
        interestCalculationDaysInYearTypeEnum:
          formValues.interestCalculationDaysInYearTypeEnum,
        accountBalanceDerived: 0,
        allowOverdraft: !formValues.allowOverdraft
          ? false
          : formValues.allowOverdraft,
        withHoldTax: !formValues.withHoldTax ? false : formValues.withHoldTax,
        enforceMinRequiredBalance: !formValues.enforceMinRequiredBalance
          ? false
          : formValues.enforceMinRequiredBalance,
        minRequiredBalance: formValues.minRequiredBalance,
        minRequiredOpeningBalance: formValues.minRequiredOpeningBalance,
        withdrawalFeeForTransfer: formValues.withdrawalFeeForTransfer,
        fieldOfficerId: formValues.fieldOfficerId,
      },
      charges: formValues.savingsAccountCharges,
      depositAccount: {
        depositAmount: formValues.depositAmount,
        depositPeriod: formValues.depositPeriod,
        depositPeriodFrequencyEnum: formValues.depositPeriodFrequencyEnum,
      },
      savingsAccountInterestRateCharts: [
        {
          fromDate: formValues.savingsAccountInterestRateCharts?.[0].fromDate,
          savingsAccountInterestRateSlabs:
            formValues.savingsAccountInterestRateCharts?.[0]
              .savingsAccountInterestRateSlabs,
        },
      ],
    };

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertSavingsAccount(updatedValues, {
        onSuccess: (data) => {
          const response: any = data;

          toast({
            type: "success",
            response: `Savings Account ${submitTypeMessage} successfully.`,
          });

          router.push(
            `${window.location.pathname}/savings-accounts/${response.id}`
          );
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
              response: `Savings Account ${submitTypeMessage} successfully.`,
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
      <table className="table-auto w-full capitalize text-left border-[1px] mt-2 border-gray-200">
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
          <th className="w-1/2">Deposit Amount</th>
          <td>
            {selectedSavingsProduct.currencyCode ?? formValues.currencyCode}{" "}
            {formatNumber(formValues.depositAmount)}
          </td>
        </tr>

        <tr>
          <th>Deposit Period</th>
          <td>
            {formValues.depositPeriod}{" "}
            {_.toLower(formValues.depositPeriodFrequencyEnum)}
          </td>
        </tr>

        {formValues.currencyMultiplesOf && (
          <tr>
            <th>Currency In Multiples Of</th>
            <td>{formValues.currencyMultiplesOf}</td>
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

        {formValues.lockInPeriodFrequency && (
          <tr>
            <th>Lock-In Period</th>
            <td>
              {formValues.lockInPeriodFrequency}{" "}
              {_.toLower(formValues.lockInPeriodFrequencyEnum)}
            </td>
          </tr>
        )}
      </table>

      <div className="pl-2 pt-2 ">
        <Title level={5}>
          <span className="text-blue-700">Settings</span>
        </Title>
      </div>

      <table className="table-auto w-full capitalize text-left border-[1px] mt-2 border-gray-200">
        {formValues.depositAccountTermAndPreClosure?.minDepositTerm &&
          formValues.depositAccountTermAndPreClosure
            ?.minDepositTermTypeEnum && (
            <tr>
              <th className="w-1/2">Minimum Deposit Term</th>
              <td>
                {formValues.depositAccountTermAndPreClosure?.minDepositTerm}{" "}
                {_.toLower(
                  formValues.depositAccountTermAndPreClosure
                    ?.minDepositTermTypeEnum
                )}
              </td>
            </tr>
          )}

        {formValues.depositAccountTermAndPreClosure?.maxDepositTerm &&
          formValues.depositAccountTermAndPreClosure
            ?.maxDepositTermTypeEnum && (
            <tr>
              <th className="w-1/2">Maximum Deposit Term</th>
              <td>
                {formValues.depositAccountTermAndPreClosure?.maxDepositTerm}{" "}
                {_.toLower(
                  formValues.depositAccountTermAndPreClosure
                    ?.maxDepositTermTypeEnum
                )}
              </td>
            </tr>
          )}

        {formValues.depositAccountTermAndPreClosure?.inMultiplesOfDepositTerm &&
          formValues.depositAccountTermAndPreClosure
            ?.inMultiplesOfDepositTermTypeEnum && (
            <tr>
              <th className="w-1/2">Deposit Term In multiple of</th>
              <td>
                {
                  formValues.depositAccountTermAndPreClosure
                    ?.inMultiplesOfDepositTerm
                }{" "}
                {_.toLower(
                  formValues.depositAccountTermAndPreClosure
                    ?.inMultiplesOfDepositTermTypeEnum
                )}
              </td>
            </tr>
          )}

        <tr>
          <th>Is withhold Tax Applicable</th>
          <td>{formValues.savingsProduct?.withHoldTax ? "True" : "False"}</td>
        </tr>
      </table>

      <div className="pl-2 pt-2 ">
        <Title level={5}>
          <span className="text-blue-700">Interest Rate Chart</span>
        </Title>
      </div>

      <div>
        <tr>
          {formValues.savingsAccountInterestRateCharts?.[0].fromDate && (
            <>
              <th>Valid From Date</th>
              <td>
                {formattedDate(
                  formValues.savingsAccountInterestRateCharts?.[0].fromDate
                )}
              </td>
            </>
          )}

          {formValues.savingsAccountInterestRateCharts?.[0].endDate && (
            <>
              <th>End Date</th>
              <td>
                {formattedDate(
                  formValues.savingsAccountInterestRateCharts?.[0].endDate
                )}
              </td>
            </>
          )}
        </tr>
      </div>

      <table className="table-auto w-full capitalize text-left border-[1px] mt-2 border-gray-200">
        <tr>
          {[
            "Period Type",
            "Period From / To",
            "Amount Range",
            "Interest",
            "Description",
          ].map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
        {formValues.savingsAccountInterestRateCharts?.[0].savingsAccountInterestRateSlabs?.map(
          (slab: SavingsAccountInterestRateSlab, i: number) => (
            <tr key={i}>
              <td>{slab.periodTypeEnum}</td>
              <td>
                {slab.fromPeriod} - {slab.toPeriod || ""}
              </td>
              <td>
                {slab.amountRangeFrom} - {slab.amountRangeTo || ""}
              </td>
              <td>{slab.annualInterestRate}</td>
              <td>{slab.description}</td>
            </tr>
          )
        )}
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
      </table>
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
