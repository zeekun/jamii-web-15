"use client";
import { get, useGet, usePatch, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { Client, Loan, Office, SavingsAccount } from "@/types";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

export default function TransferForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  saving: SavingsAccount;
  page?: "CLIENT" | "SAVING ACCOUNT";
}) {
  const { tenantId } = useParams();
  const { saving, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientsOptions, setClientsOptions] = useState<any[]>([]);
  const [clientId, setClientId] = useState<number>();
  const [accountTypeLoading, setAccountTypeLoading] = useState(false);
  const [accountsOptions, setAccountsOptions] = useState<any[]>([]);

  const savingId = saving.id;

  const { mutate: transact } = usePatchV2(`${tenantId}/${ENDPOINT}`, savingId, [
    `${tenantId}/savings-accounts`,
    `${saving.id}`,
    `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${savingId},"isReversed":false},"order":["id DESC"]}`,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>(`${tenantId}/offices`, [`${tenantId}/offices`]);

  let officeOptions: any = [];

  if (officesStatus === "success") {
    officeOptions = offices.map((office: Office) => {
      return { value: office.id, label: office.name };
    });
  }

  const onOfficeChange = (officeId: number) => {
    form.resetFields(["clientId"]);
    setClientLoading(true);
    get(
      `${tenantId}/clients?filter={"where":{"officeId":${officeId},"isActive":true}}`
    )
      .then((res) => {
        const clients: Client[] = res.data;
        const clientOptions = clients.map((client) => {
          const m = client.middleName || "";
          return {
            value: client.id,
            label: `${client.firstName} ${m}${client.lastName}`,
          };
        });
        setClientsOptions(clientOptions);
        setClientLoading(false);
      })
      .catch(() => {
        setClientLoading(false);
      });
  };

  const onChangeAccountType = (accountType: "loan" | "savings") => {
    setAccountTypeLoading(true);
    form.resetFields(["accountId"]);

    if (accountType === "savings") {
      get(
        `${tenantId}/${ENDPOINT}?filter={"where":{"clientId":"${clientId}","statusEnum":"ACTIVE"}}`
      )
        .then((res) => {
          const savings: SavingsAccount[] = res.data;
          const accountsOptions = savings
            .filter((saving) => saving.id !== savingId)
            .map((saving) => {
              return {
                value: saving.id,
                label: `${saving.savingsProduct.name} - #${saving.accountNo}`,
              };
            });
          setAccountsOptions(accountsOptions);
          setAccountTypeLoading(false);
        })
        .catch(() => {
          setAccountTypeLoading(false);
        });
    } else {
      if (clientId) {
        get(
          `${tenantId}/loans?filter={"where":{"clientId":"${clientId}","loanStatusEnum":"ACTIVE"}}`
        )
          .then((res) => {
            const loans: Loan[] = res.data;
            const accountsOptions = loans.map((loan) => {
              return {
                value: loan.id,
                label: `${loan.loanProduct.name} -#${loan.accountNo}`,
              };
            });
            setAccountsOptions(accountsOptions);
            setAccountTypeLoading(false);
          })
          .catch(() => {
            setAccountTypeLoading(false);
          });
      }
    }
  };

  console.log("currencyCode: saving.currencyCode", saving.currencyCode);

  const onSelectClient = (id: number) => {
    setClientId(id);
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const formValuesChargesIds =
      saving.savingsAccountCharges?.map((charge) => charge.id) ?? [];

    let updatedValues = {
      savingsAccount: {
        accountBalanceDerived: saving.accountBalanceDerived,
        totalWithdrawalsDerived:
          values.transactionAmount + saving.totalWithdrawalsDerived,
        statusEnum: "ACTIVE",
        withdrawalFeeForTransfer: saving.withdrawalFeeForTransfer,
        currencyCode: saving.currencyCode,
      },
      charges: formValuesChargesIds,
      transaction: {
        amount: values.transactionAmount,
        transactionDate: values.transactionDate,
        transactionTypeEnum: "WITHDRAW TRANSFER",
        runningBalanceDerived:
          saving.accountBalanceDerived - values.transactionAmount,
        isReversed: false,
        transferFunds: true,
        clientFromId: saving.clientId,
        officeId: saving.client.officeId,
        availableBalance: saving.minRequiredBalance
          ? saving.accountBalanceDerived - saving.minRequiredBalance
          : saving.accountBalanceDerived,
        clientToId: values.clientId,
        transferFromAccountId: saving.id,
        transferToAccountId: values.accountId,
        totalDepositsDerived:
          saving.accountBalanceDerived - values.transactionAmount,
        accountBalanceDerived:
          saving.accountBalanceDerived - values.transactionAmount,
      },
    };

    transact(
      { id: savingId, ...updatedValues },
      {
        onSuccess: () => {
          toast({
            type: "success",
            response: `Transfer successfully made`,
          });
          setSubmitLoader(false);
          setIsModalOpen(false);
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });
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

            <th>Currency</th>
            <td>{saving.currency?.name || "Not Available"}</td>
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
          className="col-span-1"
          name="officeId"
          label="Office"
          rules={[{ required: true, message: "Office is required!" }]}
        >
          <Select
            allowClear
            showSearch
            filterOption={filterOption}
            options={officeOptions}
            onChange={onOfficeChange}
          />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="clientId"
          label="Client"
          rules={[{ required: true, message: "Client is required!" }]}
        >
          <Select
            allowClear
            showSearch
            filterOption={filterOption}
            options={clientsOptions}
            loading={clientLoading}
            onSelect={onSelectClient}
          />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="accountType"
          label="Account Type"
          rules={[{ required: true, message: "Account Type is required!" }]}
        >
          <Select onChange={onChangeAccountType}>
            <option value={"loan"}>Loan Accounts</option>
            <option value={"savings"}>Savings Accounts</option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="accountId"
          label="Account"
          rules={[{ required: true, message: "Account is required!" }]}
        >
          <Select
            allowClear
            showSearch
            filterOption={filterOption}
            options={accountsOptions}
            loading={accountTypeLoading}
          />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="transactionDate"
          label="Transaction Date"
          initialValue={dayjs()}
          rules={[{ required: true, message: "Transaction Date is required!" }]}
        >
          <DatePicker className="w-full" format={dateFormat} />
        </Form.Item>

        <Form.Item
          className="col-span-1"
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
