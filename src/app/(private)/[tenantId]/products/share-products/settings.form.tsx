"use client";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";
import { Checkbox, Divider, Form, InputNumber, Select } from "antd";
import { useEffect, useState } from "react";

export default function SettingsForm(props: {
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
      name={"settingsForm"}
      onFinish={onFinish}
      className="text-left grid grid-cols-6 gap-2"
    >
      <Divider plain className="col-span-6" style={{ border: "#ccc" }}>
        Shares per Client{" "}
        <Tooltip_ title="These fields are used to define the minimum, default, maximum shares per customer" />
      </Divider>
      <Form.Item
        className="col-span-2"
        name="minimumClientShares"
        label="Minimum"
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="nominalClientShares"
        label="default"
        rules={[{ required: true, message: "Default is required!" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="maximumClientShares"
        label="Maximum"
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Divider plain className="col-span-6" style={{ border: "#ccc" }}>
        Minimum Active Period{" "}
        <Tooltip_ title="Minimum active period to consider for dividend calculations." />
      </Divider>

      <Form.Item
        name="minimumActivePeriodFrequency"
        className="col-span-3"
        label="Frequency"
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="minimumActivePeriodFrequencyEnum"
        className="col-span-3"
        label="Type"
      >
        <Select>
          <option value={"DAYS"}>Days</option>
        </Select>
      </Form.Item>

      <Divider plain className="col-span-6" style={{ border: "#ccc" }}>
        Lock-in Period{" "}
        <Tooltip_ title="Used to indicate the length of time that a share account of this share product type is locked-in and redeems are not allowed." />
      </Divider>

      <Form.Item
        name="lockInPeriodFrequency"
        className="col-span-3"
        label="Frequency"
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="lockInPeriodFrequencyEnum"
        className="col-span-3"
        label="Type"
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      <Form.Item
        name="allowDividendsInactiveClients"
        className="col-span-6 flex justify-start items-baseline"
        valuePropName="checked"
      >
        <Checkbox>Allow dividends for inactive clients</Checkbox>
      </Form.Item>

      <div className="col-span-6">
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
