"use client";
import { useCreate } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Form, Select } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { SubmitType } from "@/types";
import { useParams } from "next/navigation";
import CurrencyList from "currency-list";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertCurrency } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);
    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    const currencyData =
      typeof values.currency === "string"
        ? JSON.parse(values.currency)
        : values.currency;

    if (submitType === "create") {
      insertCurrency(
        { ...values, currency: currencyData },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            toast.success(`${PAGE_TITLE} ${submitTypeMessage} successfully.`, {
              theme: "colored",
            });
            form.resetFields();
          },
          onError(error) {
            toast.error(error.message, {
              theme: "colored",
            });
            setSubmitLoader(false);
          },
        }
      );
    }
  }

  // Get currency options
  const currencyOptions = Object.entries(CurrencyList.getAll("en_US")).map(
    ([code, details]) => ({
      label: `${details.name} (${details.symbol})`,
      value: JSON.stringify({ code, ...details }),
    })
  );

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="currency"
        label="Currency"
        rules={[{ required: true, message: "Currency is required!" }]}
      >
        <Select options={currencyOptions} placeholder="Select a currency" />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
