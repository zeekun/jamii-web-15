"use client";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";
import { Form, InputNumber, Select } from "antd";
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

  return (
    <Form
      layout="vertical"
      form={form}
      name={"termsForm"}
      onFinish={onFinish}
      className="text-left grid grid-cols-6 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="nominalAnnualInterestRate"
        label={
          <Tooltip_
            inputLabel="Nominal Annual Interest"
            title="The default interest rate set when creating savings accounts."
          />
        }
        rules={[
          { required: true, message: "Nominal Annual Interest is required!" },
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
        className="col-span-2"
        name="interestCompoundingPeriodTypeEnum"
        label={
          <Tooltip_
            inputLabel="Interest Compounding Period"
            title="The period at which interest rate is compounded."
          />
        }
        rules={[
          {
            required: true,
            message: "Interest Compounding Period is required!",
          },
        ]}
      >
        <Select>
          <option value={"DAILY"}>Daily</option>
          <option value={"QUARTERLY"}>Quarterly</option>
          <option value={"SEMI-ANNUAL"}>Semi-Annual</option>
          <option value={"MONTHLY"}>Monthly</option>
          <option value={"ANNUALLY"}>Annually</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="interestPostingPeriodTypeEnum"
        label={
          <Tooltip_
            inputLabel="Interest Posting Period"
            title="The period at which interest rate is posted or credited to a saving account."
          />
        }
        rules={[
          {
            required: true,
            message: "Interest Posting Period is required!",
          },
        ]}
      >
        <Select>
          <option value={"MONTHLY"}>Monthly</option>
          <option value={"QUARTERLY"}>Quarterly</option>
          <option value={"BIANNUAL"}>BiAnnual</option>
          <option value={"ANNUALLY"}>Annually</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="interestCalculationTypeEnum"
        label={
          <Tooltip_
            inputLabel="Interest Calculated Using"
            title="The method used to calculate interest"
          />
        }
        rules={[
          {
            required: true,
            message: "Interest Calculated Using is required!",
          },
        ]}
      >
        <Select>
          <option value={"DAILY BALANCE"}>Daily Balance</option>
          <option value={"AVERAGE DAILY BALANCE"}>Average Daily Balance</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="interestCalculationDaysInYearTypeEnum"
        label={
          <Tooltip_
            inputLabel="Days in year"
            title="The setting for number of days in year to use to calculate interest"
          />
        }
        rules={[
          {
            required: true,
            message: "Days In year is required!",
          },
        ]}
      >
        <Select>
          <option value={"360"}>360</option>
          <option value={"365"}>365</option>
        </Select>
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
