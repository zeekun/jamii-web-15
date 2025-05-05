"use client";
import { useCreate, useGet } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Table,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { Currency, GLAccount, Office, PaymentType, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import { dateFormat } from "@/utils/dates";
import { useParams, useRouter } from "next/navigation";
import toast from "@/utils/toast";

const { Text } = Typography;

interface JournalEntryItem {
  glAccountId: number;
  amount: number;
  name: string;
  type: "debit" | "credit";
  key: string;
}

export default function CreateForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  submitType?: SubmitType;
  handleCancel: () => void;
  frequentPostings?: boolean;
}) {
  const { tenantId } = useParams();
  const router = useRouter();

  const {
    submitType = "create",
    handleCancel,
    frequentPostings = false,
    setIsModalOpen,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);

  const { mutate: insertJournalEntry } = useCreate(`${tenantId}/${ENDPOINT}`, [
    QUERY_KEY,
  ]);

  // Fetch data hooks
  const { status: officesStatus, data: offices } = useGet<Office[]>(
    `${tenantId}/offices`,
    ["offices"]
  );
  const { status: currenciesStatus, data: currencies } = useGet<Currency[]>(
    `${tenantId}/currencies`,
    ["currencies"]
  );
  const { status: paymentTypesStatus, data: paymentTypes } = useGet<
    PaymentType[]
  >(`${tenantId}/payment-types`, ["payment-types"]);
  const { status: glAccountsStatus, data: glAccounts } = useGet<GLAccount[]>(
    `${tenantId}/gl-accounts?filter={"where":{"isActive":true,"manualEntriesAllowed":true}}`,
    ["gl-accounts"]
  );

  let selectOfficeOptions: any = [];

  if (officesStatus === "success") {
    selectOfficeOptions = offices.map((office: Office) => {
      return { value: office.id, label: office.name };
    });
  }

  let currenciesOptions: any = [];

  if (currenciesStatus === "success") {
    currenciesOptions = currencies.map((currency: Currency) => {
      return { value: currency.code, label: currency.name };
    });
  }

  const paymentTypesOptions =
    paymentTypes?.map((paymentType: PaymentType) => ({
      value: paymentType.id.toString(),
      label: paymentType.name,
    })) || [];

  let glAccountOptions: any = [];

  if (glAccountsStatus === "success") {
    glAccountOptions = glAccounts
      ?.filter((a: GLAccount) => a.usage.codeValue === "DETAIL")
      .map((gl: GLAccount) => {
        return { value: gl.id, label: gl.name };
      });
  }

  const onReset = () => {
    form.resetFields();
    setEntries([]);
  };

  const addEntry = (type: "debit" | "credit") => {
    const glAccountId = form.getFieldValue(`${type}GLId`);
    const amount = form.getFieldValue(`${type}Amount`);

    if (!glAccountId || !amount) {
      toast({
        type: "error",
        response: "Please select an account and enter an amount",
      });
      return;
    }

    const account = glAccountOptions.find(
      (option: { value: any }) => option.value === glAccountId
    );

    const newEntry: JournalEntryItem = {
      glAccountId,
      name: account?.label || "Unknown Account",
      amount,
      type,
      key: `${type}-${Date.now()}`,
    };

    setEntries([...entries, newEntry]);
    form.resetFields([`${type}GLId`, `${type}Amount`]);
  };

  const removeEntry = (key: string) => {
    setEntries(entries.filter((entry) => entry.key !== key));
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text: string) => <Text strong>{text.toUpperCase()}</Text>,
    },
    {
      title: "Account",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatCurrency(amount, "UGX", 2),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: JournalEntryItem) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() => removeEntry(record.key)}
          danger
          size="small"
        />
      ),
    },
  ];

  function onFinish(values: any) {
    setSubmitLoader(true);

    // Group entries by type
    const debits = entries
      .filter((e) => e.type === "debit")
      .map((e) => ({
        glAccountId: e.glAccountId,
        amount: e.amount,
      }));

    const credits = entries
      .filter((e) => e.type === "credit")
      .map((e) => ({
        glAccountId: e.glAccountId,
        amount: e.amount,
      }));

    // Validate that debits equal credits
    const totalDebits = debits.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredits = credits.reduce((sum, entry) => sum + entry.amount, 0);

    if (totalDebits !== totalCredits) {
      toast({
        type: "error",
        response: "Total debits must equal total credits",
      });
      setSubmitLoader(false);
      return;
    }

    if (debits.length === 0 || credits.length === 0) {
      toast({
        type: "error",
        response: "You must add at least one debit and one credit entry",
      });
      setSubmitLoader(false);
      return;
    }

    const updatedValues = {
      glJournalEntry: {
        manualEntry: true,
        reversed: false,
        entryDate: values.entryDate,
        officeId: values.officeId as number,
        currencyId: values.currencyId,
        refNum: values.refNum,
        paymentTypeId: values.paymentTypeId,
        description: values.description,
      },
      debits,
      credits,
    };

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    insertJournalEntry(updatedValues, {
      onSuccess: (response: any) => {
        setSubmitLoader(false);
        toast({
          type: "success",
          response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
        });
        onReset();
        setIsModalOpen(false);
        router.push(`${window.location.pathname}/${response.transactionId}`);
      },
      onError(error) {
        toast({ type: "error", response: error.message });
        setSubmitLoader(false);
      },
    });
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
    >
      {/* Basic Information */}
      <Form.Item
        className="col-span-full md:col-span-2 lg:col-span-2"
        name="officeId"
        label="Office"
        rules={[{ required: true, message: "Office is required!" }]}
      >
        <Select
          filterOption={filterOption}
          options={selectOfficeOptions}
          allowClear
          showSearch
          className="w-full"
        />
      </Form.Item>

      {frequentPostings && (
        <Form.Item
          className="col-span-full md:col-span-3 lg:col-span-3"
          name="accountingRuleId"
          label="Accounting Rule"
          rules={[{ required: true, message: "Accounting Rule is required!" }]}
        >
          <Select
            filterOption={filterOption}
            options={currenciesOptions}
            allowClear
            showSearch
            className="w-full"
          />
        </Form.Item>
      )}

      <Form.Item
        className="col-span-full md:col-span-2 lg:col-span-2"
        name="currencyId"
        label="Currency"
        rules={[{ required: true, message: "Currency is required!" }]}
      >
        <Select
          filterOption={filterOption}
          options={currenciesOptions}
          allowClear
          showSearch
          className="w-full"
        />
      </Form.Item>

      <Form.Item
        className="col-span-full md:col-span-2 lg:col-span-2"
        name="entryDate"
        label="Transaction Date"
        rules={[{ required: true, message: "Transaction Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      {/* Entry Section */}
      <div className="col-span-full space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
          <Form.Item
            className="col-span-full md:col-span-3"
            name="debitGLId"
            label="Debit Account"
          >
            <Select
              filterOption={filterOption}
              options={glAccountOptions}
              allowClear
              showSearch
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            className="col-span-full md:col-span-3"
            name="debitAmount"
            label="Amount"
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            label=" "
            colon={false}
            className="col-span-full md:col-span-2 flex justify-end"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => addEntry("debit")}
              className="w-full md:w-auto"
            >
              Add Debit
            </Button>
          </Form.Item>

          <Form.Item
            className="col-span-full md:col-span-3"
            name="creditGLId"
            label="Credit Account"
          >
            <Select
              filterOption={filterOption}
              options={glAccountOptions}
              allowClear
              showSearch
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            className="col-span-full md:col-span-3"
            name="creditAmount"
            label="Amount"
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            label=" "
            colon={false}
            className="col-span-full md:col-span-2 flex justify-end"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => addEntry("credit")}
              className="w-full md:w-auto"
            >
              Add Credit
            </Button>
          </Form.Item>
        </div>

        {entries.length > 0 && (
          <div className="space-y-2">
            <Text strong>Journal Entries</Text>
            <Table
              columns={columns}
              dataSource={entries}
              pagination={false}
              size="small"
              className="w-full"
              scroll={{ x: true }}
            />
          </div>
        )}
      </div>

      {/* Transaction Details */}
      <Form.Item
        className="col-span-full md:col-span-3 lg:col-span-3"
        name="paymentTypeId"
        label="Payment Type"
      >
        <Select
          filterOption={filterOption}
          options={paymentTypesOptions}
          allowClear
          showSearch
          className="w-full"
        />
      </Form.Item>

      <Form.Item
        className="col-span-full md:col-span-3 lg:col-span-3"
        name="referenceNumber"
        label="Reference Number"
      >
        <Input className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-full md:col-span-3 lg:col-span-3"
        name="accountNumber"
        label="Account Number"
      >
        <Input className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-full md:col-span-3 lg:col-span-3"
        name="chequeNumber"
        label="Cheque Number"
      >
        <Input className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-full md:col-span-3 lg:col-span-3"
        name="routingCode"
        label="Routing Code"
      >
        <Input className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-full md:col-span-3 lg:col-span-3"
        name="receiptNumber"
        label="Receipt Number"
      >
        <Input className="w-full" />
      </Form.Item>

      <Form.Item
        className="col-span-full md:col-span-3 lg:col-span-3"
        name="bankNumber"
        label="Bank Number"
      >
        <Input className="w-full" />
      </Form.Item>

      <Form.Item className="col-span-full" name="description" label="Comments">
        <Input.TextArea rows={4} className="w-full" />
      </Form.Item>

      <div className="col-span-full flex flex-col sm:flex-row justify-end gap-3">
        <FormSubmitButtons
          submitLoader={submitLoader}
          onReset={onReset}
          handleCancel={handleCancel}
        />
      </div>
    </Form>
  );
}

function formatCurrency(amount: number, currency: string, decimals: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
