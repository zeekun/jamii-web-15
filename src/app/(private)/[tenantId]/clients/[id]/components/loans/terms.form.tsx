"use client";
import { Checkbox, DatePicker, Divider, Form, InputNumber, Select } from "antd";
import { SetStateAction, useEffect, useState } from "react";
import {
  Loan,
  LoanProduct,
  LoanTransactionProcessingStrategy,
  SelectOption,
  SubmitType,
  TimeInterval,
} from "@/types";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";
import { dateFormat } from "@/utils/dates";
import { filterOption } from "@/utils/strings";
import { useGet } from "@/api";
import _ from "lodash";
import { useParams } from "next/navigation";

export default function TermsForm(props: {
  form: any;
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<Loan>;
  setFormValues: React.Dispatch<SetStateAction<Partial<Loan>>>;
  submitType: SubmitType;
  selectedLoanProduct: Partial<LoanProduct>;
  id?: number;
}) {
  const { tenantId } = useParams();
  const {
    form,
    current,
    setCurrent,
    formValues,
    setFormValues,
    submitType,
    selectedLoanProduct,
  } = props;

  //const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showMonthInterval, setShowMonthInterval] = useState(false);
  const [
    loanTransactionProcessingStrategyOptions,
    setLoanTransactionProcessingStrategyOptions,
  ] = useState<any>([]);

  useEffect(() => {
    console.log("terms", formValues);
    form.setFieldsValue({ ...formValues, ...formValues.loanProduct });

    const numberOfRepayments = formValues.numberOfRepayments ?? 0;
    const repaymentEvery = formValues.repaymentEvery ?? 0;
    const loanTerm = numberOfRepayments * repaymentEvery;
    form.setFieldsValue({
      termFrequency: loanTerm,
      termPeriodFrequencyEnum: formValues.repaymentFrequencyTypeEnum,
    });

    if (submitType === "update") {
      form.setFieldsValue({
        loanTransactionProcessingStrategyId:
          formValues.loanTransactionProcessingStrategyId,
      });
    }

    if (formValues.repaymentFrequencyTypeEnum === "MONTHS") {
      setShowMonthInterval(true);
    } else {
      setShowMonthInterval(false);
    }
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: loanTransactionProcessingStrategiesStatus,
    data: loanTransactionProcessingStrategies,
  } = useGet<LoanTransactionProcessingStrategy[]>(
    `${tenantId}/loan-transaction-processing-strategies`,
    [`${tenantId}/loan-transaction-processing-strategies`]
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

  const onFinish = (values: any) => {
    setFormValues({ ...formValues, ...values });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const handleTermChange = () => {
    const values = form.getFieldsValue();
    const { numberOfRepayments, repaymentEvery, repaymentFrequencyTypeEnum } =
      values;

    if (numberOfRepayments && repaymentEvery) {
      const loanTerm = numberOfRepayments * repaymentEvery;
      form.setFieldsValue({
        termFrequency: loanTerm,
        termPeriodFrequencyEnum: repaymentFrequencyTypeEnum,
      });
    }

    if (repaymentFrequencyTypeEnum === "MONTHS") {
      setShowMonthInterval(true);
    } else {
      setShowMonthInterval(false);
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={"termsForm"}
      onFinish={onFinish}
      className="grid grid-cols-6 gap-2 text-left"
    >
      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Principal & Term Options
        <Tooltip_ title="These fields are used to define the minimum, default, and maximum principal allowed for the loan product. The loan term parameter in loan accounts is the default-calculated field based on the number of repayments and repaid every value entered by the user" />
      </Divider>

      <Form.Item
        className="col-span-2"
        name="principalAmount"
        label="Principal"
        rules={[
          {
            required: true,
            message: "Principal is required!",
          },
        ]}
      >
        <InputNumber
          min={formValues.minPrincipalAmount}
          max={formValues.maxPrincipalAmount}
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="termFrequency"
        label="Loan Term"
        rules={[{ required: true, message: "Loan Term is required!" }]}
      >
        <InputNumber
          disabled
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="termPeriodFrequencyEnum"
        label="Frequency"
        rules={[
          {
            required: true,
            message: "Frequency is required!",
          },
        ]}
      >
        <Select disabled>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      {/* <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Term Options{" "}
        <Tooltip_ title="The loan term parameter in loan accounts is the default-calculated field based on the number of repayments and repaid every value entered by the user." />
      </Divider> */}

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Repayments{" "}
        <Tooltip_ title="These fields are used to define the minimum, default, and maximum number of repayments allowed for the loan product." />
      </Divider>

      <Form.Item
        className="col-span-2"
        name="numberOfRepayments"
        label="Number Of Repayments"
      >
        <InputNumber
          onChange={handleTermChange}
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="expectedFirstRepaymentOnDate"
        label="First Repayment On"
      >
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="interestCalculatedFromDate"
        label="Interest Charged From"
      >
        <DatePicker className="w-full" format={dateFormat} />
      </Form.Item>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Repaid Every{" "}
        <Tooltip_ title="These fields are input to calculating the repayment schedule for a loan account and are used to determine when payments are due.." />
      </Divider>

      <Form.Item
        className="col-span-2"
        name="repaymentEvery"
        label="Repaid Every"
      >
        <InputNumber
          onChange={handleTermChange}
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="repaymentFrequencyTypeEnum"
        className="col-span-2"
        label="Frequency"
      >
        <Select onChange={handleTermChange}>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      {showMonthInterval && (
        <>
          <Form.Item name="selectOn" className="col-span-1" label="Select On">
            <Select className="w-full">
              <option value={"FIRST"}>First</option>
              <option value={"SECOND"}>Second</option>
              <option value={"THIRD"}>Third</option>
              <option value={"FOURTH"}>Fourth</option>
              <option value={"LAST"}>Last</option>
            </Select>
          </Form.Item>

          <Form.Item
            name="selectDay"
            className="col-span-1  w-full"
            label="Select Day"
          >
            <Select className="w-full">
              <option value={"SUNDAY"}>Sunday</option>
              <option value={"MONDAY"}>Monday</option>
              <option value={"TUESDAY"}>Tuesday</option>
              <option value={"WEDNESDAY"}>Wednesday</option>
              <option value={"THURSDAY"}>Thursday</option>
              <option value={"FRIDAY"}>Friday</option>
              <option value={"SATURDAY"}>Saturday</option>
            </Select>
          </Form.Item>
        </>
      )}

      <Form.Item
        className="col-span-6 flex justify-start items-baseline"
        valuePropName="checked"
        name="enableDownPayment"
      >
        <Checkbox>Enable Down Payment?</Checkbox>
      </Form.Item>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Nominal Interest Rate{" "}
        <Tooltip_ title="These fields are used to define the minimum, default, maximum, and period for the nominal interest rate allowed for the loan product. The minimum, default, and maximum nominal interest rates are expressed as percentages." />
      </Divider>

      <div className="col-span-6">
        <div className="grid grid-cols-8 gap-2">
          <Form.Item
            className="col-span-2"
            name="nominalInterestRatePerPeriod"
            label="Nominal Interest Rate %"
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-2 text-left"
            name="interestRateFrequencyTypeEnum"
            label="Frequency"
            rules={[{ required: true, message: "Frequency is required!" }]}
          >
            <Select>
              <option value={"PER MONTH"}>Per Month</option>
              <option value={"PER YEAR"}>Per Year</option>
              <option value={"WHOLE TERM"}>Whole Term</option>
            </Select>
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="interestTypeEnum"
            label="Interest Method"
            rules={[
              { required: true, message: "Interest Method is required!" },
            ]}
          >
            <Select>
              <option value={"FLAT"}>Flat</option>
              <option value={"DECLINING BALANCE"}>Declining Balance</option>
            </Select>
          </Form.Item>

          <Form.Item
            className="col-span-2 text-left"
            name="amortizationTypeEnum"
            label="Amortization"
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
            className="col-span-6 flex justify-start items-baseline"
            valuePropName="checked"
            name="isEqualAmortization"
          >
            <Checkbox>Is Equal Amortization?</Checkbox>
          </Form.Item>
        </div>
      </div>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Loan Schedule
      </Divider>

      <Form.Item
        className="col-span-3"
        name="loanTransactionProcessingStrategyId"
        label="Repayment Strategy"
        rules={[{ required: true, message: "Repayment Strategy is required!" }]}
      >
        <Select
          allowClear
          filterOption={filterOption}
          options={loanTransactionProcessingStrategyOptions}
        />
      </Form.Item>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Interest Calculations{" "}
        <Tooltip_ title="These fields are input to calculating the repayment schedule for a loan account and are used to determine when payments are due." />
      </Divider>

      <Form.Item
        className="col-span-3"
        name="interestCalculationPeriodTypeEnum"
        label="Interest Calculation Period"
        rules={[{ required: true, message: "Frequency is required!" }]}
      >
        <Select>
          <option value="DAILY">Daily</option>
          <option value="SAME AS REPAYMENT PERIOD">
            Same As Repayment Period
          </option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="allowPartialPeriodInterestCalculation"
        label={" "}
        valuePropName="checked"
      >
        <Checkbox>
          Calculate Interest For Exact Days In Partial Period?
        </Checkbox>
      </Form.Item>

      <Form.Item
        className="col-span-3 text-left"
        name="inArrearsTolerance"
        label="Arrears Tolerance"
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
        label="Interest Free Period"
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Moratorium{" "}
        <Tooltip_ title="The moratorium information will default from the loan product settings, but can be changed for this loan account." />
      </Divider>

      <Form.Item
        className="col-span-2"
        name="graceOnPrincipalPayment"
        label="Grace On Principal Payment"
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
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
        className="col-span-2"
        name="graceOnArrearsAgeing"
        label="On Arrears Ageing"
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <div className="col-span-6 flex justify-start gap-2">
        <label>Recalculate Interest: </label>

        <label className="capitalize">
          {formValues.interestRecalculationEnabled ? "Yes" : "No"}
        </label>
      </div>

      <div className="col-span-6 ">
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
