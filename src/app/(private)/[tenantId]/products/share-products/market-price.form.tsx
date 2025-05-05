"use client";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Form } from "antd";
import { useEffect, useState } from "react";
import CreateMarketPricePeriodModal from "./create-market-price-period.modal";
import MarketPricePeriodDataTable from "./market-price-periods.data-table";
import { ShareProductMarketPrice } from "@/types";

export default function MarketPriceForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: any;
  setFormValues: any;
  marketPriceData: ShareProductMarketPrice[];
  setMarketPriceData: React.Dispatch<
    React.SetStateAction<ShareProductMarketPrice[]>
  >;
}) {
  const {
    current,
    setCurrent,
    formValues,
    setFormValues,
    marketPriceData,
    setMarketPriceData,
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  return (
    <div className="col-span-4 ">
      <div className="flex justify-end mb-2">
        <CreateMarketPricePeriodModal
          submitType="create"
          marketPriceData={marketPriceData}
          setMarketPriceData={setMarketPriceData}
          formValues={formValues}
          setFormValues={setFormValues}
        />
      </div>

      <div className="mb-4">
        {" "}
        <MarketPricePeriodDataTable
          data={marketPriceData}
          setMarketPriceData={setMarketPriceData}
          formValues={formValues}
          setFormValues={setFormValues}
        />
      </div>

      <FormSubmitButtonsStep
        submitText="Next"
        cancelText="Previous"
        submitLoader={submitLoader}
        onReset={onReset}
        handleCancel={() => {
          setCurrent(current - 1);
        }}
        setCurrent={setCurrent}
        current={current}
      />
    </div>
  );
}
