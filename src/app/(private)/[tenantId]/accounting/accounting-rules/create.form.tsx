"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import {
  AccountingRule,
  Code,
  CodeValue,
  GLAccount,
  Office,
  SubmitType,
} from "@/types";
import { filterOption } from "@/utils/strings";
import toast from "@/utils/toast";
import { Checkbox, Form, Input, Radio, RadioChangeEvent, Select } from "antd";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useParams } from "next/navigation";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [debitValue, setDebitValue] = useState(1);
  const [creditValue, setCreditValue] = useState(1);
  const [showFixedDebitForm, setShowFixedDebitForm] = useState(true);
  const [showListAccountsDebitForm, setShowListAccountsDebitForm] =
    useState(false);
  const [showFixedCreditForm, setShowFixedCreditForm] = useState(true);
  const [showListAccountsCreditForm, setShowListAccountsCreditForm] =
    useState(false);

  const { mutate: insertAccountingRule } = useCreate(
    `${tenantId}/${ENDPOINT}`,
    [`${tenantId}/${QUERY_KEY}`]
  );
  const { mutate: updateAccountingRule } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    id,
    [`${tenantId}/${QUERY_KEY}`]
  );

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: officesStatus,
    data: offices,
    error: officesError,
  } = useGet<Office[]>(`${tenantId}/offices`, [`${tenantId}/offices`]);

  let selectOfficeOptions: any = [];

  if (officesStatus === "success") {
    selectOfficeOptions = offices.map((office: Office) => {
      return { value: office.id, label: office.name };
    });
  }

  const {
    status: glAccountsStatus,
    data: glAccounts,
    error: glAccountsError,
  } = useGet<GLAccount[]>(`${tenantId}/gl-accounts`, [
    `${tenantId}/gl-accounts`,
  ]);

  let selectAccountsOptions: any = [];

  if (glAccountsStatus === "success") {
    selectAccountsOptions = glAccounts.map((account: GLAccount) => {
      return { value: account.id, label: account.name };
    });
  }

  const {
    status: debitTagsStatus,
    data: debitTags,
    error: debitTagsError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"accounting-rule-debit-tag"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"accounting-rule-debit-tag"}}`]
  );

  let debitTagsOptions: any = [];

  if (debitTagsStatus === "success" && debitTags[0]?.codeValues) {
    debitTagsOptions = debitTags[0]?.codeValues
      .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
      .filter(
        (code: CodeValue) => code.isActive && code.tenantId === Number(tenantId)
      )
      .map((code: { id: number; codeValue: string }) => {
        return { value: code.id, label: code.codeValue };
      });
  }

  const {
    status: creditTagsStatus,
    data: creditTags,
    error: creditTagsError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"accounting-rule-credit-tag"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"accounting-rule-credit-tag"}}`]
  );

  let creditTagsOptions: any = [];

  if (creditTagsStatus === "success" && creditTags[0]?.codeValues) {
    creditTagsOptions = creditTags[0]?.codeValues
      .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
      .filter(
        (code: CodeValue) => code.isActive && code.tenantId === Number(tenantId)
      )
      .map((code: { id: number; codeValue: string }) => {
        return { value: code.id, label: code.codeValue };
      });
  }

  const {
    status: accountingRuleStatus,
    data: accountingRule,
    error: accountingRuleError,
  } = useGetById<AccountingRule>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (
      submitType === "update" &&
      accountingRuleStatus === "success" &&
      accountingRule
    ) {
      let editObject = {
        name: accountingRule.name,
        officeId: accountingRule.office.id,
        debitAccountId: accountingRule.debitAccount?.id,
        creditAccountId: accountingRule.creditAccount?.id,
        description: accountingRule.description,
        allowMultipleDebits: accountingRule.allowMultipleDebits,
        allowMultipleCredits: accountingRule.allowMultipleCredits,
        debitTags: [],
        creditTags: [],
      };

      const accountingRuleTagsArray = accountingRule.accountingRuleTags;
      let debitTags: any = [];
      let creditTags: any = [];

      accountingRuleTagsArray?.map((accountingRuleTag: any) => {
        if (accountingRuleTag.tag?.code.name === "accounting-rule-debit-tag") {
          debitTags.push(accountingRuleTag.tagId);
        }

        if (accountingRuleTag.tag?.code.name === "accounting-rule-credit-tag") {
          creditTags.push(accountingRuleTag.tagId);
        }
      });

      editObject["debitTags"] = debitTags;
      editObject["creditTags"] = creditTags;

      form.setFieldsValue(editObject);
    }
  }, [submitType, accountingRuleStatus, accountingRule, form]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (!values.allowMultipleDebits) {
      values["allowMultipleDebits"] = false;
    }

    if (!values.allowMultipleCredits) {
      values["allowMultipleCredits"] = false;
    }

    let accountingRule = { ...values };
    delete accountingRule["debitTags"];
    delete accountingRule["creditTags"];

    let updatedValues = {
      accountingRule: { ...accountingRule, systemDefined: false },
      accountingRuleTags: {
        debitTags: values.debitTags,
        creditTags: values.creditTags,
      },
    };

    if (submitType === "create") {
      insertAccountingRule(
        { ...updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);

            toast({
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
              type: "success",
            });
            form.resetFields();
          },
          onError(error, variables, context) {
            toast({ response: error, type: "error" });
            setSubmitLoader(false);
          },
        }
      );
    } else {
      updateAccountingRule(
        { id, ...updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);

            toast({
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
              type: "success",
            });
          },
          onError(error, variables, context) {
            toast({ response: error, type: "error" });
            setSubmitLoader(false);
          },
        }
      );
    }
  }

  const onChangeDebitType = (e: RadioChangeEvent) => {
    if (e.target.value === 1) {
      setShowFixedDebitForm(true);
      setShowListAccountsDebitForm(false);
    }
    if (e.target.value === 2) {
      setShowListAccountsDebitForm(true);
      setShowFixedDebitForm(false);
    }
    setDebitValue(e.target.value);
  };

  const onChangeCreditType = (e: RadioChangeEvent) => {
    if (e.target.value === 1) {
      setShowFixedCreditForm(true);
      setShowListAccountsCreditForm(false);
    }
    if (e.target.value === 2) {
      setShowListAccountsCreditForm(true);
      setShowFixedCreditForm(false);
    }
    setCreditValue(e.target.value);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={`${PAGE_TITLE}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-12 gap-2"
    >
      <Form.Item
        className="col-span-6"
        name="name"
        label="Accounting Rule Name"
        rules={[
          { required: true, message: "Accounting Rule Name is required!" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        className="col-span-6"
        name="officeId"
        label="Office"
        rules={[{ required: true, message: "Office is required!" }]}
      >
        <Select
          options={selectOfficeOptions}
          allowClear
          showSearch
          filterOption={filterOption}
        />
      </Form.Item>

      <div className="col-span-2">Affected GL Entry (Debit) Rule Type</div>
      <div className="col-span-4">
        <Radio.Group onChange={onChangeDebitType} value={debitValue}>
          <Radio value={1}>Fixed Account</Radio>
          <Radio value={2}>List Of Accounts</Radio>
        </Radio.Group>
      </div>

      {showFixedDebitForm && (
        <Form.Item
          className="col-span-6"
          name="debitAccountId"
          label="Account To Debit"
          rules={[
            {
              required: showFixedDebitForm,
              message: "Account To Debit is required!",
            },
          ]}
        >
          <Select
            options={selectAccountsOptions}
            allowClear
            showSearch
            filterOption={filterOption}
          />
        </Form.Item>
      )}

      {showListAccountsDebitForm && (
        <>
          <Form.Item
            className="col-span-3"
            name="debitTags"
            label="Debit Tags"
            rules={[
              {
                required: showListAccountsDebitForm,
                message: "Debit Tags is required!",
              },
            ]}
          >
            <Select
              mode="multiple"
              options={debitTagsOptions}
              allowClear
              showSearch
              filterOption={filterOption}
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="allowMultipleDebits"
            label={" "}
            valuePropName="checked"
          >
            <Checkbox>Multiple Debit Entries Allowed</Checkbox>
          </Form.Item>
        </>
      )}

      <div className="col-span-2">Affected GL Entry (Credit) Rule Type</div>
      <div className="col-span-4">
        <Radio.Group onChange={onChangeCreditType} value={creditValue}>
          <Radio value={1}>Fixed Account</Radio>
          <Radio value={2}>List Of Accounts</Radio>
        </Radio.Group>
      </div>

      {showFixedCreditForm && (
        <Form.Item
          className="col-span-6"
          name="creditAccountId"
          label="Account To Credit"
          rules={[
            {
              required: showFixedCreditForm,
              message: "Account To Credit is required!",
            },
          ]}
        >
          <Select
            options={selectAccountsOptions}
            allowClear
            showSearch
            filterOption={filterOption}
          />
        </Form.Item>
      )}

      {showListAccountsCreditForm && (
        <>
          <Form.Item
            className="col-span-3"
            name="creditTags"
            label="Credit Tags"
            rules={[
              {
                required: showListAccountsCreditForm,
                message: "Credit Tags is required!",
              },
            ]}
          >
            <Select
              mode="multiple"
              options={creditTagsOptions}
              allowClear
              showSearch
              filterOption={filterOption}
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="allowMultipleCredits"
            label={" "}
            valuePropName="checked"
          >
            <Checkbox>Multiple Credit Entries Allowed</Checkbox>
          </Form.Item>
        </>
      )}

      <Form.Item className="col-span-12" name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <div className="col-span-12">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
