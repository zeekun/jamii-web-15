"use client";
import { get, useGet } from "@/api";
import Divider_ from "@/components/divider";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import {
  Employee,
  LoanProduct,
  Loan,
  SubmitType,
  CodeValue,
  Code,
  Fund,
  SavingsAccount,
} from "@/types";
import { dateFormat } from "@/utils/dates";
import { filterOption } from "@/utils/strings";
import { Checkbox, DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailsForm(props: {
  form: any;
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<Loan>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<Loan>>>;
  submitType: SubmitType;
  id?: number;
  selectedLoanProduct: Partial<LoanProduct>;
  setSelectedLoanProduct: React.Dispatch<
    React.SetStateAction<Partial<LoanProduct>>
  >;
  showLoanProduct: boolean;
  setShowLoanProduct: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId, id } = useParams();

  const {
    form,
    current,
    setCurrent,
    formValues,
    submitType,
    setFormValues,
    setSelectedLoanProduct,
    selectedLoanProduct,
    showLoanProduct,
    setShowLoanProduct,
  } = props;

  //const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showLoanProductLoading, setShowLoanProductLoading] = useState(false);
  const [selectedLoanProductId, setSelectedLoanProductId] = useState<number>();
  const [minDisbursementOnDate, setMinDisbursementOnDate] = useState<any>();

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  useEffect(() => {
    if (submitType === "update") {
      setShowLoanProduct(true);
    }
  }, [submitType]);

  const onReset = () => {
    form.resetFields();
  };

  const { status: loanProductsStatus, data: loanProducts } = useGet<
    LoanProduct[]
  >(`${tenantId}/loan-products`, [`${tenantId}/loan-products`]);

  let loanProductOptions: any = [];

  if (loanProductsStatus === "success") {
    loanProductOptions = loanProducts.map((loanProduct: LoanProduct) => {
      return {
        value: loanProduct.id,
        label: loanProduct.name,
      };
    });
  }

  const onFinish = (values: any) => {
    setFormValues({
      ...formValues,
      ...values,
      ...selectedLoanProduct,
    });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const { status: loanOfficerStatus, data: loanOfficerData } = useGet<
    Employee[]
  >(`${tenantId}/staff?filter={"where":{"isLoanOfficer":true}}`, [
    `${tenantId}/staff`,
  ]);

  let loanOfficerOptions: any = [];

  if (loanOfficerStatus === "success") {
    loanOfficerOptions = loanOfficerData.map((loanOfficer: Employee) => {
      return {
        value: loanOfficer.id,
        label: `${loanOfficer.firstName} ${loanOfficer.middleName ?? ""} ${
          loanOfficer.lastName
        }`,
      };
    });
  }

  const {
    status: loanPurposesStatus,
    data: loanPurposes,
    error: loanPurposesError,
  } = useGet<Code[]>(
    `${tenantId}/codes?filter={"where":{"name":"loan-purpose"}}`,
    [`${tenantId}/codes?filter={"where":{"name":"loan-purpose"}}`]
  );

  let loanPurposesOptions: any = [];

  if (loanPurposesStatus === "success") {
    if (loanPurposes[0]?.codeValues) {
      loanPurposesOptions = loanPurposes[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter(
          (code: CodeValue) =>
            code.isActive && code.tenantId === Number(tenantId)
        )
        .map((code: { id: number; codeValue: string }) => {
          return { value: code.id, label: code.codeValue };
        });
    }
  }

  const {
    status: fundsStatus,
    data: funds,
    error: fundsError,
  } = useGet<Fund[]>(`${tenantId}/funds`, [`${tenantId}/funds`]);

  let fundOptions: any = [];

  if (fundsStatus === "success") {
    fundOptions = funds.map((fund: Fund) => {
      return { value: fund.id, label: fund.name };
    });
  }

  useEffect(() => {
    const submittedOn = form.getFieldValue("submittedOn");
    setMinDisbursementOnDate(submittedOn);
  }, [minDisbursementOnDate]);

  const onChangeLoanProduct = (value: number) => {
    setShowLoanProductLoading(true);
    setSelectedLoanProductId(value);
    setShowLoanProduct(false);
  };

  useEffect(() => {
    if (selectedLoanProductId) {
      get(`${tenantId}/loan-products/${selectedLoanProductId}`).then((res) => {
        setShowLoanProduct(true);
        setSelectedLoanProduct(res.data);
        setShowLoanProductLoading(false);
      });
    }
  }, [selectedLoanProductId]);

  const { status: savingsAccountsStatus, data: savingsAccounts } = useGet<
    SavingsAccount[]
  >(
    `${tenantId}/savings-accounts?filter={"where":{"and":[{"clientId":${id}},{"depositTypeEnum":"SAVING DEPOSIT"},{"statusEnum":"ACTIVE"}]}}`,
    [
      `${tenantId}/savings-accounts?filter={"where":{"and":[{"clientId":${id}},{"depositTypeEnum":"SAVING DEPOSIT"},{"statusEnum":"ACTIVE"}]}}`,
    ]
  );

  let savingsAccountsOptions: any = [];

  if (savingsAccountsStatus === "success") {
    savingsAccountsOptions = savingsAccounts.map(
      (savingsAccount: SavingsAccount) => {
        return {
          value: savingsAccount.id,
          label: `${savingsAccount.savingsProduct.name} #${savingsAccount.accountNo}`,
        };
      }
    );
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={"detailsForm"}
      onFinish={onFinish}
      className="grid grid-cols-4 gap-2 text-left"
    >
      <Form.Item
        className="col-span-2"
        name="loanProductId"
        label="Product"
        rules={[{ required: true, message: "Product is required!" }]}
      >
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={loanProductOptions}
          onChange={onChangeLoanProduct}
          loading={loanProductsStatus === "success" ? false : true}
        />
      </Form.Item>

      {showLoanProductLoading && <div className="col-span-4">Loading...</div>}

      {showLoanProduct && (
        <>
          <Form.Item
            className="col-span-2"
            name="loanOfficerId"
            label="Loan Officer"
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={loanOfficerOptions}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="loanPurposeId"
            label="Loan Purpose"
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={loanPurposesOptions}
              //onChange={onChangeLoanPurpose}
            />
          </Form.Item>

          <Form.Item className="col-span-2" name="fundId" label="Fund">
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={fundOptions}
              // onChange={onChangeFund}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="submittedOnDate"
            label="Submitted On"
            rules={[{ required: true, message: "Submitted On is required!" }]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2 w-full"
            name="expectedDisbursedOnDate"
            label="Disbursement On"
            rules={[
              {
                required: true,
                message: "Disbursement On Date is required!", // Error message if the date is missing
              },
              {
                validator: (_, value) => {
                  let submittedOnDate = form.getFieldValue("submittedOnDate");
                  const minDisbursementOnDate = dayjs(submittedOnDate).subtract(
                    1,
                    "day"
                  );

                  if (
                    !value || // Check if the date is missing
                    !minDisbursementOnDate ||
                    (dayjs(value).isSame(minDisbursementOnDate) &&
                      !dayjs(value).isBefore(minDisbursementOnDate)) ||
                    dayjs(value).isAfter(minDisbursementOnDate)
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Disbursement On Date must be greater than or equal to Submitted On Date!"
                    )
                  );
                },
              },
            ]}
          >
            <DatePicker className="w-full" format={dateFormat} />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="externalId"
            label="External Id"
          >
            <Input />
          </Form.Item>

          <Divider_ />

          <Form.Item
            className="col-span-2 w-full"
            name="savingsAccountId"
            label="Link Savings"
          >
            <Select
              allowClear
              showSearch
              filterOption={filterOption}
              options={savingsAccountsOptions}
              className="text-left"
            />
          </Form.Item>

          <Form.Item
            className="col-span-2 w-full"
            name="createStandingInstructionsAtDisbursement"
            label={" "}
            valuePropName="checked"
          >
            <Checkbox>Create Standing Instructions At Disbursement</Checkbox>
          </Form.Item>
        </>
      )}

      {showLoanProduct && (
        <div className="col-span-4 ">
          <FormSubmitButtonsStep
            submitText="Next"
            submitLoader={submitLoader}
            onReset={onReset}
          />
        </div>
      )}
    </Form>
  );
}
