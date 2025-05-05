import { useCreate, useGet, usePatch, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";
import { useEffect, useState } from "react"; // Add useEffect
import toast from "@/utils/toast";
import { PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { filterOption } from "@/utils/strings";
import { Loan, PaymentType } from "@/types";
import { useParams } from "next/navigation";
import Loading from "@/components/loading";

export default function RepaymentForm(props: {
  loan: Loan;
  undoDisbursal?: boolean;
  page?: "CLIENT" | "LOAN ACCOUNT";
  paymentAmount: number;
  repaymentScheduleId: number | undefined;
}) {
  const { tenantId, loanId } = useParams();
  const {
    loan,
    undoDisbursal = false,
    page,
    paymentAmount,
    repaymentScheduleId,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showPaymentTypeInputs, setShowPaymentTypeInputs] = useState(false);

  console.log("paymentAmountpaymentAmount", paymentAmount);

  // Use useEffect to update the form's amount field when paymentAmount changes
  useEffect(() => {
    if (paymentAmount !== undefined) {
      form.setFieldsValue({ amount: paymentAmount });
    }
  }, [paymentAmount, form]);

  let loanTransactionsQueryKey = [
    `${tenantId}/clients/${loan.clientId}/loans?filter={"where":{"loanStatusEnum":{"neq":"REJECTED"}}}`,
  ];

  if (page === "LOAN ACCOUNT") {
    loanTransactionsQueryKey = ["loans", `${loan.id}`];
  }

  const { mutate: repayLoan } = useCreate(`${tenantId}/loan-transactions`, [
    `${tenantId}/loan-transactions?filter={"where":{"loanId":${loan.id},"isReversed":"false"},"order": ["id DESC"]}`,
  ]);

  const { mutate: updateLoanRepaymentSchedule } = usePatchV2(
    `${tenantId}/loan-repayment-schedules`,
    repaymentScheduleId,
    [
      `${tenantId}/loan-repayment-schedules-${loan.id}`,
      `${tenantId}/loans`,
      `${loanId}`,
    ]
  );

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: paymentTypesStatus,
    data: paymentTypes,
    error: paymentTypesError,
  } = useGet<PaymentType[]>(`${tenantId}/payment-types`, [
    `${tenantId}/payment-types`,
  ]);

  let paymentTypesOptions: any = [];

  if (paymentTypesStatus === "success") {
    paymentTypesOptions = paymentTypes.map((paymentType: PaymentType) => {
      return { value: paymentType.id, label: paymentType.name };
    });
  }

  const onChangeShowPaymentType = (checked: boolean) => {
    setShowPaymentTypeInputs(!showPaymentTypeInputs);
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      ...values,
      loanId: loan.id,
      isReversed: false,
      transactionTypeEnum: "REPAYMENT",
    };

    repayLoan(updatedValues, {
      onSuccess: (response: any) => {
        setSubmitLoader(false);

        if (response.id) {
          updateLoanRepaymentSchedule(
            {
              totalPaidInAdvanceDerived: values.amount,
              loanId: loan.id,
              loanProductId: loan.loanProductId,
              obligationsMetOnDate: values.transactionDate,
              loanRepaymentTransactionId: response.id,
              officeId: response.officeId,
              currencyId: response.currencyId,
              nominalInterestRatePerPeriod: loan.nominalInterestRatePerPeriod,
              principalAmount: loan.principalAmount,
              termFrequency: loan.termFrequency,
              amortizationTypeEnum: loan.amortizationTypeEnum,
              interestTypeEnum: loan.interestTypeEnum,
              numberOfRepayments: loan.numberOfRepayments,
              transactionTypeEnum: "REPAYMENT",
            },
            {
              onSuccess: () => {
                setSubmitLoader(false);
                toast({
                  type: "success",
                  response: `Payment made successfully.`,
                });

                //window.location.reload();
              },
              onError(error, variables, context) {
                toast({ type: "error", response: error });
                setSubmitLoader(false);
              },
            }
          );
        }
      },
      onError(error, variables, context) {
        toast({ type: "error", response: error });
        setSubmitLoader(false);
      },
    });
  }

  return (
    <>
      {loan && paymentTypesStatus === "success" ? (
        <Form
          layout="vertical"
          form={form}
          name={PAGE_TITLE}
          onFinish={onFinish}
          className="grid grid-cols-4 gap-2"
        >
          {!undoDisbursal && (
            <>
              <Form.Item
                className="col-span-2"
                name="transactionDate"
                label="Transaction Date"
                initialValue={dayjs()}
                rules={[
                  { required: true, message: "Transaction Date is required!" },
                ]}
              >
                <DatePicker
                  className="w-full"
                  maxDate={dayjs()}
                  format={dateFormat}
                />
              </Form.Item>

              <Form.Item
                className="col-span-2"
                name="amount"
                label="Transaction Amount"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  className="w-full"
                  formatter={(value) => {
                    // Round the value to the nearest whole number
                    const roundedValue = Math.round(
                      parseFloat(`${value}` || "0")
                    );
                    // Format the rounded value with commas as thousand separators
                    return `${roundedValue}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    );
                  }}
                  parser={(value) => {
                    // Remove commas and parse the value as a number
                    return value ? parseFloat(value.replace(/,/g, "")) : 0;
                  }}
                  max={loan.approvedPrincipal}
                />
              </Form.Item>

              <Form.Item
                className="col-span-2"
                name="externalId"
                label="External Id"
              >
                <Input />
              </Form.Item>

              <Form.Item
                className="col-span-2"
                name="transactionTypeEnum"
                label="Payment Type"
              >
                <Select
                  filterOption={filterOption}
                  options={paymentTypesOptions}
                  allowClear
                  showSearch
                />
              </Form.Item>

              <div className="flex justify-start items-center col-span-4 gap-2">
                <label>Show Payment Details</label>
                <Switch
                  defaultChecked={false}
                  onChange={onChangeShowPaymentType}
                  size="small"
                  className="w-4"
                />
              </div>

              {showPaymentTypeInputs && (
                <>
                  <Form.Item
                    className="col-span-2"
                    name="accountNo"
                    label="Account #"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    className="col-span-2"
                    name="chequeNo"
                    label="Cheque #"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    className="col-span-2"
                    name="routingCode"
                    label="Routing Code"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    className="col-span-2"
                    name="accountNo"
                    label="Receipt #"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    className="col-span-2"
                    name="bankNo"
                    label="Bank #"
                  >
                    <Input />
                  </Form.Item>
                </>
              )}
            </>
          )}

          <div className="col-span-4">
            <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
          </div>
        </Form>
      ) : (
        <Loading />
      )}
    </>
  );
}
