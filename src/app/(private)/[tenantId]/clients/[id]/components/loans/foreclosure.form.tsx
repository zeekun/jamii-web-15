"use client";
import { usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, InputNumber } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import { Loan, LoanRepaymentSchedule } from "@/types";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";

export default function ForeClosureForm(props: {
  loan: Loan;
  foreclosureRepaymentSchedule: LoanRepaymentSchedule | undefined;
  balancesOfLoan: number[];
  setBalancesOfLoan: Dispatch<SetStateAction<number[]>>;
}) {
  const {
    loan,
    foreclosureRepaymentSchedule,
    balancesOfLoan,
    setBalancesOfLoan,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: approveLoan } = usePatch(ENDPOINT, loan.id, [
    `clients/${loan.clientId}/loans?filter={"where":{"loanStatusEnum":{"neq":"REJECTED"}}}`,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const updatedValues = {
      ...values,
      loanStatusEnum: "APPROVED",
    };

    const submitTypeMessage = "updated";

    // approveLoan(
    //   { id, ...updatedValues },
    //   {
    //     onSuccess: () => {
    //       setSubmitLoader(false);
    //     },
    //     onError(error, variables, context) {
    //       setSubmitLoader(false);
    //     },
    //   }
    // );
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
        name="transactionDate"
        label="Transaction Date"
        initialValue={dayjs()}
        rules={[{ required: true, message: "Transaction Date is required!" }]}
      >
        <DatePicker className="w-full" maxDate={dayjs()} format={dateFormat} />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="approvedPrincipal"
        label="Principal"
        rules={[
          {
            required: true,
            message: "Approved Amount is required!",
          },
        ]}
        //initialValue={foreclosureRepaymentSchedule.}
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
        name="interest"
        label="Interest"
        rules={[
          {
            required: true,
            message: "Interest is required!",
          },
        ]}
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
        name="approvedPrincipal"
        label="Fee Amount"
        rules={[
          {
            required: true,
            message: "Approved Amount is required!",
          },
        ]}
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
        name="approvedPrincipal"
        label="Penalty Amount"
        rules={[
          {
            required: true,
            message: "Approved Amount is required!",
          },
        ]}
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
        name="approvedPrincipal"
        label="Transaction Amount"
        rules={[
          {
            required: true,
            message: "Approved Amount is required!",
          },
        ]}
      >
        <InputNumber
          className="w-full"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

      {/* <Form.Item className="col-span-2" name="note" label="Note">
        <Input.TextArea rows={4} />
      </Form.Item> */}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
