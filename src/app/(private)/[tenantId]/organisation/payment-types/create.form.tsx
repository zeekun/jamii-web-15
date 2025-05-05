"use client";
import { useCreate, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { PaymentType, SubmitType } from "@/types";
import { Checkbox, Form, Input, InputNumber } from "antd";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertPaymentType } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updatePaymentType } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    id,
    [`${tenantId}/${QUERY_KEY}`]
  );

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: paymentTypeStatus,
    data: paymentType,
    error: paymentTypeError,
  } = useGetById<PaymentType>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (
      submitType === "update" &&
      paymentTypeStatus === "success" &&
      paymentType
    ) {
      form.setFieldsValue({
        name: paymentType.name,
        description: paymentType.description ? paymentType.description : "",
        isCashPayment: paymentType.isCashPayment,
        position: paymentType.position,
      });
    }
  }, [submitType, paymentTypeStatus, paymentType, form]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertPaymentType(values, {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `Payment Type ${submitTypeMessage} successfully.`,
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
      updatePaymentType(
        { id, ...values },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            toast({
              type: "success",
              response: `Payment Type ${submitTypeMessage} successfully.`,
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
        label="Payment Type"
        rules={[{ required: true, message: "Payment Type is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item className="col-span-2" name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item
        className="col-span-2 flex justify-start items-baseline"
        label={" "}
        name="isCashPayment"
        valuePropName="checked"
      >
        <Checkbox>Is Cash Payment</Checkbox>
      </Form.Item>

      <Form.Item className="col-span-2" name="position" label="Position">
        <InputNumber className="w-full" />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
