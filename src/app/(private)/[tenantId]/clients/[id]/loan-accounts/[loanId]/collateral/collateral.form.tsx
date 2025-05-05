"use client";
import { useCreate, useGet } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { Form, Input, InputNumber, Select } from "antd";
import { useState } from "react";
import toast from "@/utils/toast";
import { Code, CodeValue, Loan } from "@/types";
import { useParams } from "next/navigation";
import { filterOption } from "@/utils/strings";

export default function CollateralForm(props: { loan?: Loan }) {
  const { tenantId, loanId } = useParams();
  const { loan } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertCollateral } = useCreate(
    `${tenantId}/loans/${loanId}/loan-collaterals`,
    [`${tenantId}/loans/${loanId}/loan-collaterals`]
  );

  const onReset = () => {
    form.resetFields();
  };

  const { status: loanCollateralStatus, data: loanCollaterals } = useGet<
    Code[]
  >(`${tenantId}/codes?filter={"where":{"name":"loan-collateral"}}`, [
    `${tenantId}/codes?filter={"where":{"name":"loan-collateral"}}`,
  ]);

  let loanCollateralsOptions: any = [];

  if (loanCollateralStatus === "success") {
    if (loanCollaterals[0]?.codeValues) {
      loanCollateralsOptions = loanCollaterals[0]?.codeValues
        .sort((a: CodeValue, b: CodeValue) => a.orderPosition - b.orderPosition)
        .filter(
          (code: CodeValue) =>
            code.isActive && code.tenantId === Number(tenantId)
        )
        .map((code: CodeValue) => {
          return { value: code.id, label: code.codeValue };
        });
    }
  }

  function onFinish(values: any) {
    setSubmitLoader(true);

    insertCollateral(values, {
      onSuccess: () => {
        setSubmitLoader(false);

        toast({
          type: "success",
          response: "Loan Collateral successfully added",
        });
      },
      onError(error, variables, context) {
        setSubmitLoader(false);
        toast({
          type: "error",
          response: error,
        });
      },
    });
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={"withdrawForm"}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <>
        <Form.Item
          className="col-span-2"
          name="typeId"
          label="Collateral Type"
          rules={[{ required: true, message: "Collateral Type is required!" }]}
        >
          <Select
            allowClear
            showSearch
            filterOption={filterOption}
            options={loanCollateralsOptions}
          />
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="value"
          label="Value"
          rules={[{ required: true, message: "Value is required!" }]}
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
          name="description"
          label="Description"
        >
          <Input.TextArea rows={5} />
        </Form.Item>
      </>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
