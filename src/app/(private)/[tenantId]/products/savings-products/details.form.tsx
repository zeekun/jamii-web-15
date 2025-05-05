"use client";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";
import { Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
const { TextArea } = Input;

export default function DetailsForm(props: {
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

  return (
    <Form
      layout="vertical"
      form={form}
      name={"detailsForm"}
      onFinish={onFinish}
      className="text-left grid grid-cols-4 gap-2"
    >
      <Form.Item
        className="col-span-3"
        name="name"
        label={
          <Tooltip_
            title="The Product Name is the unique identifier for the lending product"
            inputLabel="Product Name"
          />
        }
        rules={[{ required: true, message: "Product Name is required!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        className="col-span-1"
        name="shortName"
        label={
          <Tooltip_
            title="The Short Name is the unique identifier for the lending product"
            inputLabel="Short Name"
          />
        }
        rules={[{ required: true, message: "Short Name is required!" }]}
      >
        <Input maxLength={4} />
      </Form.Item>

      <Form.Item
        name="description"
        label={
          <Tooltip_
            title={`The description is used to provide additional information regarding the purpose and characteristics of the
              loan product.`}
            inputLabel="Description"
          />
        }
        className="col-span-4"
      >
        <TextArea rows={4} />
      </Form.Item>

      <div className="col-span-4 ">
        <FormSubmitButtonsStep
          submitText="Next"
          submitLoader={submitLoader}
          onReset={onReset}
        />
      </div>
    </Form>
  );
}
