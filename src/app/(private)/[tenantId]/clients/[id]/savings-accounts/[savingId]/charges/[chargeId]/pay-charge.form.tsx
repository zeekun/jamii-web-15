"use client";
import { usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, InputNumber } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { SavingsAccount, SavingsAccountCharge } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";
import { formatNumber } from "@/utils/numbers";

export default function PayChargeForm(props: {
  charge: SavingsAccountCharge;
  saving: SavingsAccount;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { id, tenantId, savingId, chargeId } = useParams();
  const { setIsModalOpen, saving, charge } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [amountOutstandingDerived, setAmountOutstandingDerived] = useState<
    number | null
  >(null);

  const { mutate: payCharge } = usePatchV2(
    `${tenantId}/savings-accounts`,
    Number(savingId),
    [
      `${tenantId}/savings-accounts`,
      `${savingId}`,
      `${tenantId}/savings-account-charges?filter={"where":{"savingsAccountId":${savingId}},"order":["id DESC"]}`,
      `${tenantId}/savings-account-charges/${chargeId}`,
      `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${savingId},"isReversed":false},"order":["id DESC"]}`,
      `${tenantId}/gl-journal-entries`,
    ]
  );

  useEffect(() => {
    if (charge?.amountOutstandingDerived !== undefined) {
      setAmountOutstandingDerived(charge.amountOutstandingDerived);
      form.setFieldsValue({ amount: charge.amountOutstandingDerived });
    }
  }, [charge]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      savingsAccount: {
        accountBalanceDerived: saving.accountBalanceDerived,
        totalFeesChargeDerived: saving.accountBalanceDerived - values.amount,
        totalPenaltyChargeDerived:
          values.amount + saving.totalWithdrawalsDerived,
        clientId: saving.clientId,
        statusEnum: saving.statusEnum,
        currencyCode: saving.currencyCode,
      },
      transaction: {
        amount: values.amount,
        transactionTypeEnum: "PAY CHARGE",
        transactionDate: values.transactionDate,
        isReversed: false,
        officeId: id,
        runningBalanceDerived: saving.accountBalanceDerived - values.amount,
        chargeId,
        chargeFeeInterval: charge.charge.feeInterval,
      },
    };

    payCharge(
      { id: savingId, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: "Charge successfully paid",
          });
          setIsModalOpen(false);
          form.resetFields();
        },
        onError(error) {
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
      name={"Pay Charge"}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="amount"
        label="Amount"
        rules={[
          { required: true },
          {
            validator: (_, value) => {
              if (
                amountOutstandingDerived !== null &&
                value > amountOutstandingDerived
              ) {
                return Promise.reject(
                  `The maximum amount to be paid is ${formatNumber(
                    amountOutstandingDerived,
                    2
                  )}`
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          min={0} // Ensure the value cannot be negative
          precision={2} // Ensure the value has 2 decimal places
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="transactionDate"
        label="Payment Date"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Payment Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
