"use client";
import { useCreate, usePatch, usePatchV2 } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Divider, Form, Radio, RadioChangeEvent, Select } from "antd";
import { useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import {
  FeeIncomeAccount,
  FundSource,
  PenaltyIncomeAccount,
  SavingsProduct,
  SubmitType,
} from "@/types";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import AdvancedAccountingRules from "@/components/products/advanced-accounting-rules";
import {
  deleteObjectByKeyValueFromArray,
  formatAccountingRulesData,
} from "@/utils/arrays";
import { useGLAccounts } from "@/hooks/gl-accounts";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/loading";

export default function AccountingForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<SavingsProduct>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<SavingsProduct>>>;
  submitType?: SubmitType;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id?: number;
}) {
  const { tenantId } = useParams();
  const {
    current,
    setCurrent,
    formValues,
    setFormValues,
    submitType = "create",
    setIsModalOpen,
    id,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [accountingRuleEnumValue, setAccountingRuleEnumValue] = useState<
    "NONE" | "CASH" | "ACCRUAL (PERIODIC)"
  >("NONE");
  const [fundSourcesData, setFundSourcesData] = useState<FundSource[]>([]);
  const [feeIncomeAccountsData, setFeeIncomeAccountsData] = useState<
    FeeIncomeAccount[]
  >([]);
  const [penaltyIncomeAccountsData, setPenaltyIncomeAccountsData] = useState<
    PenaltyIncomeAccount[]
  >([]);
  const [
    showAdvancedAccountingRulesInputs,
    setShowAdvancedAccountingRulesInputs,
  ] = useState(false);
  const [advancedAccountingRulesChecked, setAdvancedAccountingRulesChecked] =
    useState(false);

  const { mutate: insertSavingsProduct } = useCreate(
    `${tenantId}/${ENDPOINT}`,
    [
      `${tenantId}/savings-products?filter={"where":{"depositTypeEnum":"SAVING DEPOSIT"},"order":["id DESC"]}`,
    ]
  );
  const { mutate: updateSavingsProduct } = usePatchV2(
    `${tenantId}/${ENDPOINT}`,
    id,
    [
      `${tenantId}/savings-products?filter={"where":{"depositTypeEnum":"SAVING DEPOSIT"},"order":["id DESC"]}`,
    ]
  );

  const router = useRouter();

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  useEffect(() => {
    if (submitType === "update" && formValues.advancedAccountingRules) {
      setAdvancedAccountingRulesChecked(formValues.advancedAccountingRules);
    }
  }, [submitType, formValues.advancedAccountingRules]);

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
    options: glExpenseAccountsOptions,
    status: glExpenseAccountStatus,
    error: glExpenseAccountsError,
  } = useGLAccounts("EXPENSE", `${tenantId}`, "DETAIL");
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

    let updatedValues: any = {
      savingsProduct: {
        name: formValues.name,
        shortName: formValues.shortName,
        description: formValues.description,
        depositTypeEnum: "SAVING DEPOSIT",
        currencyCode: formValues.currencyCode,
        inMultiplesOf: formValues.inMultiplesOf,
        nominalAnnualInterestRate: formValues.nominalAnnualInterestRate,
        interestCompoundingPeriodTypeEnum:
          formValues.interestCompoundingPeriodTypeEnum,
        interestPostingPeriodTypeEnum: formValues.interestPostingPeriodTypeEnum,
        interestCalculationTypeEnum: formValues.interestCalculationTypeEnum,
        interestCalculationDaysInYearTypeEnum:
          formValues.interestCalculationDaysInYearTypeEnum,
        minRequiredOpeningBalance: formValues.minRequiredOpeningBalance,
        lockInPeriodFrequency: formValues.lockInPeriodFrequency,
        lockInPeriodFrequencyTypeEnum: formValues.lockInPeriodFrequencyTypeEnum,
        withdrawalFeeForTransfers: formValues.withdrawalFeeForTransfers,
        withDrawFeeAmount: formValues.withDrawFeeAmount,
        allowOverdraft: formValues.allowOverdraft,
        overdraftLimit: formValues.overdraftLimit,
        nominalAnnualInterestRateOverdraft:
          formValues.nominalAnnualInterestRateOverdraft,
        minOverdraftForInterestCalculation:
          formValues.minOverdraftForInterestCalculation,
        minBalanceForInterestCalculation:
          formValues.minBalanceForInterestCalculation,
        enforceMinRequiredBalance: formValues.enforceMinRequiredBalance,
        minRequiredBalance: formValues.minRequiredBalance,
        withHoldTax: formValues.withHoldTax,
        taxGroupId: formValues.taxGroupId,
        isDormancyTrackingActive: formValues.isDormancyTrackingActive,
        daysToInactive: formValues.daysToInactive,
        daysToDormant: formValues.daysToDormant,
        daysToEscheat: formValues.daysToEscheat,
        accountingRuleEnum: values.accountingRuleEnum,
        advancedAccountingRules: values.advancedAccountingRules,
      },
      charges: formValuesChargesIds,
      accounting: formattedAccountingValues,
      fundSources: fundSourcesData,
      feeIncomeAccounts: feeIncomeAccountsData,
      penaltyIncomeAccounts: penaltyIncomeAccountsData,
    };

    updatedValues["accounting"] = deleteObjectByKeyValueFromArray(
      updatedValues.accounting,
      "name",
      "Advanced Accounting Rules"
    );

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
        onSuccess: (response: any) => {
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
          setIsModalOpen(false);
          setCurrent(0);

          router.push(`savings-products/${response.id}`);
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
          setIsModalOpen(false);
          setCurrent(0);
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
      if (formValues.accountingRuleEnum)
        setAccountingRuleEnumValue(formValues.accountingRuleEnum);
    }
  }, [submitType, formValues.accountingRuleEnum]);

  useEffect(() => {
    if (
      submitType === "update" &&
      formValues.advancedAccountingRules === true
    ) {
      setShowAdvancedAccountingRulesInputs(true);
    }
  }, [submitType, formValues.advancedAccountingRules]);

  const onChangeAccountingRule = (e: RadioChangeEvent) => {
    setAccountingRuleEnumValue(e.target.value);
  };

  const onChangeAdvancedAccountingRules = (e: CheckboxChangeEvent) => {
    setShowAdvancedAccountingRulesInputs(e.target.checked);
    setAdvancedAccountingRulesChecked(e.target.checked);
  };

  if (
    glAssetAccountStatus === "pending" &&
    glIncomeAccountStatus === "pending" &&
    glExpenseAccountStatus === "pending" &&
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
      className="grid grid-cols-6 gap-2"
    >
      <Form.Item
        className="col-span-6 flex justify-start"
        name="accountingRuleEnum"
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
          name="accountingRuleEnum"
        >
          <Radio value={"NONE"}>None</Radio>
          <Radio value={"CASH"}>Cash</Radio>
          <Radio value={"ACCRUAL (PERIODIC)"}>Accrual (Periodic)</Radio>
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
            name="savingsReferenceId"
            label="Savings Reference"
            rules={[
              {
                required: true,
                message: "Savings Reference is required!",
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
          <Form.Item
            className="col-span-3"
            name="overdraftPortfolioId"
            label="Overdraft Portfolio"
            rules={[
              {
                required: true,
                message: "Overdraft Portfolio is required!",
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
          {accountingRuleEnumValue === "ACCRUAL (PERIODIC)" && (
            <>
              {" "}
              <Form.Item
                className="col-span-3"
                name="feesReceivableId"
                label="Fees Receivable"
                rules={[
                  {
                    required:
                      accountingRuleEnumValue === "ACCRUAL (PERIODIC)"
                        ? true
                        : false,
                    message: "Fees Receivable is required!",
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
              <Form.Item
                className="col-span-3"
                name="penaltiesReceivableId"
                label="Penalties Receivable"
                rules={[
                  {
                    required:
                      accountingRuleEnumValue === "ACCRUAL (PERIODIC)"
                        ? true
                        : false,
                    message: "Penalties Receivable is required!",
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
            </>
          )}
          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Liabilities
          </Divider>
          <Form.Item
            className="col-span-3"
            name="savingControlId"
            label="Saving Control"
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
          <Form.Item
            className="col-span-3"
            name="savingsTransfersInSuspenseId"
            label="Savings Transfers In Suspense"
            rules={[
              {
                required: true,
                message: "Savings Transfers In Suspense is required!",
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
          {accountingRuleEnumValue === "ACCRUAL (PERIODIC)" && (
            <>
              {" "}
              <Form.Item
                className="col-span-3"
                name="interestPayableId"
                label="Interest Payable"
                rules={[
                  {
                    required:
                      accountingRuleEnumValue === "ACCRUAL (PERIODIC)"
                        ? true
                        : false,
                    message: "Interest Payable is required!",
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
            </>
          )}
          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Expenses
          </Divider>
          <Form.Item
            className="col-span-3"
            name="interestOnSavingsId"
            label="Interest On Savings"
            rules={[
              {
                required: true,
                message: "Interest On Savings is required!",
              },
            ]}
          >
            <Select
              className="text-left"
              filterOption={filterOption}
              allowClear
              showSearch
              options={glExpenseAccountsOptions}
            />
          </Form.Item>
          <Form.Item
            className="col-span-3"
            name="writeOffId"
            label="Write-Off"
            rules={[
              {
                required: true,
                message: "Write-Off is required!",
              },
            ]}
          >
            <Select
              className="text-left"
              filterOption={filterOption}
              allowClear
              showSearch
              options={glExpenseAccountsOptions}
            />
          </Form.Item>
          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Income
          </Divider>
          <Form.Item
            className="col-span-3"
            name="incomeFromFeesId"
            label="Income From Fees"
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
          <Form.Item
            className="col-span-3"
            name="incomeFromPenalitiesId"
            label="Income From Penalities"
            rules={[
              {
                required: true,
                message: "Income from Penalities is required!",
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
          <Form.Item
            className="col-span-3"
            name="overdraftInterestIncomeId"
            label="Overdraft Interest Income"
            rules={[
              {
                required: true,
                message: "Overdraft Interest Income is required!",
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
          <AdvancedAccountingRules
            advancedAccountingRulesChecked={advancedAccountingRulesChecked}
            onChangeAdvancedAccountingRules={onChangeAdvancedAccountingRules}
            showAdvancedAccountingRulesInputs={
              showAdvancedAccountingRulesInputs
            }
            fundSourcesData={fundSourcesData}
            setFundSourcesData={setFundSourcesData}
            feeIncomeAccountsData={feeIncomeAccountsData}
            setFeeIncomeAccountsData={setFeeIncomeAccountsData}
            penaltyIncomeAccountsData={penaltyIncomeAccountsData}
            setPenaltyIncomeAccountsData={setPenaltyIncomeAccountsData}
          />
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
