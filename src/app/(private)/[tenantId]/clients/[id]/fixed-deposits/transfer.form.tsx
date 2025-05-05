"use client";
import { useGet, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { Client, Office, SavingsAccount } from "@/types";
import { filterOption } from "@/utils/strings";

export default function TransferForm(props: {
  saving: SavingsAccount;
  page?: "CLIENT" | "SAVING ACCOUNT";
}) {
  const { saving, page } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showPaymentTypeInputs, setShowPaymentTypeInputs] = useState(false);

  const savingId = saving.id;

  let qk = [
    `clients/${saving.clientId}/savings-accounts?filter={"where":{"statusEnum":{"neq":"REJECTED"}}}`,
  ];

  if (page === "SAVING ACCOUNT") {
    qk = ["savings-accounts", `${saving.id}`];
  }

  const { mutate: transact } = usePatch(ENDPOINT, savingId, qk);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>("offices", ["offices"]);

  let officeOptions: any = [];

  if (officesStatus === "success") {
    officeOptions = offices.map((office: Office) => {
      return { value: office.id, label: office.name };
    });
  }

  const {
    status: clientsStatus,
    data: clients,
    error: clientsError,
  } = useGet<Client[]>("clients", ["clients"]);

  let clientsOptions: any = [];

  if (clientsStatus === "success") {
    clientsOptions = clients.map((client: Client) => {
      return {
        value: client.id,
        label: client.firstName
          ? `${client.firstName} ${client.middleName} ${client.lastName}`
          : client.fullName,
      };
    });
  }

  const {
    status: accountsStatus,
    data: accounts,
    error: accountsError,
  } = useGet<SavingsAccount[]>("savings-accounts", ["savings-accounts"]);

  let accountOptions: any = [];

  if (accountsStatus === "success") {
    accountOptions = accounts.map((account: SavingsAccount) => {
      return {
        value: account.id,
        label: `${account.savingsProduct.name} - #${account.accountNo}`,
      };
    });
  }

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      savingsAccount: {
        accountBalanceDerived:
          saving.accountBalanceDerived - values.transactionAmount,
        totalWithdrawalsDerived:
          values.transactionAmount + saving.totalWithdrawalsDerived,
      },
      transaction: {
        amount: values.transactionAmount,
        transactionDate: values.transactionDate,
        transactionTypeEnum: "WITHDRAW",
        runningBalanceDerived:
          saving.accountBalanceDerived - values.transactionAmount,
        isReversed: false,
        officeId: saving.client.officeId,
        transferFunds: true,
        transferToAccountId: values.accountId,
        totalDepositsDerived:
          values.transactionAmount + saving.accountBalanceDerived,
        accountBalanceDerived:
          values.transactionAmount + saving.accountBalanceDerived,
      },
    };

    transact(
      { id: savingId, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
        },
      }
    );
  }

  return (
    <>
      <div className="bg-gray-200 p-5 mb-4">
        <table className="w-full justify-start">
          <tr>
            <th>Applicant</th>
            <td>
              {saving.client?.firstName
                ? `${saving.client?.firstName} ${
                    saving.client?.middleName || ""
                  } ${saving.client?.lastName}`
                : saving.client.fullName}
            </td>
            <th>Office</th>
            <td>{saving.client.office.name}</td>
          </tr>
          <tr>
            <th>From Account</th>
            <td>
              {saving.savingsProduct.name} - #{saving.accountNo}
            </td>
          </tr>
          <tr>
            <th>Currency</th>
            <td>{saving.currency.name}</td>
          </tr>
        </table>
      </div>
      <strong className="mb-5">Transferring To</strong>
      <Form
        layout="vertical"
        form={form}
        name={PAGE_TITLE}
        onFinish={onFinish}
        className="grid grid-cols-2 gap-2"
      >
        <Form.Item
          className="col-span-2"
          name="officeId"
          label="Office"
          rules={[{ required: true, message: "Office is required!" }]}
        >
          <Select
            allowClear
            showSearch
            filterOption={filterOption}
            options={officeOptions}
          />
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="clientId"
          label="Client"
          rules={[{ required: true, message: "Client is required!" }]}
        >
          <Select
            allowClear
            showSearch
            filterOption={filterOption}
            options={clientsOptions}
          />
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="accountType"
          label="Account Type"
          rules={[{ required: true, message: "Account Type is required!" }]}
        >
          <Select>
            <option value={"Loan Accounts"}>Loan Accounts</option>
            <option value={"Savings Accounts"}>Savings Accounts</option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="accountId"
          label="Account"
          rules={[{ required: true, message: "Account is required!" }]}
        >
          <Select
            allowClear
            showSearch
            filterOption={filterOption}
            options={accountOptions}
          />
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="transactionDate"
          label="Transaction Date"
          initialValue={dayjs()}
          rules={[{ required: true, message: "Transaction Date is required!" }]}
        >
          <DatePicker className="w-full" format={dateFormat} />
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="transactionAmount"
          label="Amount"
          rules={[
            {
              required: true,
              message: "Transaction Amount is required!",
            },
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
          className="col-span-2"
          name="description"
          label="Description"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <div className="col-span-2">
          <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
        </div>
      </Form>
    </>
  );
}
