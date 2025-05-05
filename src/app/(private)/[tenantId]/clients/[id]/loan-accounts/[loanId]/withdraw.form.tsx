"use client";
import { useCreate, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import toast from "@/utils/toast";
import { Loan } from "@/types";
import { useParams } from "next/navigation";

export default function WithdrawForm(props: { loan?: Loan }) {
  const { tenantId } = useParams();
  const { loan } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const id = loan?.id;

  let qk = [`loans/${id}`];

  const { mutate: withdrawLoan } = usePatch(`${tenantId}/loans`, id, qk);
  const { mutate: insertNote } = useCreate(`${tenantId}/loans/${id}/notes`, qk);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      withdrawnOnDate: values.withdrawnOnDate,
      loanStatusEnum: "WITHDRAWN BY CLIENT",
    };

    withdrawLoan(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          insertNote({ noteTypeEnum: "LOAN", note: values.note });
          toast({
            type: "success",
            response: "Loan successfully withdrawn",
          });
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
          toast({
            type: "error",
            response: error,
          });
        },
      }
    );
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
          name="withdrawnOnDate"
          label="Withdrawal Date"
          initialValue={dayjs()}
          rules={[{ required: true, message: "Withdrawal Date is required!" }]}
        >
          <DatePicker
            className="w-full"
            maxDate={dayjs()}
            format={dateFormat}
          />
        </Form.Item>

        <Form.Item
          className="col-span-2"
          name="note"
          label="Note"
          rules={[{ required: true, message: "Note is required!" }]}
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
