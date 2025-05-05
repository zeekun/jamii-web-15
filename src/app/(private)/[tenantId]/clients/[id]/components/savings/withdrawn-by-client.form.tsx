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

export default function WithdrawnByClientForm(props: {
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
        statusEnum: "WITHDRAWN BY CLIENT",
        withdrawnOnDate: values.withdrawnOnDate,
      },
    };

    reject(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: "Saving Account successfully withdrawn by client",
          });
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
      name={`withdrawnByClientForm`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="withdrawnOnDate"
        label="Withdrawn On"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Withdrawn On Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
