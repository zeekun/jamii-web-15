"use client";
import { Form, Input, InputNumber, Select } from "antd";
import { SetStateAction, useEffect, useState } from "react";
import {
  DepositAccount,
  SubmitType,
  DepositProductTermAndPreClosure,
} from "@/types";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";

export default function TermsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<DepositAccount>;
  setFormValues: React.Dispatch<SetStateAction<Partial<DepositAccount>>>;
  submitType: SubmitType;
  id?: number;
  selectedDepositProduct: Partial<DepositProductTermAndPreClosure>;
}) {
  const {
    current,
    setCurrent,
    formValues,
    setFormValues,

    selectedDepositProduct,
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => {
    console.log(
      "terms",
      formValues.savingsProduct?.interestCompoundingPeriodTypeEnum
    );
    form.setFieldsValue({
      ...formValues,
      ...formValues.savingsProduct,
    });
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (values: any) => {
    setFormValues({
      ...formValues,
      ...values,
      shareProduct: formValues.savingsAccount,
    });
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
      className="grid grid-cols-6 gap-2 text-left"
    >
      <Form.Item className="col-span-6" name="currencyCode" label="Currency">
        <Input disabled />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="interestPostingPeriodTypeEnum"
        label="Interest Posting Period"
        rules={[
          {
            required: true,
            message: "Interest Posting Period is required!",
          },
        ]}
        initialValue={
          selectedDepositProduct.savingsProduct?.interestPostingPeriodTypeEnum
        }
      >
        <Select>
          <option value={"MONTHLY"}>Monthly</option>
          <option value={"QUARTERLY"}>Quarterly</option>
          <option value={"BIANNUAL"}>BiAnnual</option>
          <option value={"ANNUALLY"}>Annually</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="interestCalculationTypeEnum"
        label="Interest  Calculated Using"
        rules={[
          {
            required: true,
            message: "Interest Calculated Using is required!",
          },
        ]}
        initialValue={
          selectedDepositProduct.savingsProduct?.interestCalculationTypeEnum
        }
      >
        <Select>
          <option value={"DAILY BALANCE"}>Daily Balance</option>
          <option value={"AVERAGE DAILY BALANCE"}>Average Daily Balance</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="interestCalculationDaysInYearTypeEnum"
        label="Interest Calculated Using"
        rules={[
          {
            required: true,
            message: "Interest Calculated Using is required!",
          },
        ]}
        initialValue={
          selectedDepositProduct.savingsProduct
            ?.interestCalculationDaysInYearTypeEnum
        }
      >
        <Select>
          <option value={"360"}>360</option>
          <option value={"365"}>365</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="depositAmount"
        label="Deposit Amount"
        rules={[{ required: true, message: "Deposit Amount is required!" }]}
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="depositPeriod"
        label="Deposit Period"
        rules={[{ required: true, message: "Deposit Period is required!" }]}
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="depositPeriodFrequencyEnum"
        className="col-span-3"
        label="Deposit Period Frequency"
        rules={[
          { required: true, message: "Deposit Period Frequency is required!" },
        ]}
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      <Form.Item
        name="lockInPeriodFrequency"
        className="col-span-3"
        label="Lock-in Period"
        initialValue={
          selectedDepositProduct.savingsProduct?.lockInPeriodFrequency
        }
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
        label="Lock-In Period Frequency"
        initialValue={
          selectedDepositProduct.savingsProduct?.lockInPeriodFrequencyTypeEnum
        }
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
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
