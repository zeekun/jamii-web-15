"use client";
import { useGet } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";
import { SavingsProduct, SubmitType, TaxGroup } from "@/types";
import { filterOption } from "@/utils/strings";

import { Checkbox, Form, InputNumber, Select } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<SavingsProduct>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<any>>>;
  submitType?: SubmitType;
}) {
  const { tenantId } = useParams();
  const {
    current,
    submitType = "create",
    setCurrent,
    formValues,
    setFormValues,
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const [showTaxGroupOptions, setShowTaxGroupOptions] = useState(false);

  const termsObj = {
    minDepositTerm: formValues.depositProductTermAndPreClosure?.minDepositTerm,
    maxDepositTerm: formValues.depositProductTermAndPreClosure?.maxDepositTerm,
    inMultiplesOfDepositTerm:
      formValues.depositProductTermAndPreClosure?.inMultiplesOfDepositTerm,
    minDepositTermTypeEnum:
      formValues.depositProductTermAndPreClosure?.minDepositTermTypeEnum,
    maxDepositTermTypeEnum:
      formValues.depositProductTermAndPreClosure?.maxDepositTermTypeEnum,
    inMultiplesOfDepositTermTypeEnum:
      formValues.depositProductTermAndPreClosure
        ?.inMultiplesOfDepositTermTypeEnum,
    preClosurePenalApplicable:
      formValues.depositProductTermAndPreClosure?.preClosurePenalApplicable,
    preClosurePenalInterest:
      formValues.depositProductTermAndPreClosure?.preClosurePenalInterest,
    preClosurePenalInterestOnEnum:
      formValues.depositProductTermAndPreClosure?.preClosurePenalInterestOnEnum,
  };

  useEffect(() => {
    form.setFieldsValue({
      ...formValues,
      ...termsObj,
    });

    if (formValues.depositProductTermAndPreClosure?.withHoldTax) {
      setShowTaxGroupOptions(true);
    }
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: taxGroupsStatus,
    data: taxGroups,
    error: taxGroupsError,
  } = useGet<TaxGroup[]>(`${tenantId}/tax-groups`, [`${tenantId}/tax-groups`]);

  let taxGroupsOptions: any = [];

  if (taxGroupsStatus === "success") {
    taxGroupsOptions = taxGroups.map((taxGroup: TaxGroup) => {
      return { value: taxGroup.id, label: taxGroup.name };
    });
  }

  useEffect(() => {
    if (submitType === "update") {
      if (formValues.withHoldTax) {
        setShowTaxGroupOptions(true);
      }
    }
  }, [submitType, formValues.withHoldTax]);

  const onFinish = (values: any) => {
    setFormValues({
      ...formValues,
      lockInPeriodFrequency: values.lockInPeriodFrequency,
      lockInPeriodFrequencyTypeEnum: values.lockInPeriodFrequencyTypeEnum,
      withHoldTax: values.withHoldTax,
      taxGroupId: values.taxGroupId,
      depositProductTermAndPreClosure: {
        ...formValues.depositProductTermAndPreClosure,
        ...values,
      },
    });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const onChangeWithHold = (e: CheckboxChangeEvent) => {
    setShowTaxGroupOptions(e.target.checked);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={"settingsForm"}
      onFinish={onFinish}
      className="text-left grid grid-cols-6 gap-2"
    >
      <Form.Item
        name="lockInPeriodFrequency"
        className="col-span-3"
        label={
          <Tooltip_
            title={`Used to indicate the length of time that a savings account of this saving product type is locked-in and withdrawals are not allowed.`}
            inputLabel="Lock-in Period"
          />
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
        name="lockInPeriodFrequencyTypeEnum"
        className="col-span-3"
        label="Lock-In Period Frequency"
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      <Form.Item
        name="minDepositTerm"
        className="col-span-3"
        label={
          <Tooltip_
            title={`Used to indicate the length of time that a savings account of this saving product type is locked-in and withdrawals are not allowed.`}
            inputLabel="Minimum Deposit Term"
          />
        }
        rules={[
          { required: true, message: "Minimum Deposit Term is required!" },
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
        name="minDepositTermTypeEnum"
        className="col-span-3"
        label="Minimum Deposit Frequency"
        rules={[
          { required: true, message: "Minimum Deposit Frequency is required!" },
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
        name="inMultiplesOfDepositTerm"
        className="col-span-3"
        label={
          <Tooltip_
            title={`Used to indicate the length of time that a savings account of this saving product type is locked-in and withdrawals are not allowed.`}
            inputLabel="And thereafter, In Multiples Of"
          />
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
        name="inMultiplesOfDepositTermTypeEnum"
        className="col-span-3"
        label="And thereafter, In Multiples Of Frequency"
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      <Form.Item
        name="maxDepositTerm"
        className="col-span-3"
        label={
          <Tooltip_
            title={`Used to indicate the length of time that a savings account of this saving product type is locked-in and withdrawals are not allowed.`}
            inputLabel="Maximum Deposit Term"
          />
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
        name="maxDepositTermTypeEnum"
        className="col-span-3"
        label="Maximum Deposit Term Frequency"
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      <Form.Item
        name="preClosurePenalApplicable"
        className="col-span-6 flex justify-start items-baseline"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox>
          Apply Penal Interest (less)
          <Tooltip_ title="Indicates whether the withdrawal fee should be applied when funds are transferred between accounts" />
        </Checkbox>
      </Form.Item>

      <Form.Item
        name="preClosurePenalInterest"
        className="col-span-3"
        label={
          <Tooltip_
            title={`Penal Interest (%).`}
            inputLabel="Balance Required For Interest Calculation"
          />
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
        name="preClosurePenalInterestOnEnum"
        className="col-span-3"
        label="Period"
      >
        <Select>
          <option value={"WHOLE TERM"}>Whole Term</option>
          <option value={"TILL PREMATURE WITHDRAWAL"}>
            Till Premature Withdrawal
          </option>
        </Select>
      </Form.Item>

      <Form.Item
        name="withHoldTax"
        className="col-span-3 flex justify-start items-center"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox onChange={onChangeWithHold}>
          Is Withhold Tax Applicable
          <Tooltip_
            title={`Enables definition and tracking inactive Savings Accounts.`}
          />
        </Checkbox>
      </Form.Item>

      {showTaxGroupOptions && (
        <Form.Item
          name="taxGroupId"
          className="col-span-3"
          label="Tax Group"
          rules={[
            {
              required: showTaxGroupOptions,
              message: "Withhold Tax Group is required!",
            },
          ]}
        >
          <Select
            style={{ width: "100%" }}
            showSearch
            options={taxGroupsOptions}
            filterOption={filterOption}
            allowClear
          />
        </Form.Item>
      )}

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
