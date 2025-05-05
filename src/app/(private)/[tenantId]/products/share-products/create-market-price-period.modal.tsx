"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, InputNumber, Modal } from "antd";
import { useState } from "react";

import FormSubmitButtons from "@/components/form-submit-buttons";
import { ShareProductMarketPrice, SubmitType } from "@/types";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";

export default function CreateMarketPricePeriodModal(props: {
  submitType: SubmitType;
  marketPriceData: ShareProductMarketPrice[];
  setMarketPriceData: React.Dispatch<
    React.SetStateAction<ShareProductMarketPrice[]>
  >;
  formValues: any;
  setFormValues: any;
}) {
  const {
    submitType,
    marketPriceData,
    setMarketPriceData,
    formValues,
    setFormValues,
  } = props;
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [addedMarketPriceId, setAddedMarketPriceId] = useState<number>(0);

  const onReset = () => {
    form.resetFields();
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  function onFinish(values: ShareProductMarketPrice) {
    setSubmitLoader(true);
    const newMarketPriceId = addedMarketPriceId + 1;
    const updatedMarketPriceData = [
      ...marketPriceData,
      { id: newMarketPriceId, ...values },
    ];

    setMarketPriceData(updatedMarketPriceData);
    setFormValues({
      ...formValues,
      shareProductMarketPrices: updatedMarketPriceData,
    });

    setAddedMarketPriceId(newMarketPriceId);
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
        title={<h1 className="capitalize">{submitType} Market Price Period</h1>}
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          form={form}
          name="marketPricePeriodForm"
          onFinish={onFinish}
          className="grid grid-cols-4 gap-2"
        >
          <Form.Item
            className="col-span-2"
            name="shareValue"
            label="Nominal/Unit Price"
            rules={[{ required: true, message: "Nominal/Unit is required!" }]}
            initialValue={0}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item className="col-span-2" name="fromDate" label="From Date">
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
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
