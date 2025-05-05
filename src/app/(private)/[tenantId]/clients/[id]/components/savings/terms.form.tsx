"use client";
import { Checkbox, Form, Input, InputNumber, Select } from "antd";
import { SetStateAction, useEffect, useState } from "react";
import { SavingsAccount, SavingsProduct, SubmitType } from "@/types";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";

export default function TermsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<SavingsAccount>;
  setFormValues: React.Dispatch<SetStateAction<Partial<SavingsAccount>>>;
  submitType: SubmitType;
  id?: number;
  selectedSavingsProduct: Partial<SavingsProduct>;
}) {
  const {
    current,
    setCurrent,
    formValues,
    setFormValues,
    selectedSavingsProduct,
    submitType,
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showAllowOverdraftInputs, setShowAllowOverdraftInputs] =
    useState(false);
  const [minRequiredBalanceInput, setMinRequiredBalanceInput] = useState(null);
  const [enforceMinRequiredBalanceCheck, setEnforceMinRequiredBalanceCheck] =
    useState(false);

  useEffect(() => {
    console.log("terms", formValues);

    if (formValues.allowOverdraft === true) {
      setShowAllowOverdraftInputs(true);
    }
    form.setFieldsValue({
      ...formValues,
      overdraftLimit:
        formValues.overdraftLimit ?? formValues.savingsProduct?.overdraftLimit,
      minOverdraftForInterestCalculation:
        formValues.minOverdraftForInterestCalculation ??
        formValues.savingsProduct?.minOverdraftForInterestCalculation,
      nominalAnnualInterestRateOverdraft:
        formValues.nominalAnnualInterestRateOverdraft ??
        formValues.savingsProduct?.nominalAnnualInterestRateOverdraft,
    });
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (values: any) => {
    const allowOverdraftValue = form.getFieldValue("allowOverdraft");

    if (allowOverdraftValue === true) {
      setMinRequiredBalanceInput(null);
    }

    setFormValues({
      ...formValues,
      ...values,
      savingsProduct: formValues.savingsProduct,
    });

    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const onChangeAllowOverdraft = (e: CheckboxChangeEvent) => {
    setShowAllowOverdraftInputs(e.target.checked);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={"termsForm"}
      onFinish={onFinish}
      className="grid grid-cols-6 gap-2 text-left"
    >
      <Form.Item
        className="col-span-6"
        name="currencyCode"
        label="Currency"
        initialValue={selectedSavingsProduct.currencyCode}
      >
        <Input disabled />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="nominalAnnualInterestRate"
        label="Nominal Annual Interest"
        rules={[
          { required: true, message: "Nominal Annual Interest is required!" },
        ]}
        initialValue={selectedSavingsProduct.nominalAnnualInterestRate}
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
        name="interestCompoundingPeriodEnum"
        label="Interest Compounding Period"
        rules={[
          {
            required: true,
            message: "Interest Compounding Period is required!",
          },
        ]}
        initialValue={selectedSavingsProduct.interestCompoundingPeriodTypeEnum}
      >
        <Select>
          <option value={"DAILY"}>Daily</option>
          <option value={"MONTHLY"}>Monthly</option>
          <option value={"QUARTERLY"}>Quarterly</option>
          <option value={"SEMI-ANNUAL"}>Semi-Annual</option>
          <option value={"ANNUALLY"}>Annually</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="interestPostingPeriodEnum"
        label="Interest Posting Period"
        rules={[
          {
            required: true,
            message: "Interest Posting Period is required!",
          },
        ]}
        initialValue={selectedSavingsProduct.interestPostingPeriodTypeEnum}
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
        label="Interest Calculated Using"
        rules={[
          {
            required: true,
            message: "Interest Calculated Using is required!",
          },
        ]}
        initialValue={selectedSavingsProduct.interestCalculationTypeEnum}
      >
        <Select>
          <option value={"DAILY BALANCE"}>Daily Balance</option>
          <option value={"AVERAGE DAILY BALANCE"}>Average Daily Balance</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="interestCalculationDaysInYearTypeEnum"
        label="Days In Year"
        rules={[
          {
            required: true,
            message: "Days In Year is required!",
          },
        ]}
        initialValue={
          selectedSavingsProduct.interestCalculationDaysInYearTypeEnum
        }
      >
        <Select>
          <option value={"360"}>360 Days</option>
          <option value={"365"}>365 Days</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="minRequiredOpeningBalance"
        label="Minimum Opening Balance"
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
        name="lockInPeriodFrequency"
        label="Lock-In Period"
        dependencies={["lockInPeriodFrequencyEnum"]}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (value && getFieldValue("lockInPeriodFrequencyEnum")) {
                return Promise.resolve();
              }
              if (!value && getFieldValue("lockInPeriodFrequencyEnum")) {
                return Promise.reject(
                  new Error("Please input the lock-in period!")
                );
              }
              return Promise.resolve();
            },
          }),
        ]}
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
        name="lockInPeriodFrequencyEnum"
        label="Lock-In Period Frequency"
        dependencies={["lockInPeriodFrequency"]}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (value && getFieldValue("lockInPeriodFrequency")) {
                return Promise.resolve();
              }
              if (!value && getFieldValue("lockInPeriodFrequency")) {
                return Promise.reject(
                  new Error("Please select the lock-in period frequency!")
                );
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Select allowClear>
          <Select.Option value="DAYS">Days</Select.Option>
          <Select.Option value="WEEKS">Weeks</Select.Option>
          <Select.Option value="MONTHS">Months</Select.Option>
          <Select.Option value="YEARS">Years</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-6 flex justify-start items-baseline"
        valuePropName="checked"
        name="withdrawalFeeForTransfer"
      >
        <Checkbox>Apply Withdrawal Fee For Transfers</Checkbox>
      </Form.Item>

      <Form.Item
        className="col-span-6 flex justify-start items-baseline"
        valuePropName="checked"
        name="allowOverdraft"
      >
        <Checkbox onChange={onChangeAllowOverdraft}>
          Is Overdraft Allowed
        </Checkbox>
      </Form.Item>

      {!showAllowOverdraftInputs && (
        <>
          <Form.Item
            className="col-span-3 flex justify-start items-baseline"
            valuePropName="checked"
            name="enforceMinRequiredBalance"
          >
            <Checkbox>Enforce Minimum Balance</Checkbox>
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="minRequiredBalance"
            label="Minimum Balance"
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </>
      )}

      {showAllowOverdraftInputs && (
        <>
          <Form.Item
            className="col-span-3"
            name="overdraftLimit"
            label="Maximum Overdraft Amount Limit"
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
            name="minOverdraftForInterestCalculation"
            label="Min Overdraft Required For Interest Calculation "
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
            name="nominalAnnualInterestRateOverdraft"
            label="Nominal annual interest for overdraft  "
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </>
      )}

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
