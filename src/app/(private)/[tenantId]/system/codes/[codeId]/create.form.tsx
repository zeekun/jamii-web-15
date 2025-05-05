"use client";
import { useCreate, useGetById, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { CodeValue, SubmitType } from "@/types";
import { Checkbox, Form, Input, InputNumber } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PAGE_TITLE } from "./constants";
import toast from "@/utils/toast";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const { tenantId, codeId } = useParams();

  const [isActiveChecked, setIsActiveChecked] = useState(true);

  const { mutate: insertCodeValue } = useCreate(
    `${tenantId}/codes/${codeId}/code-values`,
    [`${tenantId}/codes/${codeId}/code-values`]
  );

  const { mutate: updateCodeValue } = usePatchV2(
    `${tenantId}/code-values`,
    id,
    [
      `${tenantId}/codes/${codeId}/code-values`,
      `${tenantId}/code-values`,
      `${tenantId}`,
    ]
  );

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: codeValueStatus,
    data: codeValue,
    error: codeValueError,
  } = useGetById<CodeValue>(`${tenantId}/code-values`, id);

  useEffect(() => {
    if (submitType === "update" && codeValueStatus === "success" && codeValue) {
      form.setFieldsValue({
        ...codeValue,
        codeDescription: codeValue.codeDescription
          ? codeValue.codeDescription
          : "",
      });
    }
  }, [submitType, codeValueStatus, codeValue, form]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertCodeValue(values, {
        onSuccess: () => {
          setSubmitLoader(false);

          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
          setIsModalOpen(false);
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateCodeValue(
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
      name={`${PAGE_TITLE}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-4 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="codeValue"
        label="Name"
        rules={[{ required: true, message: "Name is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="orderPosition"
        label="Position"
        rules={[{ required: true, message: "Position is required!" }]}
      >
        <InputNumber className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-2 flex justify-start items-baseline"
        name="isActive"
        label={" "}
        valuePropName="checked"
      >
        <Checkbox defaultChecked={isActiveChecked}>Is Active</Checkbox>
      </Form.Item>

      <Form.Item
        className="col-span-4"
        name="codeDescription"
        label="Description"
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <div className="col-span-4">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
