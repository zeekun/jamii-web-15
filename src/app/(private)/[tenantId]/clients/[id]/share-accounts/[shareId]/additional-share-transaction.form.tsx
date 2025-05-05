"use client";
import { usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "../../components/shares/constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { ShareAccount } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

export default function ShareTransactionForm(props: {
  share: ShareAccount;
  transactionType: "PURCHASE" | "REDEEM";
  page?: "CLIENT" | "SHARE ACCOUNT";
}) {
  const { tenantId, id, shareId } = useParams();
  const { share, page, transactionType } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: updateShareAccount } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    Number(shareId),
    [
      `${tenantId}/share-accounts`,
      `${shareId}`,
      `${tenantId}/share-account-transactions?filter={"where":{"shareAccountId":${shareId}}}`,
    ]
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues;

    if (transactionType === "PURCHASE") {
      const totalPendingShares =
        values.totalPendingShares + share.totalPendingShares;

      updatedValues = {
        shareAccount: {
          totalPendingShares,
        },
        transaction: {
          totalPendingShares: values.totalPendingShares,
          unitPrice: values.unitPrice,
          typeEnum: "PURCHASE",
          statusEnum: "SUBMITTED AND AWAITING APPROVAL",
        },
      };
    } else {
      const totalApprovedShares =
        share.totalApprovedShares - values.totalPendingShares;

      updatedValues = {
        shareAccount: {
          totalApprovedShares,
          statusEnum: "ACTIVE",
          clientId: Number(id),
        },
        charges: share.shareAccountCharges,
        transaction: {
          totalPendingShares: values.totalPendingShares,
          unitPrice: values.unitPrice,
          typeEnum: "REDEEM",
          officeId: share.client.officeId,
        },
      };
    }

    const response =
      transactionType === "PURCHASE"
        ? `Additional Shares successfully applied for!`
        : `Shares successfully redeemed!`;

    updateShareAccount(
      { id: shareId, ...updatedValues },
      {
        onSuccess: () => {
          toast({
            type: "success",
            response,
          });
          setSubmitLoader(false);
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

  return (
    <Form
      layout="vertical"
      form={form}
      name={"share transaction"}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="submittedDate"
        label="Request Date"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Request Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="totalPendingShares"
        label="Total Number of Share"
        rules={[
          {
            required: true,
            message: "Total Number of Shares is required!",
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
        name="unitPrice"
        label={`Today's Price (${share.currencyCode})`}
        rules={[
          {
            required: true,
            message: "Today's Price is required!",
          },
        ]}
        initialValue={share.shareProduct.unitPrice}
      >
        <InputNumber
          disabled
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
