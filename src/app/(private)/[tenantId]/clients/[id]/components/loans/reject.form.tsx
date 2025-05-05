"use client";
import { useCreate, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  RadioChangeEvent,
  Select,
} from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { SubmitType } from "@/types";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";

export default function RejectForm(props: {
  id?: number;
  expectedDisbursedOnDate: string | undefined;
}) {
  const { id, expectedDisbursedOnDate } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: approveLoan } = usePatch(ENDPOINT, id, [QUERY_KEY]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const updatedValues = {
      ...values,
      loanStatusEnum: "REJECTED",
    };

    const submitTypeMessage = "updated";

    approveLoan(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
        },
      }
    );
  }

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
        name="approvedOnDate"
        label="Rejected On"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Approved On Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
