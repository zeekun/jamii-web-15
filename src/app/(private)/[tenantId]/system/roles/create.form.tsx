"use client";
import { useCreate, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Form, Input } from "antd";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { Role, SubmitType } from "@/types";
import { useParams, useRouter } from "next/navigation";
import toast from "@/utils/toast";

export default function CreateForm(props: {
  role?: Role;
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const router = useRouter();
  const { submitType = "create", id, setIsModalOpen, role } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertRole } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateRole } = usePatchV2(`${tenantId}/${ENDPOINT}`, id);

  const onReset = () => {
    form.resetFields();
  };

  useEffect(() => {
    form.setFieldsValue(role);
  }, [submitType, role]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertRole(
        { ...values, isDisabled: true },
        {
          onSuccess: (response: any) => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            toast({
              type: "success",
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            });
            form.resetFields();
            router.push(`roles/${response.id}`);
          },
          onError(error) {
            toast({ type: "error", response: error });
            setSubmitLoader(false);
          },
        }
      );
    } else {
      updateRole(
        { id, ...values },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);

            toast({
              type: "success",
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            });
          },
          onError(error, variables, context) {
            toast({ type: "error", response: error });

            setSubmitLoader(false);
          },
        }
      );
    }
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
        name="name"
        label="Name"
        rules={[{ required: true, message: "Name is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="description"
        label="Description"
        rules={[{ required: true, message: "Description is required!" }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <div className="col-span-2 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
