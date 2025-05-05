"use client";
import { usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";
import { ShareAccountTransaction } from "@/types";

export default function ApproveAdditionalShareTransactionForm(props: {
  transaction: ShareAccountTransaction;
  undoApproval?: boolean;
}) {
  const { tenantId, shareId } = useParams();
  const {
    transaction,

    undoApproval = false,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: approveAdditionalShare } = usePatch(
    `${tenantId}/share-account-transactions`,
    transaction.id,
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

    const transactionId = transaction.id;
    approveAdditionalShare(
      { transactionId, statusEnum: "ACTIVE", typeEnum: transaction.typeEnum },
      {
        onSuccess: () => {
          toast({
            type: "success",
            response: `Additional Shares successfully approved`,
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
      name={`approveTransaction`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      {!undoApproval && (
        <>
          <Form.Item
            className="col-span-2"
            name="approvedOnDate"
            label="Approved On Date"
            initialValue={dayjs()}
            rules={[
              { required: true, message: "Approved On Date is required!" },
            ]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>
          <Form.Item className="col-span-2" name="note" label="Note">
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      )}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
