"use client";
import { useCreate } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Checkbox, DatePicker, Form, Input, InputNumber } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { SubmitType } from "@/types";
import { useParams } from "next/navigation";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertFundMapping } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertFundMapping(values, {
        onSuccess: () => {
          setSubmitLoader(false);
          //setOpen(false);
          toast.success(`${PAGE_TITLE} ${submitTypeMessage} successfully.`, {
            theme: "colored",
          });
          form.resetFields();
        },
        onError(error, variables, context) {
          toast.error(error.message, {
            theme: "colored",
          });

          setSubmitLoader(false);
        },
      });
    } else {
      // updateSchedule(
      //   { id, ...values },
      //   {
      //     onSuccess: () => {
      //       setSubmitLoader(false);
      //       setOpen(false);
      //       toast({
      //         title: "Success",
      //         description: `${PAGE_TITLE} ${submitTypeMessage} successfully`,
      //         variant: "success",
      //       });
      //     },
      //     onError(error, variables, context) {
      //       toast({
      //         title: "Error",
      //         description: error.message,
      //         variant: "destructive",
      //       });
      //       setSubmitLoader(false);
      //     },
      //   }
      // );
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-6 gap-2"
    >
      <Form.Item
        className="col-span-3"
        name="loanStatusId"
        label="Loan Status"
        rules={[{ required: true, message: "Loan Status is required!" }]}
      >
        <Input />
      </Form.Item>
      <div className="col-span-3"></div>
      <Form.Item
        className="col-span-3"
        name="product"
        label="Product"
        rules={[{ required: true, message: "Product is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="officeId"
        label="Office"
        rules={[{ required: true, message: "Office is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="dateType"
        label="Date Type"
        rules={[{ required: true, message: "Date Type is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="fromDate"
        label="From Date"
        rules={[{ required: true, message: "From Date is required!" }]}
      >
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="toDate"
        label="To Date"
        rules={[{ required: true, message: "To Date is required!" }]}
      >
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item className="col-span-6" name="comments" label={" "}>
        <Checkbox>Loan Outstanding Percentage</Checkbox>
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="comparisonCondition"
        label="Comparison Condition"
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="minimumValue"
        label="Minimum Value"
      >
        <InputNumber className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="maximumValue"
        label="Maximum Value"
      >
        <InputNumber className="w-full" />
      </Form.Item>

      <Form.Item className="col-span-6" name="comments" label={" "}>
        <Checkbox>Loan Outstanding Amount</Checkbox>
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="comparisonCondition"
        label="Comparison Condition"
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="minimumValue"
        label="Minimum Value"
      >
        <InputNumber className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="maximumValue"
        label="Maximum Value"
      >
        <InputNumber className="w-full" />
      </Form.Item>

      <div className="col-span-6">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
