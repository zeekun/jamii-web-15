"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { PaymentType, SavingsAccount } from "@/types";
import { useParams } from "next/navigation";
import { filterOption } from "@/utils/strings";

export default function TransactionForm(props: {
  saving: SavingsAccount;
  undoTransaction?: boolean;
  transactionType: "deposit" | "withdraw";
  page?: "CLIENT" | "SAVING ACCOUNT";
}) {
  const { tenantId } = useParams();
  const { saving, undoTransaction = false, page, transactionType } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showPaymentTypeInputs, setShowPaymentTypeInputs] = useState(false);

  const savingId = saving.id;

  let qk = [
    `${tenantId}/clients/${saving.clientId}/savings-accounts?filter={"where":{"statusEnum":{"neq":"REJECTED"}}}`,
  ];

  if (page === "SAVING ACCOUNT") {
    qk = [`${tenantId}/loans`, `${saving.id}`];
  }

  const { mutate: transact } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    savingId,
    qk
  );

  const onReset = () => {
    form.resetFields();
  };

  const onChangeShowPaymentType = (checked: boolean) => {
    setShowPaymentTypeInputs(!showPaymentTypeInputs);
  };

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

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues;

    // Given values
    const nominalInterestRate = saving.nominalAnnualInterestRate; // 10% annually
    const depositAmount = values.transactionAmount; // USh 10,000
    const daysInYear = Number(saving.interestCalculationDaysInYearTypeEnum); // For annual compounding
    const daysHeld = 1; // The deposit was held for 1 day

    // Calculate the Average Daily Balance
    // In this case, the deposit of 10,000 was held for 1 day out of 365
    const averageDailyBalance = (depositAmount * daysHeld) / daysInYear;

    // Convert nominal interest rate from percentage to decimal
    const interestRateDecimal = nominalInterestRate / 100;

    // Calculate the interest earned using the formula
    const interestEarned = averageDailyBalance * interestRateDecimal;

    if (transactionType === "deposit") {
      updatedValues = {
        savingsAccount: {
          accountBalanceDerived:
            values.transactionAmount + saving.accountBalanceDerived,
          totalDepositsDerived:
            values.transactionAmount + saving.accountBalanceDerived,
        },
        transaction: {
          amount: values.transactionAmount,
          transactionDate: values.transactionDate,
          officeId: saving.client.officeId,
          transactionTypeEnum: "DEPOSIT",
          runningBalanceDerived:
            values.transactionAmount + saving.accountBalanceDerived,
          isReversed: false,
        },
      };
    } else {
      updatedValues = {
        savingsAccount: {
          accountBalanceDerived:
            saving.accountBalanceDerived - values.transactionAmount,
          totalWithdrawalsDerived:
            values.transactionAmount + saving.totalWithdrawalsDerived,
        },
        transaction: {
          amount: values.transactionAmount,
          transactionDate: values.transactionDate,
          transactionTypeEnum: "WITHDRAW",
          officeId: saving.client.officeId,
          runningBalanceDerived:
            saving.accountBalanceDerived - values.transactionAmount,
          isReversed: false,
        },
      };
    }

    if (undoTransaction === false) {
      transact(
        { id: savingId, ...updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            //setIsModalOpen(false);
          },
          onError(error, variables, context) {
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
      {!undoTransaction && (
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
            <DatePicker className="w-full" format={dateFormat} />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="transactionAmount"
            label="Transaction Amount"
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
            name="paymentTypeId"
            label="Payment Type"
          >
            <Select
              showSearch
              allowClear
              filterOption={filterOption}
              options={paymentTypeOptions}
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

              <Form.Item className="col-span-2" name="bankNo" label="Bank #">
                <Input />
              </Form.Item>
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
