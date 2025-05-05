"use client";
import { useGet, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import {
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
} from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { PaymentType, SavingsAccount } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import PaymentTypeInputs from "../payment-type-inputs";

export default function CloseForm(props: {
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
    page,
    transactionType,
    setIsModalOpen,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showPaymentTypeInputs, setShowPaymentTypeInputs] = useState(false);
  const [showWithdrawBalanceInput, setShowWithdrawBalanceInput] =
    useState(false);

  const savingId = saving.id;

  const { mutate: close } = usePatchV2(`${tenantId}/${ENDPOINT}`, savingId, [
    `${tenantId}/savings-accounts`,
    `${saving.id}`,
    `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${savingId},"isReversed":false},"order":["id DESC"]}`,
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

    type UpdatedValuesType = {
      savingsAccount: {
        accountBalanceDerived: number;
        clientId: number;
        statusEnum: string;
        closedOnDate: string;
        currencyCode: string;
      };
      transaction?: {
        amount: number;
        transactionDate: string | Date;
        transactionTypeEnum: string;
        runningBalanceDerived: number;
        availableBalance: number;
        isReversed: boolean;
        officeId: number;
      };
    };

    let updatedValues: UpdatedValuesType;

    updatedValues = {
      savingsAccount: {
        accountBalanceDerived: saving.accountBalanceDerived,
        clientId: saving.clientId,
        statusEnum: "CLOSED",
        closedOnDate: values.closedOnDate,
        currencyCode: saving.currencyCode,
      },
    };

    if (showWithdrawBalanceInput) {
      updatedValues.transaction = {
        amount: values.transactionAmount,
        transactionDate: values.closedOnDate,
        transactionTypeEnum: "WITHDRAW",
        runningBalanceDerived: 0,
        availableBalance: saving.minRequiredBalance
          ? saving.accountBalanceDerived - saving.minRequiredBalance
          : saving.accountBalanceDerived,
        isReversed: false,
        officeId: saving.client.officeId,
      };
    }

    close(
      { id: savingId, ...updatedValues },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          toast({
            type: "success",
            response: `Closure successfully made`,
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

  const onWithdrawBalanceChange = (e: CheckboxChangeEvent) => {
    setShowWithdrawBalanceInput(e.target.checked);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-1"
        name="closedOnDate"
        label="Closed On"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Closed On Date is required!" }]}
      >
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>

      <Form.Item
        className={`col-span-1 flex justify-start items-baseline`}
        valuePropName="checked"
        label={" "}
        name="isWithdrawBalance"
      >
        <Checkbox onChange={onWithdrawBalanceChange}>Withdraw Balance</Checkbox>
      </Form.Item>

      {showWithdrawBalanceInput && (
        <>
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
            initialValue={saving.accountBalanceDerived}
          >
            <InputNumber
              disabled
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
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
