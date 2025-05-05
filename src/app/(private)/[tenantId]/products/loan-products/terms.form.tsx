"use client";
import { Checkbox, Divider, Form, InputNumber, Select, Typography } from "antd";
import { SetStateAction, useEffect, useState } from "react";
import CreateLoanCycleModal from "./create-loan-cycle.modal";
import { LoanCycle, LoanProduct, SubmitType } from "@/types";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import LoanCycleDataTable from "./loan-cycle.data-table";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";

const { Title } = Typography;

export default function TermsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<LoanProduct>;
  setFormValues: React.Dispatch<SetStateAction<Partial<LoanProduct>>>;
  submitType: SubmitType;
  id?: number;
}) {
  const { current, setCurrent, formValues, setFormValues, submitType, id } =
    props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showApprovalDisbursalAboveLoan, setShowApprovalDisbursalAboveLoan] =
    useState(false);
  const [showTermsVaryBasedOnLoanCycle, setShowTermsVaryBasedOnLoanCycle] =
    useState(false);
  const [loanCyclesPrincipalData, setLoanCyclesPrincipalData] = useState<
    LoanCycle[]
  >([]);
  const [
    loanCyclesNumberOfRepaymentsData,
    setLoanCyclesNumberOfRepaymentsData,
  ] = useState<LoanCycle[]>([]);
  const [
    loanCyclesNominalInterestRatesData,
    setLoanCyclesNominalInterestRatesData,
  ] = useState<LoanCycle[]>([]);

  const [
    selectedLoanCyclesPrincipalsData,
    setSelectedLoanCyclesPrincipalsData,
  ] = useState<LoanCycle[]>([]);
  const [
    selectedLoanCyclesNumberOfRepaymentsData,
    setSelectedLoanCyclesNumberOfRepaymentsData,
  ] = useState<LoanCycle[]>([]);
  const [
    selectedLoanCyclesNominalInterestRatesData,
    setSelectedLoanCyclesNominalInterestRatesData,
  ] = useState<LoanCycle[]>([]);

  const [isZeroInterestRate, setIsZeroInterestRate] = useState(false);
  const [isLinkedToFloatingInterestRates, setIsLinkedToFloatingInterestRates] =
    useState(false);
  const [termsVaryBasedOnLoanCycle, setTermsVaryBasedOnLoanCycle] =
    useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (values: Partial<LoanProduct>) => {
    values["isZeroInterestRate"] = values.isZeroInterestRate ?? false;
    setFormValues({ ...formValues, ...values });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const onApprovalDisbursalAboveLoan = (e: CheckboxChangeEvent) => {
    setShowApprovalDisbursalAboveLoan(e.target.checked);
  };

  const onTermsVaryBasedOnLoanCycle = (e: CheckboxChangeEvent) => {
    setShowTermsVaryBasedOnLoanCycle(e.target.checked);
    setFormValues({
      ...formValues,
      termsVaryBasedOnLoanCycle: e.target.checked,
    });
  };

  useEffect(() => {
    if (submitType === "update") {
      setShowApprovalDisbursalAboveLoan(
        !!formValues.approvalDisbursalAboveLoan
      );
      setIsZeroInterestRate(!!formValues.isZeroInterestRate);
      setIsLinkedToFloatingInterestRates(
        !!formValues.isLinkedToFloatingInterestRates
      );

      if (
        formValues.termsVaryBasedOnLoanCycle &&
        formValues.loanProductVariationsBorrowerCycles &&
        formValues.loanProductVariationsBorrowerCycles?.length > 0
      ) {
        setTermsVaryBasedOnLoanCycle(true);
        setShowTermsVaryBasedOnLoanCycle(true);
        setLoanCyclesPrincipalData(
          formValues.loanProductVariationsBorrowerCycles
        );
      }
    }
  }, [submitType, formValues]);

  useEffect(() => {
    const updateLoanCyclesData = (
      variations: LoanCycle[],
      setVariationsData: {
        (value: SetStateAction<LoanCycle[]>): void;
        (value: SetStateAction<LoanCycle[]>): void;
        (arg0: any[]): void;
      },
      selectedVariationsData: any[],
      existingVariationsData: any[]
    ) => {
      if (variations) {
        setVariationsData(variations);
      }

      if (selectedVariationsData.length > 0) {
        const uniqueKey = selectedVariationsData
          .map(
            (data) =>
              `${data.borrowerCycleNumber}${data.defaultValue}${data.maxValue}${data.minValue}${data.paramTypeEnum}${data.valueConditionTypeEnum}`
          )
          .join("-");

        const isUnique = !existingVariationsData.some(
          (variation) =>
            `${variation.borrowerCycleNumber}${variation.defaultValue}${variation.maxValue}${variation.minValue}${variation.paramTypeEnum}${variation.valueConditionTypeEnum}` ===
            uniqueKey
        );

        if (isUnique) {
          const updatedVariationsData = [
            ...existingVariationsData,
            ...selectedVariationsData,
          ];
          setVariationsData(updatedVariationsData);
          setFormValues((prevFormValues) => ({
            ...prevFormValues,
            loanProductVariationsBorrowerCycles: updatedVariationsData,
          }));
        }
      }
    };

    if (formValues.loanProductVariationsBorrowerCycles) {
      const variationsForPrincipal =
        formValues.loanProductVariationsBorrowerCycles.filter(
          (loanCycle) => loanCycle.paramTypeEnum === "PRINCIPAL"
        );
      const variationsForNumberOfRepayments =
        formValues.loanProductVariationsBorrowerCycles.filter(
          (loanCycle) => loanCycle.paramTypeEnum === "NUMBER OF REPAYMENTS"
        );
      const variationsForNominalInterestRates =
        formValues.loanProductVariationsBorrowerCycles.filter(
          (loanCycle) => loanCycle.paramTypeEnum === "NOMINAL INTEREST RATE"
        );

      updateLoanCyclesData(
        variationsForPrincipal,
        setLoanCyclesPrincipalData,
        selectedLoanCyclesPrincipalsData,
        loanCyclesPrincipalData
      );

      updateLoanCyclesData(
        variationsForNumberOfRepayments,
        setLoanCyclesNumberOfRepaymentsData,
        selectedLoanCyclesNumberOfRepaymentsData,
        loanCyclesNumberOfRepaymentsData
      );

      updateLoanCyclesData(
        variationsForNominalInterestRates,
        setLoanCyclesNominalInterestRatesData,
        selectedLoanCyclesNominalInterestRatesData,
        loanCyclesNominalInterestRatesData
      );
    }
  }, [
    selectedLoanCyclesPrincipalsData,
    selectedLoanCyclesNumberOfRepaymentsData,
    selectedLoanCyclesNominalInterestRatesData,
    formValues.loanProductVariationsBorrowerCycles,
  ]);

  return (
    <Form
      layout="vertical"
      form={form}
      name={"termsForm"}
      onFinish={onFinish}
      className="grid grid-cols-6 gap-2 text-left"
    >
      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Principal{" "}
        <Tooltip_ title="These fields are used to define the minimum, default, and maximum principal allowed for the loan product." />
      </Divider>

      <Form.Item
        className="col-span-2"
        name="minPrincipalAmount"
        label="Minimum"
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
        name="principalAmount"
        label="Default"
        rules={[{ required: true, message: "Default is required!" }]}
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
        name="maxPrincipalAmount"
        label="Maximum"
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="approvalDisbursalAboveLoan"
        className="col-span-6 flex justify-start items-baseline"
        valuePropName="checked"
      >
        <Checkbox onChange={onApprovalDisbursalAboveLoan}>
          Allow approval / disbursal above loan applied amount
        </Checkbox>
      </Form.Item>

      {showApprovalDisbursalAboveLoan ? (
        <>
          <Form.Item
            className="col-span-3"
            name="overAmountCalculationTypeEnum"
            label="Over Amount Calculation Type"
            rules={[
              {
                required: showApprovalDisbursalAboveLoan,
                message: "Over Amount Calculation Type is required!",
              },
            ]}
          >
            <Select>
              <option value={"PERCENTAGE"}>Percentage</option>
              <option value={"FIXED AMOUNT"}>Fixed Amount</option>
            </Select>
          </Form.Item>

          <Form.Item
            className="col-span-3"
            name="overAmount"
            label="Over Amount"
            rules={[
              {
                required: showApprovalDisbursalAboveLoan,
                message: "Over Amount is required!",
              },
            ]}
            initialValue={2}
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </>
      ) : null}

      <Form.Item
        className="col-span-3"
        name="installmentDayCalculationFromEnum"
        label="Installment Day Calculation From"
        rules={[
          {
            required: true,
            message: "Installment Day Calculation From is required!",
          },
        ]}
        initialValue={"DISBURSEMENT DATE"}
      >
        <Select>
          <option value={"DISBURSEMENT DATE"}>Disbursement Date</option>
          <option value={"SUBMITTED ON DATE"}>Submitted On Date</option>
        </Select>
      </Form.Item>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Number of Repayments{" "}
        <Tooltip_ title="These fields are used to define the minimum, default, and maximum number of repayments allowed for the loan product." />
      </Divider>

      <Form.Item
        className="col-span-2"
        name="minNumberOfRepayments"
        label="Minimum"
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
        name="numberOfRepayments"
        label="Default"
        rules={[{ required: true, message: "Default is required!" }]}
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
        name="maxNumberOfRepayments"
        label="Maximum"
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Interest Rates{" "}
        <Tooltip_ title="These fields are used to define the minimum, default, and maximum number of repayments allowed for the loan product." />
      </Divider>

      <Form.Item
        name="isZeroInterestRate"
        className="col-span-3 flex justify-start items-baseline"
        valuePropName="checked"
      >
        <Checkbox>Is Zero Interest Rate</Checkbox>
      </Form.Item>

      <Form.Item
        name="isLinkedToFloatingInterestRates"
        className="col-span-3 flex justify-start items-baseline"
        valuePropName="checked"
      >
        <Checkbox defaultChecked={isLinkedToFloatingInterestRates}>
          Is Linked to floating interest rates
        </Checkbox>
      </Form.Item>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Nominal Interest Rate{" "}
        <Tooltip_ title="These fields are used to define the minimum, default, maximum, and period for the nominal interest rate allowed for the loan product. The minimum, default, and maximum nominal interest rates are expressed as percentages." />
      </Divider>

      <div className="col-span-6">
        <div className="grid grid-cols-8 gap-2">
          <Form.Item
            className="col-span-2"
            name="minNominalInterestRatePerPeriod"
            label="Minimum"
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
            name="nominalInterestRatePerPeriod"
            label="Default"
            rules={[{ required: true, message: "Default is required!" }]}
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
            name="maxNominalInterestRatePerPeriod"
            label="Maximum"
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
        </div>
      </div>

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Variations{" "}
        <Tooltip_ title="These fields are used to define the minimum, default, maximum, and period for the nominal interest rate allowed for the loan product. The minimum, default, and maximum nominal interest rates are expressed as percentages." />
      </Divider>

      <Form.Item
        className="col-span-6 flex justify-start items-baseline"
        valuePropName="checked"
        name="termsVaryBasedOnLoanCycle"
      >
        <Checkbox
          checked={termsVaryBasedOnLoanCycle}
          onChange={onTermsVaryBasedOnLoanCycle}
        >
          Terms vary based on loan cycle
        </Checkbox>
      </Form.Item>

      {showTermsVaryBasedOnLoanCycle ? (
        <div className="col-span-6">
          <div className="grid grid-cols-6 gap-3">
            <Title level={5} className="col-span-5">
              Principal by loan cycle
            </Title>

            <div className="col-span-1 flex justify-end">
              <CreateLoanCycleModal
                submitType="create"
                loanCycleType="PRINCIPAL"
                formValues={formValues}
                setFormValues={setFormValues}
              />
            </div>

            {loanCyclesPrincipalData.length > 0 && (
              <div className="col-span-6">
                <LoanCycleDataTable
                  data={loanCyclesPrincipalData}
                  setLoanCyclesPrincipalData={setLoanCyclesPrincipalData}
                  formValues={formValues}
                  setFormValues={setFormValues}
                  type="PRINCIPAL"
                />
              </div>
            )}

            <Title level={5} className="col-span-5">
              Number of repayments
            </Title>

            <div className="col-span-1 flex justify-end">
              <CreateLoanCycleModal
                submitType="create"
                loanCycleType="NUMBER OF REPAYMENTS"
                formValues={formValues}
                setFormValues={setFormValues}
              />
            </div>

            {loanCyclesNumberOfRepaymentsData.length > 0 && (
              <div className="col-span-6">
                <LoanCycleDataTable
                  data={loanCyclesNumberOfRepaymentsData}
                  setLoanCyclesNumberOfRepaymentsData={
                    setLoanCyclesNumberOfRepaymentsData
                  }
                  type="NUMBER OF REPAYMENTS"
                  formValues={formValues}
                  setFormValues={setFormValues}
                />
              </div>
            )}

            <Title level={5} className="col-span-5">
              Nominal interest rate
            </Title>

            <div className="col-span-1 flex justify-end">
              <CreateLoanCycleModal
                submitType="create"
                loanCycleType="NOMINAL INTEREST RATE"
                formValues={formValues}
                setFormValues={setFormValues}
              />
            </div>
            {loanCyclesNominalInterestRatesData.length > 0 && (
              <div className="col-span-6">
                <LoanCycleDataTable
                  data={loanCyclesNominalInterestRatesData}
                  setLoanCyclesNominalInterestRatesData={
                    setLoanCyclesNominalInterestRatesData
                  }
                  type="NOMINAL INTEREST RATE"
                  formValues={formValues}
                  setFormValues={setFormValues}
                />
              </div>
            )}
          </div>
        </div>
      ) : null}

      <Divider className="col-span-6" plain style={{ border: "#ccc" }}>
        Repaid Every{" "}
        <Tooltip_ title="These fields are input to calculating the repayment schedule for a loan account and are used to determine when payments are due." />
      </Divider>

      <Form.Item
        className="col-span-3"
        name="repaymentEvery"
        label="Frequency"
        rules={[{ required: true, message: "Frequency is required!" }]}
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        className="col-span-3 text-left"
        name="repaymentFrequencyTypeEnum"
        label="Frequency Type"
        rules={[{ required: true, message: "Frequency Type is required!" }]}
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
        </Select>
      </Form.Item>

      <Form.Item
        className="col-span-3"
        name="minDaysBetweenDisbursalAndFirstRepayment"
        label="Minimum days between disbursal and first repayment date."
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

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
