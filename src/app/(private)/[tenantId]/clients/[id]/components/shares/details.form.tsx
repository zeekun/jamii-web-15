"use client";
import { get, useGet } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { ShareAccount, ShareProduct, SubmitType } from "@/types";
import { dateFormat } from "@/utils/dates";
import { filterOption } from "@/utils/strings";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailsForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<ShareAccount>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<ShareAccount>>>;
  submitType: SubmitType;
  id?: number;
  selectedShareProduct: Partial<ShareProduct>;
  setSelectedShareProduct: React.Dispatch<
    React.SetStateAction<Partial<ShareProduct>>
  >;
  showShareProduct: boolean;
  setShowShareProduct: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const {
    current,
    setCurrent,
    formValues,
    submitType,
    setFormValues,
    setSelectedShareProduct,
    selectedShareProduct,
    showShareProduct,
    setShowShareProduct,
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showShareProductLoading, setShowShareProductLoading] = useState(false);
  const [selectedShareProductId, setSelectedShareProductId] =
    useState<number>();
  const [minDisbursementOnDate, setMinDisbursementOnDate] = useState<any>();

  useEffect(() => {
    form.setFieldsValue(formValues);
    console.log("details", formValues);
  }, [form, formValues]);

  useEffect(() => {
    if (submitType === "update") {
      setShowShareProduct(true);
    }
  }, [submitType]);

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (values: any) => {
    setFormValues({
      ...formValues,
      ...values,
      shareProduct: formValues.shareProduct,
    });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const {
    status: shareProductsStatus,
    data: shareProducts,
    error: shareProductsError,
  } = useGet<ShareProduct[]>(`${tenantId}/share-products`, [
    `${tenantId}/share-products`,
  ]);

  let shareProductsOptions: any = [];

  if (shareProductsStatus === "success") {
    shareProductsOptions = shareProducts.map((shareProduct: ShareProduct) => {
      return {
        value: shareProduct.id,
        label: shareProduct.name,
      };
    });
  }

  useEffect(() => {
    const submittedOn = form.getFieldValue("submittedOn");
    setMinDisbursementOnDate(submittedOn);
  }, [minDisbursementOnDate]);

  const onChangeShareProduct = (value: number) => {
    setShowShareProductLoading(true);
    setSelectedShareProductId(value);
    setShowShareProduct(false);
  };

  useEffect(() => {
    if (selectedShareProductId) {
      get(`${tenantId}/share-products/${selectedShareProductId}`).then(
        (res) => {
          setShowShareProduct(true);
          setSelectedShareProduct(res.data);
          setShowShareProductLoading(false);
        }
      );
    }
  }, [selectedShareProductId]);

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
        name="shareProductId"
        label="Product"
        rules={[{ required: true, message: "Product is required!" }]}
      >
        <Select
          allowClear
          showSearch
          filterOption={filterOption}
          options={shareProductsOptions}
          onChange={onChangeShareProduct}
          loading={shareProductsStatus === "success" ? false : true}
        />
      </Form.Item>

      {showShareProductLoading && <div className="col-span-4">Loading...</div>}

      {showShareProduct && (
        <>
          <Form.Item
            className="col-span-2"
            name="submittedDate"
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

      {showShareProduct && (
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
