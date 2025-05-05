"use client";
import { usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { DepositAccount, SavingsAccount } from "@/types";
import toast from "@/utils/toast";
import { useParams } from "next/navigation";

type UpdatedValuesType = {
  savingsAccount: {
    activatedOnDate: any;
    accountBalanceDerived: number;
    totalDepositsDerived: number;
    statusEnum: string;
    officeId: number;
    currencyCode: string;
  };
  transaction?: {
    amount: number;
    runningBalanceDerived: number;
    officeId: number;
    isReversed: boolean;
    transactionDate: any;
    transactionTypeEnum: string;
    makeActive?: boolean;
  };
  depositAccount?: {
    depositPeriod: number;
    depositPeriodFrequencyEnum: string;
  };
};

export default function ActivateForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id?: number;
  clientId: number | undefined;
  saving: SavingsAccount;
  page?: "CLIENT" | "SAVING ACCOUNT";
}) {
  const { tenantId } = useParams();
  const { id, saving, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: activateLoan } = usePatchV2(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/${ENDPOINT}`,
    `${id}`,
    `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${id},"isReversed":false},"order":["id DESC"]}`,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues: UpdatedValuesType = {
      savingsAccount: {
        activatedOnDate: values.activatedOnDate,
        accountBalanceDerived: 0,
        totalDepositsDerived: 0,
        currencyCode: saving.currencyCode,
        statusEnum: "ACTIVE",
        officeId: saving.client
          ? saving.client.officeId
          : Number(saving.group?.officeId),
      },
    };

    // Add transaction if fixed deposit
    if (
      saving.savingsProduct.depositTypeEnum === "FIXED DEPOSIT" &&
      saving.depositAccountTermAndPreClosure.depositAmount
    ) {
      updatedValues.depositAccount = {
        depositPeriod: saving.depositAccountTermAndPreClosure.depositPeriod,
        depositPeriodFrequencyEnum:
          saving.depositAccountTermAndPreClosure.depositPeriodFrequencyEnum,
      };

      updatedValues.savingsAccount.totalDepositsDerived =
        saving.depositAccountTermAndPreClosure.depositAmount;

      updatedValues.transaction = {
        amount: saving.depositAccountTermAndPreClosure.depositAmount,
        runningBalanceDerived:
          saving.depositAccountTermAndPreClosure.depositAmount,
        officeId: saving.client
          ? saving.client.officeId
          : Number(saving.group?.officeId),
        isReversed: false,
        transactionDate: values.activatedOnDate,
        transactionTypeEnum: "DEPOSIT",
        makeActive: true,
      };
    }

    // Add the transaction object only if minRequiredOpeningBalance > 0
    if (
      saving?.minRequiredOpeningBalance &&
      saving?.minRequiredOpeningBalance > 0
    ) {
      //
      let totalActivationCharge = 0;
      if (
        saving.savingsAccountCharges &&
        saving.savingsAccountCharges.length > 0
      ) {
        saving.savingsAccountCharges.forEach((charge) => {
          if (charge.chargeTimeEnum === "SAVINGS ACTIVATION") {
            totalActivationCharge += charge.amount;
          }
        });
      }

      updatedValues.transaction = {
        amount: saving.minRequiredOpeningBalance - totalActivationCharge,
        runningBalanceDerived:
          saving.minRequiredOpeningBalance - totalActivationCharge,
        officeId: saving.client
          ? saving.client.officeId
          : Number(saving.group?.officeId),
        isReversed: false,
        transactionDate: values.activatedOnDate,
        transactionTypeEnum: "DEPOSIT",
        makeActive: true,
      };
    }

    activateLoan(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          toast({ type: "success", response: "Saving successfully activated" });
          setSubmitLoader(false);
          setIsModalOpen(false);
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });
          setSubmitLoader(false);
        },
      }
    );
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="activatedOnDate"
        label="Activated On Date"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Activated On Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>
      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
