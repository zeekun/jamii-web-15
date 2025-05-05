"use client";
import { useGet } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";
import {
  LoanProduct,
  LoanTransactionProcessingStrategy,
  SelectOption,
  SubmitType,
} from "@/types";
import { filterOption } from "@/utils/strings";
import { Checkbox, Divider, Form, Input, InputNumber, Select } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useParams } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

export default function SettingsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<LoanProduct>;
  setFormValues: React.Dispatch<SetStateAction<Partial<LoanProduct>>>;
  submitType: SubmitType;
  id?: number;
}) {
  const { tenantId } = useParams();
  const { current, setCurrent, formValues, setFormValues, submitType, id } =
    props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showMultipleDisbursementsInputs, setShowMultipleDisbursementsInputs] =
    useState(false);
  const [
    showAllowVariableInstallmentsInputs,
    setShowAllowVariableInstallmentsInputs,
  ] = useState(false);
  const [
    showInterestRecalculationEnabledInputs,
    setShowInterestRecalculationEnabledInputs,
  ] = useState(false);
  const [showHoldGuaranteeFundsInputs, setShowHoldGuaranteeFundsInputs] =
    useState(false);
  const [
    loanTransactionProcessingStrategyOptions,
    setLoanTransactionProcessingStrategyOptions,
  ] = useState<any>([]);
  const [
    showGlobalConfigValuesRepaymentEventInputs,
    setShowGlobalConfigValuesRepaymentEventInputs,
  ] = useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: loanTransactionProcessingStrategiesStatus,
    data: loanTransactionProcessingStrategies,
    error: loanTransactionProcessingStrategiesError,
  } = useGet<LoanTransactionProcessingStrategy[]>(
    `1/loan-transaction-processing-strategies`,
    [`1/loan-transaction-processing-strategies`]
  );

  useEffect(() => {
    if (loanTransactionProcessingStrategiesStatus === "success") {
      setLoanTransactionProcessingStrategyOptions(
        loanTransactionProcessingStrategies.map(
          (type: LoanTransactionProcessingStrategy): SelectOption => {
            return { value: type.id, label: type.name };
          }
        )
      );
    }
  }, [
    loanTransactionProcessingStrategies,
    loanTransactionProcessingStrategiesStatus,
  ]);

  useEffect(() => {
    if (submitType === "update") {
      form.setFieldValue(
        "termsAndSettings",
        formValues.loanProductSettingsAndTerms?.termsAndSettings
      );
      form.setFieldValue(
        "amortization",
        formValues.loanProductSettingsAndTerms?.amortization
      );
      form.setFieldValue(
        "repaymentStrategy",
        formValues.loanProductSettingsAndTerms?.repaymentStrategy
      );
      form.setFieldValue(
        "arrearsTolerance",
        formValues.loanProductSettingsAndTerms?.arrearsTolerance
      );
      form.setFieldValue(
        "moratorium",
        formValues.loanProductSettingsAndTerms?.moratorium
      );
      form.setFieldValue(
        "interestMethod",
        formValues.loanProductSettingsAndTerms?.interestMethod
      );
      form.setFieldValue(
        "interestCalculationPeriod",
        formValues.loanProductSettingsAndTerms?.interestCalculationPeriod
      );
      form.setFieldValue(
        "numDaysOverdueBeforeMovingIntoArrears",
        formValues.loanProductSettingsAndTerms
          ?.numDaysOverdueBeforeMovingIntoArrears
      );
      form.setFieldValue(
        "repaidEvery",
        formValues.loanProductSettingsAndTerms?.repaidEvery
      );
    }
  }, [submitType]);

  useEffect(() => {
    if (submitType === "update") {
      if (formValues.allowMultipleDisbursements) {
        setShowMultipleDisbursementsInputs(true);
      }

      if (formValues.allowVariableInstallments) {
        setShowAllowVariableInstallmentsInputs(true);
      }

      if (formValues.interestRecalculationEnabled) {
        setShowInterestRecalculationEnabledInputs(true);
      }

      if (formValues.holdGuaranteeFunds) {
        setShowHoldGuaranteeFundsInputs(true);
      }

      if (formValues.useGlobalConfigValuesRepaymentEvent) {
        setShowGlobalConfigValuesRepaymentEventInputs(true);
      }
    }
  }, [submitType]);

  const onFinish = (values: any) => {
    values["loanProductSettingsAndTerms"] = {
      termsAndSettings: values.termsAndSettings
        ? values.termsAndSettings
        : true,
      amortization: values.amortization ? values.amortization : true,
      repaymentStrategy: values.repaymentStrategy
        ? values.repaymentStrategy
        : true,
      arrearsTolerance: values.arrearsTolerance
        ? values.arrearsTolerance
        : true,
      moratorium: values.moratorium ? values.moratorium : true,
      interestMethod: values.interestMethod ? values.interestMethod : true,
      interestCalculationPeriod: values.interestCalculationPeriod
        ? values.interestCalculationPeriod
        : true,
      repaidEvery: values.repaidEvery ? values.repaidEvery : true,
      numDaysOverdueBeforeMovingIntoArrears:
        values.numDaysOverdueBeforeMovingIntoArrears
          ? values.numDaysOverdueBeforeMovingIntoArrears
          : true,
    };
    setFormValues({ ...formValues, ...values });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const onChangeMultipleDisbursements = (e: CheckboxChangeEvent) => {
    setShowMultipleDisbursementsInputs(e.target.checked);
  };

  const onChangeAllowVariableInstallments = (e: CheckboxChangeEvent) => {
    setShowAllowVariableInstallmentsInputs(e.target.checked);
  };

  const onChangeInterestRecalculationEnabled = (e: CheckboxChangeEvent) => {
    setShowInterestRecalculationEnabledInputs(e.target.checked);
  };

  const onChangeHoldGuaranteeFunds = (e: CheckboxChangeEvent) => {
    setShowHoldGuaranteeFundsInputs(e.target.checked);
  };

  const onChangeUseGlobalConfigValuesRepaymentEvent = (
    e: CheckboxChangeEvent
  ) => {
    setShowGlobalConfigValuesRepaymentEventInputs(e.target.checked);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={"settingsForm"}
      onFinish={onFinish}
      className="text-left grid grid-cols-6 gap-2"
    >
      <div className="col-span-6">
        <div className="grid grid-cols-6 gap-2">
          <Divider plain className="col-span-6" style={{ border: "#ccc" }}>
            Amortization & Interest
          </Divider>

          <Form.Item
            className="col-span-2 "
            name="amortizationTypeEnum"
            label={
              <Tooltip_
                title={`The Amortization value is input to calculating the repayment amounts for repayment of the loan.`}
                inputLabel="amortization"
              />
            }
            rules={[{ required: true, message: "Amortization is required!" }]}
          >
            <Select>
              <option value={"EQUAL INSTALLMENTS"}>Equal Installments</option>
              <option value={"EQUAL PRINCIPAL PAYMENTS"}>
                Equal Principal Payments
              </option>
            </Select>
          </Form.Item>

          <Form.Item
            name="interestTypeEnum"
            className="col-span-2 "
            label={
              <Tooltip_
                title={`The Interest method value is input to calculating the payments amount for repayment of the loan.`}
                inputLabel="interest method"
              />
            }
            rules={[
              { required: true, message: "Interest Method is required!" },
            ]}
          >
            <Select>
              <option value="FLAT">Flat</option>
              <option value="DECLINING BALANCE">Declining Balance</option>
            </Select>
          </Form.Item>

          <Form.Item
            name="interestCalculationPeriodTypeEnum"
            className="col-span-2 "
            label={
              <Tooltip_
                title={`Daily - Will Calculate the interest on DAILY basis ex: Month of February has 28days
      and it will calculate interest for 28days, SAME AS REPAYMENT PERIOD- it calculates for the month,that is, 30days.`}
                inputLabel="interest calculation period"
              />
            }
            rules={[
              {
                required: true,
                message: "Interest Calculation Period Type is required!",
              },
            ]}
          >
            <Select>
              <option value="DAILY">Daily</option>
              <option value="SAME AS REPAYMENT PERIOD">
                Same As Repayment Period
              </option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isEqualAmortization"
            className="col-span-3 flex justify-start items-baseline"
            valuePropName="checked"
          >
            <Checkbox>Is Equal Amortization?</Checkbox>
          </Form.Item>

          <Form.Item
            name="allowPartialPeriodInterestCalculation"
            className="col-span-3 flex justify-start items-center"
            valuePropName="checked"
          >
            <Checkbox>
              Calculate interest for exact days in partial period{" "}
              <Tooltip_
                title={`To be used with SAME AS REPAYMENT PERIOD- for  calculating exact interest with partial period  ex: Interest charged from is 5th of April ,
      Principal is 10000 and interest is 1% per month then the interest will be (10000 * 1%)* (25/30) , it calculates for the month first then calculates exact periods between start date and end date(can be a decimal).`}
              />
            </Checkbox>
          </Form.Item>
        </div>
      </div>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Loan Schedule
      </Divider>

      <Form.Item
        className="col-span-3 "
        name="loanScheduleTypeEnum"
        label="Loan Schedule Type"
        rules={[
          {
            required: true,
            message: "Loan Schedule Type is required!",
          },
        ]}
      >
        <Select allowClear>
          <option value="CUMULATIVE">Cumulative</option>
          <option value="PROGRESSIVE">Progressive</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3 "
        name="loanTransactionProcessingStrategyId"
        label={
          <Tooltip_
            title={`The repayment strategy determines the sequence in which each of the components is paid.`}
            inputLabel="Repayment Strategy"
          />
        }
        rules={[
          {
            required: true,
            message: "Repayment Strategy is required!",
          },
        ]}
      >
        <Select
          allowClear
          filterOption={filterOption}
          options={loanTransactionProcessingStrategyOptions}
        />
      </Form.Item>

      <div className="col-span-6">
        <Divider plain style={{ border: "#ccc" }}>
          Loan Trench Details
        </Divider>

        <Form.Item
          name="allowMultipleDisbursements"
          className="flex justify-start items-center"
          valuePropName="checked"
        >
          <Checkbox onChange={onChangeMultipleDisbursements}>
            Enable Multiple Disbursements{" "}
            <Tooltip_
              title={`Leave this checkbox unchecked if the loan is a single disburse loan. Check this
    checkbox if the loan is a multi disburse loan. See additional fields for additional information required for this type of loan.`}
            />
          </Checkbox>
        </Form.Item>
      </div>

      {showMultipleDisbursementsInputs && (
        <>
          <Form.Item
            className="col-span-3"
            name="maximumTrancheCount"
            label="Maximum Tranche Count"
            rules={[
              { required: true, message: "Maximum Tranche Count is required!" },
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
            className="col-span-3"
            name="maximumAllowedStandingBalance"
            label="Maximum Allowed Standing Balance"
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            name="disallowExpectedMultipleDisbursements"
            className="col-span-6 flex justify-start items-center"
            valuePropName="checked"
          >
            <Checkbox>Disallow Expected Multiple Disbursements </Checkbox>
          </Form.Item>
        </>
      )}

      <div className="col-span-6">
        <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
          Down Payment
        </Divider>

        <Form.Item
          name="enableDownPayment"
          className="flex justify-start items-center"
          valuePropName="checked"
        >
          <Checkbox>
            Enable Down Payment{" "}
            <Tooltip_
              title={`Leave this checkbox checked if the loan has Down Payment, A Down Payment is
    a sum a buyer pays upfront when purchasing a good. It represents a percentage of the total purchase price, and the balance is usually financed.`}
            />
          </Checkbox>
        </Form.Item>
      </div>

      <div className="col-span-6">
        <div className="grid grid-cols-6 gap-2">
          <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
            Moratorium{" "}
            <Tooltip_ title="The moratorium information will default from the loan product settings, but can be changed for this loan account" />
          </Divider>

          <Form.Item
            className="col-span-3"
            name="graceOnPrincipalPayment"
            label="Grace On Principle Payment"
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="graceOnInterestPayment"
            label="Grace On Interest Payment"
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="interestFreePeriod"
            label={
              <Tooltip_
                title={`If the Interest Free Period is '4' and the client's Repayment Frequency is every week,
      then for the first four weeks the client need not to pay interest, he has to pay principle due for that week only.`}
                inputLabel="Interest Free Period"
              />
            }
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="inArrearsTolerance"
            label={
              <Tooltip_
                title={`With 'Arrears tolerance' you can specify a tolerance amount and if the loan is behind (in arrears),
      but within the tolerance, it won't be classified as 'in arrears' and part of the portfolio at risk.`}
                inputLabel="Arrears Tolerance"
              />
            }
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-3 "
            name="daysInYearTypeEnum"
            label={
              <Tooltip_
                title={`The setting for number of days in year to use to calculate interest.`}
                inputLabel="Days In Year"
              />
            }
            rules={[
              {
                required: true,
                message: "Days In Year is required!",
              },
            ]}
          >
            <Select>
              <option value={"ACTUAL"}>Actual</option>
              <option value={"360 DAYS"}>360 Days</option>
              <option value={"364 DAYS"}>364 Days</option>
              <option value={"365 DAYS"}>365 Days</option>
            </Select>
          </Form.Item>

          <Form.Item
            className="col-span-3 "
            name="daysInMonthTypeEnum"
            label={
              <Tooltip_
                title={`Number of days in month.`}
                inputLabel="Days In Month"
              />
            }
            rules={[
              {
                required: true,
                message: "Days In Month is required!",
              },
            ]}
          >
            <Select>
              <option value={"ACTUAL"}>Actual</option>
              <option value={"30 DAYS"}>30 Days</option>
            </Select>
          </Form.Item>

          <Form.Item
            name="canDefineInstallmentAmount"
            className="col-span-3 flex justify-start items-baseline"
            valuePropName="checked"
          >
            <Checkbox>Allow fixing of the installment amount</Checkbox>
          </Form.Item>

          <Form.Item
            name="accountMovesOutOfNPAOnlyOnArrearsCompletion"
            className="col-span-3 flex justify-start items-baseline"
            valuePropName="checked"
          >
            <Checkbox>
              Account moves out of NPA only after all arrears have been cleared
            </Checkbox>
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="daysOverdueBeforeMovingIntoArrears"
            label={
              <Tooltip_
                title="A loan is in arrears once the number of days entered into this field is exceeded. If this field is blank, the loan will be in arrears the day after a scheduled payment is missed."
                inputLabel="Number of days a loan may be overdue before moving into arrears"
              />
            }
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="principalThresholdForLastInstalment"
            label="Principal Threshold (%) for Last Instalment"
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="maxDaysOverdueBeforeBecomingAnNPA"
            label={
              <Tooltip_
                title="A loan is a NPA (non performing asset) once the number of days entered into this field is exceeded. If this field is blank, the loan will be an NPA the day after a scheduled payment is missed."
                inputLabel="Maximum number of days a loan may be overdue before becoming an NPA (Non Performing Asset)"
              />
            }
          >
            <InputNumber
              placeholder="Overdue days for NPA"
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <div className="col-span-6 ">
            <div className="grid grid-cols-6 gap-2">
              <Form.Item
                name="allowVariableInstallments"
                className="col-span-6 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox onChange={onChangeAllowVariableInstallments}>
                  Are Variable Installments Allowed?{" "}
                  <Tooltip_
                    title={`These fields are used to define the minimum, maximum gap that should be present between the installments for the loan product.`}
                  />
                </Checkbox>
              </Form.Item>

              {showAllowVariableInstallmentsInputs && (
                <>
                  <Form.Item
                    className="col-span-3"
                    name="minimumGap"
                    label="Minimum Gap Between Installments"
                    rules={[
                      {
                        required: true,
                        message:
                          "Minimum Gap Between Installments is required!",
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
                    className="col-span-3"
                    name="maximumGap"
                    label="Maximum Gap Between Installments"
                    rules={[
                      {
                        required: true,
                        message:
                          "Maximum Gap Between Installments is required!",
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
                </>
              )}

              <Form.Item
                name="canUseForTopUp"
                className="col-span-3 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>
                  Allowed to be used for providing Top Up Loans
                  <Tooltip_
                    title={`If selected, the Loan Product can be used to apply for Top Up Loans.`}
                  />
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="interestRecalculationEnabled"
                className="col-span-6 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox onChange={onChangeInterestRecalculationEnabled}>
                  Recalculate Interest
                </Checkbox>
              </Form.Item>

              {showInterestRecalculationEnabledInputs && (
                <>
                  <Form.Item
                    className="col-span-3"
                    name="preClosureInterestCalculationStrategyEnum"
                    label="Pre-Closure Interest Calculation Rule"
                    rules={[
                      {
                        required: true,
                        message:
                          "Pre-Closure Interest Calculation Rule is required!",
                      },
                    ]}
                  >
                    <Select>
                      <option value={"TILL PRE-CLOSE DATE"}>
                        Till Pre-Close Date
                      </option>
                      <option value={"TILL REST FREQUENCY DATE"}>
                        Till Rest Frequency Date
                      </option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    className="col-span-3"
                    name="rescheduleStrategyMethodEnum"
                    label="Advance Payments Adjustment Type"
                    rules={[
                      {
                        required: true,
                        message:
                          "Advance Payments Adjustment Type is required!",
                      },
                    ]}
                  >
                    <Select>
                      <option value={"REDUCE EMI AMOUNT"}>
                        Reduce EMI Amount
                      </option>
                      <option value={"REDUCE NUMBER OF INSTALLMENTS"}>
                        Reduce Number Of Installments
                      </option>
                      <option value={"RESCHEDULE NEXT REPAYMENTS"}>
                        Reschedule Next Repayments
                      </option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    className="col-span-3"
                    name="interestRecalculationCompoundingMethodEnum"
                    label="Interest Recalculation Compounding On"
                    rules={[
                      {
                        required: true,
                        message:
                          "Interest Recalculation Compounding On is required!",
                      },
                    ]}
                  >
                    <Select>
                      <option value={"NONE"}>None</option>
                      <option value={"FEE"}>Fee</option>
                      <option value={"INTEREST"}>Interest</option>
                      <option value={"FEE AND INTEREST"}>
                        Fee And Interest
                      </option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    className="col-span-3"
                    name="recalculationCompoundingFrequencyTypeEnum"
                    label="Frequency For Recalculate Outstanding Principal"
                    rules={[
                      {
                        required: true,
                        message:
                          "Frequency For Recalculate Outstanding Principal is required!",
                      },
                    ]}
                  >
                    <Select>
                      <option value={"SAME AS REPAYMENT PERIOD"}>
                        Same As Repayment Period
                      </option>
                      <option value={"DAILY"}>Daily</option>
                      <option value={"WEEKLY"}>Weekly</option>
                      <option value={"MONTHLY"}>Monthly</option>
                    </Select>
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="holdGuaranteeFunds"
                className="col-span-6 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox onChange={onChangeHoldGuaranteeFunds}>
                  Place Guarantee Funds On-Hold
                </Checkbox>
              </Form.Item>

              {showHoldGuaranteeFundsInputs && (
                <>
                  <Form.Item
                    className="col-span-3"
                    name="mandatoryGuarantee"
                    label="Mandatory Guarantee (%)"
                    rules={[
                      {
                        required: true,
                        message: "Mandatory Guarantee (%) is required!",
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
                    className="col-span-3"
                    name="minimumGuaranteeFromOwnFunds"
                    label="Minimum Guarantee From Own Funds(%)"
                  >
                    <InputNumber
                      className="w-full"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    className="col-span-3"
                    name="minimumGuaranteeFromGuarantor"
                    label="Minimum Guarantee From Guarantor Funds(%)"
                  >
                    <InputNumber
                      className="w-full"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="useGlobalConfigValuesRepaymentEvent"
                className="col-span-6 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox
                  onChange={onChangeUseGlobalConfigValuesRepaymentEvent}
                >
                  Use the Global Configurations values to the Repayment Event
                  (notifications)
                  <Tooltip_
                    title={`Use or not the Global Configurations values to the Repayment Event (notifications).`}
                  />
                </Checkbox>
              </Form.Item>
              {showGlobalConfigValuesRepaymentEventInputs && (
                <>
                  {" "}
                  <Form.Item
                    className="col-span-3"
                    name="dueDaysForRepaymentEvent"
                    label={
                      <Tooltip_
                        title={`The maximum outstanding loan account balance allowed at a point in time.`}
                        inputLabel="Due days for repayment event"
                      />
                    }
                  >
                    <InputNumber
                      className="w-full"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    className="col-span-3"
                    name="overDueDaysForRepaymentEvent"
                    label={
                      <Tooltip_
                        title={`The maximum outstanding loan account balance allowed at a point in time.`}
                        inputLabel="OverDue days for repayment event"
                      />
                    }
                  >
                    <InputNumber
                      className="w-full"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                </>
              )}

              <Divider plain className="col-span-6" style={{ border: "#ccc" }}>
                Configurable Terms and Settings
              </Divider>

              <Form.Item
                name="termsAndSettings"
                className="col-span-6 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>
                  Allow overriding select terms and settings in loan accounts
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="amortization"
                className="col-span-3 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>Amortization</Checkbox>
              </Form.Item>

              <Form.Item
                name="repaymentStrategy"
                className="col-span-3 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>Repayment Strategy</Checkbox>
              </Form.Item>

              <Form.Item
                name="arrearsTolerance"
                className="col-span-3 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>Arrears Tolerance</Checkbox>
              </Form.Item>

              <Form.Item
                name="moratorium"
                className="col-span-3 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>Moratorium</Checkbox>
              </Form.Item>

              <Form.Item
                name="interestMethod"
                className="col-span-3 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>Interest method</Checkbox>
              </Form.Item>

              <Form.Item
                name="interestCalculationPeriod"
                className="col-span-3 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>Interest calculation period</Checkbox>
              </Form.Item>

              <Form.Item
                name="repaidEvery"
                className="col-span-3 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>Repaid Every</Checkbox>
              </Form.Item>

              <Form.Item
                name="numDaysOverdueBeforeMovingIntoArrears"
                className="col-span-3 flex justify-start items-baseline"
                valuePropName="checked"
              >
                <Checkbox>
                  Number of days a loan may be overdue before moving into
                  arrears
                </Checkbox>
              </Form.Item>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-6">
        <FormSubmitButtonsStep
          submitText="Next"
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
