"use client";
import { usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "../constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { Client } from "@/types";
import { useParams } from "next/navigation";

export default function ActivateForm(props: { client: Client | undefined }) {
  const { client } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const { tenantId } = useParams();

  const id = client?.id;

  let qk = [`${tenantId}/clients/${id}`];

  const { mutate: activateClient } = usePatch(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/clients`,
    `${id}`,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      client: {
        ...values,
        legalFormEnum: client?.legalFormEnum,
        officeId: client?.officeId,
        isActive: true,
        statusEnum: "ACTIVE",
      },
    };

    activateClient(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: "Client successfully activated",
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
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="activationDate"
        label="Activation Date"
        initialValue={dayjs()}
        rules={[{ required: true }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
