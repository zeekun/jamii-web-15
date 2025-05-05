"use client";
import { useCreate, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, Input } from "antd";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import {  SavingsAccount } from "@/types";

export default function ApproveForm(props: {
  id?: number;
  clientId: number | undefined;
  saving: SavingsAccount | undefined;
  undoApproval?: boolean;
  page?: "CLIENT" | "SAVING ACCOUNT";
}) {
  const { id, clientId, saving, undoApproval = false, page } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  let qk = [
    `clients/${clientId}/loans?filter={"where":{"loanStatusEnum":{"neq":"REJECTED"}}}`,
  ];

  if (page === "SAVING ACCOUNT") {
    qk = ["loans", `${id}`];
  }

  const { mutate: approveLoan } = usePatch(ENDPOINT, id, qk);

  const { mutate: createLoanRepaymentSchedule } = useCreate(
    "loan-repayment-schedules",
    qk
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    let updatedValues = {
      savingsAccount: {
        approvedOnDate: values.approvedOnDate,
        statusEnum: "APPROVED",
      },
      note: values.note,
    };

    // if (undoApproval === false) {
    //   updatedValues = {
    //     ...values,
    //     statusEnum: "APPROVED",
    //   };
    // } else {
    //   updatedValues = {
    //     principalDisbursedDerived: 0,
    //     statusEnum: "SUBMITTED AND AWAITING APPROVAL",
    //   };
    // }

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
      {!undoApproval && (
        <>
          {" "}
          <Form.Item
            className="col-span-2"
            name="approvedOnDate"
            label="Approved On Date"
            initialValue={dayjs()}
            rules={[
              { required: true, message: "Approved On Date is required!" },
            ]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>
          <Form.Item className="col-span-2" name="note" label="Note">
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      )}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
