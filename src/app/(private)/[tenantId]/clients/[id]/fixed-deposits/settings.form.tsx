"use client";
import { Checkbox, Form, Select } from "antd";
import { SetStateAction, useEffect, useState } from "react";
import {
  SavingsAccount,
  DepositAccount,
  SubmitType,
  DepositProductTermAndPreClosure,
} from "@/types";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { useGet } from "@/api";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";

export default function SettingsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<DepositAccount>;
  setFormValues: React.Dispatch<SetStateAction<Partial<DepositAccount>>>;
  submitType: SubmitType;
  fixedDepositAccountId?: number;
  selectedDepositProduct: Partial<DepositProductTermAndPreClosure>;
}) {
  const { tenantId } = useParams();
  const { current, setCurrent, formValues, setFormValues } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const { id } = useParams();

  const clientId = id;

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: savingsAccountsStatus,
    data: savingsAccounts,
    error: savingsAccountsError,
  } = useGet<SavingsAccount[]>(
    `${tenantId}/savings-accounts`,
    [`${tenantId}/savings-accounts?filter={"where":{"clientId":${clientId}}}`],
    `?filter={"where":{"clientId":${clientId}}}`
  );

  let savingsAccountsOptions: any = [];

  if (savingsAccountsStatus === "success") {
    savingsAccountsOptions = savingsAccounts.map(
      (savingsAccount: SavingsAccount) => {
        return {
          value: savingsAccount.id,
          label: `#${savingsAccount.accountNo} ${savingsAccount.savingsProduct.name}`,
        };
      }
    );
  }

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
      className="grid grid-cols-6 gap-2 text-left mt-5"
    >
      <Form.Item
        className="col-span-3 flex justify-start items-baseline"
        valuePropName="checked"
        name="transferInterestToLinkedAccount"
      >
        <Checkbox>Transfer Interest to Linked Savings Account</Checkbox>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        valuePropName="checked"
        name="savingsAccountId"
        label="Link Savings"
      >
        <Select
          filterOption={filterOption}
          allowClear
          showSearch
          options={savingsAccountsOptions}
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
