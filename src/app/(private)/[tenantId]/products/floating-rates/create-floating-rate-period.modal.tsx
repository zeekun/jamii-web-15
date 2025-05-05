"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Form, InputNumber, Modal } from "antd";
import { useState } from "react";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { FloatingRatePeriod, SubmitType } from "@/types";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";

export default function CreateFloatingRatePeriodModal(props: {
  submitType: SubmitType;
  floatingRatePeriodsData: FloatingRatePeriod[];
  setFloatingRatePeriodsData: React.Dispatch<
    React.SetStateAction<FloatingRatePeriod[]>
  >;
}) {
  const { submitType, floatingRatePeriodsData, setFloatingRatePeriodsData } =
    props;
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [addedFloatingRatePeriodId, setAddedFloatingRatePeriodId] =
    useState<number>(0);

  const onReset = () => {
    form.resetFields();
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  function onFinish(values: FloatingRatePeriod) {
    setSubmitLoader(true);
    const newFloatingRatePeriodId = addedFloatingRatePeriodId + 1;
    const updatedFloatingRatePeriodData = [
      ...floatingRatePeriodsData,
      { id: newFloatingRatePeriodId, ...values },
    ];

    setFloatingRatePeriodsData(updatedFloatingRatePeriodData);

    setAddedFloatingRatePeriodId(newFloatingRatePeriodId);
    setSubmitLoader(false);
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
          <h1 className="capitalize">{submitType} Floating Rate Period</h1>
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          form={form}
          name="floatingRatePeriodForm"
          onFinish={onFinish}
          className="grid grid-cols-4 gap-2"
        >
          <Form.Item
            className="col-span-2"
            name="fromDate"
            label="From Date"
            rules={[{ required: true, message: "Interest Rate is required!" }]}
          >
            <DatePicker className="w-full" format={dateFormat} />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="interestRate"
            label="Interest Rate"
            rules={[{ required: true, message: "Interest Rate is required!" }]}
            initialValue={0}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            className="col-span-2"
            name="isDifferentialToBaseLendingRate"
            label={" "}
            valuePropName="checked"
          >
            <Checkbox>Is Differential To Base Lending Rate</Checkbox>
          </Form.Item>

          <div className="col-span-4">
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
