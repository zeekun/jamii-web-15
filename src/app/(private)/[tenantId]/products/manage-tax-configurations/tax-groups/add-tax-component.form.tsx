"use client";
import { get, useGet } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { SubmitType, TaxComponent } from "@/types";
import { filterOption } from "@/utils/strings";
import { Form, Select } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddTaxComponentForm(props: {
  submitType: SubmitType;
  taxComponentData: any;
  setTaxComponentData: any;
  setFilteredTaxComponentsOptions: any;
  filteredTaxComponentsOptions: any;
  id?: number;
}) {
  const {
    submitType,
    id,
    taxComponentData,
    setTaxComponentData,
    setFilteredTaxComponentsOptions,
    filteredTaxComponentsOptions,
  } = props;
  const { tenantId } = useParams();
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const {
    status: taxComponentsStatus,
    data: taxComponents,
    error: taxComponentsError,
  } = useGet<TaxComponent[]>(`${tenantId}/tax-components`, [
    `${tenantId}/tax-components`,
  ]);

  useEffect(() => {
    if (taxComponentsStatus === "success") {
      const options = taxComponents.map((type: TaxComponent) => {
        return { value: type.id, label: type.name };
      });

      // Ensure filtered options exclude the ones already added to the tax group
      const filteredOptions = options.filter(
        (option: { value: any }) =>
          !taxComponentData.some(
            (component: any) => component.id === option.value
          )
      );
      setFilteredTaxComponentsOptions(filteredOptions);
    }
  }, [
    taxComponentsStatus,
    taxComponents,
    taxComponentData,
    setFilteredTaxComponentsOptions,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  async function onFinish(values: any) {
    setSubmitLoader(true);

    if (submitType === "create") {
      let taxComponent: TaxComponent = (
        await get(`${tenantId}/tax-components/${values.taxComponentId}`)
      ).data;

      setTaxComponentData([...taxComponentData, taxComponent]);
      setFilteredTaxComponentsOptions((prevOptions: any[]) => {
        return prevOptions.filter(
          (option) => option.value !== values.taxComponentId
        );
      });

      form.resetFields();

      setSubmitLoader(false);
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name="tax component"
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="taxComponentId"
        label="Name"
        rules={[{ required: true, message: "Name is required!" }]}
      >
        <Select
          allowClear
          filterOption={filterOption}
          showSearch
          options={filteredTaxComponentsOptions}
        />
      </Form.Item>

      <div className="col-span-2 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
