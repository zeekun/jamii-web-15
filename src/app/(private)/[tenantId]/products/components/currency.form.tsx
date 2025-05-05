"use client";
import { useGet } from "@/api";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import Loading from "@/components/loading";
import Tooltip_ from "@/components/tooltip";
import { Currency } from "@/types";
import { filterOption } from "@/utils/strings";
import { Form, InputNumber, Select } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CurrencyForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: any;
  setFormValues: any;
  multiplesName?: string;
}) {
  const { tenantId } = useParams();
  const {
    current,
    setCurrent,
    formValues,
    setFormValues,
    multiplesName = "inMultiplesOf",
  } = props;

  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (values: any) => {
    setFormValues({ ...formValues, ...values });
    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  const {
    status: currenciesStatus,
    data: currencies,
    error: currenciesError,
  } = useGet<Currency[]>(`${tenantId}/currencies`, [`${tenantId}/currencies`]);

  let currencyOptions: any = [];
  if (currenciesStatus === "success")
    currencyOptions = currencies.map((currency: Currency) => {
      return { value: currency.code, label: currency.name };
    });

  if (currenciesStatus === "pending") {
    return <Loading />;
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={"currencyForm"}
      onFinish={onFinish}
      className="grid grid-cols-4 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="currencyCode"
        label={
          <Tooltip_
            title={`The currency in which the loan will be disbursed.`}
            inputLabel="currency"
          />
        }
        rules={[{ required: true, message: "Currency is required!" }]}
        initialValue={"UGX"}
      >
        <Select
          className="text-left"
          showSearch
          filterOption={filterOption}
          options={currencyOptions}
          allowClear
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name={multiplesName}
        label={
          <Tooltip_
            title={`You can enter multiples of currency value.
              For example, if you put multiples of 100, the currency value will be rounded off to 200, 300, 400, etc.`}
            inputLabel="Currency in multiples of"
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

      <div className="col-span-4 ">
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
