"use client";
import { usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";
import { ShareAccount } from "@/types";

export default function CloseForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  share: ShareAccount;
}) {
  const { tenantId, shareId, id } = useParams();
  const { setIsModalOpen, share } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  console.log("share", share);

  const { mutate: close } = usePatchV2(
    `${tenantId}/${ENDPOINT}`,
    `${shareId}`,
    [
      `${tenantId}/share-accounts`,
      `${shareId}`,
      `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${shareId},"isReversed":false},"order":["id DESC"]}`,
    ]
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      shareAccount: {
        closedDate: values.closedDate,
        statusEnum: "CLOSED",
        clientId: Number(id),
      },
      charges: share.shareAccountCharges,
      transaction: {
        totalPendingShares: share.totalApprovedShares,
        unitPrice: share.shareProduct.unitPrice,
        typeEnum: "REDEEM",
        statusEnum: "ACTIVE",
        officeId: share.client.officeId,
      },
    };

    close(
      { id: shareId, ...updatedValues },
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
        name="closedDate"
        label="Closed On"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Closed On Date is required!" }]}
      >
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
