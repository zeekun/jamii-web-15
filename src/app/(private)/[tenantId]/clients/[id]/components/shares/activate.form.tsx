"use client";
import { usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { ShareAccount, ShareAccountCharge } from "@/types";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

export default function ActivateForm(props: { share: ShareAccount }) {
  const { tenantId, id, shareId } = useParams();
  const { share } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: activateLoan } = usePatchV2(
    `${tenantId}/${ENDPOINT}`,
    `${shareId}`,
    [
      `${tenantId}/${ENDPOINT}`,
      `${shareId}`,
      `${tenantId}/clients/${id}/share-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    ]
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);
    let updatedValues: { shareAccount: {}; charges?: ShareAccountCharge[] } = {
      shareAccount: {
        activatedDate: values.activatedDate,
        statusEnum: "ACTIVE",
        ...(share?.group
          ? { groupId: share.groupId }
          : { clientId: share.clientId }),
        officeId:
          share?.client?.officeId ?? share?.group?.officeId ?? undefined,
        currencyCode: share.currencyCode,
      },
    };

    if (share.shareAccountCharges) {
      updatedValues.charges = share.shareAccountCharges;
    }

    activateLoan(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          toast({
            type: "success",
            response: `Share successfully activated`,
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
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      {" "}
      <Form.Item
        className="col-span-2"
        name="activatedDate"
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
