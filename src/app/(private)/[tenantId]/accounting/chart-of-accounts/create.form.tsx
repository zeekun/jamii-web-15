"use client";
import { get, useCreate, useGet, useGetById, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Code, CodeValue, GLAccount, SubmitType } from "@/types";
import { filterOption } from "@/utils/strings";
import { Checkbox, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import toast from "@/utils/toast";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useGLAccounts } from "@/hooks/gl-accounts";
import { useParams } from "next/navigation";
import Loading from "@/components/loading";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [parentOptions, setParentOptions] = useState<any[]>([]);

  const { mutate: insertGLAccount } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateGLAccount } = usePatchV2(
    `${tenantId}/${ENDPOINT}`,
    id,
    [`${tenantId}/gl-accounts`, `${id}`]
  );

  const {
    status: glAccountTypesStatus,
    data: glAccountTypes,
    error: glAccountTypesError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"gl-account-type"}}`,
    [`gl-account-type-code-values`]
  );

  let glAccountTypeOptions: any = [];

  if (glAccountTypesStatus === "success") {
    if (glAccountTypes[0]?.codeValues) {
      glAccountTypeOptions = glAccountTypes[0]?.codeValues.map(
        (code: { id: number; codeValue: string }) => {
          return { value: code.id, label: code.codeValue };
        }
      );
    }
  }

  const {
    status: glAccountUsageStatus,
    data: glAccountUsage,
    error: glAccountUsageError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"gl-account-usage"}}`,
    [`${tenantId}/gl-account-usage-code-values`]
  );

  let glAccountUsageOptions: any = [];

  if (glAccountUsageStatus === "success") {
    if (glAccountUsage[0]?.codeValues) {
      glAccountUsageOptions = glAccountUsage[0]?.codeValues.map(
        (code: { id: number; codeValue: string }) => {
          return { value: code.id, label: code.codeValue };
        }
      );
    }
  }

  const {
    status: tagsStatus,
    data: tags,
    error: tagsError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"gl-account-tags"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"gl-account-tags"}}`]
  );

  let tagsOptions: any = [];

  if (tagsStatus === "success") {
    tagsOptions = tags[0]?.codeValues
      .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
      .filter(
        (code: CodeValue) => code.isActive && code.tenantId === Number(tenantId)
      )
      .map((code: { id: number; codeValue: string }) => {
        return { value: code.id, label: code.codeValue };
      });
  }

  const {
    status: parentAccountsStatus,
    data: parentAccounts,
    error: parentAccountsError,
  } = useGet<GLAccount[]>(
    `${tenantId}/${ENDPOINT}?filter={"where":{"isActive":true}}`,
    [`parentGlAccounts`]
  );

  let parentAccountOptions: any = [];

  if (parentAccountsStatus === "success") {
    parentAccountOptions = parentAccounts.map((account: GLAccount) => {
      return { value: account.id, label: account.name };
    });
  }

  if (submitType === "update") {
    parentAccountOptions = parentAccountOptions.filter(
      (item: { value: number | undefined }) => item.value !== id
    );
  }

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: glAccountStatus,
    data: glAccount,
    error: glAccountError,
  } = useGetById<GLAccount>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (submitType === "update" && glAccountStatus === "success" && glAccount) {
      // Update form fields
      form.setFieldsValue({
        name: glAccount.name,
        typeId: glAccount.type.id,
        glCode: glAccount.glCode,
        usageId: glAccount.usage.id,
        parentId: glAccount.parent?.id || null,
        tagId: glAccount.tagId,
        manualEntriesAllowed: !!glAccount.manualEntriesAllowed,
        description: glAccount.description,
      });

      // Map options based on type
      const accountOptionsMap: Record<
        string,
        Array<{ value: number | undefined }>
      > = {
        ASSET: glAssetAccountsOptions,
        LIABILITY: glLiabilityAccountsOptions,
        EQUITY: glEquityAccountsOptions,
        INCOME: glIncomeAccountsOptions,
        EXPENSE: glExpenseAccountsOptions,
      };

      const newParentOptions = (
        accountOptionsMap[glAccount.type.codeValue] || []
      ).filter((item) => item.value !== id);

      setParentOptions(newParentOptions); // Update parent options
    }
  }, [submitType, glAccountStatus, glAccount, form, id]);

  // Re-render parentOptions as soon as they change
  useEffect(() => {
    if (parentOptions) {
      console.log("Parent options updated:", parentOptions);
    }
  }, [parentOptions]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (!values.parentId) values["parentId"] = 0;
    if (submitType === "create") {
      insertGLAccount(values, {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          setIsModalOpen(false);
          form.resetFields();
        },
        onError(error, variables, context) {
          toast({
            type: "error",
            response: error,
          });

          setSubmitLoader(false);
        },
      });
    } else {
      if (!values.description) delete values["description"];
      if (!values.tagId) delete values["tagId"];

      updateGLAccount(values, {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          setIsModalOpen(false);
        },
        onError(error: any, variables, context) {
          toast({
            type: "error",
            response: error,
          });
          setSubmitLoader(false);
        },
      });
    }
  }

  const { options: glAssetAccountsOptions } = useGLAccounts(
    "ASSET",
    `${tenantId}`
  );
  const { options: glLiabilityAccountsOptions } = useGLAccounts(
    "LIABILITY",
    `${tenantId}`
  );
  const { options: glEquityAccountsOptions } = useGLAccounts(
    "EQUITY",
    `${tenantId}`
  );
  const { options: glIncomeAccountsOptions } = useGLAccounts(
    "INCOME",
    `${tenantId}`
  );
  const { options: glExpenseAccountsOptions } = useGLAccounts(
    "EXPENSE",
    `${tenantId}`
  );

  const onChangeAccountTypeId = async (value: number) => {
    form.setFieldValue("parentId", null);
    //get asset type name

    const accountType = await get(`${tenantId}/code-values/${value}`);

    const accountTypeName = accountType.data.codeValue;

    if (accountTypeName === "ASSET") {
      const parents = glAssetAccountsOptions.filter(
        (item: { value: number | undefined }) => item.value !== id
      );
      setParentOptions(parents);
    } else if (accountTypeName === "LIABILITY") {
      const parents = glLiabilityAccountsOptions.filter(
        (item: { value: number | undefined }) => item.value !== id
      );
      setParentOptions(parents);
    } else if (accountTypeName === "EQUITY") {
      const parents = glEquityAccountsOptions.filter(
        (item: { value: number | undefined }) => item.value !== id
      );
      setParentOptions(parents);
    } else if (accountTypeName === "INCOME") {
      const parents = glIncomeAccountsOptions.filter(
        (item: { value: number | undefined }) => item.value !== id
      );
      setParentOptions(parents);
    } else if (accountTypeName === "EXPENSE") {
      const parents = glExpenseAccountsOptions.filter(
        (item: { value: number | undefined }) => item.value !== id
      );
      setParentOptions(parents);
    }
  };

  useEffect(() => {
    console.log(parentOptions);
  }, [parentOptions]);

  if (glAccountStatus === "pending") {
    return <Loading />;
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={`${PAGE_TITLE}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-8 gap-2"
    >
      <Form.Item
        className="col-span-4"
        name="typeId"
        label="Account Type"
        rules={[{ required: true, message: "Account Type is required!" }]}
      >
        <Select
          allowClear
          options={glAccountTypeOptions}
          onChange={onChangeAccountTypeId}
        />
      </Form.Item>

      <Form.Item
        className="col-span-4"
        name="name"
        label="Account Name"
        rules={[{ required: true, message: "Account Name is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        className="col-span-4"
        name="usageId"
        label="Account Usage"
        rules={[{ required: true, message: "Account Usage is required!" }]}
      >
        <Select allowClear options={glAccountUsageOptions} />
      </Form.Item>

      <Form.Item
        className="col-span-4"
        name="glCode"
        label="GL Code"
        rules={[{ required: true, message: "GL code is required!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item className="col-span-4" name="parentId" label="Parent">
        <Select
          allowClear
          options={parentOptions}
          showSearch
          filterOption={filterOption}
        />
      </Form.Item>

      <Form.Item className="col-span-2" name="tagId" label="Tag">
        <Select
          allowClear
          options={tagsOptions}
          showSearch
          filterOption={filterOption}
        />
      </Form.Item>

      <Form.Item
        className="col-span-2 flex justify-start items-baseline"
        name="manualEntriesAllowed"
        label={" "}
        valuePropName="checked"
      >
        <Checkbox checked={true}>Manual Entries Allowed</Checkbox>
      </Form.Item>

      <Form.Item className="col-span-8" name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <div className="col-span-8">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
