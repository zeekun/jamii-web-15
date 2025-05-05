"use client";
import { useCreate, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import {
  FinancialActivityTypeEnum,
  GLAccount,
  GLFinancialActivityAccount,
} from "@/types";
import { filterOption } from "@/utils/strings";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useGLAccounts } from "@/hooks/gl-accounts";
import { useParams } from "next/navigation";

export default function CreateForm({
  submitType = "create",
  id,
  setIsModalOpen,
}: {
  submitType?: "create" | "update";
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [glAccountsOptions, setGlAccountsOptions] = useState<any>([]);
  const [accountOptionsLoading, setAccountOptionsLoading] = useState(false);

  const { mutate: insertGLAccount } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${ENDPOINT}`,
  ]);
  const { mutate: updateGLAccount } = usePatch(`${tenantId}/${ENDPOINT}`, id, [
    QUERY_KEY,
  ]);

  const { data: gLFinancialActivityAccount } =
    useGetById<GLFinancialActivityAccount>(`${tenantId}/${ENDPOINT}`, id);

  const glAccountMap = {
    ASSET: useGLAccounts("ASSET", `${tenantId}`),
    LIABILITY: useGLAccounts("LIABILITY", `${tenantId}`),
    EQUITY: useGLAccounts("EQUITY", `${tenantId}`),
    INCOME: useGLAccounts("INCOME", `${tenantId}`),
    EXPENSE: useGLAccounts("EXPENSE", `${tenantId}`),
  };

  useEffect(() => {
    if (submitType === "update" && gLFinancialActivityAccount) {
      form.setFieldsValue({
        financialActivityTypeEnum:
          gLFinancialActivityAccount.financialActivityTypeEnum,
        glAccountId: gLFinancialActivityAccount.glAccount.id,
      });

      const typeKey = gLFinancialActivityAccount.glAccount.type
        ?.codeValue as keyof typeof glAccountMap;

      const accountOptions = glAccountMap[typeKey]?.options?.filter(
        (item) => item.value !== id
      );
      const { options, status } = glAccountMap["ASSET"];
      if (status === "success") {
        setGlAccountsOptions(options);
      }
      if (accountOptions) setGlAccountsOptions(accountOptions);
    }
  }, [submitType, gLFinancialActivityAccount, form]);

  const handleActivityChange = (value: FinancialActivityTypeEnum) => {
    form.resetFields(["glAccountId"]);
    const activityMap: Record<
      FinancialActivityTypeEnum,
      keyof typeof glAccountMap
    > = {
      "ASSET TRANSFER": "ASSET",
      "LIABILITY TRANSFER": "LIABILITY",
      "CASH AT MAIN VAULT": "ASSET",
      "CASH AT TELLER": "ASSET",
      "OPENING BALANCES TRANSFERS CONTRA": "EQUITY",
      "ASSET FUND SOURCE": "ASSET",
      "PAYABLE DIVIDENDS": "LIABILITY",
    };

    const key = activityMap[value];
    if (key) {
      const { options, status } = glAccountMap[key];
      if (status === "success") {
        setGlAccountsOptions(options);
        setAccountOptionsLoading(false);
      } else {
        setAccountOptionsLoading(true);
      }
    }
  };

  const handleSubmit = (values: GLFinancialActivityAccount) => {
    setSubmitLoader(true);
    const submitAction =
      submitType === "create" ? insertGLAccount : updateGLAccount;

    submitAction(values, {
      onSuccess: () => {
        toast.success(`${PAGE_TITLE} ${submitType}d successfully.`, {
          theme: "colored",
        });
        setSubmitLoader(false);
        form.resetFields();
        setIsModalOpen(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error?.message || error.message, {
          theme: "colored",
        });
        setSubmitLoader(false);
      },
    });
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleSubmit}
      className="grid grid-cols-8 gap-2"
    >
      <Form.Item
        className="col-span-4"
        name="financialActivityTypeEnum"
        label="Financial Activity"
        rules={[{ required: true, message: "Financial Activity is required!" }]}
      >
        <Select
          showSearch
          allowClear
          onChange={handleActivityChange}
          options={[
            { value: "ASSET TRANSFER", label: "Asset Transfer" },
            {
              value: "CASH AT MAIN VAULT",
              label: "Main Cash Account or Cash At Vault",
            },
            { value: "CASH AT TELLER", label: "Cash at Tellers/Cashier" },
            { value: "ASSET FUND SOURCE", label: "Fund Source" },
            { value: "LIABILITY TRANSFER", label: "Liability Transfer" },
            { value: "PAYABLE DIVIDENDS", label: "Payable Dividends" },
            {
              value: "OPENING BALANCES TRANSFERS CONTRA",
              label: "Opening Balances Contra",
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        className="col-span-4"
        name="glAccountId"
        label="Account Type"
        rules={[{ required: true, message: "Account Type is required!" }]}
      >
        <Select
          allowClear
          showSearch
          options={glAccountsOptions}
          loading={accountOptionsLoading}
          filterOption={filterOption}
        />
      </Form.Item>
      <div className="col-span-8">
        <FormSubmitButtons
          submitLoader={submitLoader}
          onReset={() => form.resetFields()}
        />
      </div>
    </Form>
  );
}
