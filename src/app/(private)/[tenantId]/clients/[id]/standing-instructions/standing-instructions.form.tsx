"use client";
import { get, useCreate, useGet } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import { useEffect, useState } from "react";
import toast from "@/utils/toast";
import { Client, Loan, Office, SavingsAccount } from "@/types";
import { useParams } from "next/navigation";
import { filterOption } from "@/utils/strings";

export default function StandingInstructionsForm(props: { client: Client }) {
  const { client } = props;
  const { tenantId, id } = useParams();
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [toAccountTypeOptions, setToAccountTypeOptions] = useState();
  const [fromAccountTypeOptions, setFromAccountTypeOptions] = useState();
  const [toAccountTypeLoading, setToAccountTypeLoading] = useState(false);
  const [fromAccountTypeLoading, setFromAccountTypeLoading] = useState(false);
  const [fromClientsLoading, setFromClientsLoading] = useState(false);
  const [toClientsLoading, setToClientsLoading] = useState(false);
  const [toClientsOptions, setToClientsOptions] = useState<any[]>([]);

  const { mutate: insertStandingInstruction } = useCreate(
    `${tenantId}/account-transfer-details`,
    [`${tenantId}/account-transfer-details`]
  );

  const onReset = () => {
    form.resetFields();
  };

  const { status: savingsAccountsStatus, data: savingsAccounts } = useGet<
    SavingsAccount[]
  >(`${tenantId}/savings-accounts?filter={"where":{"clientId":${id}}}`, [
    `${tenantId}/savings-accounts?filter={"where":{"clientId":${id}}}`,
  ]);

  let savingsAccountsOptions: any = [];

  if (savingsAccountsStatus === "success") {
    savingsAccountsOptions = savingsAccounts.map((account: SavingsAccount) => {
      return {
        value: account.id,
        label: `${account.savingsProduct.name} - ${account.accountNo}`,
      };
    });
  }

  const { status: loanAccountsStatus, data: loanAccounts } = useGet<Loan[]>(
    `${tenantId}/loans?filter={"where":{"clientId":${id}}}`,
    [`${tenantId}/loans?filter={"where":{"clientId":${id}}}`]
  );

  let loanAccountsOptions: any = [];

  if (loanAccountsStatus === "success") {
    loanAccountsOptions = loanAccounts.map((account: Loan) => {
      return {
        value: account.id,
        label: `${account.loanProduct.name} - ${account.accountNo}`,
      };
    });
  }

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>(`${tenantId}/offices`, [`${tenantId}/offices`]);

  let officesOptions: any = [];

  if (officesStatus === "success") {
    officesOptions = offices.map((office: Office) => {
      return {
        value: office.id,
        label: `${office.name}`,
      };
    });
  }

  function onFinish(values: any) {
    setSubmitLoader(true);

    const updatedValues = {
      accountTransferDetail: {
        transferType: values.transferType,
        fromOfficeId: client.officeId,
        toOfficeId: values.toOfficeId,
        fromClientId: client.id,
        toClientId: values.toClientId,
      },
      accountTransferStandingInstruction: {
        name: values.name,
        priority: values.priority,
        status: values.status === 1 ? true : false,
        instructionType: values.instructionType,
        amount: values.amount,
        validFrom: values.validFrom,
        validTill: values.validTill,
        recurrenceType: values.recurrenceType,
        recurrenceFrequency: values.recurrenceFrequency,
        recurrenceInterval: values.recurrenceInterval,
        recurrenceOnDay: values.recurrenceOnDay,
        recurrenceOnMonth: values.recurrenceOnMonth,
        lastRunDate: values.lastRunDate,
      },
      helperData: {
        fromAccountType: values.fromAccountType,
        fromAccountId: values.fromAccountId,
        toAccountType: values.toAccountType,
        toAccountId: values.toAccountId,
      },
    };

    insertStandingInstruction(updatedValues, {
      onSuccess: () => {
        setSubmitLoader(false);

        toast({
          type: "success",
          response: "Standing Instruction created successfully!",
        });
      },
      onError(error, variables, context) {
        setSubmitLoader(false);
        toast({
          type: "error",
          response: error,
        });
      },
    });
  }

  useEffect(() => {
    form.setFieldsValue({
      applicant: client.firstName
        ? `${client.firstName} ${client.middleName || ""} ${client.lastName}`
        : client.fullName,
    });
  }, [client]);

  const onChangeFromAccountType = (value: any) => {
    if (savingsAccountsStatus === "pending") {
      setFromAccountTypeLoading(true);
    }

    if (value === "savings account" && savingsAccountsStatus === "success") {
      setFromAccountTypeOptions(savingsAccountsOptions);
      setFromAccountTypeLoading(false);
    } else if (value === "loan account" && loanAccountsStatus === "success") {
      setFromAccountTypeOptions(loanAccountsOptions);
      setFromAccountTypeLoading(false);
    }
  };

  const onChangeToAccountType = (value: any) => {
    if (savingsAccountsStatus === "pending") {
      setToAccountTypeLoading(true);
    }

    if (value === "savings account" && savingsAccountsStatus === "success") {
      setToAccountTypeOptions(savingsAccountsOptions);
      setToAccountTypeLoading(false);
    } else if (value === "loan account" && loanAccountsStatus === "success") {
      setToAccountTypeOptions(loanAccountsOptions);
      setToAccountTypeLoading(false);
    }
  };

  const fetchToClients = (officeId: number) => {
    setToClientsLoading(true);
    get(
      `${tenantId}/clients?filter={"where":{"officeId":${officeId},"isActive":true}}`
    )
      .then((res) => {
        const toClients: Client[] = res.data;
        const toClientsOptions = toClients.map((client) => {
          const clientName = client.firstName
            ? `${client.firstName} ${client.middleName || ""} ${
                client.lastName
              }`
            : client.fullName;
          return {
            value: client.id,
            label: clientName,
          };
        });
        setToClientsOptions(toClientsOptions);
        setToClientsLoading(false);
      })
      .catch(() => {
        setToClientsLoading(false);
      });
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={"standingInstructionForm"}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <>
        <Form.Item
          className="col-span-1"
          name="name"
          label="Name"
          rules={[{ required: true, message: "Name is required!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          label="Applicant"
          rules={[{ required: true, message: "Applicant is required!" }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="transferType"
          label="Type"
          rules={[{ required: true, message: "Type is required!" }]}
        >
          <Select>
            <option value="ACCOUNT TRANSFER">Account Transfer</option>
            <option value="LOAN REPAYMENT">Loan Repayment</option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="priority"
          label="Priority"
          rules={[{ required: true, message: "Priority is required!" }]}
        >
          <Select>
            <option value="URGENT">Urgent Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="status"
          label="Status"
          rules={[{ required: true, message: "Status is required!" }]}
        >
          <Select>
            <option value={1}>Active</option>
            <option value={0}>Disabled</option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="fromAccountType"
          label="From Account Type"
          rules={[
            { required: true, message: "From Account Type is required!" },
          ]}
        >
          <Select onChange={onChangeFromAccountType}>
            <option value="savings account">Savings Account</option>
            <option value="loan account">Loan Account</option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="fromAccountId"
          label="From Account"
          rules={[{ required: true, message: "From Account is required!" }]}
        >
          <Select
            showSearch
            allowClear
            options={fromAccountTypeOptions}
            filterOption={filterOption}
            loading={fromAccountTypeLoading}
          />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          label="Destination"
          rules={[{ required: true, message: "Destination is required!" }]}
        >
          <Select>
            <option value={"own account"}>Own Account</option>
            <option value={"within bank"}>Within Bank</option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="toOfficeId"
          label="To Office"
          rules={[{ required: true, message: "To Office is required!" }]}
        >
          <Select
            showSearch
            allowClear
            filterOption={filterOption}
            options={officesOptions}
            onChange={fetchToClients}
          />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="toClientId"
          label="Beneficiary"
          rules={[{ required: true, message: "Beneficiary is required!" }]}
        >
          <Select
            showSearch
            allowClear
            filterOption={filterOption}
            options={toClientsOptions}
            loading={toClientsLoading}
          />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="toAccountType"
          label="To Account Type"
          rules={[{ required: true, message: "To Account Type is required!" }]}
        >
          <Select onChange={onChangeToAccountType}>
            <option value={"savings account"}>Savings Account</option>
            <option value={"loan account"}>Loan Account</option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="toAccountId"
          label="To Account"
          rules={[{ required: true, message: "To Account is required!" }]}
        >
          <Select
            showSearch
            allowClear
            options={toAccountTypeOptions}
            filterOption={filterOption}
            loading={toAccountTypeLoading}
          />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="instructionType"
          label="Standing Instruction Type"
          rules={[
            {
              required: true,
              message: "Standing Instruction Type is required!",
            },
          ]}
        >
          <Select>
            <option value="FIXED">Fixed</option>
            <option value="DUES">Dues</option>
          </Select>
        </Form.Item>

        <Form.Item className="col-span-1" name="amount" label="Amount">
          <InputNumber
            className="w-full"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="validFrom"
          label="Validity from"
          rules={[{ required: true, message: "Validity From is required!" }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="validTill"
          label="Valid To"
          rules={[{ required: true, message: "To is required!" }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="recurrenceType"
          label="Recurrence Type"
          rules={[{ required: true, message: "Recurrence Type is required!" }]}
        >
          <Select>
            <option value="PERIODIC RECURRENCE">Periodic Recurrence</option>
            <option value="AS PER DUES RECURRENCE">
              As Per Dues Recurrence
            </option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="recurrenceInterval"
          label="Interval"
        >
          <InputNumber
            className="w-full"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="recurrenceFrequency"
          label="Recurrence Frequency"
        >
          <Select>
            <option value="DAYS">Days</option>
            <option value="WEEKS">Weeks</option>
            <option value="MONTHS">Months</option>
            <option value="YEARS">Years</option>
          </Select>
        </Form.Item>

        <Form.Item
          className="col-span-1"
          name="recurrenceOnMonth"
          label="On Month Day"
        >
          <DatePicker className="w-full" />
        </Form.Item>
      </>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
