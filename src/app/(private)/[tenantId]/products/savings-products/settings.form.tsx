"use client";
import { useGet } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Tooltip_ from "@/components/tooltip";
import { SavingsProduct, SubmitType, TaxGroup } from "@/types";
import { filterOption } from "@/utils/strings";
import { Checkbox, Form, InputNumber, Select } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<SavingsProduct>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<SavingsProduct>>>;
  submitType?: SubmitType;
}) {
  const { tenantId } = useParams();
  const {
    current,
    submitType = "create",
    setCurrent,
    formValues,
    setFormValues,
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showOverDraftInputs, setShowOverDraftInputs] = useState(false);
  const [showTaxGroupOptions, setShowTaxGroupOptions] = useState(false);
  const [showDormancyTrackingInputs, setShowDormancyTrackingInputs] =
    useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: taxGroupsStatus,
    data: taxGroups,
    error: taxGroupsError,
  } = useGet<TaxGroup[]>(`${tenantId}/tax-groups`, [`${tenantId}/tax-groups`]);

  let taxGroupsOptions: any = [];

  if (taxGroupsStatus === "success") {
    taxGroupsOptions = taxGroups.map((taxGroup: TaxGroup) => {
      return { value: taxGroup.id, label: taxGroup.name };
    });
  }

  useEffect(() => {
    if (submitType === "update") {
      if (formValues.withHoldTax) {
        setShowTaxGroupOptions(true);
      }
    }
  }, [submitType, formValues.withHoldTax]);

  useEffect(() => {
    if (submitType === "update") {
      if (formValues.isDormancyTrackingActive) {
        setShowDormancyTrackingInputs(true);
      }
    }
  }, [submitType, formValues.isDormancyTrackingActive]);

  useEffect(() => {
    if (submitType === "update") {
      if (formValues.allowOverdraft) {
        setShowOverDraftInputs(true);
      }
    }
  }, [submitType, formValues.allowOverdraft]);

  const onFinish = (values: any) => {
    setFormValues({ ...formValues, ...values });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const onChangeAllowOverdraft = (e: CheckboxChangeEvent) => {
    setShowOverDraftInputs(e.target.checked);
  };

  const onChangeWithHold = (e: CheckboxChangeEvent) => {
    setShowTaxGroupOptions(e.target.checked);
  };

  const onChangeDormancyTracking = (e: CheckboxChangeEvent) => {
    setShowDormancyTrackingInputs(e.target.checked);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={"settingsForm"}
      onFinish={onFinish}
      className="text-left grid grid-cols-6 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="minRequiredOpeningBalance"
        label={
          <Tooltip_
            title={`Sets the minimum deposit amount required to open a saving account of this saving product type.`}
            inputLabel="minimum opening balance"
          />
        }
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="lockInPeriodFrequency"
        className="col-span-2"
        label={
          <Tooltip_
            title={`Used to indicate the length of time that a savings account of this saving product type is locked-in and withdrawals are not allowed.`}
            inputLabel="Lock-in Period"
          />
        }
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="lockInPeriodFrequencyTypeEnum"
        className="col-span-2"
        label="Lock-In Period Frequency"
      >
        <Select>
          <option value={"DAYS"}>Days</option>
          <option value={"WEEKS"}>Weeks</option>
          <option value={"MONTHS"}>Months</option>
          <option value={"YEARS"}>Years</option>
        </Select>
      </Form.Item>

      <Form.Item
        name="withdrawalFeeForTransfers"
        className="col-span-3 flex justify-start items-baseline"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox>
          Apply Withdrawal fee for transfers
          <Tooltip_ title="Indicates whether the withdrawal fee should be applied when funds are transferred between accounts" />
        </Checkbox>
      </Form.Item>

      <Form.Item
        name="minBalanceForInterestCalculation"
        className="col-span-3"
        label={
          <Tooltip_
            title={`Sets the balance required for interest calculation.`}
            inputLabel="Balance Required For Interest Calculation"
          />
        }
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="enforceMinRequiredBalance"
        className="col-span-3 flex justify-start items-baseline"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox>
          Enforce minimum balance
          <Tooltip_ title="Indicates whether to enforce a minimum balance" />
        </Checkbox>
      </Form.Item>

      <Form.Item
        name="minRequiredBalance"
        className="col-span-3"
        label={
          <Tooltip_
            title={`Sets the minimum balance allowed for a saving account.`}
            inputLabel="Minimum balance"
          />
        }
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      <Form.Item
        name="withHoldTax"
        className="col-span-3 flex justify-start items-center"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox onChange={onChangeWithHold}>
          Is Withhold tax applicable
          <Tooltip_
            title={`An boolean flag to attach  taxes to interest posting.`}
          />
        </Checkbox>
      </Form.Item>

      {showTaxGroupOptions && (
        <Form.Item
          name="taxGroupId"
          className="col-span-3"
          label="Tax Group"
          rules={[
            {
              required: showTaxGroupOptions,
              message: "Withhold Tax Group is required!",
            },
          ]}
        >
          <Select
            style={{ width: "100%" }}
            showSearch
            options={taxGroupsOptions}
            filterOption={filterOption}
            allowClear
          />
        </Form.Item>
      )}
      <div className="col-span-6"></div>

      <Form.Item
        name="allowOverdraft"
        className="col-span-6 flex justify-start items-center"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox onChange={onChangeAllowOverdraft}>
          Is Overdraft Allowed
          <Tooltip_
            title={`Indicates whether saving accounts based on this saving product may have an overdraft.`}
          />
        </Checkbox>
      </Form.Item>

      {showOverDraftInputs && (
        <Form.Item
          name="overdraftLimit"
          className="col-span-2"
          label={
            <Tooltip_
              title={`Sets the maximum allowed overdraft amount for a saving account that is allowed to have an overdraft.`}
              inputLabel="Maximum Overdraft Amount Limit"
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
      )}

      {showOverDraftInputs && (
        <Form.Item
          name="nominalAnnualInterestRateOverdraft"
          className="col-span-2"
          label={
            <Tooltip_
              title={`Default interest rate on overdraft.`}
              inputLabel="Nominal Annual Interest Rate Overdraft"
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
      )}

      {showOverDraftInputs && (
        <Form.Item
          name="minOverdraftForInterestCalculation"
          className="col-span-2"
          label={
            <Tooltip_
              title={`Sets the overdraft required for interest calculation.`}
              inputLabel="Minimum Overdraft For Interest Calculation"
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
      )}

      <Form.Item
        name="isDormancyTrackingActive"
        className="col-span-6 flex justify-start items-center"
        valuePropName="checked"
        label={" "}
      >
        <Checkbox onChange={onChangeDormancyTracking}>
          Enable Dormancy Tracking
          <Tooltip_
            title={`Enables definition and tracking inactive Savings Accounts.`}
          />
        </Checkbox>
      </Form.Item>

      {showDormancyTrackingInputs && (
        <>
          <Form.Item
            name="daysToInactive"
            className="col-span-2"
            label={
              <Tooltip_
                title={`Consecutive number of days of inactive period to mark an account as inactive.`}
                inputLabel="Number Of Days to Inactive sub-status"
              />
            }
            rules={[
              {
                required: showDormancyTrackingInputs,
                message: "Number Of Days to Inactive sub-status is required!",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            name="daysToDormant"
            className="col-span-2"
            label={
              <Tooltip_
                title={`Consecutive number of days of inactive period to mark an account as dormant.`}
                inputLabel="Number Of Days to Dormant sub-status"
              />
            }
            rules={[
              {
                required: showDormancyTrackingInputs,
                message: "Number Of Days to Dormant sub-status is required!",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            name="daysToEscheat"
            className="col-span-2"
            label={
              <Tooltip_
                title={`Consecutive number of days of inactive period to mark an account as inactive.`}
                inputLabel="Number Of Days to Escheat"
              />
            }
            rules={[
              {
                required: showDormancyTrackingInputs,
                message: "Number Of Days to Escheat sub-status is required!",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </>
      )}

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
