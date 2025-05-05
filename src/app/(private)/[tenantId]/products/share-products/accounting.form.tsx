"use client";
import { useCreate, usePatch } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Divider, Form, Radio, RadioChangeEvent, Select } from "antd";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import {
  FeeIncomeAccount,
  FundSource,
  InterestRateSlab,
  PenaltyIncomeAccount,
  ShareProduct,
  SubmitType,
} from "@/types";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import {
  deleteObjectByKeyValueFromArray,
  formatAccountingRulesData,
} from "@/utils/arrays";
import { useGLAccounts } from "@/hooks/gl-accounts";
import { useParams } from "next/navigation";
import Tooltip_ from "@/components/tooltip";
import Loading from "@/components/loading";

export default function AccountingForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<ShareProduct>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<ShareProduct>>>;
  submitType?: SubmitType;
  id?: number;
}) {
  const { tenantId } = useParams();
  const {
    current,
    setCurrent,
    formValues,
    setFormValues,
    submitType = "create",
    id,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [accountingRuleEnumValue, setAccountingRuleEnumValue] = useState<
    "NONE" | "CASH"
  >("NONE");

  const { mutate: insertSavingsProduct } = useCreate(
    `${tenantId}/${ENDPOINT}`,
    [`${tenantId}/${QUERY_KEY}`]
  );
  const { mutate: updateSavingsProduct } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    id,
    [`${tenantId}/${QUERY_KEY}`]
  );

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const {
    options: glAssetAccountsOptions,
    status: glAssetAccountStatus,
    error: glAssetAccountsError,
  } = useGLAccounts("ASSET", `${tenantId}`, "DETAIL");
  const {
    options: glIncomeAccountsOptions,
    status: glIncomeAccountStatus,
    error: glIncomeAccountsError,
  } = useGLAccounts("INCOME", `${tenantId}`, "DETAIL");
  const {
    options: glEquityAccountsOptions,
    status: glEquityAccountStatus,
    error: glEquityAccountsError,
  } = useGLAccounts("EQUITY", `${tenantId}`, "DETAIL");
  const {
    options: glLiabilityAccountsOptions,
    status: glLiabilityAccountStatus,
    error: glLiabilityAccountsError,
  } = useGLAccounts("LIABILITY", `${tenantId}`, "DETAIL");

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (values: any) => {
    setFormValues({ ...formValues, ...values });
    setSubmitLoader(true);

    const formattedAccountingValues = formatAccountingRulesData(values);
    formattedAccountingValues.shift(); //remove accountingRuleEnum value from array

    const formValuesChargesIds = formValues.charges?.map((charge) => {
      return charge.id;
    });

    const shareProduct: Partial<ShareProduct> = {
      name: formValues.name,
      shortName: formValues.shortName,
      description: formValues.description,
      currencyCode: formValues.currencyCode,
      currencyMultiplesOf: formValues.currencyMultiplesOf,
      externalId: formValues.externalId,
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      totalShares: formValues.totalShares,
      issuedShares: formValues.issuedShares,
      totalSubscribedShares: formValues.totalSubscribedShares,
      unitPrice: formValues.unitPrice,
      capitalAmount: formValues.capitalAmount,
      minimumClientShares: formValues.minimumClientShares,
      nominalClientShares: formValues.nominalClientShares,
      maximumClientShares: formValues.maximumClientShares,
      minimumActivePeriodFrequency: formValues.minimumActivePeriodFrequency,
      minimumActivePeriodFrequencyEnum:
        formValues.minimumActivePeriodFrequencyEnum,
      lockInPeriodFrequency: formValues.lockInPeriodFrequency,
      lockInPeriodFrequencyEnum: formValues.lockInPeriodFrequencyEnum,
      allowDividendsInactiveClients: formValues.allowDividendsInactiveClients,
      accountingTypeEnum: values.accountingTypeEnum,
    };

    let updatedValues: any = {
      shareProduct,
      charges: formValuesChargesIds,
      accounting: formattedAccountingValues,
      shareProductMarketPrices: formValues.shareProductMarketPrices,
    };

    updatedValues["accounting"] = deleteObjectByKeyValueFromArray(
      updatedValues.accounting,
      "name",
      "Advanced Accounting Rules"
    );

    //delete ids if any as api will not accept it
    if (
      updatedValues.interestRateSlabs !== undefined &&
      updatedValues.interestRateSlabs.length > 0
    ) {
      updatedValues.interestRateSlabs.map(
        (interestRateSlab: InterestRateSlab) => {
          delete interestRateSlab.id;
        }
      );
    }

    if (
      updatedValues.fundSources !== undefined &&
      updatedValues.fundSources.length > 0
    ) {
      updatedValues.fundSources.map((fundSource: FundSource) => {
        delete fundSource.id;
      });
    }

    if (
      updatedValues.feeIncomeAccounts !== undefined &&
      updatedValues.feeIncomeAccounts.length > 0
    ) {
      updatedValues.feeIncomeAccounts.map(
        (feeIncomeAccount: FeeIncomeAccount) => {
          delete feeIncomeAccount.id;
        }
      );
    }

    if (
      updatedValues.penaltyIncomeAccounts !== undefined &&
      updatedValues.penaltyIncomeAccounts.length > 0
    ) {
      updatedValues.penaltyIncomeAccounts.map(
        (penaltyIncomeAccount: PenaltyIncomeAccount) => {
          delete penaltyIncomeAccount.id;
        }
      );
    }

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertSavingsProduct(updatedValues, {
        onSuccess: () => {
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });
        },
        onSettled: () => {
          setSubmitLoader(false);
        },
      });
    } else {
      updateSavingsProduct(updatedValues, {
        onSuccess: () => {
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });
          setSubmitLoader(false);
        },
        onSettled: () => {
          setSubmitLoader(false);
        },
      });
    }
  };

  useEffect(() => {
    if (submitType === "update") {
      if (formValues.accountingTypeEnum)
        setAccountingRuleEnumValue(formValues.accountingTypeEnum);
    }
  }, [submitType, formValues.accountingTypeEnum]);

  const onChangeAccountingRule = (e: RadioChangeEvent) => {
    setAccountingRuleEnumValue(e.target.value);
  };

  if (
    glAssetAccountStatus === "pending" &&
    glIncomeAccountStatus === "pending" &&
    glEquityAccountStatus === "pending" &&
    glLiabilityAccountStatus === "pending"
  ) {
    return <Loading />;
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={"accountingForm"}
      onFinish={onFinish}
      className="text-left grid grid-cols-6 gap-2 justify-start"
    >
      <Form.Item
        className="col-span-6 flex justify-start"
        name="accountingTypeEnum"
        label="Accounting Rule"
        rules={[
          {
            required: true,
            message: "Accounting Rule is required!",
          },
        ]}
        initialValue="NONE"
      >
        <Radio.Group
          className="col-span-6"
          onChange={onChangeAccountingRule}
          value={accountingRuleEnumValue}
          defaultValue="NONE"
          name="accountingTypeEnum"
        >
          <Radio value={"NONE"}>None</Radio>
          <Radio value={"CASH"}>Cash</Radio>
        </Radio.Group>
      </Form.Item>

      {accountingRuleEnumValue === "NONE" ? null : (
        <>
          {" "}
          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Assets
          </Divider>
          <Form.Item
            className="col-span-3"
            name="shareReferenceId"
            label={
              <Tooltip_
                inputLabel="Share Reference"
                title="An Asset account (typically a cash account) to which the amount is debited when new shares purchased by the account and credited when the account holder makes a redeem"
              />
            }
            rules={[
              {
                required: true,
                message: "Share Reference is required!",
              },
            ]}
          >
            <Select
              className="text-left"
              filterOption={filterOption}
              allowClear
              showSearch
              options={glAssetAccountsOptions}
            />
          </Form.Item>
          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Liabilities
          </Divider>
          <Form.Item
            className="col-span-3"
            name="shareSuspenseControlId"
            label={
              <Tooltip_
                inputLabel="Share Suspense Control"
                title="A Liability account which denotes the Share Deposit Accounts portfolio is debited when Share Purchase is approved and credited when Share Purchase is rejected."
              />
            }
            rules={[
              {
                required: true,
                message: "Saving Control is required!",
              },
            ]}
          >
            <Select
              className="text-left"
              filterOption={filterOption}
              allowClear
              showSearch
              options={glLiabilityAccountsOptions}
            />
          </Form.Item>
          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Share Equity
          </Divider>
          <Form.Item
            className="col-span-3"
            name="equityId"
            label={
              <Tooltip_
                inputLabel="Equity"
                title="An Equity account which is debited when shares purchase is approved"
              />
            }
            rules={[
              {
                required: true,
                message: "Equity is required!",
              },
            ]}
          >
            <Select
              className="text-left"
              filterOption={filterOption}
              allowClear
              showSearch
              options={glEquityAccountsOptions}
            />
          </Form.Item>
          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Income
          </Divider>
          <Form.Item
            className="col-span-3"
            name="incomeFromFeesId"
            label={
              <Tooltip_
                inputLabel="Income From Fees"
                title="An Income account which is credited when a fee is paid by an account holder on this account"
              />
            }
            rules={[
              {
                required: true,
                message: "Income From Fees is required!",
              },
            ]}
          >
            <Select
              className="text-left"
              filterOption={filterOption}
              allowClear
              showSearch
              options={glIncomeAccountsOptions}
            />
          </Form.Item>
        </>
      )}

      <div className="col-span-6 ">
        <FormSubmitButtonsStep
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
