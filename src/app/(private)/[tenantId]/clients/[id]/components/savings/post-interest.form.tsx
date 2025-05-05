"use client";
import { usePatch, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { DepositAccount, SavingsAccount } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

export default function PostInterestForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id?: number;
  clientId: number | undefined;
  saving: DepositAccount | undefined;
  page?: "CLIENT" | "SAVING ACCOUNT";
}) {
  const { tenantId } = useParams();
  const { id, saving, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const savingId = saving?.id;

  const { mutate: postInterest } = usePatchV2(
    `${tenantId}/${ENDPOINT}`,
    savingId,
    [
      `${tenantId}/savings-accounts`,
      `${savingId}`,
      `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${savingId},"isReversed":false},"order":["id DESC"]}`,
    ]
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const nominalAnnualInterestRate =
      saving?.savingsProduct.depositTypeEnum === "SAVING DEPOSIT"
        ? saving?.nominalAnnualInterestRate
        : saving?.savingsAccountInterestRateCharts?.[0]
            ?.savingsAccountInterestRateSlabs[0].annualInterestRate;

    let updatedValues = {
      savingsAccount: {
        //clientId: saving?.clientId,
        accountBalanceDerived: saving?.accountBalanceDerived,
        totalInterestPostedDerived: saving?.totalInterestPostedDerived,
        lastInterestCalculationDate:
          saving?.lastInterestCalculationDate?.substring(0, 10),
        currencyCode: saving?.currencyCode,
        savingsProductId: saving?.savingsProductId,
        statusEnum: "ACTIVE",
      },
      interestPosting: {
        balance: saving?.minRequiredBalance
          ? saving.accountBalanceDerived - saving?.minRequiredBalance
          : saving?.accountBalanceDerived,
        nominalInterestRate: nominalAnnualInterestRate,
        interestCompoundingPeriod: saving?.interestCompoundingPeriodEnum,
        interestPostingPeriod: saving?.interestPostingPeriodEnum,
        calculationMethod: saving?.interestCalculationTypeEnum,
        daysInYear: saving?.interestCalculationDaysInYearTypeEnum,
        startDate: saving?.activatedOnDate?.substring(0, 10),
        endDate: dayjs(values.transactionDate).format("YYYY-MM-DD"),
        officeId: saving?.client
          ? saving.client.officeId
          : Number(saving?.group?.officeId),
      },
    };

    postInterest(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: "Interest successfully posted",
          });
          setIsModalOpen(false);
          form.resetFields();
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
        name="transactionDate"
        label="Transaction Date"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Transaction Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
