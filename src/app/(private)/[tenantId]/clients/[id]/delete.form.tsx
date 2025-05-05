"use client";
import { useDelete } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Form } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "../constants";
import toast from "@/utils/toast";
import { Client } from "@/types";
import { useParams, useRouter } from "next/navigation";

export default function DeleteForm(props: { client: Client | undefined }) {
  const { tenantId } = useParams();
  const { client } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const router = useRouter();

  const id = client?.id;

  let qk = [`clients/${id}`];

  const { mutate: deleteRow } = useDelete(`${tenantId}/${ENDPOINT}`, qk);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    deleteRow(Number(id), {
      onSuccess: () => {
        toast({ type: "success", response: `Client deleted successfully.` });
        setSubmitLoader(false);
        router.push(`/${tenantId}/clients`);
      },
      onError(error, variables, context) {
        setSubmitLoader(false);
        toast({
          type: "error",
          response: error,
        });
      },
    });
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
