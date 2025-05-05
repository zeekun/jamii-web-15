"use client";
import { Checkbox, DatePicker, Form, Input, InputNumber, Select } from "antd";
import { SetStateAction, useEffect, useState } from "react";
import {
  Client,
  Group,
  SavingsAccount,
  ShareAccount,
  ShareProduct,
  SubmitType,
} from "@/types";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { useGet } from "@/api";
import { filterOption } from "@/utils/strings";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { useParams } from "next/navigation";

export default function TermsForm(props: {
  client?: Client | Group;
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<ShareAccount>;
  setFormValues: React.Dispatch<SetStateAction<Partial<ShareAccount>>>;
  submitType: SubmitType;
  id?: number;
  selectedShareProduct: Partial<ShareProduct>;
  setSelectedSavingsAccount: React.Dispatch<SetStateAction<React.ReactNode>>;
}) {
  const { tenantId } = useParams();
  const {
    client,
    current,
    setCurrent,
    formValues,
    setFormValues,
    submitType,
    id,
    selectedShareProduct,
    setSelectedSavingsAccount,
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showAllowOverdraftInputs, setShowAllowOverdraftInputs] =
    useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
    console.log("terms", formValues);
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  // Determine if client is a Group (has legalFormEnum) or Client (doesn't have it)
  const isGroup = client && !("legalFormEnum" in client);

  // Build the API endpoint based on client type
  const savingsAccountsEndpoint = isGroup
    ? `${tenantId}/savings-accounts?filter={"where":{"and":[{"groupId":${client?.id}},{"depositTypeEnum":"SAVING DEPOSIT"},{"statusEnum":"ACTIVE"}]}}`
    : `${tenantId}/savings-accounts?filter={"where":{"and":[{"clientId":${client?.id}},{"depositTypeEnum":"SAVING DEPOSIT"},{"statusEnum":"ACTIVE"}]}}`;
  const {
    status: savingsAccountsStatus,
    data: savingsAccounts,
    error: savingsAccountsError,
  } = useGet<SavingsAccount[]>(savingsAccountsEndpoint, [
    `${tenantId}/savings-accounts`,
    `${formValues.clientId}`,
    `${formValues.groupId}`,
  ]);

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
      shareProduct: formValues.shareProduct,
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

  const onChangeSavingsAccount = (value: {
    value: string;
    label: React.ReactNode;
  }) => {
    setSelectedSavingsAccount(value.label);
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
        className="col-span-3"
        name="currencyCode"
        label="Currency"
        initialValue={selectedShareProduct.currencyCode}
      >
        <Input disabled />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="savingsAccountId"
        label="Default Savings Account"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          onChange={onChangeSavingsAccount}
          allowClear
          showSearch
          filterOption={filterOption}
          options={savingsAccountsOptions}
        />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="totalPendingShares"
        label="Total Number of Shares"
        rules={[{ required: true }]}
        initialValue={selectedShareProduct.nominalClientShares}
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          min={selectedShareProduct.minimumClientShares}
          max={selectedShareProduct.maximumClientShares}
        />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        label="Today's Price"
        name="unitPrice"
        rules={[{ required: true }]}
        initialValue={selectedShareProduct.unitPrice}
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          disabled
        />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="minimumActivePeriodFrequency"
        label="Minimum Active Period"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <InputNumber
          className="w-full"
          min={selectedShareProduct.minimumActivePeriodFrequency}
        />
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="minimumActivePeriodFrequencyEnum"
        label="Minimum Active Period Frequency"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select>
          <option value={"DAYS"}>Days</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="lockInPeriodFrequency"
        label="Lock-In Period"
        initialValue={selectedShareProduct.lockInPeriodFrequency}
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
        initialValue={selectedShareProduct.lockInPeriodFrequencyEnum}
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="applicationDate"
        label="Application Date"
        rules={[{ required: true }]}
        initialValue={dayjs()}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-3 flex justify-start items-baseline"
        valuePropName="checked"
        name="allowDividendsInactiveClients"
        label={" "}
      >
        <Checkbox onChange={onChangeAllowOverdraft}>
          Allow dividends for inactive clients
        </Checkbox>
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
