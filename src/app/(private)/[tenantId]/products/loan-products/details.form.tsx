"use client";
import { useCreate, useGet, usePatch } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";
import { AutoSavedFormData, Fund, SubmitType } from "@/types";
import toast from "@/utils/toast";
import { Checkbox, Form, Input, Select } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
const { TextArea } = Input;

export default function DetailsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: any;
  setFormValues: any;
  submitType: SubmitType;
  id?: number;
}) {
  const { tenantId } = useParams();
  const { current, setCurrent, formValues, setFormValues, submitType, id } =
    props;

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

  const {
    status: fundsStatus,
    data: funds,
    error: fundsError,
  } = useGet<Fund[]>(`${tenantId}/funds`, [`${tenantId}/funds`]);

  let fundOptions: any = [];

  if (fundsStatus === "success") {
    fundOptions = funds.map((fund: Fund) => {
      return { value: fund.id, label: fund.name };
    });
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={"detailsForm"}
      onFinish={onFinish}
      className="grid grid-cols-4 gap-2 text-left"
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
        className="col-span-2"
        name="fundId"
        label={
          <Tooltip_
            title={`Loan Products may be assigned to a fund set up by your financial institution. If available
              , the fund field can be used for tracking and reporting on groups of loans`}
            inputLabel="Fund"
          />
        }
      >
        <Select allowClear options={fundOptions} className="text-left" />
      </Form.Item>

      <Form.Item
        name="inCustomerLoanCounter"
        className="col-span-2 flex items-center"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox>
          Include in Customer Loan Counter{" "}
          <Tooltip_
            title={`A borrower loan counter(cycle) is used for tracking how many times the client has taken this
              particular loan product.`}
          />
        </Checkbox>
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
