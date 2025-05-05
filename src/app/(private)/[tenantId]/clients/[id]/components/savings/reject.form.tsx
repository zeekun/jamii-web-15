"use client";
import { usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { useParams } from "next/navigation";
import { ENDPOINT } from "./constants";

export default function RejectForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  savingId: string;
}) {
  const { tenantId, id } = useParams();
  const { savingId, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: reject } = usePatchV2(`${tenantId}/${ENDPOINT}`, savingId);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      savingsAccount: {
        statusEnum: "REJECTED",
        rejectedOnDate: values.rejectedOnDate,
      },
    };

    reject(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: "Saving Account successfully rejected",
          });
          setIsModalOpen(false);
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
          toast({
            type: "error",
            response: error,
          });
        },
      }
    );
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={`rejectForm`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="rejectedOnDate"
        label="Rejection Date"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Rejection Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
