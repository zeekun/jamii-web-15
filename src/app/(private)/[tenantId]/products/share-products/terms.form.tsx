"use client";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";
import { Form, InputNumber } from "antd";
import { useEffect, useState } from "react";

export default function TermsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: any;
  setFormValues: any;
}) {
  const { current, setCurrent, formValues, setFormValues } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (values: any) => {
    setFormValues({ ...formValues, ...values });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const onValuesChange = (changedValues: any) => {
    const { issuedShares, unitPrice } = form.getFieldsValue();
    const capitalAmount = (issuedShares || 0) * (unitPrice || 0);
    form.setFieldsValue({ capitalAmount });
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={"termsForm"}
      onFinish={onFinish}
      onValuesChange={onValuesChange} // Add this line
      className="text-left grid grid-cols-6 gap-2"
    >
      <Form.Item
        className="col-span-3"
        name="totalShares"
        label={
          <Tooltip_
            inputLabel="Total Number of Shares"
            title="Total number of shares that a product is offering."
          />
        }
        rules={[{ required: true, message: "Total Number of Shares!" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="issuedShares"
        label={
          <Tooltip_
            inputLabel="Shares to be issued"
            title="Total number of shares that an organization wants to issue to its clients."
          />
        }
        rules={[
          {
            required: true,
            message: "Shares to be issued is required!",
          },
        ]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="unitPrice"
        label={
          <Tooltip_
            inputLabel="Nominal/Unit Price"
            title="Unit/Nominal Price of each share."
          />
        }
        rules={[
          {
            required: true,
            message: "Nominal Price is required!",
          },
        ]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="capitalAmount"
        help="Shares to be Issued * Nominal Price (Auto calculated)"
        label={
          <Tooltip_ inputLabel="Capital Value" title="Total Capital Value" />
        }
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          disabled
        />
      </Form.Item>

      <div className="col-span-6 ">
        <FormSubmitButtonsStep
          submitText="Next"
          cancelText="Previous"
          submitLoader={submitLoader}
          onReset={onReset}
          handleCancel={() => {
            setCurrent(current - 1);
          }}
        />
      </div>
    </Form>
  );
}
