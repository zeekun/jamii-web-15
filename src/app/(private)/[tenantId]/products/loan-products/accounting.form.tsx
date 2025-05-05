"use client";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Divider, Form, Radio, RadioChangeEvent, Select } from "antd";
import { SetStateAction, useEffect, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useCreate, usePatch } from "@/api";
import {
  FeeIncomeAccount,
  FundSource,
  LoanCycle,
  LoanProduct,
  LoanProductAccountingRule,
  PenaltyIncomeAccount,
  SubmitType,
} from "@/types";
import toast from "@/utils/toast";
import { filterOption } from "@/utils/strings";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import {
  deleteObjectByKeyValueFromArray,
  formatAccountingRulesData,
  removeKeysFromObject,
} from "@/utils/arrays";
import AdvancedAccountingRules from "@/components/products/advanced-accounting-rules";
import { useGLAccounts } from "@/hooks/gl-accounts";
import useAdvancedAccountingRulesData from "@/hooks/advanced-accounting-rules-data";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/loading";

export default function AccountingForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<LoanProduct>;
  setFormValues: React.Dispatch<SetStateAction<Partial<LoanProduct>>>;
  submitType: SubmitType;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id?: number;
}) {
  const { tenantId } = useParams();
  const {
    current,
    setCurrent,
    formValues,
    setFormValues,
    submitType,
    id,
    setIsModalOpen,
  } = props;

  const router = useRouter();

  const [accountingRuleEnumValue, setAccountingRuleEnumValue] =
    useState<LoanProductAccountingRule>("NONE");
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

  const { mutate: insertLoanProduct } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateLoanProduct } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    id,
    [`${tenantId}/${QUERY_KEY}`]
  );

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

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

  useAdvancedAccountingRulesData<FundSource[]>(
    `${tenantId}/loan-products/${id}/loan-product-fund-sources`,
    submitType,
    setFundSourcesData
  );

  useAdvancedAccountingRulesData<FeeIncomeAccount[]>(
    `${tenantId}/loan-products/${id}/loan-product-fee-income-accounts`,
    submitType,
    setFeeIncomeAccountsData
  );

  useAdvancedAccountingRulesData<PenaltyIncomeAccount[]>(
    `${tenantId}/loan-products/${id}/loan-product-penalty-income-accounts`,
    submitType,
    setPenaltyIncomeAccountsData
  );

  const onFinish = (values: any) => {
    setFormValues({ ...formValues, ...values });
    setSubmitLoader(true);

    const { accountingRuleEnum, ...newValues } = values;

    console.log(newValues);

    let formattedAccountingValues = formatAccountingRulesData(newValues);

    console.log("formattedAccountingValues", formattedAccountingValues);

    let loanProduct = removeKeysFromObject(formValues, [
      "id",
      "charges",
      "loanProductAccountings",
      "loanProductVariationsBorrowerCycles",
      "loanProductSettingsAndTerms",
      "amortization",
      "repaymentStrategy",
      "arrearsTolerance",
      "moratorium",
      "interestMethod",
      "interestCalculationPeriod",
      "repaidEvery",
      "termsAndSettings",
      "fundSources",
      "feeIncomeAccounts",
      "penaltyIncomeAccounts",
      "fund",
      "loanTransactionProcessingStrategy",
      "fundSourceId",
      "loanPortfolioId",
      "transferInSuspenseId",
      "incomeFromInterestId",
      "incomeFromFeesId",
      "incomeFromPenaltiesId",
      "incomeFromRecoveryRepaymentsId",
      "lossesWrittenOffId",
      "overPaymentLiabilityId",
    ]);

    loanProduct["accountingRuleEnum"] = accountingRuleEnum;
    loanProduct["advancedAccountingRules"] = values.advancedAccountingRules;

    const formValuesChargesIds = formValues.charges?.map((charge) => {
      return charge.id;
    });

    console.log("formattedAccountingValues two", formattedAccountingValues);

    let updatedValues: any = {
      loanProduct,
      charges: formValuesChargesIds,
      accounting: formattedAccountingValues,
      loanProductSettingsAndTerms: formValues.loanProductSettingsAndTerms,
      loanProductVariationsBorrowerCycles:
        formValues.loanProductVariationsBorrowerCycles,
      fundSources: fundSourcesData,
      feeIncomeAccounts: feeIncomeAccountsData,
      penaltyIncomeAccounts: penaltyIncomeAccountsData,
    };

    updatedValues["accounting"] = deleteObjectByKeyValueFromArray(
      formattedAccountingValues,
      "name",
      "Advanced Accounting Rules"
    );

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertLoanProduct(updatedValues, {
        onSuccess: (response: any) => {
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          setCurrent(0);

          if (response.id) {
            router.push(`${window.location.pathname}/${response.id}`);
          }
          setIsModalOpen(false);

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
      //delete ids if any as api will not accept it
      if (
        updatedValues.loanProductVariationsBorrowerCycles !== undefined &&
        updatedValues.loanProductVariationsBorrowerCycles.length > 0
      ) {
        updatedValues.loanProductVariationsBorrowerCycles.map(
          (loanCycle: LoanCycle) => {
            delete loanCycle.id;
          }
        );
      }

      delete updatedValues.loanProductSettingsAndTerms.id;

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

      updateLoanProduct(updatedValues, {
        onSuccess: () => {
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          setIsModalOpen(false);
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
    if (submitType === "update" && formValues.accountingRuleEnum) {
      setAccountingRuleEnumValue(formValues.accountingRuleEnum);
    }
  }, [submitType, formValues.accountingRuleEnum]);

  useEffect(() => {
    if (submitType === "update" && formValues.advancedAccountingRules) {
      setAdvancedAccountingRulesChecked(formValues.advancedAccountingRules);
    }
  }, [submitType, formValues.advancedAccountingRules]);

  useEffect(() => {
    if (
      submitType === "update" &&
      formValues.advancedAccountingRules === true
    ) {
      setShowAdvancedAccountingRulesInputs(true);
    }
  }, [submitType, formValues.advancedAccountingRules]);

  const onChangeAdvancedAccountingRules = (e: CheckboxChangeEvent) => {
    setShowAdvancedAccountingRulesInputs(e.target.checked);
    setAdvancedAccountingRulesChecked(e.target.checked);
  };

  const onChangeAccountingRule = (e: RadioChangeEvent) => {
    setAccountingRuleEnumValue(e.target.value);
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
      className="grid grid-cols-6 gap-2 text-left"
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
        >
          <Radio value={"NONE"}>None</Radio>
          <Radio value={"CASH"}>Cash</Radio>
          <Radio value={"ACCRUAL (PERIODIC)"}>Accrual (Periodic)</Radio>
          <Radio value={"ACCRUAL (UPFRONT)"}>Accrual (Upfront)</Radio>
        </Radio.Group>
      </Form.Item>

      {accountingRuleEnumValue === "NONE" ? null : (
        <>
          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Assets
          </Divider>
          <Form.Item
            className="col-span-3"
            name="fundSourceId"
            label="Fund Source"
            rules={[{ required: true, message: "Fund Source is required!" }]}
          >
            <Select
              filterOption={filterOption}
              allowClear
              showSearch
              options={glAssetAccountsOptions}
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="loanPortfolioId"
            label="Loan Portfolio"
            rules={[{ required: true, message: "Loan Portfolio is required!" }]}
          >
            <Select
              filterOption={filterOption}
              allowClear
              showSearch
              options={glAssetAccountsOptions}
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="transferInSuspenseId"
            label="Transfer In Suspense"
            rules={[
              { required: true, message: "Transfer In Suspense is required!" },
            ]}
          >
            <Select
              filterOption={filterOption}
              allowClear
              showSearch
              options={glAssetAccountsOptions}
            />
          </Form.Item>

          {(accountingRuleEnumValue === "ACCRUAL (PERIODIC)" ||
            accountingRuleEnumValue === "ACCRUAL (UPFRONT)") && (
            <>
              <Form.Item
                className="col-span-3"
                name="feesReceivableId"
                label="Fees Receivable"
                rules={[
                  { required: true, message: "Fees Receivable is required!" },
                ]}
              >
                <Select
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
                    required: true,
                    message: "Penalties Receivable is required!",
                  },
                ]}
              >
                <Select
                  filterOption={filterOption}
                  allowClear
                  showSearch
                  options={glAssetAccountsOptions}
                />
              </Form.Item>

              <Form.Item
                className="col-span-3"
                name="interestReceivableId"
                label="Interest Receivable"
                rules={[
                  {
                    required: true,
                    message: "Interest Receivable is required!",
                  },
                ]}
              >
                <Select
                  filterOption={filterOption}
                  allowClear
                  showSearch
                  options={glAssetAccountsOptions}
                />
              </Form.Item>
            </>
          )}

          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Income
          </Divider>

          <Form.Item
            className="col-span-3"
            name="incomeFromInterestId"
            label="Income From Interest"
            rules={[
              { required: true, message: "Income From Interest is required!" },
            ]}
          >
            <Select
              filterOption={filterOption}
              allowClear
              showSearch
              options={glIncomeAccountsOptions}
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="incomeFromFeesId"
            label="Income From Fees"
            rules={[
              { required: true, message: "Income From Fees is required!" },
            ]}
          >
            <Select
              filterOption={filterOption}
              allowClear
              showSearch
              options={glIncomeAccountsOptions}
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="incomeFromPenaltiesId"
            label="Income From Penalties"
            rules={[
              { required: true, message: "Income From Penalties is required!" },
            ]}
          >
            <Select
              filterOption={filterOption}
              allowClear
              showSearch
              options={glIncomeAccountsOptions}
            />
          </Form.Item>
          <Form.Item
            className="col-span-3"
            name="incomeFromRecoveryRepaymentsId"
            label="Income From Recovery Repayments"
            rules={[
              {
                required: true,
                message: "Income From Recovery Repayments is required!",
              },
            ]}
          >
            <Select
              filterOption={filterOption}
              allowClear
              showSearch
              options={glIncomeAccountsOptions}
            />
          </Form.Item>

          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Expenses
          </Divider>

          <Form.Item
            className="col-span-3"
            name="lossesWrittenOffId"
            label="Losses Written Off"
            rules={[
              {
                required: true,
                message: "Losses Written Off is required!",
              },
            ]}
          >
            <Select
              filterOption={filterOption}
              allowClear
              showSearch
              options={glExpenseAccountsOptions}
            />
          </Form.Item>

          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Liabilities
          </Divider>

          <Form.Item
            className="col-span-3"
            name="overPaymentLiabilityId"
            label="Over Payment Liability"
            rules={[
              {
                required: true,
                message: "Over Payment Liability is required!",
              },
            ]}
          >
            <Select
              filterOption={filterOption}
              allowClear
              showSearch
              options={glLiabilityAccountsOptions}
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
