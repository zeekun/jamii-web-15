"use client";
import { useGet, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { PaymentType, SavingsAccount } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import PaymentTypeInputs from "../payment-type-inputs";

export default function TransactionForm(props: {
  saving: SavingsAccount;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  undoTransaction?: boolean;
  transactionType: "deposit" | "withdraw";
  page?: "CLIENT" | "SAVING ACCOUNT";
}) {
  const { tenantId } = useParams();
  const {
    saving,
    undoTransaction = false,
    transactionType,
    setIsModalOpen,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showPaymentTypeInputs, setShowPaymentTypeInputs] = useState(false);

  const savingId = saving.id;

  const { mutate: transact } = usePatchV2(`${tenantId}/${ENDPOINT}`, savingId, [
    `${tenantId}/savings-accounts`,
    `${saving.id}`,
    `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${savingId},"isReversed":false},"order":["id DESC"]}`,
    `${tenantId}/gl-journal-entries`,
  ]);

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

  let paymentTypeOptions: any = [];

  if (paymentTypesStatus === "success") {
    paymentTypeOptions = paymentTypes?.map((paymentType: PaymentType) => {
      return {
        value: paymentType.id,
        label: `${paymentType.name}`,
      };
    });
  }

  const onChangeShowPaymentType = (checked: boolean) => {
    setShowPaymentTypeInputs(!showPaymentTypeInputs);
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const getCommonSavingsAccountFields = (saving: any) => ({
      accountBalanceDerived: saving.accountBalanceDerived,
      ...(saving.clientId
        ? { clientId: saving.clientId }
        : { groupId: saving.groupId }),
      statusEnum: saving.statusEnum,
      currencyCode: saving.currencyCode,
    });

    const getCommonTransactionFields = (
      saving: any,
      values: any,
      transactionTypeEnum: string
    ) => ({
      amount: values.transactionAmount,
      transactionDate: values.transactionDate,
      transactionTypeEnum,
      isReversed: false,
      officeId: saving.client
        ? saving.client.officeId
        : Number(saving.group?.officeId),
      paymentDetail: {
        paymentTypeId: values.paymentTypeId,
        accountNumber: values.accountNumber,
        checkNumber: values.checkNumber,
        receiptNumber: values.receiptNumber,
        routingCode: values.routingCode,
      },
    });

    const calculateWithdrawalFee = (saving: any, transactionAmount: number) => {
      let withdrawalFee = 0;
      saving?.savingsAccountCharges?.forEach((charge: any) => {
        withdrawalFee =
          charge.chargeTimeEnum === "WITHDRAWAL FEE" &&
          charge.chargeCalculationEnum === "FLAT"
            ? charge.amount
            : (charge.amount / 100) * transactionAmount;
      });
      return withdrawalFee;
    };

    let updatedValues;

    if (transactionType === "deposit") {
      updatedValues = {
        savingsAccount: {
          ...getCommonSavingsAccountFields(saving),
          totalDepositsDerived:
            values.transactionAmount + saving.totalDepositsDerived,
        },
        charges: saving.savingsAccountCharges,
        transaction: {
          ...getCommonTransactionFields(saving, values, "DEPOSIT"),
          runningBalanceDerived:
            values.transactionAmount + saving.accountBalanceDerived,
        },
      };
    } else {
      const withdrawalFee = calculateWithdrawalFee(
        saving,
        values.transactionAmount
      );
      const totalWithdrawalFeesDerived = saving.totalWithdrawalFeesDerived || 0;

      updatedValues = {
        savingsAccount: {
          ...getCommonSavingsAccountFields(saving),
          totalWithdrawalsDerived:
            values.transactionAmount + saving.totalWithdrawalsDerived,
          totalWithdrawalFeesDerived:
            totalWithdrawalFeesDerived + withdrawalFee,
          enforceMinRequiredBalance: saving.enforceMinRequiredBalance,
          minRequiredBalance: saving.minRequiredBalance,
          overdraftLimit: saving.overdraftLimit,
          allowOverdraft: saving.allowOverdraft,
        },
        charges: saving.savingsAccountCharges,
        transaction: {
          ...getCommonTransactionFields(saving, values, "WITHDRAW"),
          runningBalanceDerived:
            saving.accountBalanceDerived - values.transactionAmount,
          availableBalance: saving.minRequiredBalance
            ? saving.accountBalanceDerived - saving.minRequiredBalance
            : saving.accountBalanceDerived,
        },
      };
    }

    if (undoTransaction === false) {
      const response = transactionType === "deposit" ? "Deposit" : "Withdraw";
      transact(
        { id: savingId, ...updatedValues },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            toast({
              type: "success",
              response: `${response} successfully made`,
            });
            setSubmitLoader(false);
            form.resetFields();
          },
          onError(error, variables, context) {
            toast({ type: "error", response: error });
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
            className="col-span-1"
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
            className="col-span-1"
            name="transactionAmount"
            label="Transaction Amount"
            rules={[
              {
                required: true,
                message: "Transaction Amount is required!",
              },
            ]}
            initialValue={5000}
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-1"
            name="externalId"
            label="External Id"
          >
            <Input />
          </Form.Item>

          <PaymentTypeInputs
            filterOption={filterOption}
            paymentTypeOptions={paymentTypeOptions}
            onChangeShowPaymentType={onChangeShowPaymentType}
            showPaymentTypeInputs={showPaymentTypeInputs}
          />
        </>
      )}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
