"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Select } from "antd";
import { SetStateAction, useState } from "react";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { LoanCycleParamTypeEnum, LoanProduct, SubmitType } from "@/types";

export default function CreateLoanCycleModal(props: {
  submitType: SubmitType;
  loanCycleType: LoanCycleParamTypeEnum;
  formValues: Partial<LoanProduct>;
  setFormValues: React.Dispatch<SetStateAction<Partial<LoanProduct>>>;
}) {
  const { submitType, loanCycleType, formValues, setFormValues } = props;

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const onReset = () => {
    form.resetFields();
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  function onFinish(values: any) {
    const newLoanCycle = {
      ...values,
      paramTypeEnum: loanCycleType.toUpperCase(),
    };

    // Update the form values based on loanCycleType
    setFormValues({
      ...formValues,
      loanProductVariationsBorrowerCycles: [
        ...(formValues.loanProductVariationsBorrowerCycles || []),
        newLoanCycle,
      ],
    });

    form.resetFields();
    handleCancel();
  }

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
        <span className="capitalize">
          {submitType === "create" ? "Add" : "Edit"}
        </span>
      </Button>
      <Modal
        title={
          <h1 className="capitalize">
            {submitType} {loanCycleType} by loan cycle
          </h1>
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          form={form}
          name={loanCycleType}
          onFinish={onFinish}
          className="text-left grid grid-cols-2 gap-2"
        >
          <Form.Item
            className="w-full col-span-2"
            name="valueConditionTypeEnum"
            label="Condition"
            rules={[{ required: true, message: "Condition is required!" }]}
          >
            <Select className="w-full">
              <option value="EQUALS">Equals</option>
              <option value="GREATER THAN">Greater Than</option>
            </Select>
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="borrowerCycleNumber"
            label="Loan Cycle"
            rules={[{ required: true, message: "Loan Cycle is required!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item className="col-span-2" name="minValue" label="Minimum">
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="defaultValue"
            label="Default"
            rules={[{ required: true, message: "Default is required!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item className="col-span-2" name="maxValue" label="Maximum">
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <div className="col-span-2">
            <FormSubmitButtons
              submitLoader={submitLoader}
              onReset={onReset}
              handleCancel={handleCancel}
            />
          </div>
        </Form>
      </Modal>
    </>
  );
}
