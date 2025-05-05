"use client";
import { Loan, LoanProduct, SubmitType } from "@/types";
import RepaymentScheduleDataTable from "./repayment-schedule.data-table";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { useState } from "react";
import { Form } from "antd";

export default function RepaymentSchedule(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<Loan>;
  setFormValues: React.Dispatch<React.SetStateAction<Partial<Loan>>>;
  submitType: SubmitType;
  id?: number;
}) {
  const { current, setCurrent, formValues, setFormValues } = props;
  const [submitLoader, setSubmitLoader] = useState(false);

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    setFormValues({ ...formValues, ...values });

    setSubmitLoader(true);
    setTimeout(() => {
      setSubmitLoader(false);
      setCurrent(current + 1);
    }, 500);
  };

  return (
    <>
      <RepaymentScheduleDataTable formValues={formValues} />

      <Form
        layout="vertical"
        form={form}
        name={"detailsForm"}
        onFinish={onFinish}
        className="grid grid-cols-4 gap-2 text-left mt-5"
      >
        <div className="col-span-6 ">
          <FormSubmitButtonsStep
            submitText="Next"
            cancelText="Previous"
            submitLoader={submitLoader}
            handleCancel={() => {
              setCurrent(current - 1);
            }}
          />
        </div>
      </Form>
    </>
  );
}
