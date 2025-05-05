"use client";
import { get, useGet } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Employee, SavingsAccount, SavingsProduct, SubmitType } from "@/types";
import { dateFormat } from "@/utils/dates";
import { filterOption } from "@/utils/strings";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<SavingsAccount>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<SavingsAccount>>>;
  submitType: SubmitType;
  id?: number;
  selectedSavingsProduct: Partial<SavingsProduct>;
  setSelectedSavingsProduct: React.Dispatch<
    React.SetStateAction<Partial<SavingsProduct>>
  >;
  showSavingsProduct: boolean;
  setShowSavingsProduct: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();

  const {
    current,
    setCurrent,
    formValues,
    submitType,
    setFormValues,
    setSelectedSavingsProduct,
    selectedSavingsProduct,
    showSavingsProduct,
    setShowSavingsProduct,
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showSavingsProductLoading, setShowSavingsProductLoading] =
    useState(false);
  const [selectedSavingsProductId, setSelectedSavingsProductId] =
    useState<number>();
  const [minDisbursementOnDate, setMinDisbursementOnDate] = useState<any>();

  useEffect(() => {
    if (submitType === "update") {
      setShowSavingsProduct(true);
    }

    // Ensure form values are updated correctly
    if (formValues) {
      form.setFieldsValue(formValues);
    }
  }, [form, submitType, formValues]);

  const onFinish = (values: any) => {
    setFormValues((prevFormValues) => {
      const updatedValues = {
        ...prevFormValues,
        ...values,
        minRequiredOpeningBalance:
          selectedSavingsProduct?.minRequiredOpeningBalance ??
          prevFormValues?.minRequiredOpeningBalance,
        allowOverdraft:
          values.allowOverdraft !== undefined
            ? values.allowOverdraft
            : selectedSavingsProduct?.allowOverdraft ?? false, // Ensure it resets if missing
        enforceMinRequiredBalance:
          values.enforceMinRequiredBalance !== undefined
            ? values.enforceMinRequiredBalance
            : selectedSavingsProduct?.enforceMinRequiredBalance ?? false,
        minRequiredBalance: values.allowOverdraft
          ? null
          : values.minRequiredBalance,
        lockInPeriodFrequency:
          selectedSavingsProduct?.lockInPeriodFrequency ??
          prevFormValues?.lockInPeriodFrequency,
        lockInPeriodFrequencyEnum:
          selectedSavingsProduct?.lockInPeriodFrequencyTypeEnum ??
          prevFormValues?.lockInPeriodFrequencyEnum,
        savingsProduct:
          selectedSavingsProduct ?? prevFormValues?.savingsProduct,
      };

      form.setFieldsValue(updatedValues);
      return updatedValues;
    });

    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent((prev) => prev + 1);
    }, 500);
  };

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: loanOfficerStatus,
    data: loanOfficerData,
    error: loanOfficerError,
  } = useGet<Employee[]>(`${tenantId}/staff`, [`${tenantId}/staff`]);

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
    status: savingsProductsStatus,
    data: savingsProducts,
    error: savingsProductsError,
  } = useGet<SavingsProduct[]>(
    `${tenantId}/savings-products?filter={"where":{"depositTypeEnum":"SAVING DEPOSIT"},"order":["id DESC"]}`,
    [
      `${tenantId}/savings-products?filter={"where":{"depositTypeEnum":"SAVING DEPOSIT"},"order":["id DESC"]}`,
    ]
  );

  let savingsProductsOptions: any = [];

  if (savingsProductsStatus === "success") {
    savingsProductsOptions = savingsProducts.map(
      (savingsProduct: SavingsProduct) => {
        return {
          value: savingsProduct.id,
          label: savingsProduct.name,
        };
      }
    );
  }

  useEffect(() => {
    const submittedOn = form.getFieldValue("submittedOn");
    setMinDisbursementOnDate(submittedOn);
  }, [minDisbursementOnDate]);

  const onChangeSavingsProduct = (value: number) => {
    setShowSavingsProductLoading(true);
    setSelectedSavingsProductId(value);
    setShowSavingsProduct(false);
  };

  useEffect(() => {
    if (selectedSavingsProductId) {
      get(`${tenantId}/savings-products/${selectedSavingsProductId}`).then(
        (res) => {
          setShowSavingsProduct(true);
          setSelectedSavingsProduct(res.data);
          setShowSavingsProductLoading(false);
        }
      );
    }
  }, [selectedSavingsProductId]);

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
        name="savingsProductId"
        label="Product"
        rules={[{ required: true, message: "Product is required!" }]}
      >
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={savingsProductsOptions}
          onChange={onChangeSavingsProduct}
          loading={savingsProductsStatus === "success" ? false : true}
        />
      </Form.Item>

      {showSavingsProductLoading && (
        <div className="col-span-4">Loading...</div>
      )}

      {showSavingsProduct && (
        <>
          <Form.Item
            className="col-span-2"
            name="fieldOfficerId"
            label="Field Officer"
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
            name="submittedOnDate"
            label="Submitted On"
            rules={[
              { required: true, message: "Submitted On Date is required!" },
            ]}
            initialValue={dayjs()}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="externalId"
            label="External Id"
          >
            <Input />
          </Form.Item>
        </>
      )}

      {showSavingsProduct && (
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
