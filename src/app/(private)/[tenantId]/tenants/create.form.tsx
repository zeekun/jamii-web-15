"use client";
import { useCreate, useGetById, usePatch, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { SubmitType, Tenant } from "@/types";
import { Form, Input } from "antd";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useParams, useRouter } from "next/navigation";
import toast from "@/utils/toast";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertUser } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
    `${tenantId}/tenants/count`,
  ]);
  const { mutate: updateUser } = usePatchV2(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/${QUERY_KEY}`,
    `${tenantId}/tenants/count`,
  ]);

  const {
    status: tenantStatus,
    data: tenant,
    error: userError,
  } = useGetById<Tenant>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (submitType === "update" && tenantStatus === "success" && tenant) {
      form.setFieldsValue(tenant);
    }
  }, [submitType, tenantStatus, tenant, form]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertUser(values, {
        onSuccess: (response: any) => {
          setSubmitLoader(false);
          setIsModalOpen(false);
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
          router.push(`/${response.id}`);
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateUser(
        { id, ...tenant },
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
      name={submitType === "create" ? submitType : `${submitType}${id}`}
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

      <div className="col-span-2 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
