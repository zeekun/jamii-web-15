"use client";
import { useCreate, useGet, useGetById, usePatch, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Charge, Currency, GLAccount, SubmitType, TaxGroup } from "@/types";
import { filterOption } from "@/utils/strings";
import {
  Checkbox,
  CheckboxProps,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import {
  chargeCalculationTypeClientOptions,
  chargeCalculationTypeLoanOptions,
  chargeCalculationTypeSavingOptions,
  chargeCalculationTypeShareOptions,
  chargeTimeTypeClientOptions,
  chargeTimeTypeLoanOptions,
  chargeTimeTypeSavingOptions,
  chargeTimeTypeShareOptions,
  ENDPOINT,
  PAGE_TITLE,
  QUERY_KEY,
} from "./constants";
import { useParams } from "next/navigation";
import Loading from "@/components/loading";
import toast from "@/utils/toast";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showLoanInputs, setShowLoanInputs] = useState(true);
  const [showClientInputs, setShowClientInputs] = useState(false);
  const [chargeTimeTypeOptions, setChargeTimeTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [chargeCalculationTypeOptions, setChargeCalculationTypeOptions] =
    useState<{ label: string; value: string }[]>([]);
  const [selectedChargeCalcTypeOption, setSelectedChargeCalcTypeOption] =
    useState<string>();
  const [
    initialChargeCalculationTypeOptions,
    setInitialChargeCalculationTypeOptions,
  ] = useState<{ label: string; value: string }[]>([]);
  const [chargeTimeTypeValue, setChargeTimeTypeValue] = useState<
    string | undefined
  >();
  const [isPenaltyErrorMessage, setIsPenaltyErrorMessage] =
    useState<string>("");
  const [isPenaltyChecked, setIsPenaltyChecked] = useState(false);
  const [showAllInputs, setShowAllInputs] = useState(false);
  const [showRepeatEvery, setShowRepeatEvery] = useState(false);
  const [repeatEveryDuration, setRepeatEveryDuration] = useState("");
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [chargeCalcErrorMessage, setChargeCalcErrorMessage] =
    useState<string>("");

  const { mutate: insertCharge } = useCreate<Charge>(
    `${tenantId}/${ENDPOINT}`,
    [`${tenantId}/${QUERY_KEY}?filter={"order":["id DESC"]}`]
  );

  const { mutate: updateCharge } = usePatchV2(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/${QUERY_KEY}?filter={"order":["id DESC"]}`,
    `${tenantId}/charges`,
    `${id}`,
  ]);

  const {
    status: taxGroupsStatus,
    data: taxGroups,
    error: taxGroupsError,
  } = useGet<TaxGroup[]>(`${tenantId}/tax-groups`, [`${tenantId}/tax-groups`]);

  let taxGroupsOptions: any = [];

  if (taxGroupsStatus === "success") {
    taxGroupsOptions = taxGroups.map((taxGroup: TaxGroup) => {
      return {
        value: taxGroup.id,
        label: taxGroup.name,
      };
    });
  }

  const {
    status: glIncomeAccountStatus,
    data: glIncomeAccounts,
    error: glIncomeAccountsError,
  } = useGet<GLAccount[]>(`${tenantId}/gl-accounts?types=INCOME,LIABILITY`, [
    `${tenantId}/gl-accounts?types=INCOME,LIABILITY`,
  ]);

  let gAccountsOptions: any = [];

  if (glIncomeAccountStatus === "success") {
    gAccountsOptions = glIncomeAccounts.map((account: GLAccount) => {
      return {
        value: account.id,
        label: `${account.type.codeValue} (${account.glCode}) ${account.name}`,
      };
    });
  }

  const {
    status: currenciesStatus,
    data: currencies,
    error: currenciesError,
  } = useGet<Currency[]>(`${tenantId}/currencies`, [`${tenantId}/currencies`]);

  let currenciesOptions: any = [];

  if (currenciesStatus === "success") {
    currenciesOptions = currencies?.map((currency: Currency) => {
      return {
        value: currency.code,
        label: currency.name,
      };
    });
  }

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: chargeStatus,
    data: charge,
    error: chargeError,
  } = useGetById<Charge>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (submitType === "update" && chargeStatus === "success" && charge) {
      setShowAllInputs(true);
      setShowLoanInputs(false);
      setShowClientInputs(false);

      setShowRepeatEvery(false);
      setRepeatEveryDuration("");
      if (charge.chargeTimeTypeEnum === "MONTHLY FEE") {
        setShowRepeatEvery(true);
        setRepeatEveryDuration("Months");
      } else if (charge.chargeTimeTypeEnum === "WEEKLY FEE") {
        setShowRepeatEvery(true);
        setRepeatEveryDuration("Weeks");
      }

      if (charge.chargeAppliesToEnum === "LOANS") {
        setShowLoanInputs(true);
        setChargeTimeTypeOptions(chargeTimeTypeLoanOptions);
        setChargeCalculationTypeOptions(chargeCalculationTypeLoanOptions);
        setInitialChargeCalculationTypeOptions(
          chargeCalculationTypeLoanOptions
        );
        if (charge.chargeTimeTypeEnum === "TRANCHE DISBURSEMENT") {
          setChargeCalculationTypeOptions([
            {
              value: "FLAT",
              label: "Flat",
            },
            {
              value: "% APPROVED AMOUNT",
              label: "% Approved Amount",
            },
            {
              value: "% DISBURSEMENT AMOUNT",
              label: "% Disbursement Amount",
            },
          ]);
        } else {
          setChargeCalculationTypeOptions(initialChargeCalculationTypeOptions);
        }
      } else if (charge.chargeAppliesToEnum === "SAVINGS AND DEPOSITS") {
        setChargeTimeTypeOptions(chargeTimeTypeSavingOptions);
        setChargeCalculationTypeOptions(chargeCalculationTypeSavingOptions);
        setInitialChargeCalculationTypeOptions(
          chargeCalculationTypeSavingOptions
        );
      } else if (charge.chargeAppliesToEnum === "CLIENTS") {
        setShowClientInputs(true);
        setChargeTimeTypeOptions(chargeTimeTypeClientOptions);
        setChargeCalculationTypeOptions(chargeCalculationTypeClientOptions);
        setInitialChargeCalculationTypeOptions(
          chargeCalculationTypeClientOptions
        );
      } else if (charge.chargeAppliesToEnum === "SHARES") {
        setChargeTimeTypeOptions(chargeTimeTypeShareOptions);
        setChargeCalculationTypeOptions(chargeCalculationTypeShareOptions);
        setInitialChargeCalculationTypeOptions(
          chargeCalculationTypeShareOptions
        );
      }

      form.setFieldsValue(charge);
    }
  }, [
    submitType,
    chargeStatus,
    charge,
    initialChargeCalculationTypeOptions,
    form,
  ]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertCharge(values, {
        onSuccess: () => {
          setSubmitLoader(false);
          setIsModalOpen(false);
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
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
      if (!values.taxGroupId) delete values["taxGroupId"];

      updateCharge(
        { id, ...values },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            toast({
              type: "success",
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            });
          },
          onError(error, variables, context) {
            toast({
              type: "error",
              response: error,
            });

            setSubmitLoader(false);
          },
        }
      );
    }
  }

  function onChargesAppliesToChange(value: string) {
    setShowAllInputs(true);
    setShowLoanInputs(false);
    setShowClientInputs(false);

    if (value === "LOANS") {
      setShowLoanInputs(true);
      setChargeTimeTypeOptions(chargeTimeTypeLoanOptions);
      setChargeCalculationTypeOptions(chargeCalculationTypeLoanOptions);
      setInitialChargeCalculationTypeOptions(chargeCalculationTypeLoanOptions);
    } else if (value === "SAVINGS AND DEPOSITS") {
      setChargeTimeTypeOptions(chargeTimeTypeSavingOptions);
      setChargeCalculationTypeOptions(chargeCalculationTypeSavingOptions);
      setInitialChargeCalculationTypeOptions(
        chargeCalculationTypeSavingOptions
      );
    } else if (value === "CLIENTS") {
      setShowClientInputs(true);
      setChargeTimeTypeOptions(chargeTimeTypeClientOptions);
      setChargeCalculationTypeOptions(chargeCalculationTypeClientOptions);
      setInitialChargeCalculationTypeOptions(
        chargeCalculationTypeClientOptions
      );
    } else if (value === "SHARES") {
      setChargeTimeTypeOptions(chargeTimeTypeShareOptions);
      setChargeCalculationTypeOptions(chargeCalculationTypeShareOptions);
      setInitialChargeCalculationTypeOptions(chargeCalculationTypeShareOptions);
    }
  }

  function validateRules(
    chargeTimeType: string,
    isPenalty: boolean,
    chargeCalcType: string
  ) {
    setSubmitDisabled(false);
    setIsPenaltyErrorMessage("");
    setChargeCalcErrorMessage("");

    if (chargeTimeType === "OVERDUE FEE" && !isPenalty) {
      setIsPenaltyErrorMessage("Overdue Charge must be a penalty");
      setSubmitDisabled(true);
    }

    if (chargeTimeType === "DISBURSEMENT" && isPenalty) {
      setIsPenaltyErrorMessage(
        "Charge cannot be setup as a penalty due at disbursement"
      );
      setSubmitDisabled(true);
    }

    if (
      chargeTimeType === "TRANCHE DISBURSEMENT" &&
      chargeCalcType === "% APPROVED AMOUNT"
    ) {
      setChargeCalcErrorMessage(
        "The selected charge calculation type option is invalid"
      );
      setSubmitDisabled(true);
    }
  }

  function onChargeTimeTypeChange(value: string) {
    setShowRepeatEvery(false);
    setRepeatEveryDuration("");
    if (value === "MONTHLY FEE") {
      setShowRepeatEvery(true);
      setRepeatEveryDuration("Months");
    } else if (value === "WEEKLY FEE") {
      setShowRepeatEvery(true);
      setRepeatEveryDuration("Weeks");
    }

    setChargeTimeTypeValue(value);
    if (value === "TRANCHE DISBURSEMENT") {
      setChargeCalculationTypeOptions([
        {
          value: "FLAT",
          label: "Flat",
        },
        {
          value: "% APPROVED AMOUNT",
          label: "% Approved Amount",
        },
        {
          value: "% DISBURSEMENT AMOUNT",
          label: "% Disbursement Amount",
        },
      ]);
    } else {
      setChargeCalculationTypeOptions(initialChargeCalculationTypeOptions);
    }
    validateRules(value, isPenaltyChecked, selectedChargeCalcTypeOption ?? "");
  }

  function onChangeChargeCalculationType(value: string) {
    setSelectedChargeCalcTypeOption(value);
    validateRules(chargeTimeTypeValue ?? "", isPenaltyChecked, value);
  }

  const onChangeIsPenalty: CheckboxProps["onChange"] = (e) => {
    setIsPenaltyChecked(e.target.checked);

    validateRules(
      chargeTimeTypeValue ?? "",
      e.target.checked,
      selectedChargeCalcTypeOption ?? ""
    );
  };

  if (submitType === "update" && chargeStatus !== "success") {
    return <Loading />;
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-6 gap-2"
    >
      <>
        <Form.Item
          className="col-span-3"
          name="chargeAppliesToEnum"
          label="Charge Applies To"
          rules={[
            { required: true, message: "Charge Applies To is required!" },
          ]}
        >
          <Select
            onChange={onChargesAppliesToChange}
            allowClear
            style={{ width: "100%" }}
            disabled={submitType === "update" ? true : false}
          >
            <option value={"LOANS"}>Loans</option>
            <option value={"SAVINGS AND DEPOSITS"}>Savings And Deposits</option>
            <option value={"CLIENTS"}>Clients</option>
            <option value={"SHARES"}>Shares</option>
          </Select>
        </Form.Item>

        {showAllInputs && (
          <>
            {" "}
            <Form.Item
              className="col-span-3"
              name="name"
              label="Name"
              rules={[{ required: true, message: "Name is required!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="col-span-3"
              name="currencyId"
              label="Currency"
              rules={[
                {
                  required: true,
                  message: "Currency is required!",
                },
              ]}
            >
              <Select
                filterOption={filterOption}
                showSearch
                allowClear
                options={currenciesOptions}
              />
            </Form.Item>
            <Form.Item
              className="col-span-3"
              name="chargeTimeTypeEnum"
              label="Charge Time Type"
              rules={[
                { required: true, message: "Charge Time Type is required!" },
              ]}
            >
              <Select
                options={chargeTimeTypeOptions}
                onChange={onChargeTimeTypeChange}
              />
            </Form.Item>
            <Form.Item
              className="col-span-3"
              name="chargeCalculationTypeEnum"
              label="Charge Calculation Type"
              rules={[
                {
                  required: true,
                  message: "Charge Calculation Type is required!",
                },
              ]}
            >
              <Select
                options={chargeCalculationTypeOptions}
                onChange={onChangeChargeCalculationType}
              />
            </Form.Item>
            <span className="col-span-6 text-red-500">
              {chargeCalcErrorMessage}
            </span>
            {showRepeatEvery && (
              <>
                <Form.Item
                  className="col-span-3"
                  name="feeInterval"
                  label="Repeats Every"
                  rules={[
                    { required: true, message: "Fee Interval is required!" },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
                <div className="col-span-3 flex items-center">
                  {repeatEveryDuration}
                </div>
              </>
            )}
            {showLoanInputs ? (
              <Form.Item
                className="col-span-3"
                name="chargePaymentModeEnum"
                label="Charge Payment Mode"
                rules={[
                  {
                    required: showLoanInputs,
                    message: "Charge Payment Mode is required!",
                  },
                ]}
              >
                <Select>
                  <option value={"REGULAR"}>Regular</option>
                  <option value={"ACCOUNT TRANSFER"}>Account Transfer</option>
                </Select>
              </Form.Item>
            ) : null}
            <Form.Item
              className="col-span-3"
              name="amount"
              label="Amount"
              rules={[{ required: true, message: "Amount is required!" }]}
            >
              <InputNumber
                className="w-full"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
            <div className="col-span-3">
              <div className="grid grid-cols-6">
                <Form.Item
                  name="isActive"
                  className="col-span-3 flex justify-start items-baseline"
                  valuePropName="checked"
                  label={" "}
                >
                  <Checkbox>Active</Checkbox>
                </Form.Item>

                <Form.Item
                  name="isPenalty"
                  className="col-span-3 flex justify-start items-baseline"
                  valuePropName="checked"
                  label={" "}
                >
                  <Checkbox onChange={onChangeIsPenalty}>Is Penalty?</Checkbox>
                </Form.Item>
                <div className="text-red-500 col-span-6">
                  {isPenaltyErrorMessage}
                </div>
              </div>
            </div>
            {showClientInputs ? (
              <Form.Item
                className="col-span-3"
                name="incomeOrLiabilityAccountId"
                label="Income From Charge"
                rules={[
                  {
                    required: showClientInputs,
                    message: "Income From Charge is required!",
                  },
                ]}
              >
                <Select
                  filterOption={filterOption}
                  showSearch
                  allowClear
                  options={gAccountsOptions}
                />
              </Form.Item>
            ) : null}
            <Form.Item
              className="col-span-3"
              name="taxGroupId"
              label="Tax Group"
            >
              <Select
                filterOption={filterOption}
                showSearch
                allowClear
                options={taxGroupsOptions}
              />
            </Form.Item>
          </>
        )}

        <div className="col-span-6 ">
          <FormSubmitButtons
            submitLoader={submitLoader}
            submitDisabled={submitDisabled}
            onReset={onReset}
          />
        </div>
      </>
    </Form>
  );
}
