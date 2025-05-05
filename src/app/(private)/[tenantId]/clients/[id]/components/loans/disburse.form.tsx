"use client";
import { useCreate, useGet, usePatch, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { Loan, PaymentType } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

export default function DisburseForm(props: {
  loan: Loan;
  undoDisbursal?: boolean;
  page?: "CLIENT" | "LOAN ACCOUNT";
  disburseToSavings?: boolean;
}) {
  const { tenantId } = useParams();
  const {
    loan,
    undoDisbursal = false,
    page,
    disburseToSavings = false,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showPaymentTypeInputs, setShowPaymentTypeInputs] = useState(false);

  const loanId = loan.id;

  const { mutate: disburseLoan } = usePatchV2(
    `${tenantId}/${ENDPOINT}`,
    loanId,
    [`${tenantId}/loans`, `${loan.id}`, `${tenantId}/${QUERY_KEY}`]
  );

  console.log("disburseToSavings", disburseToSavings);

  const {
    status: paymentTypesStatus,
    data: paymentTypes,
    error: paymentTypesError,
  } = useGet<PaymentType[]>(`${tenantId}/payment-types`, [
    `${tenantId}/payment-types`,
  ]);

  let paymentTypeOptions: any = [];

  if (paymentTypesStatus === "success") {
    paymentTypeOptions = paymentTypes?.map((paymentType: PaymentType) => {
      return {
        value: paymentType.id,
        label: `${paymentType.name}`,
      };
    });
  }

  const { mutate: createLoanRepaymentSchedule } = useCreate(
    `${tenantId}/loan-repayment-schedules`,
    [`${tenantId}/loan-repayment-schedules-${loanId}`]
  );

  const onReset = () => {
    form.resetFields();
  };

  const onChangeShowPaymentType = (checked: boolean) => {
    setShowPaymentTypeInputs(!showPaymentTypeInputs);
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues;

    if (undoDisbursal === false) {
      updatedValues = {
        loan: {
          ...values,
          loanStatusEnum: "ACTIVE",
          principalOutstandingDerived: values.principalDisbursedDerived,
          disbursedOnDate: `${dayjs(values.disbursedOnDate).format(
            "YYYY-MM-DD"
          )}`,
          currencyCode: loan?.currencyCode,
          loanProductId: loan?.loanProductId,
          loanTransactionProcessingStrategyId:
            loan?.loanTransactionProcessingStrategyId,
          submittedOnDate: loan?.submittedOnDate,
          expectedMaturedOnDate: loan?.expectedMaturedOnDate,
          maturedOnDate: loan?.maturedOnDate,
          expectedDisbursedOnDate:
            values.expectedDisbursedOnDate || loan?.expectedDisbursedOnDate,
          termFrequency: loan.termFrequency,
          nominalInterestRatePerPeriod: loan?.nominalInterestRatePerPeriod,
          interestRateFrequencyTypeEnum: loan?.interestRateFrequencyTypeEnum,
          savingsAccountId: loan?.savingsAccountId,
        },
        transaction: {
          amount: values.principalDisbursedDerived,
          officeId: loan.client?.officeId || loan.group?.officeId,
          loanId,
          isReversed: false,
          transactionTypeEnum: "DISBURSEMENT",
          transactionDate: values.disbursedOnDate,
          outstandingLoanBalanceDerived: values.principalDisbursedDerived,
          principalPortionDerived: 0,
          interestPortionDerived: 0,
          feeChargesPortionDerived: 0,
          penaltyChargesPortionDerived: 0,
        },
        disburseToSavings,
      };
    } else {
      updatedValues = {
        loan: {
          loanStatusEnum: "APPROVED",
          principalDisbursedDerived: 0,
          principalOutstandingDerived: loan.principalDisbursedDerived,
          principalRepaidDerived: 0,
          interestChargedDerived: 0,
          interestOutstandingDerived: loan.interestOutstandingDerived,
          interestRepaidDerived: 0,
          penaltyChargesChargedDerived: 0,
          penaltyChargesRepaidDerived: 0,
          penaltyChargesOutstandingDerived: 0,
          totalOutstandingDerived: 0,
          disbursedOnDate: null,
          submittedOnDate: loan?.submittedOnDate,
          expectedMaturedOnDate: loan?.expectedMaturedOnDate,
          maturedOnDate: loan?.maturedOnDate,
          expectedDisbursedOnDate:
            values.expectedDisbursedOnDate || loan?.expectedDisbursedOnDate,
          loanTransactionProcessingStrategyId:
            loan?.loanTransactionProcessingStrategyId,
          currencyCode: loan?.currencyCode,
          loanProductId: loan?.loanProductId,
        },
        transaction: {
          loanId,
          officeId: loan.client?.officeId || loan.group?.officeId,
          isReversed: true,
        },
      };
    }

    if (undoDisbursal === false) {
      createLoanRepaymentSchedule(
        {
          nominalInterestRatePerPeriod: loan.nominalInterestRatePerPeriod,
          principalAmount: values.principalDisbursedDerived,
          loanId,
          termFrequency: loan.termFrequency,
          expectedDisbursedOnDate: values.disbursedOnDate,
          amortizationTypeEnum: loan.amortizationTypeEnum,
          interestTypeEnum: loan.interestTypeEnum,
          numberOfRepayments: loan.numberOfRepayments,
          interestPeriodFrequencyEnum: loan.interestRateFrequencyTypeEnum,
          transactionTypeEnum: "DISBURSEMENT",
        },
        {
          onSuccess: () => {
            setSubmitLoader(false);

            disburseLoan(
              { id: loanId, ...updatedValues },
              {
                onSuccess: () => {
                  setSubmitLoader(false);
                  toast({
                    type: "success",
                    response: "Loan Disbursed successfully",
                  });
                },
                onError(error, variables, context) {
                  toast({
                    type: "error",
                    response: error,
                  });
                  setSubmitLoader(false);
                },
              }
            );
          },
          onError(error, variables, context) {
            setSubmitLoader(false);
          },
        }
      );
    } else {
      disburseLoan(
        { id: loanId, ...updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            toast({
              type: "success",
              response: "Loan Disbursal undone successfully",
            });
          },
          onError(error, variables, context) {
            toast({
              type: "error",
              response: error,
            });
            setSubmitLoader(false);
          },
        }
      );
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      {!undoDisbursal && (
        <>
          <Form.Item
            className="col-span-2"
            name="disbursedOnDate"
            label="Disbursed On"
            rules={[
              { required: true, message: "Disbursed On Date is required!" },
            ]}
          >
            <DatePicker className="w-full" format={dateFormat} />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="principalDisbursedDerived"
            label="Transaction Amount"
            initialValue={loan.approvedPrincipal}
            rules={[
              {
                required: true,
                message: "Transaction Amount is required!",
              },
            ]}
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              // max={loan.approvedPrincipal}
            />
          </Form.Item>

          {!disburseToSavings && (
            <>
              <Form.Item
                className="col-span-2"
                name="externalId"
                label="External Id"
              >
                <Input />
              </Form.Item>
              <Form.Item
                className="col-span-2"
                name="paymentTypeId"
                label="Payment Type"
              >
                <Select
                  showSearch
                  allowClear
                  filterOption
                  options={paymentTypes}
                />
              </Form.Item>
              <div className="flex justify-start items-center gap-2">
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
        </>
      )}

      {/* <Form.Item className="col-span-2" name="note" label="Note">
        <Input.TextArea rows={4} />
      </Form.Item> */}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
